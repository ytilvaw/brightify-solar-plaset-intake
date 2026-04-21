export const roofTypeOptions = [
  'Shingles',
  'Tile Roof',
  'Metal Roof',
  'Flat Roof',
  'Slate',
  'Wood Shake',
  'Other',
] as const

export const requesterTypeOptions = ['Homeowner', 'Installer'] as const

export const sitePhotoFields = [
  {
    name: 'mainPanelPhoto',
    label: 'Main Panel',
    hint: 'Show available breaker space and panel labeling.',
    section: 'sitePhotos',
  },
  {
    name: 'frontHousePhoto',
    label: 'Front of House',
    hint: 'Provide a clean front elevation for the permitting packet.',
    section: 'sitePhotos',
  },
  {
    name: 'sidewallPhoto',
    label: 'Sidewall',
    hint: 'Capture conduit path or likely equipment mounting area.',
    section: 'sitePhotos',
  },
  {
    name: 'roofPhoto',
    label: 'Roof Area',
    hint: 'Show the roof section where modules are expected to land.',
    section: 'sitePhotos',
  },
  {
    name: 'meterPhoto',
    label: 'Utility Meter',
    hint: 'Include meter, disconnects, and nearby equipment.',
    section: 'sitePhotos',
  },
  {
    name: 'additionalPhoto',
    label: 'Additional Context',
    hint: 'Anything unusual that will affect layout or permitting.',
    section: 'sitePhotos',
  },
] as const

export const datasheetFields = [
  {
    name: 'solarPanelDatasheet',
    label: 'Solar Panel',
    hint: 'Upload the panel datasheet as a PDF or image.',
    section: 'datasheets',
  },
  {
    name: 'inverterDatasheet',
    label: 'Inverter',
    hint: 'Upload the inverter datasheet as a PDF or image.',
    section: 'datasheets',
  },
  {
    name: 'batteryDatasheet',
    label: 'Battery',
    hint: 'Upload the battery datasheet as a PDF or image.',
    section: 'datasheets',
  },
] as const

export const fileFields = [...sitePhotoFields, ...datasheetFields] as const

export type FileFieldName = (typeof fileFields)[number]['name']
export type UploadSectionName = (typeof fileFields)[number]['section']

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
  requesterType: string
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

export const sitePhotoContentTypes = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
] as const

export const datasheetContentTypes = [
  'application/pdf',
  ...sitePhotoContentTypes,
] as const

export const uploadContentTypes = [...datasheetContentTypes] as const

export const uploadSections = [
  {
    name: 'sitePhotos',
    title: 'Site Photos',
    description:
      'Upload the best available field photos. Files upload directly to Vercel Blob before the intake metadata is saved, which avoids large request payloads hitting a single serverless function.',
    accept: sitePhotoContentTypes.join(','),
    emptyStateLabel: 'JPG, PNG, WEBP, HEIC, or HEIF',
    fields: sitePhotoFields,
  },
  {
    name: 'datasheets',
    title: 'Datasheets',
    description:
      'Upload equipment datasheets for the selected solar panel, inverter, and battery. PDFs and images are both accepted.',
    accept: datasheetContentTypes.join(','),
    emptyStateLabel: 'PDF, JPG, PNG, WEBP, HEIC, or HEIF',
    fields: datasheetFields,
  },
] as const

export const maxUploadCount = fileFields.length
