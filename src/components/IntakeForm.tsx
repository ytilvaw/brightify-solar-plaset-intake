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
const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.trim()
const googleMapsCallbackName = '__initGoogleMapsPlaces'
const googleMapsScriptId = 'google-maps-places-script'
const requestTimeoutMs = 10_000

type ApiErrorResponse = {
  error?: string
}

type IntakeResponse = ApiErrorResponse & {
  submissionId?: string
}

type UploadResponse = ApiErrorResponse & Partial<UploadedAsset>

type AddressPrediction = {
  description: string
  place_id: string
}

type PlacesLibrary = {
  AutocompleteSessionToken: new () => unknown
  AutocompleteSuggestion: {
    fetchAutocompleteSuggestions: (request: Record<string, unknown>) => Promise<{
      suggestions?: Array<{
        placePrediction?: {
          placeId?: string
          text?: {
            toString: () => string
          }
        }
      }>
    }>
  }
}

declare global {
  interface Window {
    google?: {
      maps: {
        places?: {
          AutocompleteSessionToken?: PlacesLibrary['AutocompleteSessionToken']
          AutocompleteSuggestion?: PlacesLibrary['AutocompleteSuggestion']
        }
        importLibrary?: (name: string) => Promise<PlacesLibrary>
      }
    }
    __googleMapsLoadError?: string
    __googleMapsPlacesPromise?: Promise<void>
    __initGoogleMapsPlaces?: () => void
  }
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

function buildGoogleMapsScriptUrl() {
  const params = new URLSearchParams({
    callback: googleMapsCallbackName,
    key: googleMapsApiKey,
    libraries: 'places',
    loading: 'async',
  })

  return `https://maps.googleapis.com/maps/api/js?${params.toString()}`
}

function loadGoogleMapsPlacesLibrary() {
  if (!googleMapsApiKey) {
    return Promise.resolve()
  }

  if (window.google?.maps?.importLibrary) {
    return Promise.resolve()
  }

  if (window.__googleMapsPlacesPromise) {
    return window.__googleMapsPlacesPromise
  }

  const existingScript = document.getElementById(googleMapsScriptId) as
    | HTMLScriptElement
    | null

  window.__googleMapsPlacesPromise = new Promise<void>((resolve, reject) => {
    window[googleMapsCallbackName] = () => {
      resolve()
    }

    const script = existingScript ?? document.createElement('script')

    script.id = googleMapsScriptId
    script.src = buildGoogleMapsScriptUrl()
    script.async = true
    script.defer = true

    script.onerror = () => {
      window.__googleMapsLoadError = 'Failed to load the Google Maps script.'
      reject(new Error(window.__googleMapsLoadError))
    }

    if (!existingScript) {
      document.head.appendChild(script)
    }
  })

  return window.__googleMapsPlacesPromise
}

export default function IntakeForm() {
  const [selectedFiles, setSelectedFiles] =
    useState<Record<FileFieldName, SelectedFileState>>(createEmptySelectedFiles)
  const [siteAddress, setSiteAddress] = useState('')
  const [addressPredictions, setAddressPredictions] = useState<AddressPrediction[]>([])
  const [showAddressPredictions, setShowAddressPredictions] = useState(false)
  const [activePredictionIndex, setActivePredictionIndex] = useState(-1)
  const [addressAutocompleteStatus, setAddressAutocompleteStatus] = useState<
    'disabled' | 'loading' | 'ready' | 'error'
  >(googleMapsApiKey ? 'loading' : 'disabled')
  const [addressAutocompleteMessage, setAddressAutocompleteMessage] = useState(
    googleMapsApiKey
      ? 'Loading Google address suggestions...'
      : 'Set VITE_GOOGLE_MAPS_API_KEY to enable Google address suggestions.',
  )
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] =
    useState<'idle' | 'uploading' | 'submitting' | 'success'>('idle')
  const [progressLabel, setProgressLabel] = useState('Ready')
  const [submissionId, setSubmissionId] = useState<string | null>(null)
  const selectedFilesRef = useRef(selectedFiles)
  const siteAddressInputRef = useRef<HTMLInputElement | null>(null)
  const placesLibraryRef = useRef<PlacesLibrary | null>(null)
  const sessionTokenRef = useRef<unknown | null>(null)
  const newestPredictionRequestIdRef = useRef(0)
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
    if (!googleMapsApiKey || !siteAddressInputRef.current) {
      return
    }

    let active = true

    void (async () => {
      try {
        await loadGoogleMapsPlacesLibrary()

        if (!active || !window.google?.maps?.importLibrary) {
          return
        }

        const placesLibrary = await window.google.maps.importLibrary('places')

        if (!active) {
          return
        }

        placesLibraryRef.current = placesLibrary
        sessionTokenRef.current = new placesLibrary.AutocompleteSessionToken()
        setAddressAutocompleteStatus('ready')
        setAddressAutocompleteMessage(
          'Google Places Autocomplete is enabled for U.S. street addresses.',
        )
      } catch (mapsError) {
        console.error(mapsError)
        setAddressAutocompleteStatus('error')
        setAddressAutocompleteMessage(
          mapsError instanceof Error
            ? mapsError.message
            : 'Google address suggestions could not be initialized.',
        )
      }
    })()

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (
      addressAutocompleteStatus !== 'ready' ||
      !placesLibraryRef.current ||
      !sessionTokenRef.current
    ) {
      return
    }

    const query = siteAddress.trim()

    if (query.length < 3) {
      setAddressPredictions([])
      setActivePredictionIndex(-1)
      return
    }

    const timeoutId = window.setTimeout(() => {
      const requestId = ++newestPredictionRequestIdRef.current

      void placesLibraryRef.current?.AutocompleteSuggestion.fetchAutocompleteSuggestions({
        includedRegionCodes: ['us'],
        input: query,
        language: 'en-US',
        region: 'us',
        sessionToken: sessionTokenRef.current,
      })
        .then((result) => {
          if (requestId !== newestPredictionRequestIdRef.current) {
            return
          }

          const predictions = (result.suggestions ?? [])
            .map((suggestion) => suggestion.placePrediction)
            .filter(Boolean)
            .map((prediction) => ({
              description: prediction?.text?.toString().trim() ?? '',
              place_id: prediction?.placeId ?? '',
            }))
            .filter((prediction) => prediction.description && prediction.place_id)

          setAddressPredictions(predictions)
          setActivePredictionIndex(predictions.length ? 0 : -1)
        })
        .catch((predictionError) => {
          console.error(predictionError)

          if (requestId !== newestPredictionRequestIdRef.current) {
            return
          }

          setAddressPredictions([])
          setActivePredictionIndex(-1)
          setAddressAutocompleteStatus('error')
          setAddressAutocompleteMessage(
            predictionError instanceof Error
              ? predictionError.message
              : 'Google address suggestions could not be loaded.',
          )
        })
    }, 200)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [addressAutocompleteStatus, siteAddress])

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

  const selectAddressPrediction = (prediction: AddressPrediction) => {
    setSiteAddress(prediction.description)
    setShowAddressPredictions(false)
    setAddressPredictions([])
    setActivePredictionIndex(-1)

    if (placesLibraryRef.current) {
      sessionTokenRef.current = new placesLibraryRef.current.AutocompleteSessionToken()
    }
  }

  const handleAddressKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!showAddressPredictions || !addressPredictions.length) {
      return
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActivePredictionIndex((current) =>
        current >= addressPredictions.length - 1 ? 0 : current + 1,
      )
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActivePredictionIndex((current) =>
        current <= 0 ? addressPredictions.length - 1 : current - 1,
      )
      return
    }

    if (event.key === 'Enter' && activePredictionIndex >= 0) {
      event.preventDefault()
      selectAddressPrediction(addressPredictions[activePredictionIndex])
      return
    }

    if (event.key === 'Escape') {
      setShowAddressPredictions(false)
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
      setAddressPredictions([])
      setShowAddressPredictions(false)
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
      setAddressPredictions([])
      setShowAddressPredictions(false)
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
                        setShowAddressPredictions(false)
                      }, 120)
                    }}
                    onChange={(event) => {
                      setSiteAddress(event.target.value)
                      setShowAddressPredictions(true)
                    }}
                    onFocus={() => {
                      if (addressPredictions.length) {
                        setShowAddressPredictions(true)
                      }
                    }}
                    onKeyDown={handleAddressKeyDown}
                    placeholder="123 Main St, City, State, ZIP"
                    ref={siteAddressInputRef}
                    required
                    spellCheck={false}
                    type="text"
                    value={siteAddress}
                  />
                  {showAddressPredictions && addressPredictions.length > 0 ? (
                    <div className="address-suggestions" role="listbox">
                      {addressPredictions.map((prediction, index) => (
                        <button
                          aria-selected={index === activePredictionIndex}
                          className={`address-suggestion ${index === activePredictionIndex ? 'address-suggestion-active' : ''}`}
                          key={prediction.place_id}
                          onMouseDown={(event) => {
                            event.preventDefault()
                            selectAddressPrediction(prediction)
                          }}
                          type="button"
                        >
                          {prediction.description}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
                <p
                  className={`field-hint ${addressAutocompleteStatus === 'error' ? 'field-hint-error' : ''}`}
                >
                  {addressAutocompleteMessage}
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
