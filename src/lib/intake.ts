export const roofTypeOptions = [
  'Shingles',
  'Tile Roof',
  'Metal Roof',
  'Flat Roof',
  'Slate',
  'Wood Shake',
  'Other',
] as const

export const fileFields = [
  {
    name: 'mainPanelPhoto',
    label: 'Main Panel',
    hint: 'Show available breaker space and panel labeling.',
  },
  {
    name: 'frontHousePhoto',
    label: 'Front of House',
    hint: 'Provide a clean front elevation for the permitting packet.',
  },
  {
    name: 'sidewallPhoto',
    label: 'Sidewall',
    hint: 'Capture conduit path or likely equipment mounting area.',
  },
  {
    name: 'roofPhoto',
    label: 'Roof Area',
    hint: 'Show the roof section where modules are expected to land.',
  },
  {
    name: 'meterPhoto',
    label: 'Utility Meter',
    hint: 'Include meter, disconnects, and nearby equipment.',
  },
  {
    name: 'additionalPhoto',
    label: 'Additional Context',
    hint: 'Anything unusual that will affect layout or permitting.',
  },
] as const

export type FileFieldName = (typeof fileFields)[number]['name']

export interface UploadedAsset {
  field: FileFieldName
  label: string
  pathname: string
  url: string
  downloadUrl?: string
  size: number
  contentType: string
  originalName: string
}

export interface IntakePayload {
  contactName: string
  companyName: string
  email: string
  phone: string
  siteAddress: string
  mainPanelRating: string
  roofType: string
  desiredSystemSize: string
  solarPanel: string
  inverter: string
  battery: string
  notes: string
  uploads: UploadedAsset[]
}

export const uploadContentTypes = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
] as const

export const maxUploadCount = fileFields.length
