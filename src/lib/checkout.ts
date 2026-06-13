export type TierId =
  | 'residential-single'
  | 'residential-5pack'
  | 'residential-10pack'
  | 'battery-single'
  | 'battery-5pack'
  | 'battery-10pack'
  | 'commercial-standard'

export type AddonId =
  | 'expedite'
  | 'ev-charger'
  | 'interconnection'

export const TIERS: Record<TierId, { label: string; price: number }> = {
  'residential-single':  { label: 'Residential PV — Single',    price: 29900 },
  'residential-5pack':   { label: 'Residential PV — 5-Pack',    price: 137500 },
  'residential-10pack':  { label: 'Residential PV — 10-Pack',   price: 249900 },
  'battery-single':      { label: 'PV + Battery — Single',      price: 39900 },
  'battery-5pack':       { label: 'PV + Battery — 5-Pack',      price: 184900 },
  'battery-10pack':      { label: 'PV + Battery — 10-Pack',     price: 339900 },
  'commercial-standard': { label: 'Commercial — Standard',      price: 89900 },
}

export const ADDONS: Record<AddonId, { label: string; price: number }> = {
  'expedite':        { label: 'Same-Day Expedite',       price: 9900  },
  'ev-charger':      { label: 'EV Charger Circuit',      price: 8900  },
  'interconnection': { label: 'Interconnection Filing',  price: 19900 },
}

export function formatPrice(cents: number) {
  return '$' + (cents / 100).toLocaleString('en-US', { minimumFractionDigits: 0 })
}
