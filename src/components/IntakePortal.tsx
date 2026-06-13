import { useEffect, useRef, useState, type DragEvent } from 'react'

import '../intake-portal.css'
import { uploadIntakeFile } from '../lib/uploads'
import type { IntakePayload, UploadedAsset } from '../lib/intake'

// ── constants ─────────────────────────────────────────────────────────────────

const PACKAGES = {
  residential: {
    label: 'Residential PV',
    blurb: 'Rooftop or ground-mount PV, up to 25 kW DC.',
    tiers: [
      { id: 'single',  name: 'Single',  price: 299,  each: null,  tag: null,          desc: 'One project. 24-hr turnaround.' },
      { id: 'pack5',   name: '5-Pack',  price: 999,  each: 200,   tag: 'Most popular', desc: '$200 each · priority queue.' },
      { id: 'pack10',  name: '10-Pack', price: 1799, each: 180,   tag: null,          desc: '$180 each · scale package.' },
    ],
  },
  battery: {
    label: 'PV + Battery',
    blurb: 'PV with energy storage (ESS) — Tesla, Enphase, Franklin & more.',
    tiers: [
      { id: 'single',  name: 'Single',  price: 399,  each: null,  tag: null,          desc: 'One PV + battery project.' },
      { id: 'pack5',   name: '5-Pack',  price: 1500, each: 300,   tag: 'Most popular', desc: '$300 each · priority queue.' },
      { id: 'pack10',  name: '10-Pack', price: 2700, each: 270,   tag: null,          desc: '$270 each · storage volume.' },
    ],
  },
  commercial: {
    label: 'Commercial',
    blurb: 'C&I rooftop or carport, up to 250 kW. Custom quotes above.',
    tiers: [
      { id: 'standard',   name: 'Standard',   price: 899,  each: null, tag: null, desc: 'Up to 50 kW. 3–5 business days.' },
      { id: 'enterprise', name: 'Enterprise',  price: null, each: null, tag: null, desc: '150 kW+ or multi-site.' },
    ],
  },
} as const

type PackageKey = keyof typeof PACKAGES

const ADDON_DEFS = [
  { id: 'expedite',     name: 'Same-day expedite',      desc: 'Jump the queue — out in hours',           price: 99  },
  { id: 'ev',           name: 'EV charger circuit',     desc: 'Add a Level-2 charger branch',            price: 89  },
  { id: 'interconnect', name: 'Interconnection filing', desc: 'We file the utility application',         price: 199 },
] as const

type AddonId = (typeof ADDON_DEFS)[number]['id']

const STEPS = [
  { key: 'project',   n: '01', label: 'Project',   sub: 'Scope & package',    title: ["Let's scope your ", 'planset', '.'],        desc: 'Pick the project type and the package that matches how you buy.' },
  { key: 'site',      n: '02', label: 'Site',      sub: 'Address & AHJ',      title: ['Where\'s it ', 'going', '?'],               desc: "The address and jurisdiction, so we draft to your exact AHJ's requirements." },
  { key: 'property',  n: '03', label: 'Property',  sub: 'Roof & panel',       title: ['Roof & ', 'panel', '.'],                    desc: 'Structure, roofing, and the main service panel we\'re interconnecting with.' },
  { key: 'equipment', n: '04', label: 'Equipment', sub: 'Modules & inverter',  title: ['What are we ', 'installing', '?'],          desc: "Module, inverter, and storage selection — exactly as it'll be installed." },
  { key: 'photos',    n: '05', label: 'Photos',    sub: 'Site survey',        title: ['Show us the ', 'site', '.'],                desc: 'Clear survey photos let our drafters dimension everything the first time.' },
  { key: 'contact',   n: '06', label: 'Contact',   sub: 'You & add-ons',      title: ['Last ', 'details', '.'],                    desc: 'Where to reach you, plus any add-ons or special requests for this job.' },
] as const

type StepKey = (typeof STEPS)[number]['key']

const US_STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY']

const PHOTO_ZONES = [
  { id: 'msp',  title: 'Main service panel', sub: 'Cover open + closed, with the deadfront label legible.', required: true  },
  { id: 'roof', title: 'Roof faces',         sub: 'Each plane you plan to use, plus any obstructions.',     required: true  },
  { id: 'attic',title: 'Attic / framing',    sub: 'Rafter or truss spacing and dimensions.',                required: false },
  { id: 'site', title: 'Site & address',     sub: 'Street view, house number, meter location.',             required: false },
] as const

type PhotoZoneId = (typeof PHOTO_ZONES)[number]['id']

// ── types ─────────────────────────────────────────────────────────────────────

type PhotoFile = { id: string; url: string; name: string; file: File }
type PhotoState = Record<PhotoZoneId, PhotoFile[]>

type FormState = {
  package: PackageKey
  tier: string
  address: string; city: string; state: string; zip: string; apn: string; ahj: string; utility: string
  structure: string; stories: string; roofMaterial: string; framing: string; attachment: string
  busbar: string; mainBreaker: string; panelLoc: string; interconnection: string
  moduleMake: string; moduleModel: string; moduleQty: string; moduleWatts: string
  inverterType: string; inverterMake: string; inverterModel: string
  batteryMake: string; batteryModel: string; batteryQty: string; backup: string
  photos: PhotoState
  siteNotes: string
  addons: Partial<Record<AddonId, boolean>>
  name: string; company: string; email: string; phone: string; notes: string
}

const BLANK: FormState = {
  package: 'residential', tier: 'single',
  address: '', city: '', state: '', zip: '', apn: '', ahj: '', utility: '',
  structure: '', stories: '', roofMaterial: '', framing: '', attachment: '',
  busbar: '', mainBreaker: '', panelLoc: '', interconnection: '',
  moduleMake: '', moduleModel: '', moduleQty: '', moduleWatts: '',
  inverterType: '', inverterMake: '', inverterModel: '',
  batteryMake: '', batteryModel: '', batteryQty: '', backup: '',
  photos: { msp: [], roof: [], attic: [], site: [] },
  siteNotes: '', addons: {},
  name: '', company: '', email: '', phone: '', notes: '',
}

const STORE_KEY = 'brightify-intake-v2'

function loadSaved(): FormState | null {
  try {
    const raw = localStorage.getItem(STORE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw) as { form?: Partial<FormState> }
    return { ...BLANK, ...data.form, photos: { msp: [], roof: [], attic: [], site: [] } }
  } catch { return null }
}

// ── pricing helpers ───────────────────────────────────────────────────────────

function pricing(form: FormState) {
  const pkg = PACKAGES[form.package]
  const tier = pkg.tiers.find((t) => t.id === form.tier) ?? pkg.tiers[0]
  const base = tier.price
  const addonItems = ADDON_DEFS.filter((a) => form.addons[a.id])
  const addonSum = addonItems.reduce((s, a) => s + a.price, 0)
  const total = base === null ? null : base + addonSum
  return { pkg, tier, base, addonItems, addonSum, total }
}

function turnaround(form: FormState) {
  if (form.package === 'commercial') {
    return form.tier === 'enterprise' ? 'Custom schedule' : '3–5 business days'
  }
  return form.addons.expedite ? 'Same day' : '24 hours'
}

// ── icons ─────────────────────────────────────────────────────────────────────

function IArrow() {
  return (
    <svg className="arrow" width={14} height={14} viewBox="0 0 14 14" fill="none">
      <path d="M2 7h10m0 0L8 3m4 4L8 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IBack() {
  return (
    <svg width={14} height={14} viewBox="0 0 14 14" fill="none">
      <path d="M12 7H2m0 0l4-4M2 7l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IUpload() {
  return (
    <svg width={14} height={14} viewBox="0 0 14 14" fill="none">
      <path d="M7 2v7m0-7L4.5 4.5M7 2l2.5 2.5M2 9.5V11a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V9.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ── field primitives ──────────────────────────────────────────────────────────

function Field({ label, optional, hint, full, children }: {
  label?: string; optional?: boolean; hint?: string; full?: boolean; children: React.ReactNode
}) {
  return (
    <div className={`ip-field${full ? ' full' : ''}`}>
      {label && (
        <label>
          {label}
          {optional && <span className="opt">Optional</span>}
        </label>
      )}
      {children}
      {hint && <div className="hint">{hint}</div>}
    </div>
  )
}

function TextField({ label, optional, hint, full, suffix, ...props }: {
  label?: string; optional?: boolean; hint?: string; full?: boolean; suffix?: string
  [k: string]: unknown
}) {
  return (
    <Field label={label} optional={optional} hint={hint} full={full}>
      {suffix ? (
        <div className="ip-input-affix">
          <input className="ip-input" style={{ paddingRight: 48 }} {...(props as React.InputHTMLAttributes<HTMLInputElement>)} />
          <span className="suffix">{suffix}</span>
        </div>
      ) : (
        <input className="ip-input" {...(props as React.InputHTMLAttributes<HTMLInputElement>)} />
      )}
    </Field>
  )
}

function TextArea({ label, optional, hint, full, ...props }: {
  label?: string; optional?: boolean; hint?: string; full?: boolean
  [k: string]: unknown
}) {
  return (
    <Field label={label} optional={optional} hint={hint} full={full}>
      <textarea className="ip-input" {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)} />
    </Field>
  )
}

function SelectField({ label, optional, hint, full, options, value, onChange, placeholder }: {
  label?: string; optional?: boolean; hint?: string; full?: boolean
  options: readonly (string | { value: string; label: string })[]
  value: string; onChange: (v: string) => void; placeholder?: string
}) {
  return (
    <Field label={label} optional={optional} hint={hint} full={full}>
      <div className="select-wrap">
        <select className="ip-select" value={value} onChange={(e) => onChange(e.target.value)}>
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((o) => {
            const val = typeof o === 'string' ? o : o.value
            const lbl = typeof o === 'string' ? o : o.label
            return <option key={val} value={val}>{lbl}</option>
          })}
        </select>
      </div>
    </Field>
  )
}

function ChoiceCard({ name, price, desc, tag, selected, onClick }: {
  name: string; price?: string; desc?: string; tag?: string | null; selected: boolean; onClick: () => void
}) {
  return (
    <button type="button" className={`choice${selected ? ' sel' : ''}`} onClick={onClick}>
      {tag && <span className="c-tag">{tag}</span>}
      <span className="c-mark" />
      <div className="c-top">
        <span className="c-name">{name}</span>
      </div>
      {price && <span className="c-price">{price}</span>}
      {desc && <span className="c-desc">{desc}</span>}
    </button>
  )
}

function PillGroup({ options, value, onChange }: {
  options: readonly string[]; value: string; onChange: (v: string) => void
}) {
  return (
    <div className="pills">
      {options.map((o) => (
        <button
          type="button"
          key={o}
          className={`pill-choice${value === o ? ' sel' : ''}`}
          onClick={() => onChange(o)}
        >
          {o}
        </button>
      ))}
    </div>
  )
}

function AddonRow({ name, desc, price, on, onToggle }: {
  name: string; desc: string; price: string; on: boolean; onToggle: () => void
}) {
  return (
    <button type="button" className={`addon-row${on ? ' sel' : ''}`} onClick={onToggle}>
      <div className="a-text">
        <div className="a-name">{name}</div>
        <div className="a-desc">{desc}</div>
      </div>
      <div className="a-right">
        <span className="a-price">{price}</span>
        <span className="ip-toggle" />
      </div>
    </button>
  )
}

function Dropzone({ title, sub, required, files, onAdd, onRemove }: {
  title: string; sub: string; required: boolean
  files: PhotoFile[]; onAdd: (items: PhotoFile[]) => void; onRemove: (id: string) => void
}) {
  const [drag, setDrag] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = (list: FileList | null) => {
    if (!list) return
    const arr = Array.from(list).filter((f) => f.type.startsWith('image/'))
    const mapped: PhotoFile[] = arr.map((f) => ({
      id: Math.random().toString(36).slice(2),
      url: URL.createObjectURL(f),
      name: f.name,
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
    <div
      className={`dropzone${drag ? ' drag' : ''}${files.length ? ' filled' : ''}`}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
      onDragLeave={() => setDrag(false)}
      onDrop={handleDrop}
    >
      <div className="dz-head">
        <div>
          <div className="dz-title">{title}</div>
          <div className="dz-sub">{sub}</div>
        </div>
        {required && <span className="dz-req">Required</span>}
      </div>

      {files.length === 0 ? (
        <div className="dz-foot">
          <span className="dz-icon"><IUpload /></span>
          Drop or click to upload
        </div>
      ) : (
        <>
          <div className="dz-thumbs" onClick={(e) => e.stopPropagation()}>
            {files.map((f) => (
              <span
                key={f.id}
                className="dz-thumb"
                style={{ backgroundImage: `url(${f.url})` }}
                title={f.name}
              >
                <span className="x" onClick={() => onRemove(f.id)}>×</span>
              </span>
            ))}
            <span
              className="dz-add"
              onClick={(e) => { e.stopPropagation(); inputRef.current?.click() }}
            >+</span>
          </div>
          <div className="dz-foot" style={{ marginTop: 12 }}>
            <span className="dz-count">
              <span className="d" />
              {files.length} photo{files.length > 1 ? 's' : ''} added
            </span>
          </div>
        </>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        onChange={(e) => { handleFiles(e.target.files); e.target.value = '' }}
      />
    </div>
  )
}

// ── step components ───────────────────────────────────────────────────────────

function StepProject({ form, set }: { form: FormState; set: (patch: Partial<FormState>) => void }) {
  const pkg = PACKAGES[form.package]
  return (
    <div className="step-body">
      <div className="block">
        <div className="block-label">Project type</div>
        <div className="choice-grid cols-3">
          {(Object.entries(PACKAGES) as [PackageKey, typeof PACKAGES[PackageKey]][]).map(([k, v]) => (
            <ChoiceCard
              key={k}
              name={v.label}
              desc={v.blurb}
              selected={form.package === k}
              onClick={() => set({ package: k, tier: PACKAGES[k].tiers[0].id })}
            />
          ))}
        </div>
      </div>

      <div className="block">
        <div className="block-label">Choose your {pkg.label} package</div>
        <div className={`choice-grid cols-${pkg.tiers.length === 2 ? '2' : '3'}`}>
          {pkg.tiers.map((t) => (
            <ChoiceCard
              key={t.id}
              name={t.name}
              price={t.price === null ? 'Custom' : `$${t.price.toLocaleString()}${t.each ? ` · $${t.each}/set` : ''}`}
              desc={t.desc}
              tag={t.tag}
              selected={form.tier === t.id}
              onClick={() => set({ tier: t.id })}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function StepSite({ form, set }: { form: FormState; set: (patch: Partial<FormState>) => void }) {
  return (
    <div className="step-body">
      <div className="block">
        <div className="block-label">Project address</div>
        <div className="field-grid">
          <TextField full label="Street address" placeholder="1234 Maple Avenue"
            value={form.address} onChange={(e: React.ChangeEvent<HTMLInputElement>) => set({ address: e.target.value })} />
          <TextField label="City" placeholder="San Jose"
            value={form.city} onChange={(e: React.ChangeEvent<HTMLInputElement>) => set({ city: e.target.value })} />
          <Field label="State">
            <div className="select-wrap">
              <select className="ip-select" value={form.state} onChange={(e) => set({ state: e.target.value })}>
                <option value="">Select…</option>
                {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </Field>
          <TextField label="ZIP" placeholder="95112" inputMode="numeric"
            value={form.zip} onChange={(e: React.ChangeEvent<HTMLInputElement>) => set({ zip: e.target.value })} />
          <TextField label="Parcel / APN" optional placeholder="000-00-000"
            value={form.apn} onChange={(e: React.ChangeEvent<HTMLInputElement>) => set({ apn: e.target.value })} />
        </div>
      </div>

      <div className="block">
        <div className="block-label">Jurisdiction & utility</div>
        <div className="field-grid">
          <TextField label="AHJ / permit office" placeholder="City of San Jose"
            hint="We'll pull the latest submittal requirements for this AHJ."
            value={form.ahj} onChange={(e: React.ChangeEvent<HTMLInputElement>) => set({ ahj: e.target.value })} />
          <TextField label="Electric utility" placeholder="PG&E"
            value={form.utility} onChange={(e: React.ChangeEvent<HTMLInputElement>) => set({ utility: e.target.value })} />
        </div>
      </div>
    </div>
  )
}

function StepProperty({ form, set }: { form: FormState; set: (patch: Partial<FormState>) => void }) {
  return (
    <div className="step-body">
      <div className="block">
        <div className="block-label">Building</div>
        <Field label="Structure type">
          <PillGroup
            options={['Single-family', 'Townhome', 'Multi-family', 'Detached garage', 'Ground mount', 'Carport']}
            value={form.structure}
            onChange={(v) => set({ structure: v })}
          />
        </Field>
        <div className="field-grid" style={{ marginTop: 'var(--field-gap)' }}>
          <SelectField label="Stories" options={['1', '2', '3+']} placeholder="Select…"
            value={form.stories} onChange={(v) => set({ stories: v })} />
          <SelectField label="Roof material" placeholder="Select…"
            options={['Comp shingle', 'Tile (flat)', 'Tile (S/W)', 'Standing seam', 'Metal corrugated', 'Flat / TPO', 'Other']}
            value={form.roofMaterial} onChange={(v) => set({ roofMaterial: v })} />
          <SelectField label="Roof framing" optional placeholder="Select…"
            options={['Trusses', 'Rafters', 'Unknown — see photos']}
            value={form.framing} onChange={(v) => set({ framing: v })} />
          <SelectField label="Attachment" optional placeholder="Select…"
            options={['IronRidge', 'Unirac', 'SnapNrack', 'K2', 'Other / not sure']}
            value={form.attachment} onChange={(v) => set({ attachment: v })} />
        </div>
      </div>

      <div className="block">
        <div className="block-label">Main service panel</div>
        <div className="field-grid">
          <TextField label="Busbar rating" placeholder="200" suffix="A" inputMode="numeric"
            value={form.busbar} onChange={(e: React.ChangeEvent<HTMLInputElement>) => set({ busbar: e.target.value })} />
          <TextField label="Main breaker" placeholder="200" suffix="A" inputMode="numeric"
            value={form.mainBreaker} onChange={(e: React.ChangeEvent<HTMLInputElement>) => set({ mainBreaker: e.target.value })} />
          <SelectField label="Panel location" placeholder="Select…"
            options={['Exterior wall', 'Interior — garage', 'Interior — utility', 'Meter-main combo']}
            value={form.panelLoc} onChange={(v) => set({ panelLoc: v })} />
          <SelectField label="Interconnection" placeholder="Select…"
            options={['Backfeed breaker', 'Line-side tap', 'Supply-side', 'Not sure']}
            value={form.interconnection} onChange={(v) => set({ interconnection: v })} />
        </div>
      </div>
    </div>
  )
}

function StepEquipment({ form, set }: { form: FormState; set: (patch: Partial<FormState>) => void }) {
  const hasBattery = form.package === 'battery'
  return (
    <div className="step-body">
      <div className="block">
        <div className="block-label">Modules</div>
        <div className="field-grid">
          <TextField label="Module manufacturer" placeholder="Qcells"
            value={form.moduleMake} onChange={(e: React.ChangeEvent<HTMLInputElement>) => set({ moduleMake: e.target.value })} />
          <TextField label="Module model" placeholder="Q.TRON BLK M-G2+"
            value={form.moduleModel} onChange={(e: React.ChangeEvent<HTMLInputElement>) => set({ moduleModel: e.target.value })} />
          <TextField label="Quantity" placeholder="21" suffix="modules" inputMode="numeric"
            value={form.moduleQty} onChange={(e: React.ChangeEvent<HTMLInputElement>) => set({ moduleQty: e.target.value })} />
          <TextField label="Rated power" placeholder="425" suffix="W" inputMode="numeric"
            value={form.moduleWatts} onChange={(e: React.ChangeEvent<HTMLInputElement>) => set({ moduleWatts: e.target.value })} />
        </div>
      </div>

      <div className="block">
        <div className="block-label">Inverter</div>
        <Field label="Inverter type">
          <PillGroup
            options={['String', 'Microinverters', 'Optimizers', 'Hybrid']}
            value={form.inverterType}
            onChange={(v) => set({ inverterType: v })}
          />
        </Field>
        <div className="field-grid" style={{ marginTop: 'var(--field-gap)' }}>
          <TextField label="Inverter manufacturer" placeholder="Enphase"
            value={form.inverterMake} onChange={(e: React.ChangeEvent<HTMLInputElement>) => set({ inverterMake: e.target.value })} />
          <TextField label="Inverter model" placeholder="IQ8M-72-2-US"
            value={form.inverterModel} onChange={(e: React.ChangeEvent<HTMLInputElement>) => set({ inverterModel: e.target.value })} />
        </div>
      </div>

      {hasBattery && (
        <div className="block">
          <div className="block-label">Energy storage</div>
          <div className="field-grid">
            <TextField label="Battery manufacturer" placeholder="Tesla"
              value={form.batteryMake} onChange={(e: React.ChangeEvent<HTMLInputElement>) => set({ batteryMake: e.target.value })} />
            <TextField label="Battery model" placeholder="Powerwall 3"
              value={form.batteryModel} onChange={(e: React.ChangeEvent<HTMLInputElement>) => set({ batteryModel: e.target.value })} />
            <TextField label="Quantity" placeholder="1" suffix="units" inputMode="numeric"
              value={form.batteryQty} onChange={(e: React.ChangeEvent<HTMLInputElement>) => set({ batteryQty: e.target.value })} />
            <SelectField label="Backup configuration" placeholder="Select…"
              options={['Whole-home', 'Partial / critical loads', 'No backup (self-consume)']}
              value={form.backup} onChange={(v) => set({ backup: v })} />
          </div>
        </div>
      )}
    </div>
  )
}

function StepPhotos({ form, set }: { form: FormState; set: (patch: Partial<FormState>) => void }) {
  const photos = form.photos
  const addTo = (zone: PhotoZoneId, items: PhotoFile[]) =>
    set({ photos: { ...photos, [zone]: [...photos[zone], ...items] } })
  const removeFrom = (zone: PhotoZoneId, id: string) =>
    set({ photos: { ...photos, [zone]: photos[zone].filter((f) => f.id !== id) } })
  const total = Object.values(photos).reduce((n, arr) => n + arr.length, 0)

  return (
    <div className="step-body">
      <div className="block">
        <div className="block-label">
          Survey photos
          {total > 0 && <span style={{ color: 'var(--ip-positive)' }}>· {total} uploaded</span>}
        </div>
        <div className="dropzones">
          {PHOTO_ZONES.map((z) => (
            <Dropzone
              key={z.id}
              title={z.title}
              sub={z.sub}
              required={z.required}
              files={photos[z.id]}
              onAdd={(items) => addTo(z.id, items)}
              onRemove={(id) => removeFrom(z.id, id)}
            />
          ))}
        </div>
      </div>
      <div className="block">
        <TextArea full label="Anything we should know about the site?" optional
          placeholder="Setbacks, shading, HOA notes, conduit routing preferences, derate notes…"
          value={form.siteNotes} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => set({ siteNotes: e.target.value })} />
      </div>
    </div>
  )
}

function StepContact({ form, set }: { form: FormState; set: (patch: Partial<FormState>) => void }) {
  const toggle = (id: AddonId) =>
    set({ addons: { ...form.addons, [id]: !form.addons[id] } })
  return (
    <div className="step-body">
      <div className="block">
        <div className="block-label">Who's this for?</div>
        <div className="field-grid">
          <TextField label="Full name" placeholder="Jordan Reyes"
            value={form.name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => set({ name: e.target.value })} />
          <TextField label="Company" optional placeholder="Solstice Energy"
            value={form.company} onChange={(e: React.ChangeEvent<HTMLInputElement>) => set({ company: e.target.value })} />
          <TextField label="Email" type="email" placeholder="jordan@solstice.com"
            value={form.email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => set({ email: e.target.value })} />
          <TextField label="Phone" placeholder="(408) 555-0142"
            value={form.phone} onChange={(e: React.ChangeEvent<HTMLInputElement>) => set({ phone: e.target.value })} />
        </div>
      </div>

      <div className="block">
        <div className="block-label">Add-ons</div>
        <div className="addon-rows">
          {ADDON_DEFS.map((a) => (
            <AddonRow
              key={a.id}
              name={a.name}
              desc={a.desc}
              price={`+ $${a.price}`}
              on={!!form.addons[a.id]}
              onToggle={() => toggle(a.id)}
            />
          ))}
        </div>
      </div>

      <div className="block">
        <TextArea full label="Special requests or instructions" optional
          placeholder="Custom title block, preferred submittal format, deadlines, repeat-job notes…"
          value={form.notes} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => set({ notes: e.target.value })} />
      </div>
    </div>
  )
}

// ── summary sidebar ───────────────────────────────────────────────────────────

function Summary({ form }: { form: FormState }) {
  const p = pricing(form)
  return (
    <div className="summary">
      <div className="summary-hd">
        <span>Order summary</span>
        <span className="stamp">AHJ ready</span>
      </div>
      <div className="summary-body">
        <div className="summary-row">
          <span className="k">Project</span>
          <span className="v">{p.pkg.label}</span>
        </div>
        <div className="summary-row">
          <span className="k">Package</span>
          <span className="v">{p.tier.name}{p.tier.each ? ` · $${p.tier.each}/set` : ''}</span>
        </div>
        {p.base !== null ? (
          <div className="summary-row">
            <span className="k">Base</span>
            <span className="v">${p.base.toLocaleString()}</span>
          </div>
        ) : (
          <div className="summary-row">
            <span className="k">Base</span>
            <span className="v muted">Quoted after review</span>
          </div>
        )}
        {p.addonItems.length > 0 && (
          <div className="summary-addons">
            {p.addonItems.map((a) => (
              <div className="a" key={a.id}>
                <span>{a.name}</span>
                <span className="p">+ ${a.price}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="summary-total">
        <span className="lbl">{p.total === null ? 'Estimate' : 'Total'}</span>
        <span className="amt">{p.total === null ? 'Custom' : `$${p.total.toLocaleString()}`}</span>
      </div>
      <div className="summary-turn">
        Turnaround <span className="b">{turnaround(form)}</span>
      </div>
    </div>
  )
}

// ── confirmation ──────────────────────────────────────────────────────────────

function Confirmation({ form, onReset }: { form: FormState; onReset: () => void }) {
  const p = pricing(form)
  const ref = `BR-${Math.random().toString(36).slice(2, 7).toUpperCase()}`
  const photoCount = Object.values(form.photos).reduce((n, a) => n + a.length, 0)
  const siteAddress = [form.address, form.city, form.state].filter(Boolean).join(', ')

  return (
    <div className="confirm">
      <div className="confirm-mark" />
      <h2>Project <em>received</em>.</h2>
      <p>
        Thanks{form.name ? `, ${form.name.split(' ')[0]}` : ''} — your intake is in the queue.
        A designer will confirm scope shortly and your stamped, AHJ-ready set follows on schedule.
      </p>

      <div className="confirm-card">
        <div className="cc-hd">
          <span>Submission · {ref}</span>
          <span>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>
        <div className="cc-rows">
          <div className="cc-row"><span className="k">Project</span><span className="v">{p.pkg.label} · {p.tier.name}</span></div>
          <div className="cc-row"><span className="k">Address</span><span className="v">{siteAddress || '—'}</span></div>
          <div className="cc-row"><span className="k">AHJ</span><span className="v">{form.ahj || '—'}</span></div>
          <div className="cc-row"><span className="k">System</span><span className="v">{form.moduleQty && form.moduleWatts ? `${form.moduleQty} × ${form.moduleWatts}W` : '—'}</span></div>
          <div className="cc-row"><span className="k">Photos</span><span className="v">{photoCount} uploaded</span></div>
          <div className="cc-row"><span className="k">{p.total === null ? 'Estimate' : 'Total'}</span><span className="v">{p.total === null ? 'Custom quote' : `$${p.total.toLocaleString()}`}</span></div>
        </div>
      </div>

      <div className="confirm-timeline">
        <div className="t">
          <div className="when">Now</div>
          <div className="what">Intake received</div>
          <div className="who">Queued for review</div>
        </div>
        <div className="t">
          <div className="when">≈ 2 hours</div>
          <div className="what">Scope confirmed</div>
          <div className="who">Designer assigned</div>
        </div>
        <div className="t">
          <div className="when">{turnaround(form)}</div>
          <div className="what">Stamped set delivered</div>
          <div className="who">Ready to submit</div>
        </div>
      </div>

      <div className="confirm-actions">
        <a className="ip-btn ip-btn-grad ip-btn-lg" href="https://wa.me/14084643739" target="_blank" rel="noopener noreferrer">
          Chat with your designer <IArrow />
        </a>
        <button className="ip-btn ip-btn-ghost ip-btn-lg" onClick={onReset}>
          Submit another
        </button>
      </div>
    </div>
  )
}

// ── main portal ───────────────────────────────────────────────────────────────

const STEP_COMPONENTS: Record<StepKey, React.ComponentType<{ form: FormState; set: (p: Partial<FormState>) => void }>> = {
  project:   StepProject,
  site:      StepSite,
  property:  StepProperty,
  equipment: StepEquipment,
  photos:    StepPhotos,
  contact:   StepContact,
}

export default function IntakePortal() {
  const [step, setStep] = useState(0)
  const [done, setDone] = useState(false)
  const [form, setForm] = useState<FormState>(BLANK)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'uploading' | 'submitting' | 'error'>('idle')
  const [submitError, setSubmitError] = useState<string | null>(null)

  // add body class for background gradient
  useEffect(() => {
    document.body.classList.add('ip-portal')
    localStorage.removeItem(STORE_KEY)
    return () => document.body.classList.remove('ip-portal')
  }, [])

  // persist non-photo form state
  useEffect(() => {
    try {
      const { photos: _, ...rest } = form
      localStorage.setItem(STORE_KEY, JSON.stringify({ form: rest }))
    } catch { /* ignore */ }
  }, [form])

  // revoke object URLs on unmount
  useEffect(() => {
    return () => {
      Object.values(form.photos).flat().forEach((f) => URL.revokeObjectURL(f.url))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const set = (patch: Partial<FormState>) => setForm((f) => ({ ...f, ...patch }))
  const meta = STEPS[step]
  const StepComp = STEP_COMPONENTS[meta.key]
  const progress = ((step + 1) / STEPS.length) * 100
  const isLast = step === STEPS.length - 1
  const isWorking = submitStatus === 'uploading' || submitStatus === 'submitting'

  const go = (n: number) => {
    setStep(n)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const reset = () => {
    Object.values(form.photos).flat().forEach((f) => URL.revokeObjectURL(f.url))
    setForm(BLANK)
    setStep(0)
    setDone(false)
    setSubmitStatus('idle')
    setSubmitError(null)
  }

  const handleSubmit = async () => {
    setSubmitError(null)
    setSubmitStatus('uploading')

    try {
      // Upload all photos as sitePhotos
      const allPhotos = Object.entries(form.photos).flatMap(([zone, files]) =>
        files.map((f, i) => ({
          file: f.file,
          label: `${PHOTO_ZONES.find((z) => z.id === zone)?.title ?? zone}${files.length > 1 ? ` ${i + 1}` : ''}`,
        }))
      )

      const uploads: UploadedAsset[] = []
      for (const item of allPhotos) {
        const asset = await uploadIntakeFile({
          field: 'sitePhotos',
          file: item.file,
          label: item.label,
        })
        uploads.push(asset)
      }

      setSubmitStatus('submitting')

      // Build address string
      const addrParts = [form.address, form.city, form.state, form.zip].filter(Boolean)
      const siteAddress = addrParts.join(', ')

      // Build notes with all extra structured data
      const noteLines: string[] = []
      if (form.ahj) noteLines.push(`AHJ: ${form.ahj}`)
      if (form.utility) noteLines.push(`Utility: ${form.utility}`)
      if (form.apn) noteLines.push(`APN: ${form.apn}`)
      if (form.structure) noteLines.push(`Structure: ${form.structure}`)
      if (form.stories) noteLines.push(`Stories: ${form.stories}`)
      if (form.framing) noteLines.push(`Framing: ${form.framing}`)
      if (form.attachment) noteLines.push(`Attachment: ${form.attachment}`)
      if (form.panelLoc) noteLines.push(`Panel location: ${form.panelLoc}`)
      if (form.interconnection) noteLines.push(`Interconnection: ${form.interconnection}`)
      if (form.inverterType) noteLines.push(`Inverter type: ${form.inverterType}`)
      if (form.batteryQty) noteLines.push(`Battery qty: ${form.batteryQty}`)
      if (form.backup) noteLines.push(`Backup: ${form.backup}`)
      const selectedAddons = ADDON_DEFS.filter((a) => form.addons[a.id]).map((a) => a.name)
      if (selectedAddons.length) noteLines.push(`Add-ons: ${selectedAddons.join(', ')}`)
      if (form.siteNotes) noteLines.push(`Site notes: ${form.siteNotes}`)
      if (form.notes) noteLines.push(`Special requests: ${form.notes}`)

      const payload: IntakePayload = {
        requesterType: 'Installer',
        contactName: form.name || 'Not provided',
        companyName: form.company,
        email: form.email,
        phone: form.phone,
        siteAddress: siteAddress || 'Not provided',
        mainPanelRating: form.busbar ? `${form.busbar}A busbar / ${form.mainBreaker}A breaker` : 'Not provided',
        roofType: form.roofMaterial,
        desiredSystemSize: form.moduleQty && form.moduleWatts ? `${form.moduleQty} × ${form.moduleWatts}W` : '',
        solarPanel: [form.moduleMake, form.moduleModel].filter(Boolean).join(' '),
        inverter: [form.inverterMake, form.inverterModel].filter(Boolean).join(' '),
        battery: [form.batteryMake, form.batteryModel].filter(Boolean).join(' '),
        racking: '',
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
      window.scrollTo({ top: 0, behavior: 'smooth' })
      setSubmitStatus('idle')
    } catch (err) {
      setSubmitStatus('error')
      setSubmitError(err instanceof Error ? err.message : 'Submission failed. Please try again.')
    }
  }

  return (
    <>
      <header className="portal-top">
        <div className="bar">
          <a className="portal-brand" href="/">
            <img src="/brightify-mark.png" alt="Brightify" />
            <span>BRIGHTIFY</span>
            <span className="div" />
            <span className="sub">Planset intake</span>
          </a>
          <div className="portal-top-right">
            {!done && <span className="portal-save"><span className="ok" />Progress saved</span>}
            <span className="portal-help"><span className="dot" />Talk to a designer · (408) 464-3739</span>
          </div>
        </div>
      </header>

      <main className="intake">
        <aside className="rail">
          <div className="rail-head">
            <span className="eyebrow">{done ? 'All set' : 'Solar planset intake'}</span>
            <h1>{done ? <>You're <em>in</em>.</> : <>Build your <em>planset</em>.</>}</h1>
            <p>
              {done
                ? "We'll take it from here — keep an eye on WhatsApp and your inbox."
                : 'A few details and your survey photos. Most projects kick off in about 10 minutes.'}
            </p>
          </div>

          {!done && (
            <ol className="stepper">
              {STEPS.map((s, i) => (
                <li
                  key={s.key}
                  className={[i === step ? 'active' : i < step ? 'done' : '', i <= step ? 'clickable' : ''].join(' ').trim()}
                  onClick={() => { if (i <= step) go(i) }}
                >
                  <span className="ix">
                    {i < step ? <span className="chk" /> : s.n}
                  </span>
                  <span className="lbl">{s.label}<small>{s.sub}</small></span>
                </li>
              ))}
            </ol>
          )}

          <Summary form={form} />
        </aside>

        <section className="panel">
          <div className="panel-progress">
            <div className="fill" style={{ width: done ? '100%' : `${progress}%` }} />
          </div>

          {done ? (
            <div className="panel-inner">
              <Confirmation form={form} onReset={reset} />
            </div>
          ) : (
            <>
              <div className="panel-inner">
                <div className="step-head">
                  <div>
                    <span className="num">§ {meta.n} — {meta.label}</span>
                    <h2>{meta.title[0]}<em>{meta.title[1]}</em>{meta.title[2]}</h2>
                    <p>{meta.desc}</p>
                  </div>
                  <span className="count">Step {step + 1} / {STEPS.length}</span>
                </div>
                <StepComp form={form} set={set} />
              </div>

              {submitError && (
                <div className="ip-error">{submitError}</div>
              )}

              <div className="panel-foot">
                <span className="left-note">
                  {isLast ? 'Review your order summary, then submit' : 'No payment until your set is ready'}
                </span>
                <div className="actions">
                  {step > 0 && (
                    <button className="ip-btn ip-btn-ghost" onClick={() => go(step - 1)} disabled={isWorking}>
                      <IBack /> Back
                    </button>
                  )}
                  {isLast ? (
                    <button
                      className="ip-btn ip-btn-grad"
                      disabled={isWorking}
                      onClick={handleSubmit}
                    >
                      {isWorking
                        ? (submitStatus === 'uploading' ? 'Uploading photos…' : 'Submitting…')
                        : <>Submit project <IArrow /></>
                      }
                    </button>
                  ) : (
                    <button className="ip-btn ip-btn-grad" onClick={() => go(step + 1)}>
                      Continue <IArrow />
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </section>
      </main>
    </>
  )
}
