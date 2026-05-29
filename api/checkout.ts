import Stripe from 'stripe'
import { z } from 'zod'
import { ADDONS, TIERS, type AddonId, type TierId } from '../src/lib/checkout.js'

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error('STRIPE_SECRET_KEY is not set.')
  return new Stripe(key)
}

const createSchema = z.object({
  tier: z.enum(Object.keys(TIERS) as [TierId, ...TierId[]]),
  addons: z.array(z.enum(Object.keys(ADDONS) as [AddonId, ...AddonId[]])).default([]),
})

export async function POST(request: Request) {
  try {
    const body = createSchema.parse(await request.json())
    const stripe = getStripe()

    const requestUrl = new URL(request.url)
    const base =
      process.env.APP_BASE_URL?.trim() ||
      `${requestUrl.protocol}//${requestUrl.host}`

    const tier = TIERS[body.tier]
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      {
        price_data: {
          currency: 'usd',
          product_data: { name: tier.label },
          unit_amount: tier.price,
        },
        quantity: 1,
      },
    ]

    for (const addonId of body.addons) {
      const addon = ADDONS[addonId]
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: { name: addon.label },
          unit_amount: addon.price,
        },
        quantity: 1,
      })
    }

    const session = await stripe.checkout.sessions.create({
      cancel_url: `${base}/design#pricing`,
      line_items: lineItems,
      metadata: {
        addons: body.addons.join(','),
        tier: body.tier,
      },
      mode: 'payment',
      success_url: `${base}/planset?session_id={CHECKOUT_SESSION_ID}`,
    })

    return Response.json({ url: session.url })
  } catch (error) {
    console.error('checkout session creation failed', error)

    if (error instanceof z.ZodError) {
      return Response.json(
        { error: error.issues[0]?.message ?? 'Invalid request.' },
        { status: 400 },
      )
    }

    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to create checkout session.' },
      { status: 500 },
    )
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const sessionId = url.searchParams.get('session_id')

    if (!sessionId) {
      return Response.json({ error: 'session_id is required.' }, { status: 400 })
    }

    const stripe = getStripe()
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    const paid = session.payment_status === 'paid'
    const tier = (session.metadata?.tier ?? '') as TierId | ''
    const addons = session.metadata?.addons
      ? (session.metadata.addons.split(',').filter(Boolean) as AddonId[])
      : []

    return Response.json({
      addons,
      amount: session.amount_total ?? 0,
      paid,
      tier,
      tierLabel: tier && tier in TIERS ? TIERS[tier as TierId].label : '',
    })
  } catch (error) {
    console.error('checkout session verification failed', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to verify session.' },
      { status: 500 },
    )
  }
}
