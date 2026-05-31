import { useState, useEffect, useMemo } from 'react';
import '../store.css';
import SiteHeader from './SiteHeader';

// ------------------------------------------------------------------
// Brightify — Inverters category page
// ------------------------------------------------------------------

const Arrow = ({ size = 14 }: { size?: number }) => (
  <svg className="arrow" width={size} height={size} viewBox="0 0 14 14" fill="none">
    <path d="M2 7h10m0 0L8 3m4 4L8 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const Plus = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
    <path d="M6.5 1.5v10M1.5 6.5h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);
const Check = () => (
  <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
    <path d="M2.5 7.5l3 3 6-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const Close = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
    <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

const WhatsAppFab = () => (
  <a className="wa-fab" href="https://wa.me/14084643739" target="_blank" rel="noopener noreferrer" aria-label="Chat with us on WhatsApp">
    <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.13h-.01a8.2 8.2 0 0 1-4.18-1.14l-.3-.18-3.12.82.83-3.04-.2-.31a8.18 8.18 0 0 1-1.26-4.37c0-4.54 3.7-8.24 8.25-8.24a8.2 8.2 0 0 1 8.23 8.25c0 4.54-3.7 8.24-8.24 8.24Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.51.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43l-.48-.01c-.17 0-.43.06-.66.31-.23.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.28Z" />
    </svg>
  </a>
);

// ---- product data ----

interface Inverter {
  id: string;
  brand: string;
  model: string;
  name: string;
  kw: number;            // rated continuous output kW
  pvInputKw: number;     // max PV input kW
  battVoltage: string;   // e.g. "48V"
  mpptChannels: number;
  outputVoltage: string; // e.g. "120/240V split-phase"
  phase: string;         // "Single-phase" | "Split-phase"
  dims: string;
  weight: string;
  type: 'offgrid' | 'hybrid';
  use: 'res' | 'com';
  warranty: string;
  price: number | null;  // null = get a quote
  image: string;
  tags: string[];
  datasheet?: string;
  flag?: string;
  certifications?: string;
  parallel?: string;
}

const INVERTERS: Inverter[] = [
  {
    id: 'ruixu-sunon3-6',
    brand: 'RUiXU',
    model: 'SUNON3.6',
    name: 'SUNON3.6 3.6kW Off-Grid',
    kw: 3.6,
    pvInputKw: 4.5,
    battVoltage: '48V',
    mpptChannels: 1,
    outputVoltage: '120V',
    phase: 'Single-phase',
    dims: '428×330×110 mm',
    weight: '8.1 kg',
    type: 'offgrid',
    use: 'res',
    warranty: '3 yr',
    price: 499,
    image: '/inverters/ruixu-sunon3-6.jpg',
    tags: ['offgrid', 'ruixu', 'single-phase'],
    datasheet: '/datasheets/ruixu-sunon3-6.pdf',
    certifications: 'UL1741',
    parallel: 'Up to 6 units (21.6 kW)',
  },
  {
    id: 'ruixu-sunon7-2',
    brand: 'RUiXU',
    model: 'SUNON7.2',
    name: 'SUNON7.2 7.2kW Off-Grid',
    kw: 7.2,
    pvInputKw: 9,
    battVoltage: '48V',
    mpptChannels: 2,
    outputVoltage: '120/240V',
    phase: 'Split-phase',
    dims: '613×360×128 mm',
    weight: '16 kg',
    type: 'offgrid',
    use: 'res',
    warranty: '3 yr',
    price: 1219,
    image: '/inverters/ruixu-sunon7-2.png',
    tags: ['offgrid', 'ruixu', 'split-phase'],
    datasheet: '/datasheets/ruixu-sunon7-2.pdf',
    certifications: 'UL1741',
    parallel: 'Up to 6 units (43.2 kW)',
  },
  {
    id: 'ruixu-rx-12k',
    brand: 'RUiXU',
    model: 'RX-12K',
    name: 'RX-12K 11.4kW Hybrid',
    kw: 11.4,
    pvInputKw: 17.1,
    battVoltage: '48V',
    mpptChannels: 4,
    outputVoltage: '120/240V',
    phase: 'Split-phase',
    dims: '780×470×259 mm',
    weight: '50 kg',
    type: 'hybrid',
    use: 'res',
    warranty: '10 yr',
    price: 3299,
    image: '/inverters/ruixu-rx-12k.jpg',
    tags: ['hybrid', 'ruixu', 'split-phase'],
    datasheet: '/datasheets/ruixu-rx-12k.pdf',
    certifications: 'UL1741 CRD, IEEE 1547, UL9540',
    parallel: 'Multi-unit capable',
    flag: 'IP65',
  },
  {
    id: 'eg4-6000xp',
    brand: 'EG4',
    model: '6000XP',
    name: '6000XP 6kW Off-Grid',
    kw: 6,
    pvInputKw: 8,
    battVoltage: '48V',
    mpptChannels: 2,
    outputVoltage: '120/240V',
    phase: 'Split-phase',
    dims: '—',
    weight: '—',
    type: 'offgrid',
    use: 'res',
    warranty: '5 yr',
    price: null,
    image: '/inverters/eg4-6000xp.jpg',
    tags: ['offgrid', 'eg4', 'split-phase'],
    datasheet: '/datasheets/eg4-6000xp.pdf',
    certifications: 'UL1741',
    parallel: 'Up to 16 units',
  },
  {
    id: 'eg4-18kpv',
    brand: 'EG4',
    model: '18kPV',
    name: '18kPV 12kW Hybrid',
    kw: 12,
    pvInputKw: 21,
    battVoltage: '48V',
    mpptChannels: 3,
    outputVoltage: '120/240V',
    phase: 'Split-phase',
    dims: '—',
    weight: '—',
    type: 'hybrid',
    use: 'res',
    warranty: '5 yr',
    price: null,
    image: '/inverters/eg4-18kpv.jpg',
    tags: ['hybrid', 'eg4', 'split-phase'],
    datasheet: '/datasheets/eg4-18kpv.pdf',
    certifications: 'UL1741, CEC',
    parallel: 'Up to 10 units',
    flag: 'IP65',
  },
  {
    id: 'eg4-12kpv',
    brand: 'EG4',
    model: '12kPV',
    name: '12kPV 8kW Hybrid',
    kw: 8,
    pvInputKw: 15,
    battVoltage: '48V',
    mpptChannels: 2,
    outputVoltage: '120/240V',
    phase: 'Split-phase',
    dims: '—',
    weight: '—',
    type: 'hybrid',
    use: 'res',
    warranty: '10 yr',
    price: null,
    image: '/inverters/eg4-12kpv.jpg',
    tags: ['hybrid', 'eg4', 'split-phase'],
    datasheet: '/datasheets/eg4-12kpv.pdf',
    certifications: 'UL1741',
    parallel: '—',
  },
  {
    id: 'eg4-flexboss21',
    brand: 'EG4',
    model: 'FlexBOSS21',
    name: 'FlexBOSS21 16kW Hybrid',
    kw: 16,
    pvInputKw: 21,
    battVoltage: '48V',
    mpptChannels: 3,
    outputVoltage: '120/240V',
    phase: 'Split-phase',
    dims: '—',
    weight: '—',
    type: 'hybrid',
    use: 'com',
    warranty: '10 yr',
    price: null,
    image: '/inverters/eg4-flexboss21.jpg',
    tags: ['hybrid', 'eg4', 'split-phase', 'commercial'],
    datasheet: '/datasheets/eg4-flexboss21.pdf',
    certifications: 'UL1741, CEC',
    parallel: 'Up to 10 units (160 kW)',
  },
  {
    id: 'eg4-flexboss18',
    brand: 'EG4',
    model: 'FlexBOSS18',
    name: 'FlexBOSS18 13kW Hybrid',
    kw: 13,
    pvInputKw: 18,
    battVoltage: '48V',
    mpptChannels: 2,
    outputVoltage: '120/240V',
    phase: 'Split-phase',
    dims: '—',
    weight: '—',
    type: 'hybrid',
    use: 'res',
    warranty: '10 yr',
    price: null,
    image: '/inverters/eg4-flexboss18.jpg',
    tags: ['hybrid', 'eg4', 'split-phase'],
    datasheet: '/datasheets/eg4-flexboss18.pdf',
    certifications: 'UL1741',
    parallel: 'Up to 10 units',
  },
  {
    id: 'growatt-sph-10k',
    brand: 'Growatt',
    model: 'SPH 10000TL-HU-US',
    name: 'SPH 10000TL 10kW Hybrid',
    kw: 10,
    pvInputKw: 15,
    battVoltage: '48V',
    mpptChannels: 3,
    outputVoltage: '120/240V',
    phase: 'Split-phase',
    dims: '—',
    weight: '—',
    type: 'hybrid',
    use: 'res',
    warranty: '10 yr',
    price: 2816,
    image: '/inverters/growatt-sph-10k.jpg',
    tags: ['hybrid', 'growatt', 'split-phase'],
    datasheet: '/datasheets/growatt-sph-10k.pdf',
    certifications: 'UL1741',
    parallel: 'Up to 6 units (60 kW)',
  },
];

// ---- filters ----

const TYPE_FILTERS: [string, string][] = [
  ['all', 'All'],
  ['offgrid', 'Off-Grid'],
  ['hybrid', 'Hybrid'],
];
const BRAND_FILTERS: [string, string][] = [
  ['all', 'All Brands'],
  ['ruixu', 'RUiXU'],
  ['eg4', 'EG4'],
  ['growatt', 'Growatt'],
];
const SORTS: [string, string][] = [
  ['kw-asc', 'Power: low to high'],
  ['kw-desc', 'Power: high to low'],
  ['price-asc', 'Price: low to high'],
  ['price-desc', 'Price: high to low'],
];

// ---- tag pill ----

function TagPill({ tag }: { tag: string }) {
  const map: Record<string, [string, React.CSSProperties]> = {
    hybrid:        ['Hybrid',       { background: 'rgba(30,100,220,0.07)', color: '#1a4fb5', borderColor: 'rgba(30,100,220,0.2)' }],
    offgrid:       ['Off-Grid',     { background: 'rgba(255,201,60,0.12)', color: '#a06000', borderColor: 'rgba(255,201,60,0.3)' }],
    commercial:    ['Commercial',   { background: 'rgba(60,180,80,0.08)', color: '#1a6b2a', borderColor: 'rgba(60,180,80,0.2)' }],
    'split-phase': ['Split-Phase',  { background: '#f0f0f2', color: '#333', borderColor: '#ddd' }],
    'single-phase':['Single-Phase', { background: '#f0f0f2', color: '#333', borderColor: '#ddd' }],
  };
  const entry = map[tag];
  if (!entry) return null;
  return <span className="prod-spec" style={entry[1]}>{entry[0]}</span>;
}

// ---- product card ----

function InverterCard({ p, inQuote, onToggle }: { p: Inverter; inQuote: boolean; onToggle: (id: string) => void }) {
  return (
    <article className="prod-card">
      <div style={{ position: 'relative' }}>
        <div className="prod-media inv-media">
          <img
            src={p.image}
            alt={`${p.brand} ${p.model}`}
            style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '12px' }}
          />
        </div>
        <span className="prod-brand">{p.brand}</span>
        {p.flag && <span className="prod-flag">{p.flag}</span>}
      </div>
      <div className="prod-body">
        <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: '-4px' }}>
          {p.model}
        </div>
        <h3 className="prod-name">{p.brand.toUpperCase()} {p.name}</h3>
        <div className="prod-specs">
          <span className="prod-spec">{p.kw} kW</span>
          <span className="prod-spec">{p.mpptChannels}-ch MPPT</span>
          <span className="prod-spec">{p.battVoltage}</span>
          {p.tags.filter(t => ['hybrid','offgrid','single-phase','split-phase','commercial'].includes(t)).slice(0, 2).map(t => (
            <TagPill key={t} tag={t} />
          ))}
        </div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--ink-3)', letterSpacing: '0.04em' }}>
          {p.pvInputKw} kW PV input · {p.outputVoltage} · {p.warranty} warranty
        </div>
        {p.certifications && (
          <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--ink-3)', letterSpacing: '0.04em' }}>
            {p.certifications}
          </div>
        )}
        {p.datasheet && (
          <a
            href={p.datasheet}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '5px',
              fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '0.06em',
              textTransform: 'uppercase', color: 'var(--ink-2)',
              border: '1px solid var(--rule-strong)', borderRadius: '6px',
              padding: '5px 10px', background: 'var(--paper-2)',
              transition: 'border-color .15s, color .15s', width: 'fit-content',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--orange)'; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--ink)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--rule-strong)'; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--ink-2)'; }}
          >
            <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
              <rect x="2" y="1" width="10" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
              <path d="M4.5 4.5h5M4.5 7h5M4.5 9.5h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            Spec sheet
          </a>
        )}
        <div className="prod-foot">
          <div className="prod-price">
            {p.price !== null ? (
              <>
                <span className="from">Starting at</span>
                <span className="amt"><sup>$</sup>{p.price.toLocaleString()}<span className="per"> /unit</span></span>
              </>
            ) : (
              <span className="amt" style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--ink-2)' }}>Get a quote</span>
            )}
          </div>
          <button className={`btn-add${inQuote ? ' added' : ''}`} onClick={() => onToggle(p.id)}>
            <span className="ic">{inQuote ? <Check /> : <Plus />}</span>
            {inQuote ? 'Added' : 'Add to quote'}
          </button>
        </div>
      </div>
    </article>
  );
}

// ---- quote drawer ----

function QuoteThumb() {
  return (
    <div style={{ width: 44, height: 44, borderRadius: 8, background: 'var(--paper-2)', border: '1px solid var(--rule)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <svg width="22" height="22" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--ink-3)' }}>
        <rect x="8" y="10" width="32" height="28" rx="3" />
        <path d="M14 24c2-6 4-6 6 0s4 6 6 0 4-6 6 0" />
        <path d="M14 33h8" />
      </svg>
    </div>
  );
}

function Drawer({
  open, onClose, items, onRemove, onClear,
}: {
  open: boolean; onClose: () => void; items: Inverter[]; onRemove: (id: string) => void; onClear: () => void;
}) {
  const waMsg = useMemo(() => {
    if (!items.length) return '';
    const lines = items.map(p => `• ${p.brand} ${p.model} (${p.kw}kW, ${p.phase})${p.price ? ` — $${p.price.toLocaleString()}/unit` : ' — pricing TBD'}`);
    return encodeURIComponent(`Hi Brightify, I'd like a quote on these inverters:\n${lines.join('\n')}`);
  }, [items]);

  return (
    <>
      <div className={`drawer-scrim${open ? ' show' : ''}`} onClick={onClose}></div>
      <aside className={`drawer${open ? ' show' : ''}`} aria-hidden={!open}>
        <div className="drawer-hd">
          <h3>Your quote{items.length ? ` · ${items.length}` : ''}</h3>
          <button className="drawer-close" onClick={onClose} aria-label="Close"><Close /></button>
        </div>
        <div className="drawer-body">
          {items.length === 0 ? (
            <div className="drawer-empty">No inverters added yet.<br />Tap "Add to quote" on any inverter to start.</div>
          ) : (
            items.map((p) => (
              <div className="q-item" key={p.id}>
                <QuoteThumb />
                <div className="q-meta">
                  <div className="nm">{p.brand} {p.name}</div>
                  <div className="sp">{p.kw} kW · {p.phase} · {p.warranty}</div>
                  <span className="q-remove" onClick={() => onRemove(p.id)}>Remove</span>
                </div>
                <div className="q-price">{p.price ? `$${p.price.toLocaleString()}` : 'Quote'}</div>
              </div>
            ))
          )}
        </div>
        <div className="drawer-ft">
          <p className="drawer-note">
            We'll confirm inverter pricing, confirm compatibility with your battery and panel selection, and include shipping.
          </p>
          <a
            className="btn btn-grad btn-lg"
            style={{ width: '100%', justifyContent: 'center', pointerEvents: items.length ? 'auto' : 'none', opacity: items.length ? 1 : 0.5 }}
            href={items.length ? `https://wa.me/14084643739?text=${waMsg}` : undefined}
            target="_blank"
            rel="noopener noreferrer"
          >
            Request this quote <Arrow />
          </a>
          {items.length > 0 && (
            <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }} onClick={onClear}>
              Clear quote
            </button>
          )}
        </div>
      </aside>
    </>
  );
}

// ---- footer ----

function Footer() {
  return (
    <footer>
      <div className="wrap">
        <div className="col">
          <div className="brand-foot">
            <img className="mark" src="/brightify-logo.png" alt="Brightify" />
            <span className="wm">BRIGHTIFY</span>
          </div>
          <p className="foot-tag">Solar gear and permit design for installers and DIY homeowners — from first panel to final inspection.</p>
          <div className="foot-contact">
            <div><a href="mailto:info@brightifysolar.com">info@brightifysolar.com</a></div>
          </div>
        </div>
        <div className="col">
          <h4>Shop</h4>
          <ul>
            <li><a href="/solar-panels">Solar Panels</a></li>
            <li><a href="/inverters">Inverters</a></li>
            <li><a href="/#shop-diy">DIY Kits</a></li>
            <li><a href="/#shop-battery">Batteries</a></li>
            <li><a href="/#shop-racking">Racking &amp; Mounting</a></li>
            <li><a href="/#shop-offgrid">Off-Grid</a></li>
          </ul>
        </div>
        <div className="col">
          <h4>Design</h4>
          <ul>
            <li><a href="/design">Permit plansets</a></li>
            <li><a href="/design">Residential PV</a></li>
            <li><a href="/design">PV + Battery</a></li>
            <li><a href="/design">PE stamps</a></li>
          </ul>
        </div>
        <div className="col">
          <h4>Company</h4>
          <ul>
            <li><a href="https://wa.me/14084643739">Get a quote</a></li>
            <li><a href="/#explore">Shop all</a></li>
            <li><a href="https://wa.me/14084643739">WhatsApp us</a></li>
            <li><a href="/design">Design service</a></li>
          </ul>
        </div>
      </div>
      <div className="wrap foot-bot">
        <span>© 2026 Brightify Solar, LLC</span>
        <span>Made in California — Solar from panel to permit</span>
      </div>
    </footer>
  );
}

const STORE_KEY = 'brightify_inv_quote_v1';

export default function InvertersPage() {
  const [type, setType] = useState('all');
  const [brand, setBrand] = useState('all');
  const [sort, setSort] = useState('kw-asc');
  const [query, setQuery] = useState('');
  const [quote, setQuote] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORE_KEY);
      return stored ? (JSON.parse(stored) as string[]) : [];
    } catch { return []; }
  });
  const [drawer, setDrawer] = useState(false);

  useEffect(() => {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(quote)); } catch { /* noop */ }
  }, [quote]);

  const toggle = (id: string) => setQuote(q => q.includes(id) ? q.filter(x => x !== id) : [...q, id]);
  const remove = (id: string) => setQuote(q => q.filter(x => x !== id));
  const clear = () => setQuote([]);

  const filtered = useMemo(() => {
    const qq = query.trim().toLowerCase();
    let list = INVERTERS.filter(p =>
      (type === 'all' || p.type === type) &&
      (brand === 'all' || p.tags.includes(brand)) &&
      (qq === '' || `${p.brand} ${p.model} ${p.name}`.toLowerCase().includes(qq))
    );
    if (sort === 'kw-asc')    list = [...list].sort((a, b) => a.kw - b.kw);
    if (sort === 'kw-desc')   list = [...list].sort((a, b) => b.kw - a.kw);
    if (sort === 'price-asc') list = [...list].sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
    if (sort === 'price-desc')list = [...list].sort((a, b) => (b.price ?? -Infinity) - (a.price ?? -Infinity));
    return list;
  }, [type, brand, sort, query]);

  const quoteItems = useMemo(() => quote.map(id => INVERTERS.find(p => p.id === id)).filter((p): p is Inverter => Boolean(p)), [quote]);

  return (
    <>
      <SiteHeader
        active="inverter"
        quoteCount={quote.length}
        onQuote={() => setDrawer(true)}
        search={query}
        onSearchChange={setQuery}
        onSearchSubmit={() => { /* filter in place */ }}
      />

      <section className="cat-head">
        <div className="wrap">
          <div className="crumb">
            <a href="/">Home</a><span className="sep">/</span>
            <a href="/#explore">Shop</a><span className="sep">/</span>
            <span className="here">Inverters</span>
          </div>
          <h1 className="cat-title" style={{ fontFamily: 'var(--hdisplay)' }}>Inverters</h1>
        </div>
      </section>

      <div className="toolbar">
        <div className="wrap">
          <div className="filter-group">
            <span className="filter-label">Type</span>
            {TYPE_FILTERS.map(([k, l]) => (
              <button key={k} className={`chip${type === k ? ' active' : ''}`} onClick={() => setType(k)}>{l}</button>
            ))}
          </div>
          <div className="filter-group">
            <span className="filter-label">Brand</span>
            {BRAND_FILTERS.map(([k, l]) => (
              <button key={k} className={`chip${brand === k ? ' active' : ''}`} onClick={() => setBrand(k)}>{l}</button>
            ))}
          </div>
          <div className="toolbar-right">
            <span className="result-count">{filtered.length} inverter{filtered.length === 1 ? '' : 's'}</span>
            <select className="sort-select" value={sort} onChange={e => setSort(e.target.value)}>
              {SORTS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
            </select>
          </div>
        </div>
      </div>

      <section className="catalog">
        <div className="wrap">
          <div className="prod-grid">
            {filtered.length === 0 ? (
              <div className="empty">
                <div className="big">No inverters match those filters.</div>
                <div>Try widening your selection.</div>
              </div>
            ) : (
              filtered.map(p => (
                <InverterCard key={p.id} p={p} inQuote={quote.includes(p.id)} onToggle={toggle} />
              ))
            )}
          </div>
        </div>
      </section>

      <section className="help">
        <div className="cta-sun"></div>
        <div className="wrap">
          <div>
            <span className="mono" style={{ color: 'var(--amber)' }}>NOT SURE WHICH INVERTER?</span>
            <h2>Let's spec it <em>together</em>.</h2>
            <p>
              Tell us your system size, battery bank and goals — a Brightify advisor will match the
              right inverter and quote a complete, permit-ready system.
            </p>
          </div>
          <div className="help-actions">
            <a className="btn btn-grad btn-lg" href="https://wa.me/14084643739">Talk to an advisor <Arrow /></a>
            <a className="btn btn-ghost btn-lg" href="/#explore" style={{ color: 'var(--paper)', borderColor: 'rgba(255,255,255,0.25)' }}>Browse other categories</a>
          </div>
        </div>
      </section>

      <Footer />
      <WhatsAppFab />

      <div className={`quote-bar${quote.length ? ' show' : ''}`}>
        <span className="qb-count"><span className="qb-badge">{quote.length}</span> inverter{quote.length === 1 ? '' : 's'} in your quote</span>
        <button className="qb-review" onClick={() => setDrawer(true)}>Review</button>
        <a className="btn btn-grad btn-sm" href="#" onClick={e => { e.preventDefault(); setDrawer(true); }}>Request quote <Arrow /></a>
      </div>

      <Drawer open={drawer} onClose={() => setDrawer(false)} items={quoteItems} onRemove={remove} onClear={clear} />
    </>
  );
}
