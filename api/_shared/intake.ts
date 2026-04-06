export const fileFields = [
  {
    name: 'mainPanelPhoto',
    label: 'Main Panel',
  },
  {
    name: 'frontHousePhoto',
    label: 'Front of House',
  },
  {
    name: 'sidewallPhoto',
    label: 'Sidewall',
  },
  {
    name: 'roofPhoto',
    label: 'Roof Area',
  },
  {
    name: 'meterPhoto',
    label: 'Utility Meter',
  },
  {
    name: 'additionalPhoto',
    label: 'Additional Context',
  },
] as const

export type FileFieldName = (typeof fileFields)[number]['name']

export interface UploadedAsset {
  field: FileFieldName
  label: string
  pathname: string
  url: string
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

export interface SubmissionRecord extends IntakePayload {
  source: string
  submissionId: string
  submittedAt: string
  userAgent: string
}

export const uploadContentTypes = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
] as const
