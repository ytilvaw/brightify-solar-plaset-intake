import { useState, useRef } from 'react'

interface FilePreview {
  file: File
  url: string
}

interface FormState {
  siteAddress: string
  mainPanelRating: string
  solarPanel: string
  inverter: string
  battery: string
}

function FileUploadField({
  id,
  name,
  label,
  hint,
  required,
}: {
  id: string
  name: string
  label: string
  hint?: string
  required?: boolean
}) {
  const [preview, setPreview] = useState<FilePreview | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setPreview((prev) => {
        if (prev) URL.revokeObjectURL(prev.url)
        return { file, url }
      })
    }
  }

  const handleRemove = () => {
    if (preview) URL.revokeObjectURL(preview.url)
    setPreview(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {hint && <p className="text-xs text-gray-500 mb-2">{hint}</p>}

      {!preview ? (
        <label
          htmlFor={id}
          className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
        >
          <svg
            className="w-8 h-8 text-gray-400 mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className="text-sm text-gray-500">Click to upload image</span>
          <span className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP, HEIC</span>
          <input
            ref={inputRef}
            id={id}
            name={name}
            type="file"
            accept="image/*"
            required={required}
            className="hidden"
            onChange={handleChange}
          />
        </label>
      ) : (
        <div className="relative rounded-lg overflow-hidden border border-gray-200">
          <img
            src={preview.url}
            alt={`Preview of ${label}`}
            className="w-full h-48 object-cover"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <label
              htmlFor={id}
              className="px-3 py-1.5 bg-white text-gray-800 text-sm font-medium rounded cursor-pointer hover:bg-gray-100"
            >
              Replace
              <input
                ref={inputRef}
                id={id}
                name={name}
                type="file"
                accept="image/*"
                required={required}
                className="hidden"
                onChange={handleChange}
              />
            </label>
            <button
              type="button"
              onClick={handleRemove}
              className="px-3 py-1.5 bg-red-500 text-white text-sm font-medium rounded hover:bg-red-600"
            >
              Remove
            </button>
          </div>
          <div className="px-3 py-2 bg-gray-50 border-t border-gray-200">
            <p className="text-xs text-gray-600 truncate">{preview.file.name}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default function SolarForm() {
  const [fields, setFields] = useState<FormState>({
    siteAddress: '',
    mainPanelRating: '',
    solarPanel: '',
    inverter: '',
    battery: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFields({ ...fields, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    const form = e.currentTarget
    const formData = new FormData(form)
    formData.set('form-name', 'solar-installation-survey')

    try {
      const res = await fetch('/form-solar.html', {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) throw new Error('Submission failed')
      setSubmitted(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="text-center max-w-md mx-auto py-16 px-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-2">Submission Received!</h2>
        <p className="text-gray-600">
          Your solar installation survey has been submitted. We'll review the details and be in touch soon.
        </p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-2xl px-4 py-10 mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-tight mb-2">
          Solar Installation Survey
        </h1>
        <p className="text-gray-600">
          Fill out the details below so we can assess your site for solar panel installation.
          Fields marked <span className="text-red-500">*</span> are required.
        </p>
      </div>

      <form
        name="solar-installation-survey"
        method="POST"
        encType="multipart/form-data"
        data-netlify="true"
        netlify-honeypot="bot-field"
        className="space-y-8"
        onSubmit={handleSubmit}
      >
        <input type="hidden" name="form-name" value="solar-installation-survey" />
        <p className="hidden" aria-hidden="true">
          <label>
            Don't fill this out: <input name="bot-field" tabIndex={-1} />
          </label>
        </p>

        {/* Section: Site Information */}
        <section>
          <h2 className="text-lg font-bold mb-4 pb-2 border-b">Site Information</h2>
          <div className="space-y-5">
            <div>
              <label htmlFor="siteAddress" className="block text-sm font-semibold mb-1">
                Site Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="siteAddress"
                name="siteAddress"
                value={fields.siteAddress}
                onChange={handleChange}
                required
                placeholder="123 Main St, City, State, ZIP"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="mainPanelRating" className="block text-sm font-semibold mb-1">
                Main Panel Rating (Amps) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="mainPanelRating"
                name="mainPanelRating"
                value={fields.mainPanelRating}
                onChange={handleChange}
                required
                placeholder="e.g. 200A"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </section>

        {/* Section: Site Photos */}
        <section>
          <h2 className="text-lg font-bold mb-4 pb-2 border-b">Site Photos</h2>
          <div className="space-y-6">
            <FileUploadField
              id="mainPanelPhoto"
              name="mainPanelPhoto"
              label="Picture of Main Panel"
              hint="Show whether there is a slot available for an additional breaker."
              required
            />
            <FileUploadField
              id="frontHousePhoto"
              name="frontHousePhoto"
              label="Front Picture of the House"
              required
            />
            <FileUploadField
              id="sidewallPhoto"
              name="sidewallPhoto"
              label="Picture of Sidewall of the House"
              required
            />
          </div>
        </section>

        {/* Section: Equipment */}
        <section>
          <h2 className="text-lg font-bold mb-4 pb-2 border-b">Planned Equipment</h2>
          <div className="space-y-5">
            <div>
              <label htmlFor="solarPanel" className="block text-sm font-semibold mb-1">
                Which Solar Panel are you planning to use? <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="solarPanel"
                name="solarPanel"
                value={fields.solarPanel}
                onChange={handleChange}
                required
                placeholder="e.g. Qcells Q.PEAK DUO 400W"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="inverter" className="block text-sm font-semibold mb-1">
                Which Inverter are you planning to use? <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="inverter"
                name="inverter"
                value={fields.inverter}
                onChange={handleChange}
                required
                placeholder="e.g. Enphase IQ8+"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="battery" className="block text-sm font-semibold mb-1">
                Which Battery are you planning to use?
              </label>
              <input
                type="text"
                id="battery"
                name="battery"
                value={fields.battery}
                onChange={handleChange}
                placeholder="e.g. Tesla Powerwall 3 (optional)"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </section>

        {error && (
          <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition-colors"
        >
          {submitting ? 'Submitting…' : 'Submit Survey'}
        </button>
      </form>
    </div>
  )
}
