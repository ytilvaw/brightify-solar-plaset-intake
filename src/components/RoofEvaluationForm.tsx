import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import AddressAutocompleteField from './AddressAutocompleteField'
import FileUploadCard, { type SelectedFileState } from './FileUploadCard'
import {
  datasheetContentTypes,
  type FileFieldName,
  type UploadedAsset,
} from '../lib/intake'

const requestTimeoutMs = 10_000
const panelSpecFieldName = 'solarPanelDatasheet' satisfies FileFieldName

type ApiErrorResponse = {
  error?: string
}

type RoofEvaluationResponse = ApiErrorResponse & {
  requestId?: string
}

type UploadResponse = ApiErrorResponse & Partial<UploadedAsset>

async function parseApiResponse<T>(response: Response) {
  const raw = await response.text()

  if (!raw) {
    return undefined as T | undefined
  }

  try {
    return JSON.parse(raw) as T
  } catch {
    return {
      error: raw,
    } as T
  }
}

function createTimeoutController(timeoutMs: number) {
  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs)

  return {
    signal: controller.signal,
    clear: () => window.clearTimeout(timeoutId),
  }
}

function getSubmissionErrorMessage(error: unknown) {
  if (!(error instanceof Error)) {
    return 'Unable to submit the roof evaluation request.'
  }

  if (error.name === 'AbortError') {
    return `Request timed out after ${requestTimeoutMs / 1000} seconds. Please try again.`
  }

  return error.message
}

function getText(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === 'string' ? value.trim() : ''
}

function createEmptySelectedFile() {
  return { file: null, previewUrl: null } satisfies SelectedFileState
}

export default function RoofEvaluationForm() {
  const [siteAddress, setSiteAddress] = useState('')
  const [panelSpecFile, setPanelSpecFile] =
    useState<SelectedFileState>(createEmptySelectedFile)
  const [error, setError] = useState<string | null>(null)
  const [requestId, setRequestId] = useState<string | null>(null)
  const [status, setStatus] =
    useState<'idle' | 'uploading' | 'submitting' | 'success'>('idle')
  const panelSpecFileRef = useRef(panelSpecFile)

  const isSubmitting = status === 'uploading' || status === 'submitting'
  const progressLabel =
    status === 'uploading'
      ? 'Uploading panel spec...'
      : status === 'submitting'
        ? 'Submitting roof evaluation...'
        : status === 'success'
          ? 'Request sent'
          : 'Ready'

  useEffect(() => {
    panelSpecFileRef.current = panelSpecFile
  }, [panelSpecFile])

  useEffect(() => {
    return () => {
      if (panelSpecFileRef.current.previewUrl) {
        URL.revokeObjectURL(panelSpecFileRef.current.previewUrl)
      }
    }
  }, [])

  const handlePanelSpecFileChange = (
    _field: FileFieldName,
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const nextFile = event.target.files?.[0] ?? null

    setPanelSpecFile((current) => {
      if (current.previewUrl) {
        URL.revokeObjectURL(current.previewUrl)
      }

      return {
        file: nextFile,
        previewUrl:
          nextFile && nextFile.type.startsWith('image/')
            ? URL.createObjectURL(nextFile)
            : null,
      }
    })
  }

  const resetPanelSpecFile = () => {
    setPanelSpecFile((current) => {
      if (current.previewUrl) {
        URL.revokeObjectURL(current.previewUrl)
      }

      return createEmptySelectedFile()
    })
  }

  const uploadPanelSpecAttachment = async () => {
    const file = panelSpecFile.file

    if (!file) {
      return null
    }

    const uploadFormData = new FormData()
    uploadFormData.set('field', panelSpecFieldName)
    uploadFormData.set('file', file)

    const timeout = createTimeoutController(requestTimeoutMs)
    let response

    try {
      response = await fetch('/api/uploads', {
        body: uploadFormData,
        method: 'POST',
        signal: timeout.signal,
      })
    } finally {
      timeout.clear()
    }

    const result = await parseApiResponse<UploadResponse>(response)

    if (!response.ok) {
      throw new Error(result?.error?.trim() || 'Unable to upload panel spec.')
    }

    return {
      contentType:
        result?.contentType ?? file.type ?? 'application/octet-stream',
      downloadUrl: result?.downloadUrl,
      field: (result?.field as FileFieldName | undefined) ?? panelSpecFieldName,
      label: 'Panel Spec',
      originalName: result?.originalName ?? file.name,
      pathname: result?.pathname ?? '',
      size: result?.size ?? file.size,
      url: result?.url ?? '',
    } satisfies UploadedAsset
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setRequestId(null)

    const form = event.currentTarget
    const formData = new FormData(form)

    try {
      if (panelSpecFile.file) {
        setStatus('uploading')
      }

      const panelSpecAttachment = await uploadPanelSpecAttachment()

      setStatus('submitting')
      const payload = {
        customerEmail: getText(formData, 'customerEmail'),
        desiredPanelCount: getText(formData, 'desiredPanelCount'),
        notes: getText(formData, 'notes'),
        panelSize: getText(formData, 'panelSize'),
        panelSpecAttachment,
        siteAddress: siteAddress.trim(),
      }
      const timeout = createTimeoutController(requestTimeoutMs)
      let response

      try {
        response = await fetch('/api/roof', {
          body: JSON.stringify(payload),
          headers: {
            'Content-Type': 'application/json',
          },
          method: 'POST',
          signal: timeout.signal,
        })
      } finally {
        timeout.clear()
      }

      const result = await parseApiResponse<RoofEvaluationResponse>(response)

      if (!response.ok) {
        throw new Error(
          result?.error?.trim() || 'Unable to submit the roof evaluation request.',
        )
      }

      setRequestId(result?.requestId ?? null)
      setStatus('success')
      form.reset()
      setSiteAddress('')
      resetPanelSpecFile()
    } catch (submissionError) {
      console.error(submissionError)
      setError(getSubmissionErrorMessage(submissionError))
      setStatus('idle')
    }
  }

  return (
    <section className="rounded-[36px] border border-[#ececf0] bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] md:p-8">
      <form className="space-y-10" onSubmit={handleSubmit}>
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-8">
            <section className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <AddressAutocompleteField
                  id="roofSiteAddress"
                  label="Property Address"
                  name="siteAddress"
                  onChange={setSiteAddress}
                  required
                  value={siteAddress}
                />
              </div>

              <div>
                <label className="field-label" htmlFor="desiredPanelCount">
                  Desired Number of Panels
                </label>
                <input
                  className="field-input"
                  id="desiredPanelCount"
                  inputMode="numeric"
                  name="desiredPanelCount"
                  placeholder="24"
                  required
                  type="text"
                />
              </div>

              <div>
                <label className="field-label" htmlFor="panelSize">
                  Panel Size
                </label>
                <input
                  className="field-input"
                  id="panelSize"
                  name="panelSize"
                  placeholder="69x45"
                  required
                  type="text"
                />
              </div>

              <div className="md:col-span-2">
                <label className="field-label" htmlFor="panelSpecAttachment">
                  Panel Spec
                </label>
                <div className="mt-3">
                  <FileUploadCard
                    accept={datasheetContentTypes.join(',')}
                    emptyStateLabel="PDF, JPG, PNG, WEBP, HEIC, or HEIF"
                    fieldName={panelSpecFieldName}
                    hint="Upload the panel spec or datasheet as a PDF or image."
                    inputId="panelSpecAttachment"
                    label="Panel Spec"
                    onChange={handlePanelSpecFileChange}
                    selected={panelSpecFile}
                    showLabel={false}
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="field-label" htmlFor="customerEmail">
                  Email for Follow-Up
                </label>
                <input
                  autoComplete="email"
                  className="field-input"
                  id="customerEmail"
                  name="customerEmail"
                  placeholder="you@example.com"
                  required
                  type="email"
                />
              </div>
            </section>
          </div>

          <div className="rounded-[32px] border border-[#ececf0] bg-[#fafafa] p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#f3a43a]">
              Roof Notes
            </p>
            <p className="mt-3 text-sm leading-6 text-[#666674]">
              Add roof type, shading, HOA notes, preferred layout, or anything else useful for the evaluation.
            </p>
            <textarea
              className="field-input mt-5 min-h-[220px] resize-y"
              id="notes"
              name="notes"
              placeholder="Comp shingles? Tile? Dormers? Heavy shade? Add those here."
            />
          </div>
        </div>

        {error ? (
          <div className="rounded-[24px] border border-rose-200 bg-rose-50 px-5 py-4 text-sm leading-6 text-rose-700">
            {error}
          </div>
        ) : null}

        {status === 'success' ? (
          <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm leading-6 text-emerald-700">
            Roof evaluation request sent{requestId ? ` with ID ${requestId}` : ''}.
          </div>
        ) : null}

        <div className="flex flex-col gap-4 border-t border-[#ececf0] pt-6 md:flex-row md:items-center md:justify-between">
          <div className="rounded-full border border-[#ececf0] bg-[#fafafa] px-4 py-2 text-sm text-[#666674]">
            {progressLabel}
          </div>

          <button
            className="inline-flex items-center justify-center rounded-full bg-[#f3a43a] px-6 py-3 text-sm font-semibold uppercase tracking-[0.22em] text-white shadow-[0_12px_30px_rgba(243,164,58,0.18)] transition hover:bg-[#e8982a] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
            type="submit"
          >
            {status === 'uploading'
              ? 'Uploading File'
              : status === 'submitting'
                ? 'Submitting Request'
                : 'Submit Evaluation'}
          </button>
        </div>
      </form>
    </section>
  )
}
