import { put } from '@vercel/blob'
import Stripe from 'stripe'
import { ADDONS, TIERS, type AddonId, type TierId } from '../../src/lib/checkout.js'
import type { OrderRecord } from '../../src/lib/orders.js'

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error('STRIPE_SECRET_KEY is not set.')
  return new Stripe(key)
}

function buildOrderRecord(session: Stripe.Checkout.Session): OrderRecord {
  const tierId = (session.metadata?.tier ?? '') as TierId | ''
  const tier = tierId && tierId in TIERS ? TIERS[tierId as TierId] : null

  const addonIds = (
    session.metadata?.addons
      ? session.metadata.addons.split(',').filter(Boolean)
      : []
  ).filter((id): id is AddonId => id in ADDONS)

  const lineItems = [
    ...(tier ? [{ id: tierId as string, label: tier.label, price: tier.price }] : []),
    ...addonIds.map((id) => ({ id, label: ADDONS[id].label, price: ADDONS[id].price })),
  ]

  return {
    orderId: session.id,
    tier: tierId,
    tierLabel: tier?.label ?? '',
    addons: addonIds,
    lineItems,
    amountTotal: session.amount_total ?? 0,
    currency: session.currency ?? 'usd',
    customerEmail: session.customer_details?.email ?? session.customer_email ?? '',
    customerName: session.customer_details?.name ?? '',
    paymentStatus: session.payment_status,
    createdAt: new Date().toISOString(),
  }
}

export async function POST(request: Request) {
  const signature = request.headers.get('stripe-signature')
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not set.')
    return Response.json({ error: 'Webhook is not configured.' }, { status: 500 })
  }

  if (!signature) {
    return Response.json({ error: 'Missing stripe-signature header.' }, { status: 400 })
  }

  const payload = await request.text()
  const stripe = getStripe()

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret)
  } catch (error) {
    console.error('stripe webhook signature verification failed', error)
    return Response.json({ error: 'Invalid signature.' }, { status: 400 })
  }

  if (event.type !== 'checkout.session.completed') {
    return Response.json({ received: true })
  }

  const session = event.data.object as Stripe.Checkout.Session
  const order = buildOrderRecord(session)

  try {
    const blob = new Blob([JSON.stringify(order, null, 2)], {
      type: 'application/json',
    })

    await put(`orders/${order.orderId}.json`, blob, {
      access: 'private',
      addRandomSuffix: false,
    })
  } catch (error) {
    console.error('failed to persist order record', error)
    return Response.json({ error: 'Failed to save order.' }, { status: 500 })
  }

  return Response.json({ received: true })
}
