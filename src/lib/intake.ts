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

export const intakeUploadFields = [
  {
    name: 'sitePhotos',
    label: 'Site Photos',
    hint:
      'Upload site photos of main electrical panel, utility meter, front of house, roof areas and anything unusual that may affect the design.',
    section: 'sitePhotos',
  },
  {
    name: 'datasheets',
    label: 'Datasheets',
    hint:
      'Upload equipment datasheets here: solar panels, inverter, battery, racking, and any other spec sheets you already have.',
    section: 'datasheets',
  },
] as const

export const fileFields = [
  ...sitePhotoFields,
  ...datasheetFields,
  ...intakeUploadFields,
] as const

export type FileFieldName = (typeof fileFields)[number]['name']
export type UploadSectionName = (typeof fileFields)[number]['section']
export type IntakeUploadFieldName = (typeof intakeUploadFields)[number]['name']

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
  racking: string
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
export const maxUploadSizeBytes = 100 * 1024 * 1024
export const maxUploadSizeLabel = '100 MB'
export const maxUploadCount = 20

export const uploadSections = [
  {
    name: 'sitePhotos',
    title: 'Site Photos (Optional)',
    accept: datasheetContentTypes.join(','),
    emptyStateLabel: `PDF, JPG, PNG, WEBP, HEIC, or HEIF up to ${maxUploadSizeLabel}`,
    field: intakeUploadFields[0],
  },
  {
    name: 'datasheets',
    title: 'Datasheets (Optional)',
    accept: datasheetContentTypes.join(','),
    emptyStateLabel: `PDF, JPG, PNG, WEBP, HEIC, or HEIF up to ${maxUploadSizeLabel}`,
    field: intakeUploadFields[1],
  },
] as const
