import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import '../intake-single-page.css'
import type { IntakePayload, UploadedAsset } from '../lib/intake'

// ── Google Maps ───────────────────────────────────────────────────────────────

const GMAPS_API_KEY = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined)?.trim()
const GMAPS_CALLBACK = '__initGoogleMapsPlaces'
const GMAPS_SCRIPT_ID = 'google-maps-places-script'
const REQUEST_TIMEOUT_MS = 10_000

type AddressPrediction = { description: string; place_id: string }
type PlacesLibrary = {
  AutocompleteSessionToken: new () => unknown
  AutocompleteSuggestion: {
    fetchAutocompleteSuggestions: (req: Record<string, unknown>) => Promise<{
      suggestions?: Array<{ placePrediction?: { placeId?: string; text?: { toString: () => string } } }>
    }>
  }
}

function loadGoogleMapsPlaces(): Promise<void> {
  if (!GMAPS_API_KEY) return Promise.resolve()
  if (window.google?.maps?.importLibrary) return Promise.resolve()
  if (window.__googleMapsPlacesPromise) return window.__googleMapsPlacesPromise
  const existing = document.getElementById(GMAPS_SCRIPT_ID) as HTMLScriptElement | null
  window.__googleMapsPlacesPromise = new Promise<void>((resolve, reject) => {
    window[GMAPS_CALLBACK] = () => resolve()
    const script = existing ?? document.createElement('script')
    script.id = GMAPS_SCRIPT_ID
    script.src = `https://maps.googleapis.com/maps/api/js?${new URLSearchParams({ callback: GMAPS_CALLBACK, key: GMAPS_API_KEY, libraries: 'places', loading: 'async' })}`
    script.async = true
    script.defer = true
    script.onerror = () => { window.__googleMapsLoadError = 'Failed to load Google Maps'; reject(new Error(window.__googleMapsLoadError)) }
    if (!existing) document.head.appendChild(script)
  })
  return window.__googleMapsPlacesPromise
}

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

// ── icon ──────────────────────────────────────────────────────────────────────

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

// ── confirmation ──────────────────────────────────────────────────────────────

function Confirmation({ form, onReset }: {
  form: FormState; onReset: () => void
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
        A designer reviews scope next and your AHJ-ready set follows on the agreed schedule.
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

type PaymentSession = { paid: boolean; tierLabel: string; amount: number }

export default function IntakeSinglePage() {
  const [form, setForm] = useState<FormState>(() => loadSaved() ?? BLANK)
  const [done, setDone] = useState(false)
  const [status, setStatus] = useState<'idle' | 'submitting' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  // Stripe session from redirect
  const [stripeSessionId] = useState<string | null>(() => {
    const p = new URLSearchParams(window.location.search)
    return p.get('session_id')
  })
  const [payment, setPayment] = useState<PaymentSession | null>(null)
  const [paymentErr, setPaymentErr] = useState<string | null>(null)

  // address autocomplete
  const [addressPredictions, setAddressPredictions] = useState<AddressPrediction[]>([])
  const [showPredictions, setShowPredictions] = useState(false)
  const [activePredIdx, setActivePredIdx] = useState(-1)
  const [acStatus, setAcStatus] = useState<'disabled' | 'loading' | 'ready' | 'error'>(
    GMAPS_API_KEY ? 'loading' : 'disabled',
  )
  const addressInputRef = useRef<HTMLInputElement>(null)
  const placesLibRef = useRef<PlacesLibrary | null>(null)
  const sessionTokenRef = useRef<unknown | null>(null)
  const predReqIdRef = useRef(0)
  const addressBlurRef = useRef<number | null>(null)

  // add body class for background gradient
  useEffect(() => {
    document.body.classList.add('isp-portal')
    return () => document.body.classList.remove('isp-portal')
  }, [])

  // verify Stripe session
  useEffect(() => {
    if (!stripeSessionId) return
    void (async () => {
      try {
        const res = await fetch(`/api/checkout?session_id=${encodeURIComponent(stripeSessionId)}`)
        const data = await res.json() as { paid?: boolean; tierLabel?: string; amount?: number; error?: string }
        if (!res.ok || data.error) {
          setPaymentErr(data.error ?? 'Could not verify payment.')
          return
        }
        setPayment({ paid: data.paid ?? false, tierLabel: data.tierLabel ?? '', amount: data.amount ?? 0 })
      } catch {
        setPaymentErr('Could not verify payment. Please contact support.')
      }
    })()
  }, [stripeSessionId])

  // persist form
  useEffect(() => {
    try { localStorage.setItem(STORE_KEY, JSON.stringify({ form })) } catch { /* ignore */ }
  }, [form])

  // cleanup blur timer
  useEffect(() => {
    return () => { if (addressBlurRef.current) window.clearTimeout(addressBlurRef.current) }
  }, [])

  // load Google Maps Places library
  useEffect(() => {
    if (!GMAPS_API_KEY) return
    let active = true
    void (async () => {
      try {
        await loadGoogleMapsPlaces()
        if (!active || !window.google?.maps?.importLibrary) return
        const lib = await window.google.maps.importLibrary('places')
        if (!active) return
        placesLibRef.current = lib
        sessionTokenRef.current = new lib.AutocompleteSessionToken()
        setAcStatus('ready')
      } catch {
        if (active) setAcStatus('error')
      }
    })()
    return () => { active = false }
  }, [])

  // fetch address predictions
  useEffect(() => {
    if (acStatus !== 'ready' || !placesLibRef.current || !sessionTokenRef.current) return
    const query = form.address.trim()
    if (query.length < 3) { setAddressPredictions([]); setActivePredIdx(-1); return }
    const id = window.setTimeout(() => {
      const reqId = ++predReqIdRef.current
      void placesLibRef.current!.AutocompleteSuggestion.fetchAutocompleteSuggestions({
        includedRegionCodes: ['us'], input: query, language: 'en-US', region: 'us',
        sessionToken: sessionTokenRef.current,
      }).then((result) => {
        if (reqId !== predReqIdRef.current) return
        const preds = (result.suggestions ?? [])
          .map((s) => s.placePrediction)
          .filter(Boolean)
          .map((p) => ({ description: p!.text?.toString().trim() ?? '', place_id: p!.placeId ?? '' }))
          .filter((p) => p.description && p.place_id)
        setAddressPredictions(preds)
        setActivePredIdx(preds.length ? 0 : -1)
      }).catch(() => { if (reqId === predReqIdRef.current) setAddressPredictions([]) })
    }, 200)
    return () => window.clearTimeout(id)
  }, [acStatus, form.address])

  const selectPrediction = (pred: AddressPrediction) => {
    set({ address: pred.description })
    setShowPredictions(false)
    setAddressPredictions([])
    setActivePredIdx(-1)
    if (placesLibRef.current) sessionTokenRef.current = new placesLibRef.current.AutocompleteSessionToken()
  }

  const handleAddressKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!showPredictions || !addressPredictions.length) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setActivePredIdx((i) => i >= addressPredictions.length - 1 ? 0 : i + 1) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActivePredIdx((i) => i <= 0 ? addressPredictions.length - 1 : i - 1) }
    else if (e.key === 'Enter' && activePredIdx >= 0) { e.preventDefault(); selectPrediction(addressPredictions[activePredIdx]) }
    else if (e.key === 'Escape') setShowPredictions(false)
  }

  // email validation state
  const [emailStatus, setEmailStatus] = useState<'idle' | 'checking' | 'ok' | 'error'>('idle')
  const [emailError, setEmailError] = useState<string | null>(null)

  // reset email validation whenever the email value changes
  useEffect(() => {
    setEmailStatus('idle')
    setEmailError(null)
  }, [form.email])

  const checkEmail = async () => {
    const email = form.email.trim()
    if (!email) return
    setEmailStatus('checking')
    setEmailError(null)
    try {
      const res = await fetch('/api/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json() as { valid: boolean; reason?: string }
      if (data.valid) {
        setEmailStatus('ok')
      } else {
        setEmailStatus('error')
        setEmailError(data.reason ?? 'Invalid email address.')
      }
    } catch {
      // network failure — don't block the user, just reset to idle
      setEmailStatus('idle')
    }
  }

  const set = (patch: Partial<FormState>) => setForm((f) => ({ ...f, ...patch }))
  const isWorking = status === 'submitting'
  const ready = !!(form.requesterType && form.contact && form.email && form.address && emailStatus === 'ok')

  const reset = () => {
    setForm(BLANK)
    setDone(false)
    setStatus('idle')
    setError(null)
  }

  const handleSubmit = async (honeypot?: string) => {
    if (!ready || isWorking) return

    // honeypot bot screen
    if (honeypot) { setDone(true); return }

    setError(null)
    setStatus('submitting')

    try {
      const requesterType = form.requesterType === 'Homeowner' ? 'Homeowner' : 'Installer'

      const noteLines: string[] = []
      if (form.requesterType && form.requesterType !== 'Homeowner' && form.requesterType !== 'Solar installer / EPC') {
        noteLines.push(`Requester: ${form.requesterType}`)
      }
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
        racking: form.racking,
        notes: noteLines.join('\n'),
        uploads: [] as UploadedAsset[],
        ...(stripeSessionId ? { stripeSessionId } : {}),
      }

      const controller = new AbortController()
      const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
      let response: Response
      try {
        response = await fetch('/api/intake', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: controller.signal,
        })
      } finally {
        window.clearTimeout(timeoutId)
      }

      if (!response.ok) {
        const err = await response.json().catch(() => ({})) as { error?: string }
        throw new Error(err.error ?? 'Submission failed. Please try again.')
      }

      setDone(true)
      setStatus('idle')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      setStatus('error')
      if (err instanceof Error && err.name === 'AbortError') {
        setError(`Request timed out after ${REQUEST_TIMEOUT_MS / 1000}s. Please try again.`)
      } else {
        setError(err instanceof Error ? err.message : 'Submission failed. Please try again.')
      }
    }
  }

  if (done) {
    return (
      <main className="intake-page">
        <div className="intake-card">
          <Confirmation
            form={form}
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
      {/* ── payment confirmation banner ── */}
      {stripeSessionId && payment?.paid && (
        <div className="payment-banner payment-banner--ok">
          <span className="payment-banner-check">✓</span>
          <div>
            <strong>Payment confirmed</strong>
            {payment.tierLabel && <span> · {payment.tierLabel}</span>}
            {payment.amount > 0 && (
              <span> · ${(payment.amount / 100).toLocaleString('en-US', { minimumFractionDigits: 0 })}</span>
            )}
          </div>
        </div>
      )}
      {stripeSessionId && payment && !payment.paid && (
        <div className="payment-banner payment-banner--err">
          <span>Payment not completed.</span>{' '}
          <a href="/design#pricing">Return to pricing</a>
        </div>
      )}
      {stripeSessionId && paymentErr && (
        <div className="payment-banner payment-banner--err">
          <span>{paymentErr}</span>{' '}
          <a href="/design#pricing">Return to pricing</a>
        </div>
      )}

      {/* ── hero ── */}
      <header className="intake-hero">
        <img className="intake-logo" src="/brightify-logo.png" alt="Brightify" />
        <h1>Solar planset <em>intake</em>.</h1>
        <p className="sub">
          Submit the project details, and equipment assumptions needed to start planset design.
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
              <div className="isp-field">
                <label>Email</label>
                <div className="email-wrap">
                  <input
                    className={`isp-input${emailStatus === 'error' ? ' email-input-err' : ''}`}
                    type="email"
                    placeholder="ops@brightify.solar"
                    value={form.email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => set({ email: e.target.value })}
                    onBlur={checkEmail}
                  />
                  {emailStatus === 'checking' && (
                    <span className="email-status-icon">
                      <span className="email-spinner" aria-label="Checking…" />
                    </span>
                  )}
                  {emailStatus === 'ok' && (
                    <span className="email-status-icon email-ok" aria-label="Valid email">✓</span>
                  )}
                  {emailStatus === 'error' && (
                    <span className="email-status-icon email-err" aria-label="Invalid email">✕</span>
                  )}
                </div>
                {emailStatus === 'error' && emailError && (
                  <div className="isp-error">{emailError}</div>
                )}
              </div>
              <TextField
                label="Phone"
                placeholder="(555) 555-0199"
                value={form.phone}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => set({ phone: e.target.value })}
              />
            </div>

            {/* honeypot — never visible */}
            <input autoComplete="off" name="website" style={{ display: 'none' }} tabIndex={-1} />

            <div className="isp-field">
              <label>Site address</label>
              <div className="isp-address-wrap">
                <input
                  autoComplete="street-address"
                  className="isp-input"
                  placeholder="123 Main St, City, State, ZIP"
                  ref={addressInputRef}
                  spellCheck={false}
                  type="text"
                  value={form.address}
                  onChange={(e) => { set({ address: e.target.value }); setShowPredictions(true) }}
                  onFocus={() => { if (addressPredictions.length) setShowPredictions(true) }}
                  onBlur={() => { addressBlurRef.current = window.setTimeout(() => setShowPredictions(false), 120) }}
                  onKeyDown={handleAddressKeyDown}
                />
                {showPredictions && addressPredictions.length > 0 && (
                  <div className="isp-address-suggestions" role="listbox">
                    {addressPredictions.map((pred, idx) => (
                      <button
                        key={pred.place_id}
                        type="button"
                        className={`isp-address-suggestion${idx === activePredIdx ? ' active' : ''}`}
                        aria-selected={idx === activePredIdx}
                        onMouseDown={(e) => { e.preventDefault(); selectPrediction(pred) }}
                      >
                        {pred.description}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

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
            <div className="isp-sec-label">Intake notes</div>
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

      {/* ── submit ── */}
      <section className="intake-card">
        {error && <div className="isp-error">{error}</div>}

        <div className="submit-bar">
          <span className={`submit-status${ready ? ' ready' : ''}`}>
            <span className="dot" />
            {ready ? 'Ready' : 'Complete required fields'}
          </span>
          <button
            className="isp-btn isp-btn-grad isp-btn-lg"
            onClick={() => {
              const hp = (document.querySelector('input[name="website"]') as HTMLInputElement | null)?.value ?? ''
              void handleSubmit(hp)
            }}
            disabled={!ready || isWorking}
          >
            {isWorking ? 'Submitting…' : <>Submit intake <IArrow /></>}
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
