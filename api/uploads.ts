import { put } from '@vercel/blob'

const fileFields = [
  { name: 'mainPanelPhoto', label: 'Main Panel' },
  { name: 'frontHousePhoto', label: 'Front of House' },
  { name: 'sidewallPhoto', label: 'Sidewall' },
  { name: 'roofPhoto', label: 'Roof Area' },
  { name: 'meterPhoto', label: 'Utility Meter' },
  { name: 'additionalPhoto', label: 'Additional Context' },
  { name: 'solarPanelDatasheet', label: 'Solar Panel' },
  { name: 'inverterDatasheet', label: 'Inverter' },
  { name: 'batteryDatasheet', label: 'Battery' },
] as const

const uploadContentTypes = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
] as const

type FileFieldName = (typeof fileFields)[number]['name']

const allowedFieldNames = new Set(fileFields.map((field) => field.name))
const allowedContentTypes = new Set(uploadContentTypes)
const fileLabels = Object.fromEntries(
  fileFields.map((field) => [field.name, field.label]),
) as Record<FileFieldName, string>

function sanitizeFileName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9.-]+/g, '-')
}

export async function POST(request: Request) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return Response.json(
      {
        error:
          'Vercel Blob is not configured. Attach a Blob store to this project or set BLOB_READ_WRITE_TOKEN locally.',
      },
      { status: 500 },
    )
  }

  try {
    const formData = await request.formData()
    const field = formData.get('field')
    const file = formData.get('file')

    if (typeof field !== 'string' || !allowedFieldNames.has(field as FileFieldName)) {
      return Response.json({ error: 'Invalid upload field.' }, { status: 400 })
    }

    const validatedField = field as FileFieldName

    if (!(file instanceof File)) {
      return Response.json({ error: 'A file is required.' }, { status: 400 })
    }

    if (!allowedContentTypes.has(file.type as (typeof uploadContentTypes)[number])) {
      return Response.json(
        { error: 'Unsupported file type. Upload PDF, JPG, PNG, WEBP, HEIC, or HEIF.' },
        { status: 400 },
      )
    }

    const pathname = `intake-temp/${validatedField}/${crypto.randomUUID()}-${sanitizeFileName(file.name)}`
    const blob = await put(pathname, file, {
      access: 'private',
      addRandomSuffix: false,
      contentType: file.type || undefined,
    })

    return Response.json({
      contentType: file.type || 'application/octet-stream',
      field: validatedField,
      label: fileLabels[validatedField],
      originalName: file.name,
      downloadUrl: blob.downloadUrl,
      pathname: blob.pathname,
      size: file.size,
      url: blob.url,
    })
  } catch (error) {
    console.error('blob upload failed', error)

    return Response.json(
      {
        error:
          error instanceof Error ? error.message : 'Could not upload file.',
      },
      { status: 500 },
    )
  }
}
