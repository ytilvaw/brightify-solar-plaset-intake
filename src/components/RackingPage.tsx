import { useState, useEffect, useMemo } from 'react';
import '../store.css';
import SiteHeader from './SiteHeader';

// ------------------------------------------------------------------
// Brightify — Racking & Mounting category page
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

interface RackingItem {
  id: string;
  brand: string;
  partNumber: string;
  name: string;
  shortName: string;
  description: string;
  material: string;
  compatibility: string;
  price: number;             // unit price
  unit: string;              // "each" | "per rail" | "per box"
  image: string;
  tags: string[];            // 'rail' | 'clamp' | 'anchor' | 'hardware' | 'grounding'
  datasheet?: string;
  certifications?: string;
}

const PRODUCTS: RackingItem[] = [
  {
    id: 'snr-ultrafoot-anchor',
    brand: 'SnapNRack',
    partNumber: '242-10058',
    name: 'UltraFoot Anchor',
    shortName: 'UltraFoot Anchor',
    description: 'Roof attachment foot supporting both rafter and deck mounting paths with SpeedSeal+ butyl waterproofing.',
    material: 'Aluminum / Stainless Steel',
    compatibility: 'UR-45 Ultra Rail',
    price: 8.00,
    unit: 'each',
    image: '/racking/snr-ultrafoot-anchor.png',
    tags: ['anchor', 'snapnrack'],
    datasheet: '/datasheets/snr-ultrafoot-anchor.pdf',
    certifications: 'ICC-ES AC428, UL 2703',
  },
  {
    id: 'snr-mid-clamp',
    brand: 'SnapNRack',
    partNumber: '242-02071',
    name: 'Ultra Rail Mid Clamp',
    shortName: 'Mid Clamp',
    description: 'Black aluminum mid clamp securing interior module frames to UR-45 Ultra Rail with 855 lb design load.',
    material: 'Aluminum / Stainless Steel, Black',
    compatibility: 'UR-45 Ultra Rail · Module frame 30–50 mm',
    price: 4.50,
    unit: 'each',
    image: '/racking/snr-mid-clamp.png',
    tags: ['clamp', 'snapnrack'],
    datasheet: '/datasheets/snr-mid-clamp.pdf',
    certifications: 'UL 2703',
  },
  {
    id: 'snr-end-clamp',
    brand: 'SnapNRack',
    partNumber: '242-02215',
    name: 'Universal End Clamp',
    shortName: 'End Clamp',
    description: 'One-size-fits-all end clamp that slips inside the module frame edge for a concealed, UL 2703-listed bonding connection.',
    material: 'Aluminum / Stainless Steel',
    compatibility: 'UR-45 Ultra Rail · Module frame 30–50 mm',
    price: 4.50,
    unit: 'each',
    image: '/racking/snr-end-clamp.png',
    tags: ['clamp', 'snapnrack'],
    datasheet: '/datasheets/snr-end-clamp.pdf',
    certifications: 'UL 2703',
  },
  {
    id: 'snr-splice',
    brand: 'SnapNRack',
    partNumber: '242-01214',
    name: 'UR-40 & UR-45 Splice',
    shortName: 'Rail Splice',
    description: 'Black aluminum connector joining two UR-40 or UR-45 Ultra Rail sections end-to-end for continuous rail runs.',
    material: 'Aluminum, Black',
    compatibility: 'UR-40 · UR-45 Ultra Rail',
    price: 7.50,
    unit: 'each',
    image: '/racking/snr-splice.png',
    tags: ['rail', 'hardware', 'snapnrack'],
    datasheet: '/datasheets/snr-splice.pdf',
    certifications: 'UL 2703',
  },
  {
    id: 'snr-omni-lug',
    brand: 'SnapNRack',
    partNumber: '242-10034',
    name: 'OmniLug',
    shortName: 'OmniLug',
    description: 'Dual-purpose grounding lug and MLPE rail attachment bonding to UR-45 rail via channel nut, accepting 6–12 AWG solid copper.',
    material: 'Aluminum / Stainless Steel',
    compatibility: 'UR-45 Ultra Rail · 6–12 AWG solid, 8–10 AWG stranded',
    price: 3.50,
    unit: 'each',
    image: '/racking/snr-omni-lug.png',
    tags: ['grounding', 'hardware', 'snapnrack'],
    datasheet: '/datasheets/snr-omni-lug.pdf',
    certifications: 'UL 2703',
  },
  {
    id: 'snr-rail-172',
    brand: 'SnapNRack',
    partNumber: '232-10095',
    name: 'UR-45 Rail 172"',
    shortName: 'Rail 172"',
    description: 'Primary 172-inch mill-finish aluminum extrusion for SnapNRack Ultra Rail rooftop systems, weighing 5.55 lb per rail.',
    material: '6063-T6 Aluminum, Mill Finish',
    compatibility: 'SnapNRack Ultra Rail system',
    price: 45.00,
    unit: 'per rail',
    image: '/racking/snr-rail-172.jpg',
    tags: ['rail', 'snapnrack'],
    datasheet: '/datasheets/snr-rail-172.pdf',
    certifications: 'ICC-ES AC428, UL 2703',
  },
  {
    id: 'snr-structural-screw',
    brand: 'SnapNRack',
    partNumber: '242-10010',
    name: 'Ultrafoot Structural Screw',
    shortName: 'Structural Screw',
    description: 'Proprietary stainless steel sealing wood screw for UltraFoot installations providing high pull-out strength into rafters or decking.',
    material: 'Stainless Steel, #14 × 2-1/4", 1/2" Hex',
    compatibility: 'UltraFoot Anchor · UltraFoot Deck',
    price: 1.20,
    unit: 'each',
    image: '/racking/snr-structural-screw.png',
    tags: ['hardware', 'anchor', 'snapnrack'],
    datasheet: '/datasheets/snr-structural-screw.pdf',
    certifications: 'ICC-ES AC428',
  },
  {
    id: 'snr-tile-hook',
    brand: 'SnapNRack',
    partNumber: '242-02729-USA',
    name: 'Adjustable Tile Hook (USA)',
    shortName: 'Tile Hook',
    description: 'USA-made adjustable tile hook for attaching SnapNRack Ultra Rail to tile roofs. IRA Domestic Content-qualified.',
    material: 'Stainless Steel / Aluminum',
    compatibility: 'UR-45 Ultra Rail · Concrete & clay tile roofs',
    price: 12.50,
    unit: 'each',
    image: '/racking/snr-tile-hook.jpg',
    tags: ['anchor', 'snapnrack'],
    datasheet: '/datasheets/snr-tile-hook.pdf',
    certifications: 'ICC-ES AC428, UL 2703 · IRA Domestic Content',
  },
];

// ---- filters ----

const TYPE_FILTERS: [string, string][] = [
  ['all', 'All'],
  ['rail', 'Rails'],
  ['clamp', 'Clamps'],
  ['anchor', 'Anchors'],
  ['hardware', 'Hardware'],
  ['grounding', 'Grounding'],
];
const SORTS: [string, string][] = [
  ['price-asc', 'Price: low to high'],
  ['price-desc', 'Price: high to low'],
  ['name-asc', 'Name: A–Z'],
];

// ---- tag pill ----

function TagPill({ tag }: { tag: string }) {
  const map: Record<string, [string, React.CSSProperties]> = {
    rail:      ['Rail',      { background: 'rgba(30,100,220,0.07)', color: '#1a4fb5', borderColor: 'rgba(30,100,220,0.2)' }],
    clamp:     ['Clamp',     { background: 'rgba(255,201,60,0.12)', color: '#a06000', borderColor: 'rgba(255,201,60,0.3)' }],
    anchor:    ['Anchor',    { background: 'rgba(60,180,80,0.08)', color: '#1a6b2a', borderColor: 'rgba(60,180,80,0.2)' }],
    hardware:  ['Hardware',  { background: '#f0f0f2', color: '#333', borderColor: '#ddd' }],
    grounding: ['Grounding', { background: 'rgba(255,85,119,0.08)', color: '#b0003a', borderColor: 'rgba(255,85,119,0.2)' }],
  };
  const entry = map[tag];
  if (!entry) return null;
  return <span className="prod-spec" style={entry[1]}>{entry[0]}</span>;
}

// ---- product card ----

function RackingCard({ p, inQuote, onToggle }: { p: RackingItem; inQuote: boolean; onToggle: (id: string) => void }) {
  return (
    <article className="prod-card">
      <div style={{ position: 'relative' }}>
        <div className="prod-media inv-media" style={{ background: '#f8f8f8' }}>
          <img
            src={p.image}
            alt={`${p.brand} ${p.shortName}`}
            style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '16px' }}
          />
        </div>
        <span className="prod-brand">{p.brand}</span>
      </div>
      <div className="prod-body">
        <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: '-4px' }}>
          {p.partNumber}
        </div>
        <h3 className="prod-name">{p.brand.toUpperCase()} {p.name}</h3>
        <div className="prod-specs">
          {p.tags.filter(t => ['rail','clamp','anchor','hardware','grounding'].includes(t)).slice(0, 2).map(t => (
            <TagPill key={t} tag={t} />
          ))}
          {p.certifications && p.certifications.split(',').slice(0,1).map(c => (
            <span key={c} className="prod-spec" style={{ background: '#f0f0f2', color: '#333', borderColor: '#ddd' }}>{c.trim()}</span>
          ))}
        </div>
        <p style={{ fontSize: '12px', color: 'var(--ink-2)', lineHeight: 1.5, margin: '4px 0 2px' }}>
          {p.description}
        </p>
        <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--ink-3)', letterSpacing: '0.04em' }}>
          {p.material}
        </div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--ink-3)', letterSpacing: '0.04em' }}>
          {p.compatibility}
        </div>
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
            <span className="amt"><sup>$</sup>{p.price.toFixed(2)}<span className="per"> /{p.unit}</span></span>
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
        <path d="M5 18h38M9 18l3 22M39 18l-3 22M16 18l1.5 22M32 18l-1.5 22M24 18v22" />
        <path d="M12 40h24" />
      </svg>
    </div>
  );
}

function Drawer({
  open, onClose, items, onRemove, onClear,
}: {
  open: boolean; onClose: () => void; items: RackingItem[]; onRemove: (id: string) => void; onClear: () => void;
}) {
  const waMsg = useMemo(() => {
    if (!items.length) return '';
    const lines = items.map(p => `• ${p.brand} ${p.name} (Part ${p.partNumber}) — $${p.price.toFixed(2)}/${p.unit}`);
    return encodeURIComponent(`Hi Brightify, I'd like a quote on these racking components:\n${lines.join('\n')}`);
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
            <div className="drawer-empty">No items added yet.<br />Tap "Add to quote" on any component to start.</div>
          ) : (
            items.map(p => (
              <div className="q-item" key={p.id}>
                <QuoteThumb />
                <div className="q-meta">
                  <div className="nm">{p.brand} {p.name}</div>
                  <div className="sp">Part {p.partNumber} · ${p.price.toFixed(2)}/{p.unit}</div>
                  <span className="q-remove" onClick={() => onRemove(p.id)}>Remove</span>
                </div>
                <div className="q-price">${p.price.toFixed(2)}</div>
              </div>
            ))
          )}
        </div>
        <div className="drawer-ft">
          <p className="drawer-note">
            Tell us your panel count and roof type — we'll put together a complete racking BOM and confirm quantities.
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
            <li><a href="/batteries">Batteries</a></li>
            <li><a href="/racking">Racking &amp; Mounting</a></li>
            <li><a href="/#shop-diy">DIY Kits</a></li>
            <li><a href="/#shop-offgrid">Off-Grid</a></li>
          </ul>
        </div>
        <div className="col">
          <h4>Design</h4>
          <ul>
            <li><a href="/design">Permit plansets</a></li>
            <li><a href="/design">Residential PV</a></li>
            <li><a href="/design">PV + Battery</a></li>
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

const STORE_KEY = 'brightify_rack_quote_v1';

export default function RackingPage() {
  const [type, setType] = useState('all');
  const [sort, setSort] = useState('price-asc');
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
    let list = PRODUCTS.filter(p =>
      (type === 'all' || p.tags.includes(type)) &&
      (qq === '' || `${p.name} ${p.partNumber} ${p.description}`.toLowerCase().includes(qq))
    );
    if (sort === 'price-asc')  list = [...list].sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
    if (sort === 'price-desc') list = [...list].sort((a, b) => (b.price ?? -Infinity) - (a.price ?? -Infinity));
    if (sort === 'name-asc')   list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [type, sort, query]);

  const quoteItems = useMemo(() => quote.map(id => PRODUCTS.find(p => p.id === id)).filter((p): p is RackingItem => Boolean(p)), [quote]);

  return (
    <>
      <SiteHeader
        active="racking"
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
            <span className="here">Racking &amp; Mounting</span>
          </div>
          <h1 className="cat-title" style={{ fontFamily: 'var(--hdisplay)' }}>Racking &amp; Mounting</h1>
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
          <div className="toolbar-right">
            <span className="result-count">{filtered.length} item{filtered.length === 1 ? '' : 's'}</span>
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
                <div className="big">No items match those filters.</div>
                <div>Try widening your selection.</div>
              </div>
            ) : (
              filtered.map(p => (
                <RackingCard key={p.id} p={p} inQuote={quote.includes(p.id)} onToggle={toggle} />
              ))
            )}
          </div>
        </div>
      </section>

      <section className="help">
        <div className="cta-sun"></div>
        <div className="wrap">
          <div>
            <span className="mono" style={{ color: 'var(--amber)' }}>NEED A FULL RACKING BOM?</span>
            <h2>Let's spec it <em>together</em>.</h2>
            <p>
              Tell us your panel count, roof type and tilt — a Brightify advisor will build out the complete bill of materials and confirm quantities for your project.
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
        <span className="qb-count"><span className="qb-badge">{quote.length}</span> item{quote.length === 1 ? '' : 's'} in your quote</span>
        <button className="qb-review" onClick={() => setDrawer(true)}>Review</button>
        <a className="btn btn-grad btn-sm" href="#" onClick={e => { e.preventDefault(); setDrawer(true); }}>Request quote <Arrow /></a>
      </div>

      <Drawer open={drawer} onClose={() => setDrawer(false)} items={quoteItems} onRemove={remove} onClear={clear} />
    </>
  );
}
