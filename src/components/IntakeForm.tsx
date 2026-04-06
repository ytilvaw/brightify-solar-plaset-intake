import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent,
} from 'react'

import FileUploadCard, { type SelectedFileState } from './FileUploadCard'
import {
  fileFields,
  roofTypeOptions,
  type FileFieldName,
  type IntakePayload,
  type UploadedAsset,
} from '../lib/intake'

const acceptedUploadTypes = 'image/jpeg,image/png,image/webp,image/heic,image/heif'
const addressQueryMinLength = 4
const addressSuggestionLimit = 5
const addressSearchDebounceMs = 250
const requestTimeoutMs = 10_000

type ApiErrorResponse = {
  error?: string
}

type IntakeResponse = ApiErrorResponse & {
  submissionId?: string
}

type UploadResponse = ApiErrorResponse & Partial<UploadedAsset>

type PhotonResponse = {
  suggestions?: string[]
}

function createEmptySelectedFiles() {
  return Object.fromEntries(
    fileFields.map(({ name }) => [name, { file: null, previewUrl: null }]),
  ) as Record<FileFieldName, SelectedFileState>
}

function getText(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === 'string' ? value.trim() : ''
}

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
    return 'Unable to submit the intake package.'
  }

  if (error.name === 'AbortError') {
    return `Request timed out after ${requestTimeoutMs / 1000} seconds. Please try again.`
  }

  return error.message
}

function buildPhotonSearchUrl(query: string) {
  const params = new URLSearchParams({
    q: query,
  })

  return `/api/address-search?${params.toString()}`
}

export default function IntakeForm() {
  const [selectedFiles, setSelectedFiles] =
    useState<Record<FileFieldName, SelectedFileState>>(createEmptySelectedFiles)
  const [siteAddress, setSiteAddress] = useState('')
  const [addressSuggestions, setAddressSuggestions] = useState<string[]>([])
  const [addressSearchState, setAddressSearchState] = useState<'idle' | 'loading' | 'error'>(
    'idle',
  )
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false)
  const [activeAddressIndex, setActiveAddressIndex] = useState(-1)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] =
    useState<'idle' | 'uploading' | 'submitting' | 'success'>('idle')
  const [progressLabel, setProgressLabel] = useState('Ready')
  const [submissionId, setSubmissionId] = useState<string | null>(null)
  const selectedFilesRef = useRef(selectedFiles)
  const addressBlurTimeoutRef = useRef<number | null>(null)

  useEffect(() => {
    selectedFilesRef.current = selectedFiles
  }, [selectedFiles])

  useEffect(() => {
    return () => {
      for (const entry of Object.values(selectedFilesRef.current)) {
        if (entry.previewUrl) {
          URL.revokeObjectURL(entry.previewUrl)
        }
      }
    }
  }, [])

  useEffect(() => {
    return () => {
      if (addressBlurTimeoutRef.current) {
        window.clearTimeout(addressBlurTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    const query = siteAddress.trim()

    if (query.length < addressQueryMinLength) {
      setAddressSuggestions([])
      setAddressSearchState('idle')
      setActiveAddressIndex(-1)
      return
    }

    const controller = new AbortController()
    const timeoutId = window.setTimeout(async () => {
      setAddressSearchState('loading')

      try {
        const response = await fetch(buildPhotonSearchUrl(query), {
          headers: {
            Accept: 'application/json',
          },
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error('Unable to load address suggestions.')
        }

        const result = (await response.json()) as PhotonResponse
        const suggestions = Array.from(
          new Set((result.suggestions ?? []).filter(Boolean).slice(0, addressSuggestionLimit)),
        )

        setAddressSuggestions(suggestions)
        setActiveAddressIndex(suggestions.length ? 0 : -1)
        setAddressSearchState('idle')
      } catch (fetchError) {
        if (controller.signal.aborted) {
          return
        }

        console.error(fetchError)
        setAddressSuggestions([])
        setActiveAddressIndex(-1)
        setAddressSearchState('error')
      }
    }, addressSearchDebounceMs)

    return () => {
      controller.abort()
      window.clearTimeout(timeoutId)
    }
  }, [siteAddress])

  const handleFileChange = (
    field: FileFieldName,
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const nextFile = event.target.files?.[0] ?? null

    setSelectedFiles((current) => {
      const previous = current[field]
      if (previous.previewUrl) {
        URL.revokeObjectURL(previous.previewUrl)
      }

      return {
        ...current,
        [field]: {
          file: nextFile,
          previewUrl: nextFile ? URL.createObjectURL(nextFile) : null,
        },
      }
    })
  }

  const resetSelectedFiles = () => {
    setSelectedFiles((current) => {
      for (const entry of Object.values(current)) {
        if (entry.previewUrl) {
          URL.revokeObjectURL(entry.previewUrl)
        }
      }

      return createEmptySelectedFiles()
    })
  }

  const selectAddressSuggestion = (suggestion: string) => {
    setSiteAddress(suggestion)
    setAddressSuggestions([])
    setShowAddressSuggestions(false)
    setAddressSearchState('idle')
    setActiveAddressIndex(-1)
  }

  const handleAddressKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!showAddressSuggestions || !addressSuggestions.length) {
      return
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveAddressIndex((current) =>
        current >= addressSuggestions.length - 1 ? 0 : current + 1,
      )
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveAddressIndex((current) =>
        current <= 0 ? addressSuggestions.length - 1 : current - 1,
      )
      return
    }

    if (event.key === 'Enter' && activeAddressIndex >= 0) {
      event.preventDefault()
      selectAddressSuggestion(addressSuggestions[activeAddressIndex])
      return
    }

    if (event.key === 'Escape') {
      setShowAddressSuggestions(false)
    }
  }

  const uploadAssets = async () => {
    const pendingUploads = fileFields
      .map(({ label, name }) => ({
        field: name,
        label,
        file: selectedFiles[name].file,
      }))
      .filter((item) => item.file)

    if (!pendingUploads.length) {
      return [] satisfies UploadedAsset[]
    }

    let completedCount = 0

    return Promise.all(
      pendingUploads.map(async (item) => {
        const file = item.file!
        setProgressLabel(`Uploading ${item.label.toLowerCase()}...`)

        const timeout = createTimeoutController(requestTimeoutMs)
        let response

        try {
          const uploadFormData = new FormData()
          uploadFormData.set('field', item.field)
          uploadFormData.set('file', file)

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
          throw new Error(result?.error?.trim() || 'Unable to upload photo.')
        }

        completedCount += 1
        setProgressLabel(
          completedCount === pendingUploads.length
            ? 'Uploads complete'
            : `Uploaded ${completedCount} of ${pendingUploads.length} photos`,
        )

        return {
          contentType:
            result?.contentType ?? file.type ?? 'application/octet-stream',
          downloadUrl: result?.downloadUrl,
          field: (result?.field as FileFieldName | undefined) ?? item.field,
          label: result?.label ?? item.label,
          originalName: result?.originalName ?? file.name,
          pathname: result?.pathname ?? '',
          size: result?.size ?? file.size,
          url: result?.url ?? '',
        } satisfies UploadedAsset
      }),
    )
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setSubmissionId(null)

    const form = event.currentTarget
    const formData = new FormData(form)

    if (getText(formData, 'website')) {
      setStatus('success')
      setSubmissionId(`screened-${crypto.randomUUID().slice(0, 8)}`)
      form.reset()
      setSiteAddress('')
      setAddressSuggestions([])
      setShowAddressSuggestions(false)
      resetSelectedFiles()
      return
    }

    try {
      setStatus('uploading')

      const uploads = await uploadAssets()
      const payload: IntakePayload = {
        battery: getText(formData, 'battery'),
        companyName: getText(formData, 'companyName'),
        contactName: getText(formData, 'contactName'),
        desiredSystemSize: getText(formData, 'desiredSystemSize'),
        email: getText(formData, 'email'),
        inverter: getText(formData, 'inverter'),
        mainPanelRating: getText(formData, 'mainPanelRating'),
        notes: getText(formData, 'notes'),
        phone: getText(formData, 'phone'),
        roofType: getText(formData, 'roofType'),
        siteAddress: getText(formData, 'siteAddress'),
        solarPanel: getText(formData, 'solarPanel'),
        uploads,
      }

      setStatus('submitting')
      setProgressLabel('Saving intake package...')

      const timeout = createTimeoutController(requestTimeoutMs)
      let response

      try {
        response = await fetch('/api/intake', {
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

      const result = await parseApiResponse<IntakeResponse>(response)

      if (!response.ok) {
        throw new Error(
          result?.error?.trim() || 'Unable to submit the intake package.',
        )
      }

      setStatus('success')
      setSubmissionId(result?.submissionId ?? null)
      setProgressLabel('Submission received')
      form.reset()
      setSiteAddress('')
      setAddressSuggestions([])
      setShowAddressSuggestions(false)
      resetSelectedFiles()
    } catch (submissionError) {
      setStatus('idle')
      setProgressLabel('Ready')
      setError(getSubmissionErrorMessage(submissionError))
    }
  }

  const isWorking = status === 'uploading' || status === 'submitting'

  return (
    <section className="rounded-[36px] border border-[#ececf0] bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] md:p-8">
      <form className="space-y-10" onSubmit={handleSubmit}>
        <input autoComplete="off" className="hidden" name="website" tabIndex={-1} />

        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-8">
            <section className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="field-label" htmlFor="contactName">
                  Primary Contact
                </label>
                <input
                  className="field-input"
                  id="contactName"
                  name="contactName"
                  placeholder="Name handling this permit set"
                  required
                  type="text"
                />
              </div>

              <div>
                <label className="field-label" htmlFor="email">
                  Email
                </label>
                <input
                  className="field-input"
                  id="email"
                  name="email"
                  placeholder="ops@brightify.solar"
                  required
                  type="email"
                />
              </div>

              <div>
                <label className="field-label" htmlFor="phone">
                  Phone
                </label>
                <input
                  className="field-input"
                  id="phone"
                  name="phone"
                  placeholder="(555) 555-0199"
                  required
                  type="tel"
                />
              </div>

            </section>

            <section className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="field-label" htmlFor="siteAddress">
                  Site Address
                </label>
                <div className="address-autocomplete">
                  <input
                    autoComplete="street-address"
                    className="field-input"
                    id="siteAddress"
                    name="siteAddress"
                    onBlur={() => {
                      addressBlurTimeoutRef.current = window.setTimeout(() => {
                        setShowAddressSuggestions(false)
                      }, 120)
                    }}
                    onChange={(event) => {
                      setSiteAddress(event.target.value)
                      setShowAddressSuggestions(true)
                    }}
                    onFocus={() => {
                      if (addressSuggestions.length) {
                        setShowAddressSuggestions(true)
                      }
                    }}
                    onKeyDown={handleAddressKeyDown}
                    placeholder="123 Main St, City, State, ZIP"
                    required
                    spellCheck={false}
                    type="text"
                    value={siteAddress}
                  />
                  {showAddressSuggestions &&
                  (addressSuggestions.length > 0 ||
                    siteAddress.trim().length >= addressQueryMinLength) ? (
                    <div className="address-suggestions" role="listbox">
                      {addressSuggestions.map((suggestion, index) => (
                        <button
                          aria-selected={index === activeAddressIndex}
                          className={`address-suggestion ${index === activeAddressIndex ? 'address-suggestion-active' : ''}`}
                          key={suggestion}
                          onMouseDown={(event) => {
                            event.preventDefault()
                            selectAddressSuggestion(suggestion)
                          }}
                          type="button"
                        >
                          {suggestion}
                        </button>
                      ))}
                      {!addressSuggestions.length && addressSearchState === 'loading' ? (
                        <div className="address-suggestion-meta">Looking up addresses...</div>
                      ) : null}
                      {!addressSuggestions.length && addressSearchState === 'error' ? (
                        <div className="address-suggestion-meta">
                          Address lookup is temporarily unavailable.
                        </div>
                      ) : null}
                      {!addressSuggestions.length && addressSearchState === 'idle' ? (
                        <div className="address-suggestion-meta">No address matches found.</div>
                      ) : null}
                    </div>
                  ) : null}
                </div>
                <p className="field-hint">
                  Suggestions are powered by OpenStreetMap search and fill the full address line.
                </p>
              </div>

              <div>
                <label className="field-label" htmlFor="mainPanelRating">
                  Main Panel Rating
                </label>
                <input
                  className="field-input"
                  id="mainPanelRating"
                  name="mainPanelRating"
                  placeholder="200A"
                  type="text"
                />
              </div>

              <div>
                <label className="field-label" htmlFor="roofType">
                  Roof Type
                </label>
                <select className="field-input" id="roofType" name="roofType">
                  <option value="">Select roof type</option>
                  {roofTypeOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="field-label" htmlFor="desiredSystemSize">
                  Desired System Size
                </label>
                <input
                  className="field-input"
                  id="desiredSystemSize"
                  name="desiredSystemSize"
                  placeholder="8.2 kW"
                  required
                  type="text"
                />
              </div>

              <div>
                <label className="field-label" htmlFor="solarPanel">
                  Panel Model
                </label>
                <input
                  className="field-input"
                  id="solarPanel"
                  name="solarPanel"
                  placeholder="Qcells Q.TRON BLK M-G2+"
                  type="text"
                />
              </div>

              <div>
                <label className="field-label" htmlFor="inverter">
                  Inverter
                </label>
                <input
                  className="field-input"
                  id="inverter"
                  name="inverter"
                  placeholder="Enphase IQ8M"
                  type="text"
                />
              </div>

              <div>
                <label className="field-label" htmlFor="battery">
                  Battery
                </label>
                <input
                  className="field-input"
                  id="battery"
                  name="battery"
                  placeholder="Tesla Powerwall 3"
                  type="text"
                />
              </div>
            </section>
          </div>

          <div className="rounded-[32px] border border-[#ececf0] bg-[#fafafa] p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#f3a43a]">
              Intake Notes
            </p>
            <p className="mt-3 text-sm leading-6 text-[#666674]">
              Call out service upgrades, trenching, detached structures, HOA review, or anything that could change engineering assumptions.
            </p>
            <textarea
              className="field-input mt-5 min-h-[280px] resize-y"
              id="notes"
              name="notes"
              placeholder="Existing PV? MPU planned? Detached garage? Utility constraints? Add those here."
            />
          </div>
        </div>

        <section>
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#f3a43a]">
                Site Photos
              </p>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#666674]">
                Upload the best available field photos. Files upload directly to Vercel Blob before the intake metadata is saved, which avoids large request payloads hitting a single serverless function.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {fileFields.map((field) => (
              <FileUploadCard
                accept={acceptedUploadTypes}
                fieldName={field.name}
                hint={field.hint}
                key={field.name}
                label={field.label}
                onChange={handleFileChange}
                selected={selectedFiles[field.name]}
              />
            ))}
          </div>
        </section>

        {error ? (
          <div className="rounded-[24px] border border-rose-200 bg-rose-50 px-5 py-4 text-sm leading-6 text-rose-700">
            {error}
          </div>
        ) : null}

        {status === 'success' ? (
          <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm leading-6 text-emerald-700">
            Submission received{submissionId ? ` with ID ${submissionId}` : ''}. The intake packet and file references are now stored in Vercel Blob.
          </div>
        ) : null}

        <div className="flex flex-col gap-4 border-t border-[#ececf0] pt-6 md:flex-row md:items-center md:justify-between">
          <div className="rounded-full border border-[#ececf0] bg-[#fafafa] px-4 py-2 text-sm text-[#666674]">
            {progressLabel}
          </div>

          <button
            className="inline-flex items-center justify-center rounded-full bg-[#f3a43a] px-6 py-3 text-sm font-semibold uppercase tracking-[0.22em] text-white shadow-[0_12px_30px_rgba(243,164,58,0.18)] transition hover:bg-[#e8982a] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isWorking}
            type="submit"
          >
            {status === 'uploading'
              ? 'Uploading Photos'
              : status === 'submitting'
                ? 'Submitting Packet'
                : 'Submit Intake'}
          </button>
        </div>
      </form>
    </section>
  )
}
