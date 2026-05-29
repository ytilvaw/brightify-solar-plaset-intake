import { useState } from 'react'
import '../design-landing.css'
import { ADDONS, TIERS, formatPrice, type AddonId, type TierId } from '../lib/checkout'

// ── shared ────────────────────────────────────────────────────────────────

function Arrow({ size = 14 }: { size?: number }) {
  return (
    <svg className="arrow" width={size} height={size} viewBox="0 0 14 14" fill="none">
      <path
        d="M2 7h10m0 0L8 3m4 4L8 11"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function Stars({ count = 5 }: { count?: number }) {
  return (
    <div className="quote-stars" aria-label={`${count} out of 5`}>
      {'★'.repeat(count)}
    </div>
  )
}

function WhatsAppFab() {
  return (
    <a
      className="wa-fab"
      href="https://wa.me/14084643739"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
    >
      <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.13h-.01a8.2 8.2 0 0 1-4.18-1.14l-.3-.18-3.12.82.83-3.04-.2-.31a8.18 8.18 0 0 1-1.26-4.37c0-4.54 3.7-8.24 8.25-8.24a8.2 8.2 0 0 1 8.23 8.25c0 4.54-3.7 8.24-8.24 8.24Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.51.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43l-.48-.01c-.17 0-.43.06-.66.31-.23.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.28Z" />
      </svg>
    </a>
  )
}

// ── announce + nav ────────────────────────────────────────────────────────

function Announce() {
  return (
    <div className="announce">
      <div className="wrap">
        <div>
          <span className="announce-dot" />
          Now accepting new installer accounts · 24-hr turnaround
        </div>
        <div className="announce-right">Talk to a designer — (408) 464-3739</div>
      </div>
    </div>
  )
}

function Nav() {
  return (
    <nav className="nav">
      <div className="wrap">
        <a href="#top" className="brand">
          <img className="mark" src="/brightify-mark.png" alt="Brightify" />
          <span>BRIGHTIFY</span>
        </a>
        <div className="nav-links">
          <a href="#pricing">Pricing</a>
          <a href="#deliverables">What's included</a>
          <a href="#process">How it works</a>
          <a href="#coverage">Coverage</a>
          <a href="#faq">FAQ</a>
        </div>
        <div className="nav-cta">
          <a className="btn btn-ghost btn-sm" href="#pricing">
            See pricing
          </a>
          <a className="btn btn-grad btn-sm" href="#pricing">
            Purchase <Arrow />
          </a>
        </div>
      </div>
    </nav>
  )
}

// ── hero ──────────────────────────────────────────────────────────────────

const COVER_INDEX: [string, string][] = [
  ['PV-1', 'Cover Sheet'],
  ['PV-2', 'Site Plan'],
  ['PV-3', 'Roof Plan'],
  ['PV-4', 'Attachment'],
  ['PV-5', 'Single-Line'],
  ['PV-6', 'Calculations'],
  ['PV-7', 'Placards'],
]

function Hero() {
  return (
    <header className="hero" id="top">
      <div className="hero-sun" />
      <div className="hero-sun-2" />
      <div className="hero-grid" />
      <div className="wrap">
        <div>
          <div className="hero-eyebrow">
            <span className="pill">NEW</span>
            <span>AHJ-compliant plansets · all 50 states</span>
          </div>
          <h1 className="hero-title">
            Plansets that <em>pass</em>
            <br />
            the first time.
          </h1>
          <p className="hero-sub">
            Stamp-ready solar permit designs delivered in 24 hours — built by installers who've
            seen every red-line your AHJ throws. Submit. Approve. Install.
          </p>
          <div className="hero-ctas">
            <a className="btn btn-grad btn-lg" href="#pricing">
              Purchase <Arrow />
            </a>
            <a className="btn btn-ghost btn-lg" href="#sample">
              See sample planset
            </a>
          </div>
          <div className="hero-meta">
            <div className="hero-meta-faces" aria-hidden="true">
              <span>JR</span>
              <span>MK</span>
              <span>DV</span>
              <span>+9</span>
            </div>
            <div>
              <span className="hero-meta-stars">★★★★★</span>
              <strong>4.9</strong> · trusted by 300+ installers
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="turn-badge">
            <div className="big">
              24<small style={{ fontSize: 16, marginLeft: 2 }}>hr</small>
            </div>
            <div className="small">Standard turnaround</div>
          </div>

          <div className="sheet sheet-1">
            <div className="sheet-hdr">
              <span>PV-002 · Site Plan</span>
              <span className="stamp">AHJ READY</span>
            </div>
            <div className="sheet-body">
              <div className="sample-site">
                <div className="lot" />
                <div className="house" />
                <div className="tag">LOT · 7,200 SF</div>
              </div>
            </div>
            <div className="sheet-ftr">
              <span>1234 Maple Ave</span>
              <span>Rev 1</span>
            </div>
          </div>

          <div className="sheet sheet-2">
            <div className="sheet-hdr">
              <span>PV-003 · Roof Plan</span>
              <span className="stamp">8.4 kW</span>
            </div>
            <div className="sheet-body blueprint">
              <div className="dim-line top">38' — 11"</div>
              <div className="dim-line left">22' — 6"</div>
              <div className="roof" />
              <div className="callout-pill">
                <span className="dot" />
                21 × 400W
              </div>
            </div>
            <div className="sheet-ftr">
              <span>Tilt 23° · Az 192°</span>
              <span>1/4" = 1'</span>
            </div>
          </div>

          <div className="sheet sheet-3">
            <div className="sheet-hdr">
              <span>PV-001 · Cover Sheet</span>
              <span className="stamp">PE ✓</span>
            </div>
            <div className="sheet-body">
              <div className="sample-cover">
                <div>
                  <div className="ttl">
                    Residential Solar PV
                    <br />
                    Permit Plan Set
                  </div>
                  <div className="sub">8.40 kW DC · 7.60 kW AC · CEC 2025</div>
                </div>
                <div className="cover-body">
                  <div className="cover-index">
                    <div className="cover-index-hd">SHEET INDEX</div>
                    {COVER_INDEX.map(([t, n], i) => (
                      <div className="cover-row" key={i}>
                        <span>{t}</span>
                        <span>{n}</span>
                      </div>
                    ))}
                  </div>
                  <div className="cover-aside">
                    <div className="cover-vicinity">
                      <span>VICINITY MAP</span>
                    </div>
                    <div className="cover-stamp">
                      <div className="cover-codes">
                        <span>NEC 2023</span>
                        <span>IRC 2024</span>
                        <span>CEC 2025</span>
                      </div>
                      <div className="cover-seal">
                        PE
                        <br />
                        SEAL
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bot">
                  <span>Prepared for HOMEOWNER</span>
                  <span>Sheet 1 of 9</span>
                </div>
              </div>
            </div>
            <div className="sheet-ftr">
              <span>Brightify Solar Design</span>
              <span>05-28-2026</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

// ── trust strip ───────────────────────────────────────────────────────────

const TRUST_CELLS = [
  { big: '96', sub: '%', lbl: 'First-pass AHJ approval rate across 50 states.', grad: true },
  { big: '24', sub: 'hr', lbl: 'Standard turnaround on residential plansets.' },
  { big: '3,200', sub: '+', lbl: 'Plansets shipped to installers since 2021.' },
  { big: '$299', sub: '', lbl: 'Starts here. Pay per planset or buy a 5-pack.' },
]

function Trust() {
  return (
    <section className="trust" style={{ padding: 0 }}>
      <div className="wrap">
        {TRUST_CELLS.map((c, i) => (
          <div key={i} className="trust-cell">
            <div className={`big${c.grad ? ' grad' : ''}`}>
              {c.big}
              <sub>{c.sub}</sub>
            </div>
            <div className="lbl">{c.lbl}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

// ── deliverables ──────────────────────────────────────────────────────────

const DELIVERABLES = [
  {
    tag: 'PV-1',
    num: '01 / 09',
    title: 'Cover Sheet',
    desc: 'Scope of work, code summary, table of contents, general notes.',
    img: '/sheets/01-cover.png',
  },
  {
    tag: 'PV-2',
    num: '02 / 09',
    title: 'Site Plan',
    desc: 'Property lines, fire setbacks, equipment locations, roof access.',
    img: '/sheets/02-site.png',
  },
  {
    tag: 'PV-3',
    num: '03 / 09',
    title: 'Array Detail',
    desc: 'Per-array layout, rafter spacing, load calculations, design criteria.',
    img: '/sheets/03-array.png',
  },
  {
    tag: 'PV-4',
    num: '04 / 09',
    title: 'String Layout',
    desc: 'Module-level wiring, string assignments, BOM and grounding.',
    img: '/sheets/04-string.png',
  },
  {
    tag: 'PV-5',
    num: '05 / 09',
    title: 'Attachment Detail',
    desc: 'Mounting hardware, flashing and lag spacing.',
    img: '/sheets/05-attach.png',
  },
  {
    tag: 'PV-6',
    num: '06 / 09',
    title: 'Equipment Elevation',
    desc: 'ESS, MSP, disconnects, conduit runs — clearances called out.',
    img: '/sheets/06-elev.png',
  },
  {
    tag: 'PV-7',
    num: '07 / 09',
    title: 'Electrical Line Diagram',
    desc: 'DC source, inverter, ESS, AC interconnect, OCPD, grounding.',
    img: '/sheets/07-electrical.png',
  },
  {
    tag: 'PV-8',
    num: '08 / 09',
    title: 'Wiring Calculations',
    desc: 'Conductor ampacity, voltage drop, OCPD sizing.',
    img: '/sheets/08-calcs.png',
  },
  {
    tag: 'PV-9',
    num: '09 / 09',
    title: 'Placards & Labels',
    desc: 'NEC placards, AC/DC disconnect labels, rapid-shutdown markings.',
    img: '/sheets/09-placards.png',
  },
]

function Deliverables() {
  return (
    <section id="deliverables">
      <div className="wrap">
        <div className="section-head">
          <div className="left">
            <span className="mono num">§ 01 — Deliverables</span>
            <h2>
              Every sheet your <em>AHJ</em> needs.
            </h2>
          </div>
          <p className="lead">
            Each Brightify planset ships as a fully dimensioned, stamped, AHJ-ready PDF — covering
            the entire submittal package from cover sheet to placards. Nothing is ever an upsell.
          </p>
        </div>

        <div className="deliverables">
          {DELIVERABLES.map((d, i) => (
            <div key={i} className="deliv">
              <div className="deliv-hdr">
                <span className="deliv-tag">{d.tag}</span>
                <span className="deliv-num">{d.num}</span>
              </div>
              <div className="deliv-thumb">
                <img className="sheet-img" src={d.img} alt={d.title} loading="lazy" />
                <span className="deliv-thumb-label">{d.tag}</span>
              </div>
              <div className="deliv-text">
                <h3>{d.title}</h3>
                <p>{d.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── process ───────────────────────────────────────────────────────────────

const STEPS = [
  {
    n: '01',
    time: '≈ 10 min',
    title: 'Submit project intake',
    body: "Drop your site survey photos, address and equipment list into the portal. We'll confirm scope and pull your AHJ's latest requirements.",
    points: ['Address & utility', 'Module + inverter list', 'Site survey photos', 'Special requests'],
  },
  {
    n: '02',
    time: '24 hours',
    title: 'We draft the planset',
    body: 'Our drafters produce a complete, dimensioned set — site plan, roof plan, electricals, calcs, placards — ready for AHJ submittal.',
    points: ['NEC + IBC current code', 'PE stamp on request', 'Free revisions', 'Live chat with designer'],
  },
  {
    n: '03',
    time: 'Ship today',
    title: 'Permit · install · energize',
    body: "Submit straight to your AHJ. If they red-line anything, we'll revise free until it passes. Then go install.",
    points: [
      'Free AHJ revisions',
      'Interconnection support',
      'PTO assistance',
      'Permit-ready package',
    ],
  },
]

function Process() {
  return (
    <section className="process" id="process">
      <div className="wrap">
        <div className="section-head">
          <div className="left">
            <span className="mono num">§ 02 — Process</span>
            <h2>
              From intake to <em>energized</em>.
            </h2>
          </div>
          <p className="lead">
            Three steps, zero surprises. We've designed the workflow around the way real installers
            work — submit fast, ship fast, install faster.
          </p>
        </div>

        <div className="process-steps">
          {STEPS.map((s, i) => (
            <div key={i} className="step">
              <div className="step-num">{s.n}</div>
              <div className="step-time">{s.time}</div>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
              <ul>
                {s.points.map((p, j) => (
                  <li key={j}>{p}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── pricing ───────────────────────────────────────────────────────────────

type PricingTier = {
  name: string
  price: number | null
  priceLabel?: string
  each: number | null
  save: string | null
  desc: string
  feats: string[]
  cta: string
  highlight?: boolean
  tag?: string
}

type PricingCategory = {
  label: string
  from: string
  desc: string
  tiers: PricingTier[]
}

type PricingKey = 'residential' | 'battery' | 'commercial'

const PRICING: Record<PricingKey, PricingCategory> = {
  residential: {
    label: 'Residential PV',
    from: 'from $299',
    desc: 'Rooftop or ground-mount PV. Up to 25 kW DC.',
    tiers: [
      {
        name: 'Single',
        price: 299,
        each: null,
        save: null,
        desc: 'One project. Best for DIY and one-off jobs.',
        feats: [
          '1 complete planset',
          '24-hour turnaround',
          'Free AHJ revisions',
          'AC/DC placards included',
        ],
        cta: 'Buy one project',
      },
      {
        name: '5-Pack',
        price: 999,
        each: 200,
        save: '$496',
        desc: 'Best value for active installers. Use anytime.',
        feats: [
          '5 plansets · $200 each',
          'Priority queue · 24 hr or less',
          'Free AHJ revisions',
          'Dedicated project manager',
          'Credits never expire',
        ],
        cta: 'Buy 5-pack',
        highlight: true,
        tag: 'Most popular',
      },
      {
        name: '10-Pack',
        price: 1799,
        each: 180,
        save: '$1,191',
        desc: 'Scale package for high-volume installers.',
        feats: [
          '10 plansets · $180 each',
          'Same-day expedites available',
          'Free AHJ revisions',
          'Account manager + dedicated line',
          'Custom title block + cover sheet',
          'Quarterly account review',
        ],
        cta: 'Buy 10-pack',
      },
    ],
  },
  battery: {
    label: 'PV + Battery',
    from: 'from $399',
    desc: 'PV with energy storage (ESS). Tesla, Enphase, Franklin, more.',
    tiers: [
      {
        name: 'Single',
        price: 399,
        each: null,
        save: null,
        desc: 'One PV + battery project, fully integrated.',
        feats: [
          '1 complete PV + ESS planset',
          '24-hour turnaround',
          'Backup/whole-home wiring',
          'Free AHJ revisions',
          'Critical-load panel detail',
        ],
        cta: 'Buy one project',
      },
      {
        name: '5-Pack',
        price: 1499,
        each: 300,
        save: '$495',
        desc: 'Battery projects, priority queue.',
        feats: [
          '5 plansets · $300 each',
          'Priority queue',
          'Free AHJ revisions',
          'Dedicated PM',
          'Custom title block',
          'Credits never expire',
        ],
        cta: 'Buy 5-pack',
        highlight: true,
        tag: 'Most popular',
      },
      {
        name: '10-Pack',
        price: 2699,
        each: 270,
        save: '$1,290',
        desc: 'Volume tier for storage-heavy installers.',
        feats: [
          '10 plansets · $270 each',
          'Same-day expedites',
          'Free AHJ revisions',
          'Account manager',
          'Quarterly account review',
        ],
        cta: 'Buy 10-pack',
      },
    ],
  },
  commercial: {
    label: 'Commercial',
    from: 'from $899',
    desc: 'C&I rooftop or carport. Up to 250 kW. Custom quotes above.',
    tiers: [
      {
        name: 'Standard',
        price: 899,
        each: null,
        save: null,
        desc: 'Up to 50 kW. Roof, ballasted or carport.',
        feats: [
          'Full commercial planset',
          '3-5 business day turnaround',
          'Structural calcs included',
          'Free AHJ revisions',
        ],
        cta: 'Start a project',
      },
      {
        name: 'Enterprise',
        price: null,
        priceLabel: 'Custom',
        each: null,
        save: null,
        desc: '150 kW+ or multi-site programs.',
        feats: [
          'Custom scope & pricing',
          'Volume discounts',
          'Multi-state coordination',
          'PE network in all 50 states',
          'Master service agreement',
          'Onsite kickoff if needed',
        ],
        cta: 'Talk to sales',
      },
    ],
  },
}

const ADDON_DISPLAY = [
  { name: 'PE Stamp', plus: '+ $199' },
  { name: 'Structural letter', plus: '+ $149' },
  { name: 'Same-day expedite', plus: '+ $99' },
  { name: 'EV charger circuit', plus: '+ $89' },
  { name: 'Interconnection filing', plus: '+ $149' },
]

// ── addons modal ──────────────────────────────────────────────────────────

function AddonsModal({
  tierId,
  onClose,
}: {
  tierId: TierId
  onClose: () => void
}) {
  const tier = TIERS[tierId]
  const [selected, setSelected] = useState<Set<AddonId>>(new Set())
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const toggle = (id: AddonId) =>
    setSelected((s) => {
      const next = new Set(s)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const total =
    tier.price + [...selected].reduce((sum, id) => sum + ADDONS[id].price, 0)

  const handlePay = async () => {
    setLoading(true)
    setErr(null)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: tierId, addons: [...selected] }),
      })
      const text = await res.text()
      if (!text) throw new Error('Checkout API is not available. Run `vercel dev` locally or deploy to Vercel.')
      const data = JSON.parse(text) as { url?: string; error?: string }
      if (!res.ok || !data.url) throw new Error(data.error ?? 'Failed to start checkout.')
      window.location.href = data.url
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Something went wrong.')
      setLoading(false)
    }
  }

  return (
    <div
      className="addons-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Select add-ons"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="addons-modal">
        <button className="addons-modal-close" onClick={onClose} aria-label="Close">✕</button>

        <div className="addons-modal-tier">
          <span className="addons-modal-tier-name">{tier.label}</span>
          <span className="addons-modal-tier-price">{formatPrice(tier.price)}</span>
        </div>

        <div className="addons-modal-section">Add-ons</div>
        <div className="addons-modal-list">
          {(Object.entries(ADDONS) as [AddonId, { label: string; price: number }][]).map(([id, addon]) => (
            <label key={id} className={`addons-modal-item${selected.has(id) ? ' checked' : ''}`}>
              <input
                type="checkbox"
                checked={selected.has(id)}
                onChange={() => toggle(id)}
              />
              <span className="addons-modal-item-label">{addon.label}</span>
              <span className="addons-modal-item-price">+{formatPrice(addon.price)}</span>
            </label>
          ))}
        </div>

        <div className="addons-modal-footer">
          <div className="addons-modal-total">
            <span>Total</span>
            <span className="addons-modal-total-price">{formatPrice(total)}</span>
          </div>
          {err && <div className="addons-modal-err">{err}</div>}
          <button
            className="btn btn-grad btn-lg addons-modal-cta"
            onClick={() => void handlePay()}
            disabled={loading}
          >
            {loading ? 'Redirecting…' : <>Continue to payment <Arrow /></>}
          </button>
        </div>
      </div>
    </div>
  )
}

// map pricing card → TierId
const TIER_ID_MAP: Record<PricingKey, Record<string, TierId | null>> = {
  residential: { Single: 'residential-single', '5-Pack': 'residential-5pack', '10-Pack': 'residential-10pack' },
  battery:     { Single: 'battery-single',      '5-Pack': 'battery-5pack',     '10-Pack': 'battery-10pack'    },
  commercial:  { Standard: 'commercial-standard', Enterprise: null },
}

function Pricing() {
  const [tab, setTab] = useState<PricingKey>('residential')
  const [modalTier, setModalTier] = useState<TierId | null>(null)
  const data = PRICING[tab]
  return (
    <section className="pricing" id="pricing">
      <div className="wrap">
        <div className="section-head">
          <div className="left">
            <span className="mono num">§ 03 — Pricing</span>
            <h2>
              Per planset. Or by the <em>pack</em>.
            </h2>
          </div>
          <p className="lead">
            Buy one when you need it. Buy a 5-pack and lock in installer pricing. Every planset
            comes complete — no per-page surcharges, no nickel-and-diming on revisions, no
            surprises.
          </p>
        </div>

        <div className="pricing-controls">
          <div className="pricing-tabs">
            {(Object.entries(PRICING) as [PricingKey, PricingCategory][]).map(([k, v]) => (
              <button
                key={k}
                className={`pricing-tab${tab === k ? ' active' : ''}`}
                onClick={() => setTab(k)}
              >
                {v.label}
                <span className="from">{v.from}</span>
              </button>
            ))}
          </div>
          <div className="savings-note">
            <span className="pill">Save 33%</span>
            with the 5-pack
          </div>
        </div>

        <div
          className={`pricing-cards${data.tiers.length < 3 ? ' pricing-cards--sm' : ''}`}
        >
          {data.tiers.map((t, i) => (
            <div key={i} className={`card${t.highlight ? ' highlight' : ''}`}>
              {t.tag && <div className="card-tag">{t.tag}</div>}
              <div>
                <div className="card-name">{t.name}</div>
                <div className="card-desc">{t.desc}</div>
              </div>
              <div className="card-price">
                {t.price !== null ? (
                  <>
                    <sup>$</sup>
                    {t.price.toLocaleString()}
                    <span className="per">/ pack</span>
                  </>
                ) : (
                  <span style={{ fontSize: 56 }}>{t.priceLabel}</span>
                )}
              </div>
              {(t.each || t.save) && (
                <div className="card-each">
                  {t.each && <span>${t.each} per planset</span>}
                  {t.save && <span className="save">save {t.save}</span>}
                </div>
              )}
              <ul className="card-feats">
                {t.feats.map((f, j) => (
                  <li key={j} className="card-feat">
                    <span className="check" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <div className="card-cta">
                {(() => {
                  const tierId = TIER_ID_MAP[tab]?.[t.name]
                  if (tierId === null) {
                    // Enterprise — contact sales
                    return (
                      <a
                        className={`btn ${t.highlight ? 'btn-grad' : 'btn-primary'} btn-lg`}
                        style={{ width: '100%', justifyContent: 'center' }}
                        href="mailto:info@brightifysolar.com"
                      >
                        {t.cta} <Arrow />
                      </a>
                    )
                  }
                  return (
                    <button
                      className={`btn ${t.highlight ? 'btn-grad' : 'btn-primary'} btn-lg`}
                      style={{ width: '100%', justifyContent: 'center' }}
                      onClick={() => tierId && setModalTier(tierId)}
                    >
                      {t.cta} <Arrow />
                    </button>
                  )
                })()}
              </div>
            </div>
          ))}
        </div>

        <div className="addons">
          <div className="addons-label">
            <h3 className="ttl">Add-ons</h3>
            <div className="sub">Drop into any planset</div>
          </div>
          <div className="addons-list">
            {ADDON_DISPLAY.map((a, i) => (
              <div key={i} className="addon">
                <b>{a.name}</b>
                <span className="plus">{a.plus}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {modalTier && <AddonsModal tierId={modalTier} onClose={() => setModalTier(null)} />}
    </section>
  )
}

// ── coverage ──────────────────────────────────────────────────────────────

type Pin = { x: number; y: number; label: string; lg?: boolean; pulse?: boolean }

const PINS: Pin[] = [
  { x: 12, y: 38, label: 'CA', lg: true, pulse: true },
  { x: 22, y: 30, label: 'NV' },
  { x: 28, y: 26, label: 'UT' },
  { x: 22, y: 50, label: 'AZ', lg: true },
  { x: 38, y: 56, label: 'TX' },
  { x: 52, y: 38, label: 'MO' },
  { x: 70, y: 30, label: 'OH' },
  { x: 80, y: 30, label: 'NJ', lg: true, pulse: true },
  { x: 78, y: 50, label: 'NC' },
  { x: 68, y: 60, label: 'GA' },
  { x: 80, y: 64, label: 'FL' },
  { x: 56, y: 22, label: 'MN' },
  { x: 18, y: 16, label: 'WA' },
  { x: 30, y: 16, label: 'MT' },
  { x: 16, y: 60, label: 'Coverage', lg: true, pulse: true },
]

const subStyle = { fontSize: 16, fontFamily: 'var(--sans)', color: 'var(--ink-3)', marginLeft: 4, letterSpacing: 0 }

function Coverage() {
  return (
    <section className="coverage" id="coverage">
      <div className="wrap">
        <div>
          <span className="mono num">§ 04 — Coverage</span>
          <h2>
            All 50 states.
            <br />
            <em>Every</em> AHJ.
          </h2>
          <p>
            Our designers track jurisdiction-level requirements across the country — from CA Title
            24 to Florida wind-zone calcs to NJ utility templates. We've drafted in hundreds of
            AHJs, so chances are we've already done yours.
          </p>
          <div className="coverage-stats">
            <div className="coverage-stat">
              <div className="big">
                600<sub style={subStyle}>+</sub>
              </div>
              <div className="lbl">AHJ jurisdictions drafted</div>
            </div>
            <div className="coverage-stat">
              <div className="big">
                96<sub style={subStyle}>%</sub>
              </div>
              <div className="lbl">First-pass approval rate</div>
            </div>
            <div className="coverage-stat">
              <div className="big">50</div>
              <div className="lbl">States licensed for PE stamps</div>
            </div>
            <div className="coverage-stat">
              <div className="big">
                24<sub style={subStyle}>hr</sub>
              </div>
              <div className="lbl">Standard residential turnaround</div>
            </div>
          </div>
        </div>

        <div className="map" aria-label="Coverage map of the United States">
          {PINS.map((p, i) => (
            <span
              key={i}
              className={`map-pin${p.lg ? ' lg' : ''}${p.pulse ? ' pulse' : ''}`}
              style={{ left: `${p.x}%`, top: `${p.y}%` }}
              title={p.label}
            />
          ))}
          <span className="map-label" style={{ left: '10%', top: '28%' }}>
            San Diego, CA
          </span>
          <span className="map-label" style={{ left: '62%', top: '22%' }}>
            Trenton, NJ
          </span>
          <span className="map-label" style={{ left: '30%', top: '62%' }}>
            Austin, TX
          </span>
          <span className="map-corner">Live coverage</span>
        </div>
      </div>
    </section>
  )
}

// ── testimonials ──────────────────────────────────────────────────────────

const QUOTES = [
  {
    body: 'We dropped our permit prep time from a week to overnight. Brightify pays for itself on the first install.',
    name: 'Marcus Reyes',
    role: 'Ops Lead · Solstice Energy',
    avatar: 'MR',
    cls: 'a',
  },
  {
    body: "Cleanest plansets I've ever submitted. Our local AHJ stopped red-lining us — straight stamps for six months.",
    name: 'Jenna Park',
    role: 'Owner · Northstar Solar',
    avatar: 'JP',
    cls: 'b',
  },
  {
    body: 'DIY-ing my own array. The 5-pack covered me, my brother, and three neighbors — and every set passed first try.',
    name: 'Janet Mathew',
    role: 'DIY · San Jose, CA',
    avatar: 'JM',
    cls: 'c',
  },
]

function Testimonials() {
  return (
    <section style={{ background: 'var(--paper)' }}>
      <div className="wrap">
        <div className="section-head">
          <div className="left">
            <span className="mono num">§ 05 — Customers</span>
            <h2>
              Installers, <em>not</em> sales reps.
            </h2>
          </div>
          <p className="lead">
            Brightify is built by ex-installers who got tired of bad plansets. We sweat the details
            our customers tell us matter — clean line work, current code refs, fast revisions, and
            zero corporate runaround.
          </p>
        </div>

        <div className="quotes">
          {QUOTES.map((q, i) => (
            <div key={i} className="quote">
              <Stars count={5} />
              <div className="quote-body">{q.body}</div>
              <div className="quote-foot">
                <div className={`quote-avatar ${q.cls}`}>{q.avatar}</div>
                <div>
                  <div className="quote-meta-name">{q.name}</div>
                  <div className="quote-meta-co">{q.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── faq ───────────────────────────────────────────────────────────────────

type FaqItem = { q: string; a: string; featured?: boolean }

const FAQS: FaqItem[] = [
  {
    q: "What's actually in a Brightify planset?",
    a: 'A complete AHJ submittal package: cover sheet, site plan, roof plan, attachment detail, single- and three-line diagrams, load + voltage-drop calculations, equipment cut sheets, and NEC-compliant placards/labels. Everything you need to walk into the permit counter and walk out approved.',
  },
  {
    q: 'How fast can I get my planset?',
    a: 'Standard residential is 24 hours from intake confirmation. Battery and commercial projects run 2–5 business days depending on scope. Same-day expedites are available for $99 extra when you need them.',
  },
  {
    q: 'What happens if my AHJ red-lines the design?',
    a: "Revisions are always free. We'll keep iterating with your AHJ's reviewer until the set is approved — that's the whole point. Our designers handle the back-and-forth so you can stay on the install.",
  },
  {
    q: 'Do you offer PE stamps?',
    a: 'Yes. We have licensed Professional Engineers in all 50 states for both electrical and structural stamps. Add a stamp to any planset for $199, or include it as part of any commercial package.',
  },
  {
    q: 'Do you support battery storage and EV chargers?',
    a: 'Yep. We design Tesla Powerwall, Enphase IQ Battery, Franklin Home Power, FranklinWH and most major ESS platforms — plus standalone EV charger circuits. Pricing starts at $399 for PV + ESS.',
  },
  {
    q: "I'm a DIY homeowner — can I use Brightify?",
    a: "Absolutely. About a third of our customers are DIY homeowners or owner-builders. We'll review your equipment list, site survey photos, and AHJ requirements, then ship a permit-ready set. No installer license required to purchase.",
  },
  {
    q: 'How do credits work in the 5-pack and 10-pack?',
    a: "Packs are pre-paid credits that never expire. Use one whenever you have a project — they apply to any residential PV planset in our standard scope. Need a battery added? Just pay the upgrade differential.",
  },
  {
    q: 'What information do you need to start?',
    a: "Address, utility, main panel specs, module + inverter + battery selection, and clear site survey photos. If you're missing pieces we'll guide you through it — most projects can kick off in 10 minutes.",
  },
  {
    q: "What's your refund policy?",
    featured: true,
    a: "Every plan set is custom-engineered for your specific project. Our designers put real craft and hours of meticulous work into your set the moment you order, so once your plan set has been prepared, it's non-refundable. What we promise instead: we stay reachable throughout, and we provide free revisions for as long as it takes to get you approved. You're never on your own, your plan set always crosses the finish line.",
  },
]

function FAQ() {
  const [open, setOpen] = useState(0)
  return (
    <section
      id="faq"
      style={{ background: 'var(--paper-2)', borderTop: '1px solid var(--rule)' }}
    >
      <div className="wrap">
        <div className="faq-wrap">
          <aside className="faq-aside">
            <span className="mono num">§ 06 — FAQ</span>
            <h2>
              Questions, <em>answered</em>.
            </h2>
            <p>
              Still curious? Our team is one click away — WhatsApp, email, or a real human on the
              phone.
            </p>
            <a className="btn btn-primary" href="mailto:info@brightifysolar.com">
              Talk to a designer <Arrow />
            </a>
          </aside>

          <div className="faq-list">
            {FAQS.map((item, i) => (
              <div
                key={i}
                className={`faq-item${item.featured ? ' featured' : ''}${open === i ? ' open' : ''}`}
              >
                <button className="faq-q" onClick={() => setOpen(open === i ? -1 : i)}>
                  <span>{item.q}</span>
                  <span className="faq-toggle" aria-hidden="true" />
                </button>
                <div className="faq-a">{item.a}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ── cta ───────────────────────────────────────────────────────────────────

function CTA() {
  return (
    <section className="cta" id="start">
      <div className="cta-grid" />
      <div className="cta-sun-ring" />
      <div className="cta-sun" />
      <div className="wrap">
        <span className="mono" style={{ color: 'var(--amber)' }}>
          READY WHEN YOU ARE
        </span>
        <h2>
          Submit by noon. <em>Energize</em> by Friday.
        </h2>
        <p className="cta-sub">
          Drop your first project into the portal and have a stamped, AHJ-ready planset on your
          desk before the sun sets tomorrow.
        </p>
        <div className="cta-ctas">
          <a className="btn btn-grad btn-lg" href="/planset">
            Purchase <Arrow />
          </a>
          <a
            className="btn btn-ghost btn-lg"
            href="#deliverables"
            style={{ color: 'var(--paper)', borderColor: 'rgba(255,255,255,0.25)' }}
          >
            See sample planset
          </a>
        </div>
        <div className="cta-trust">
          <span>No subscriptions</span>
          <span>Free AHJ revisions</span>
          <span>24-hr turnaround</span>
          <span>All 50 states</span>
        </div>
      </div>
    </section>
  )
}

// ── footer ────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer>
      <div className="wrap">
        <div className="col">
          <div className="brand-foot">
            <img className="mark" src="/brightify-mark.png" alt="Brightify" />
            <span className="wm">BRIGHTIFY</span>
          </div>
          <p className="foot-tag">
            Solar permit design for installers and DIY homeowners. Built by people who've installed
            the panels themselves.
          </p>
          <div className="foot-contact">
            <div>
              <a href="tel:+14084643739">(408) 464-3739</a>
            </div>
            <div>
              <a href="https://wa.me/14084643739">WhatsApp — (408) 464-3739</a>
            </div>
            <div>
              <a href="mailto:info@brightifysolar.com">info@brightifysolar.com</a>
            </div>
          </div>
        </div>
        <div className="col">
          <h4>Product</h4>
          <ul>
            <li>
              <a href="#pricing">Pricing</a>
            </li>
            <li>
              <a href="#deliverables">Deliverables</a>
            </li>
            <li>
              <a href="#process">Process</a>
            </li>
            <li>
              <a href="#deliverables">Sample planset</a>
            </li>
          </ul>
        </div>
        <div className="col">
          <h4>Services</h4>
          <ul>
            <li>
              <a href="#pricing">Residential PV</a>
            </li>
            <li>
              <a href="#pricing">PV + Battery</a>
            </li>
            <li>
              <a href="#pricing">Commercial</a>
            </li>
            <li>
              <a href="#pricing">PE stamps</a>
            </li>
            <li>
              <a href="#pricing">Interconnection</a>
            </li>
            <li>
              <a href="#pricing">EV charger design</a>
            </li>
          </ul>
        </div>
        <div className="col">
          <h4>Company</h4>
          <ul>
            <li>
              <a href="/">Home</a>
            </li>
            <li>
              <a href="https://wa.me/14084643739">WhatsApp us</a>
            </li>
            <li>
              <a href="mailto:info@brightifysolar.com">Email us</a>
            </li>
            <li>
              <a href="/planset">Start a planset</a>
            </li>
          </ul>
        </div>
      </div>
      <div className="wrap foot-bot">
        <span>© 2026 Brightify Solar Design, LLC</span>
        <span>Made in California — Designed for every AHJ</span>
      </div>
    </footer>
  )
}

// ── page ──────────────────────────────────────────────────────────────────

export default function DesignLandingPage() {
  return (
    <div className="dl">
      <Announce />
      <Nav />
      <Hero />
      <Trust />
      <Deliverables />
      <Process />
      <Pricing />
      <Coverage />
      <Testimonials />
      <FAQ />
      <CTA />
      <Footer />
      <WhatsAppFab />
    </div>
  )
}
