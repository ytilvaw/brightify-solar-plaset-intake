import { useEffect, useRef, useState, type DragEvent } from 'react'
import '../intake-single-page.css'
import { uploadIntakeFile } from '../lib/uploads'
import type { IntakePayload, UploadedAsset } from '../lib/intake'

// ── constants ─────────────────────────────────────────────────────────────────

const REQUESTER_TYPES = [
  'Solar installer / EPC',
  'Homeowner',
  'General contractor',
  'Designer / consultant',
  'Other',
] as const

const ROOF_TYPES = [
  'Comp shingle',
  'Tile (flat)',
  'Tile (S / W)',
  'Standing seam',
  'Metal corrugated',
  'Flat / TPO',
  'Ground mount',
  'Other',
] as const

const STORE_KEY = 'brightify-intake-single-v2'

// ── types ─────────────────────────────────────────────────────────────────────

type FormState = {
  requesterType: string
  contact: string
  email: string
  phone: string
  address: string
  mainPanel: string
  roofType: string
  numPanels: string
  panelModel: string
  inverter: string
  battery: string
  racking: string
  notes: string
}

type UploadedFile = {
  id: string
  name: string
  size: number
  isImg: boolean
  url: string | null
  ext: string
  file: File
}

const BLANK: FormState = {
  requesterType: '', contact: '', email: '', phone: '', address: '',
  mainPanel: '', roofType: '', numPanels: '', panelModel: '',
  inverter: '', battery: '', racking: '', notes: '',
}

function loadSaved(): FormState | null {
  try {
    const raw = localStorage.getItem(STORE_KEY)
    if (!raw) return null
    return { ...BLANK, ...(JSON.parse(raw) as { form?: Partial<FormState> }).form }
  } catch { return null }
}

function fmtSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// ── icon ──────────────────────────────────────────────────────────────────────

function UploadIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 18 18" fill="none">
      <path
        d="M9 2.5v8m0-8L5.5 6M9 2.5 12.5 6M3 11.5v2A1.5 1.5 0 0 0 4.5 15h9a1.5 1.5 0 0 0 1.5-1.5v-2"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  )
}

function IArrow() {
  return (
    <svg className="arrow" width={14} height={14} viewBox="0 0 14 14" fill="none">
      <path d="M2 7h10m0 0L8 3m4 4L8 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ── field primitives ──────────────────────────────────────────────────────────

function Field({ label, optional, hint, children }: {
  label: string; optional?: boolean; hint?: string; children: React.ReactNode
}) {
  return (
    <div className="isp-field">
      <label>
        {label}
        {optional && <span className="opt">Optional</span>}
      </label>
      {children}
      {hint && <div className="hint">{hint}</div>}
    </div>
  )
}

function TextField({ label, optional, hint, ...props }: {
  label: string; optional?: boolean; hint?: string; [k: string]: unknown
}) {
  return (
    <Field label={label} optional={optional} hint={hint}>
      <input className="isp-input" {...(props as React.InputHTMLAttributes<HTMLInputElement>)} />
    </Field>
  )
}

// ── file drop zone ────────────────────────────────────────────────────────────

function FileDrop({ title, sub, files, onAdd, onRemove, field }: {
  title: string
  sub: string
  files: UploadedFile[]
  onAdd: (items: UploadedFile[]) => void
  onRemove: (id: string) => void
  field: 'sitePhotos' | 'datasheets'
}) {
  const [drag, setDrag] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = (list: FileList | null) => {
    if (!list) return
    const mapped: UploadedFile[] = Array.from(list).map((f) => ({
      id: Math.random().toString(36).slice(2),
      name: f.name,
      size: f.size,
      isImg: f.type.startsWith('image/'),
      url: f.type.startsWith('image/') ? URL.createObjectURL(f) : null,
      ext: (f.name.split('.').pop() ?? 'FILE').toUpperCase().slice(0, 4),
      file: f,
    }))
    onAdd(mapped)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDrag(false)
    handleFiles(e.dataTransfer.files)
  }

  return (
    <div>
      <div className="upload-head">
        <div className="ut">
          <span className="ut-title">{title}</span>
          <span className="ut-sub">{sub}</span>
        </div>
        <button
          type="button"
          className="isp-btn isp-btn-ghost isp-btn-sm"
          onClick={() => inputRef.current?.click()}
        >
          Add files
        </button>
      </div>

      <div
        className={`isp-dropzone${drag ? ' drag' : ''}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
        onDragLeave={() => setDrag(false)}
        onDrop={handleDrop}
      >
        <span className="dz-icon"><UploadIcon /></span>
        <span className="dz-cta">Drag &amp; drop, or <b>browse files</b></span>
        <span className="dz-formats">PDF, JPG, PNG, WEBP, HEIC, or HEIF up to 100 MB</span>
      </div>

      {files.length > 0 && (
        <div className="dz-files">
          {files.map((f) => (
            <div className="dz-file" key={f.id}>
              <span
                className="thumb"
                style={f.isImg && f.url ? { backgroundImage: `url(${f.url})` } : undefined}
              >
                {!f.isImg && f.ext}
              </span>
              <div className="meta">
                <div className="nm" title={f.name}>{f.name}</div>
                <div className="sz">{fmtSize(f.size)}</div>
              </div>
              <button
                type="button"
                className="rm"
                onClick={(e) => { e.stopPropagation(); onRemove(f.id) }}
                aria-label="Remove"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        multiple
        accept={field === 'sitePhotos' ? 'image/*,.heic,.heif' : '.pdf,image/*,.heic,.heif'}
        style={{ display: 'none' }}
        onChange={(e) => { handleFiles(e.target.files); e.target.value = '' }}
      />
    </div>
  )
}

// ── confirmation ──────────────────────────────────────────────────────────────

function Confirmation({ form, photoCount, sheetCount, onReset }: {
  form: FormState; photoCount: number; sheetCount: number; onReset: () => void
}) {
  const ref = `BR-${Math.random().toString(36).slice(2, 7).toUpperCase()}`
  const system = form.numPanels && form.panelModel
    ? `${form.numPanels} × ${form.panelModel}`
    : form.panelModel || form.numPanels || '—'

  return (
    <div className="confirm">
      <div className="isp-confirm-mark" />
      <h2>Intake <em>received</em>.</h2>
      <p>
        Thanks{form.contact ? `, ${form.contact.split(' ')[0]}` : ''} — your planset intake is in the queue.
        A designer reviews scope next and your stamped, AHJ-ready set follows on the agreed schedule.
      </p>

      <div className="isp-confirm-card">
        <div className="cc-hd">
          <span>Submission · {ref}</span>
          <span>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>
        <div className="cc-rows">
          <div className="cc-row"><span className="k">Requester</span><span className="v">{form.requesterType || '—'}</span></div>
          <div className="cc-row"><span className="k">Contact</span><span className="v">{form.contact || '—'}</span></div>
          <div className="cc-row"><span className="k">Site</span><span className="v">{form.address || '—'}</span></div>
          <div className="cc-row"><span className="k">System</span><span className="v">{system}</span></div>
          <div className="cc-row"><span className="k">Files</span><span className="v">{photoCount + sheetCount} uploaded</span></div>
        </div>
      </div>

      <div className="confirm-actions">
        <a
          className="isp-btn isp-btn-grad isp-btn-lg"
          href="https://wa.me/14084643739"
          target="_blank"
          rel="noopener noreferrer"
        >
          Chat with your designer <IArrow />
        </a>
        <button className="isp-btn isp-btn-ghost isp-btn-lg" onClick={onReset}>
          Submit another
        </button>
      </div>
    </div>
  )
}

// ── main component ────────────────────────────────────────────────────────────

export default function IntakeSinglePage() {
  const [form, setForm] = useState<FormState>(() => loadSaved() ?? BLANK)
  const [photos, setPhotos] = useState<UploadedFile[]>([])
  const [datasheets, setDatasheets] = useState<UploadedFile[]>([])
  const [done, setDone] = useState(false)
  const [status, setStatus] = useState<'idle' | 'uploading' | 'submitting' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  // add body class for background gradient
  useEffect(() => {
    document.body.classList.add('isp-portal')
    return () => document.body.classList.remove('isp-portal')
  }, [])

  // persist form
  useEffect(() => {
    try { localStorage.setItem(STORE_KEY, JSON.stringify({ form })) } catch { /* ignore */ }
  }, [form])

  // revoke object URLs on unmount
  useEffect(() => {
    return () => {
      ;[...photos, ...datasheets].forEach((f) => { if (f.url) URL.revokeObjectURL(f.url) })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const set = (patch: Partial<FormState>) => setForm((f) => ({ ...f, ...patch }))
  const isWorking = status === 'uploading' || status === 'submitting'
  const ready = !!(form.requesterType && form.contact && form.email && form.address)

  const reset = () => {
    ;[...photos, ...datasheets].forEach((f) => { if (f.url) URL.revokeObjectURL(f.url) })
    setForm(BLANK)
    setPhotos([])
    setDatasheets([])
    setDone(false)
    setStatus('idle')
    setError(null)
  }

  const handleSubmit = async () => {
    if (!ready || isWorking) return
    setError(null)
    setStatus('uploading')

    try {
      const uploads: UploadedAsset[] = []

      // Upload site photos
      for (const f of photos) {
        const asset = await uploadIntakeFile({ field: 'sitePhotos', file: f.file, label: f.name })
        uploads.push(asset)
      }

      // Upload datasheets
      for (const f of datasheets) {
        const asset = await uploadIntakeFile({ field: 'datasheets', file: f.file, label: f.name })
        uploads.push(asset)
      }

      setStatus('submitting')

      // Map requester type to API-accepted values
      const requesterType = form.requesterType === 'Homeowner' ? 'Homeowner' : 'Installer'

      // Build notes including extra fields
      const noteLines: string[] = []
      if (form.requesterType && form.requesterType !== 'Homeowner' && form.requesterType !== 'Solar installer / EPC') {
        noteLines.push(`Requester: ${form.requesterType}`)
      }
      if (form.racking) noteLines.push(`Racking: ${form.racking}`)
      if (form.notes) noteLines.push(form.notes)

      const payload: IntakePayload = {
        requesterType,
        contactName: form.contact,
        companyName: '',
        email: form.email,
        phone: form.phone,
        siteAddress: form.address,
        mainPanelRating: form.mainPanel,
        roofType: form.roofType,
        desiredSystemSize: form.numPanels,
        solarPanel: form.panelModel,
        inverter: form.inverter,
        battery: form.battery,
        notes: noteLines.join('\n'),
        uploads,
      }

      const response = await fetch('/api/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({})) as { error?: string }
        throw new Error(err.error ?? 'Submission failed. Please try again.')
      }

      setDone(true)
      setStatus('idle')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Submission failed. Please try again.')
    }
  }

  if (done) {
    return (
      <main className="intake-page">
        <div className="intake-card">
          <Confirmation
            form={form}
            photoCount={photos.length}
            sheetCount={datasheets.length}
            onReset={reset}
          />
        </div>
        <footer className="intake-foot">
          <span>Brightify · Solar plansets that pass</span>
          <span className="sep">·</span>
          <a href="https://wa.me/14084643739" target="_blank" rel="noopener noreferrer">
            Talk to a designer
          </a>
        </footer>
      </main>
    )
  }

  return (
    <main className="intake-page">
      {/* ── hero ── */}
      <header className="intake-hero">
        <img className="intake-logo" src="/brightify-logo.png" alt="Brightify" />
        <div className="intake-eyebrow">
          <span className="pill">Step</span>
          Project intake
        </div>
        <h1>Solar planset <em>intake</em>.</h1>
        <p className="sub">
          Submit the project details, equipment assumptions, and site photos needed to start planset design.
        </p>
      </header>

      {/* ── main form ── */}
      <section className="intake-card">
        <div className="form-grid">
          <div className="form-main">
            {/* Requester type */}
            <Field label="Requester type">
              <div className="isp-select-wrap">
                <select
                  className="isp-select"
                  value={form.requesterType}
                  onChange={(e) => set({ requesterType: e.target.value })}
                >
                  <option value="">Select requester type</option>
                  {REQUESTER_TYPES.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            </Field>

            <TextField
              label="Primary contact"
              placeholder="Name handling this permit set"
              value={form.contact}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => set({ contact: e.target.value })}
            />

            <div className="row-2">
              <TextField
                label="Email"
                type="email"
                placeholder="ops@brightify.solar"
                value={form.email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => set({ email: e.target.value })}
              />
              <TextField
                label="Phone"
                placeholder="(555) 555-0199"
                value={form.phone}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => set({ phone: e.target.value })}
              />
            </div>

            <TextField
              label="Site address"
              placeholder="123 Main St, City, State, ZIP"
              value={form.address}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => set({ address: e.target.value })}
            />

            <div className="row-2">
              <TextField
                label="Main panel rating"
                placeholder="200A"
                value={form.mainPanel}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => set({ mainPanel: e.target.value })}
              />
              <Field label="Roof type">
                <div className="isp-select-wrap">
                  <select
                    className="isp-select"
                    value={form.roofType}
                    onChange={(e) => set({ roofType: e.target.value })}
                  >
                    <option value="">Select roof type</option>
                    {ROOF_TYPES.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              </Field>
            </div>

            <div className="row-2">
              <TextField
                label="Number of panels"
                placeholder="24"
                inputMode="numeric"
                value={form.numPanels}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => set({ numPanels: e.target.value })}
              />
              <TextField
                label="Panel model"
                placeholder="Qcells Q.TRON BLK M-G2+"
                value={form.panelModel}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => set({ panelModel: e.target.value })}
              />
            </div>

            <div className="row-2">
              <TextField
                label="Inverter"
                placeholder="Enphase IQ8M"
                value={form.inverter}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => set({ inverter: e.target.value })}
              />
              <TextField
                label="Battery"
                optional
                placeholder="Tesla Powerwall 3"
                value={form.battery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => set({ battery: e.target.value })}
              />
            </div>

            <TextField
              label="Racking brand"
              optional
              placeholder="IronRidge, SnapNrack, Unirac…"
              value={form.racking}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => set({ racking: e.target.value })}
            />
          </div>

          {/* ── sticky notes panel ── */}
          <aside className="notes-panel">
            <div className="isp-sec-label">
              Intake<br />notes
            </div>
            <p className="notes-hint">
              Call out service upgrades, trenching, detached structures, HOA review, or anything that could change engineering assumptions.
            </p>
            <textarea
              className="isp-input"
              placeholder="Existing PV? MPU planned? Detached garage? Utility constraints? Add those here."
              value={form.notes}
              onChange={(e) => set({ notes: e.target.value })}
            />
          </aside>
        </div>
      </section>

      {/* ── site photos ── */}
      <section className="intake-card">
        <div className="isp-sec-label">
          Site photos <span className="opt">(optional)</span>
        </div>
        <FileDrop
          field="sitePhotos"
          title="Site photos"
          sub="Upload site photos of the main electrical panel, utility meter, front of house, roof areas, and anything unusual that may affect the design."
          files={photos}
          onAdd={(items) => setPhotos((p) => [...p, ...items])}
          onRemove={(id) => setPhotos((p) => p.filter((f) => f.id !== id))}
        />
      </section>

      {/* ── datasheets + submit ── */}
      <section className="intake-card">
        <div className="isp-sec-label">
          Datasheets <span className="opt">(optional)</span>
        </div>
        <FileDrop
          field="datasheets"
          title="Datasheets"
          sub="Upload equipment datasheets here: solar panels, inverter, battery, racking, and any other spec sheets you already have."
          files={datasheets}
          onAdd={(items) => setDatasheets((d) => [...d, ...items])}
          onRemove={(id) => setDatasheets((d) => d.filter((f) => f.id !== id))}
        />

        <div className="isp-divider" />

        {error && <div className="isp-error">{error}</div>}

        <div className="submit-bar">
          <span className={`submit-status${ready ? ' ready' : ''}`}>
            <span className="dot" />
            {ready ? 'Ready' : 'Complete required fields'}
          </span>
          <button
            className="isp-btn isp-btn-grad isp-btn-lg"
            onClick={handleSubmit}
            disabled={!ready || isWorking}
          >
            {isWorking
              ? (status === 'uploading' ? 'Uploading files…' : 'Submitting…')
              : <>Submit intake <IArrow /></>
            }
          </button>
        </div>
      </section>

      <footer className="intake-foot">
        <span>Brightify · Solar plansets that pass</span>
        <span className="sep">·</span>
        <a href="/">Back to site</a>
        <span className="sep">·</span>
        <a href="https://wa.me/14084643739" target="_blank" rel="noopener noreferrer">
          Talk to a designer
        </a>
      </footer>
    </main>
  )
}
