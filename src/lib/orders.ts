import type { AddonId, TierId } from './checkout'

export interface OrderLineItem {
  id: string
  label: string
  price: number
}

export interface OrderRecord {
  orderId: string
  tier: TierId | ''
  tierLabel: string
  addons: AddonId[]
  lineItems: OrderLineItem[]
  amountTotal: number
  currency: string
  customerEmail: string
  customerName: string
  paymentStatus: string
  createdAt: string
}
