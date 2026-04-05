import { upload } from '@vercel/blob/client'
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
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

function createEmptySelectedFiles() {
  return Object.fromEntries(
    fileFields.map(({ name }) => [name, { file: null, previewUrl: null }]),
  ) as Record<FileFieldName, SelectedFileState>
}

function buildUploadPath(field: FileFieldName, file: File) {
  const sanitizedName = file.name.toLowerCase().replace(/[^a-z0-9.-]+/g, '-')
  return `intake-temp/${field}/${crypto.randomUUID()}-${sanitizedName}`
}

function getText(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === 'string' ? value.trim() : ''
}

export default function IntakeForm() {
  const [selectedFiles, setSelectedFiles] =
    useState<Record<FileFieldName, SelectedFileState>>(createEmptySelectedFiles)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] =
    useState<'idle' | 'uploading' | 'submitting' | 'success'>('idle')
  const [progressLabel, setProgressLabel] = useState('Ready')
  const [submissionId, setSubmissionId] = useState<string | null>(null)
  const selectedFilesRef = useRef(selectedFiles)

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

        const blob = await upload(buildUploadPath(item.field, file), file, {
          access: 'private',
          clientPayload: JSON.stringify({ field: item.field }),
          handleUploadUrl: '/api/uploads',
        })

        completedCount += 1
        setProgressLabel(
          completedCount === pendingUploads.length
            ? 'Uploads complete'
            : `Uploaded ${completedCount} of ${pendingUploads.length} photos`,
        )

        return {
          contentType: file.type || 'application/octet-stream',
          field: item.field,
          label: item.label,
          originalName: file.name,
          pathname: blob.pathname,
          size: file.size,
          url: blob.url,
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

      const response = await fetch('/api/intake', {
        body: JSON.stringify(payload),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      })

      const result = (await response.json()) as
        | { error?: string; submissionId?: string }
        | undefined

      if (!response.ok) {
        throw new Error(result?.error ?? 'Unable to submit the intake package.')
      }

      setStatus('success')
      setSubmissionId(result?.submissionId ?? null)
      setProgressLabel('Submission received')
      form.reset()
      resetSelectedFiles()
    } catch (submissionError) {
      setStatus('idle')
      setProgressLabel('Ready')
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : 'Unable to submit the intake package.',
      )
    }
  }

  const isWorking = status === 'uploading' || status === 'submitting'

  return (
    <section className="rounded-[36px] border border-[#efd8c2] bg-[rgba(255,255,255,0.94)] p-6 shadow-[0_30px_90px_rgba(236,160,74,0.12)] backdrop-blur md:p-8">
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
                <input
                  className="field-input"
                  id="siteAddress"
                  name="siteAddress"
                  placeholder="123 Main St, City, State, ZIP"
                  required
                  type="text"
                />
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

          <div className="rounded-[32px] border border-[#efd8c2] bg-[#fff7f1] p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#ef9f33]">
              Intake Notes
            </p>
            <p className="mt-3 text-sm leading-6 text-[#6f5b69]">
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
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#ef9f33]">
                Site Photos
              </p>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6f5b69]">
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

        <div className="flex flex-col gap-4 border-t border-[#f0ddd0] pt-6 md:flex-row md:items-center md:justify-between">
          <div className="rounded-full border border-[#f0ddd0] bg-[#fff7f2] px-4 py-2 text-sm text-[#7c6875]">
            {progressLabel}
          </div>

          <button
            className="inline-flex items-center justify-center rounded-full bg-[linear-gradient(135deg,#ff6f7d,#f7ab41)] px-6 py-3 text-sm font-semibold uppercase tracking-[0.22em] text-white shadow-[0_14px_34px_rgba(255,116,122,0.28)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
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
