import { put } from '@vercel/blob'
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'

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
  { name: 'sitePhotos', label: 'Site Photos' },
  { name: 'datasheets', label: 'Datasheets' },
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
const maxUploadSizeBytes = 100 * 1024 * 1024
const maxUploadSizeLabel = '100 MB'
const fileLabels = Object.fromEntries(
  fileFields.map((field) => [field.name, field.label]),
) as Record<FileFieldName, string>

class UploadValidationError extends Error {}

interface ClientUploadPayload {
  contentType: string
  field: FileFieldName
  originalName: string
  size: number
}

function sanitizeFileName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9.-]+/g, '-')
}

function isClientUploadPayload(value: unknown): value is ClientUploadPayload {
  if (!value || typeof value !== 'object') {
    return false
  }

  const payload = value as Record<string, unknown>

  return (
    typeof payload.contentType === 'string' &&
    typeof payload.field === 'string' &&
    allowedFieldNames.has(payload.field as FileFieldName) &&
    typeof payload.originalName === 'string' &&
    typeof payload.size === 'number' &&
    Number.isFinite(payload.size)
  )
}

function parseClientUploadPayload(clientPayload: string | null) {
  if (!clientPayload) {
    throw new UploadValidationError('Upload metadata is required.')
  }

  try {
    const payload = JSON.parse(clientPayload) as unknown

    if (isClientUploadPayload(payload)) {
      return payload
    }
  } catch {
    // Fall through to a consistent validation error below.
  }

  throw new UploadValidationError('Invalid upload metadata.')
}

function validateFileDetails(input: {
  contentType: string
  field: FileFieldName
  pathname?: string
  size: number
}) {
  if (!allowedFieldNames.has(input.field)) {
    throw new UploadValidationError('Invalid upload field.')
  }

  if (!allowedContentTypes.has(input.contentType as (typeof uploadContentTypes)[number])) {
    throw new UploadValidationError(
      'Unsupported file type. Upload PDF, JPG, PNG, WEBP, HEIC, or HEIF.',
    )
  }

  if (input.size > maxUploadSizeBytes) {
    throw new UploadValidationError(
      `File is too large. Upload files up to ${maxUploadSizeLabel}.`,
    )
  }

  if (input.pathname) {
    const expectedPrefix = `intake-temp/${input.field}/`

    if (
      !input.pathname.startsWith(expectedPrefix) ||
      input.pathname.includes('..') ||
      input.pathname.includes('//')
    ) {
      throw new UploadValidationError('Invalid upload path.')
    }
  }
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
    if (request.headers.get('content-type')?.includes('application/json')) {
      const body = (await request.json()) as HandleUploadBody
      const jsonResponse = await handleUpload({
        body,
        request,
        onBeforeGenerateToken: async (pathname, clientPayload) => {
          const payload = parseClientUploadPayload(clientPayload)

          validateFileDetails({
            contentType: payload.contentType,
            field: payload.field,
            pathname,
            size: payload.size,
          })

          return {
            addRandomSuffix: false,
            allowedContentTypes: [payload.contentType],
            maximumSizeInBytes: maxUploadSizeBytes,
            tokenPayload: JSON.stringify({
              contentType: payload.contentType,
              field: payload.field,
              label: fileLabels[payload.field],
              originalName: payload.originalName,
              size: payload.size,
            }),
          }
        },
      })

      return Response.json(jsonResponse)
    }

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

    try {
      validateFileDetails({
        contentType: file.type,
        field: validatedField,
        size: file.size,
      })
    } catch (error) {
      if (error instanceof UploadValidationError) {
        return Response.json({ error: error.message }, { status: 400 })
      }

      throw error
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

    if (error instanceof UploadValidationError) {
      return Response.json({ error: error.message }, { status: 400 })
    }

    return Response.json(
      {
        error:
          error instanceof Error ? error.message : 'Could not upload file.',
      },
      { status: 500 },
    )
  }
}
