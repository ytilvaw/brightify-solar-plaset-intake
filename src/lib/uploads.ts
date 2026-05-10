import { upload } from '@vercel/blob/client'

import {
  maxUploadSizeBytes,
  maxUploadSizeLabel,
  uploadContentTypes,
  type FileFieldName,
  type UploadedAsset,
} from './intake'

const allowedContentTypes = new Set<string>(uploadContentTypes)

type UploadProgress = {
  loaded: number
  percentage: number
  total: number
}

interface UploadIntakeFileInput {
  field: FileFieldName
  file: File
  label: string
  onUploadProgress?: (progress: UploadProgress) => void
}

function sanitizeFileName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9.-]+/g, '-')
}

function getFileType(file: File) {
  return file.type || 'application/octet-stream'
}

export function validateUploadFile(file: File) {
  if (!allowedContentTypes.has(file.type)) {
    return 'Unsupported file type. Upload PDF, JPG, PNG, WEBP, HEIC, or HEIF.'
  }

  if (file.size > maxUploadSizeBytes) {
    return `File is too large. Upload files up to ${maxUploadSizeLabel}.`
  }

  return null
}

export async function uploadIntakeFile(input: UploadIntakeFileInput) {
  const { field, file, label, onUploadProgress } = input
  const validationError = validateUploadFile(file)

  if (validationError) {
    throw new Error(validationError)
  }

  const pathname = `intake-temp/${field}/${crypto.randomUUID()}-${sanitizeFileName(file.name)}`
  const blob = await upload(pathname, file, {
    access: 'private',
    clientPayload: JSON.stringify({
      contentType: getFileType(file),
      field,
      originalName: file.name,
      size: file.size,
    }),
    contentType: file.type,
    handleUploadUrl: '/api/uploads',
    multipart: file.size >= 5 * 1024 * 1024,
    onUploadProgress,
  })

  return {
    contentType: blob.contentType || getFileType(file),
    downloadUrl: blob.downloadUrl,
    field,
    label,
    originalName: file.name,
    pathname: blob.pathname,
    size: file.size,
    url: blob.url,
  } satisfies UploadedAsset
}
