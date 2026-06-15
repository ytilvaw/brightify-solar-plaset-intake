import { useState, useEffect, useMemo } from 'react';
import '../store.css';
import SiteHeader from './SiteHeader';

// ------------------------------------------------------------------
// Brightify — Off-Grid category page
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

interface OffGridProduct {
  id: string;
  brand: string;
  name: string;
  tagline: string;
  outputKw: number;
  capacityKwh: number;
  components: string[];
  price: number;
  image: string;
  tags: string[];
  flag?: string;
}

const PRODUCTS: OffGridProduct[] = [
  {
    id: 'ecoflow-dpux-1inv-2bat',
    brand: 'EcoFlow',
    name: 'DELTA Pro Ultra X — 1× Inverter + 2× Batteries',
    tagline: '12kW output · 12kWh capacity · 120/240V · <10ms UPS',
    outputKw: 12,
    capacityKwh: 12,
    components: [
      '1× EcoFlow DELTA Pro Ultra X Inverter',
      '2× Smart Extra Battery (6kWh each)',
      '120/240V · NEMA 5-20, L14-30, 14-50',
      '5-year warranty',
    ],
    price: 7899,
    image: '/offgrid/ecoflow-dpux-1inv-2bat.png',
    tags: ['ecoflow', 'whole-home'],
  },
  {
    id: 'ecoflow-dpux-1inv-2bat-shp3',
    brand: 'EcoFlow',
    name: 'DELTA Pro Ultra X — 1× Inverter + 2× Batteries + Smart Home Panel 3',
    tagline: '12kW output · 12kWh capacity · 32 circuits · <20ms switchover',
    outputKw: 12,
    capacityKwh: 12,
    components: [
      '1× EcoFlow DELTA Pro Ultra X Inverter',
      '2× Smart Extra Battery (6kWh each)',
      '1× Smart Home Panel 3 (32 circuits)',
      '<20ms automatic switchover',
    ],
    price: 10699,
    image: '/offgrid/ecoflow-dpux-1inv-2bat-shp3.png',
    tags: ['ecoflow', 'whole-home'],
    flag: 'Recommended',
  },
  {
    id: 'ecoflow-dpux-1inv-2bat-sg200a',
    brand: 'EcoFlow',
    name: 'DELTA Pro Ultra X — 1× Inverter + 2× Batteries + Smart Gateway 200A',
    tagline: '12kW output · 12kWh capacity · 6 controlled circuits · <20ms switchover',
    outputKw: 12,
    capacityKwh: 12,
    components: [
      '1× EcoFlow DELTA Pro Ultra X Inverter',
      '2× Smart Extra Battery (6kWh each)',
      '1× Smart Gateway 200A (6 circuits)',
      '<20ms automatic switchover',
    ],
    price: 9899,
    image: '/offgrid/ecoflow-dpux-1inv-2bat-sg200a.png',
    tags: ['ecoflow', 'whole-home'],
  },
  {
    id: 'ecoflow-dpux-1inv-2bat-ev',
    brand: 'EcoFlow',
    name: 'DELTA Pro Ultra X — 1× Inverter + 2× Batteries + PowerPulse EV Charger',
    tagline: '12kW output · 12kWh capacity · 9.6kW EV charging',
    outputKw: 12,
    capacityKwh: 12,
    components: [
      '1× EcoFlow DELTA Pro Ultra X Inverter',
      '2× Smart Extra Battery (6kWh each)',
      '1× PowerPulse EV Charger (9.6kW)',
      'Charge home + vehicle simultaneously',
    ],
    price: 8199,
    image: '/offgrid/ecoflow-dpux-1inv-2bat-ev.png',
    tags: ['ecoflow', 'whole-home', 'ev'],
  },
  {
    id: 'ecoflow-dpux-1inv-4bat-shp3',
    brand: 'EcoFlow',
    name: 'DELTA Pro Ultra X — 1× Inverter + 4× Batteries + Smart Home Panel 3',
    tagline: '12kW output · 24kWh capacity · 32 circuits · expandable to 180kWh',
    outputKw: 12,
    capacityKwh: 24,
    components: [
      '1× EcoFlow DELTA Pro Ultra X Inverter',
      '4× Smart Extra Battery (6kWh each)',
      '1× Smart Home Panel 3 (32 circuits)',
      'Expandable to 180kWh',
    ],
    price: 13699,
    image: '/offgrid/ecoflow-dpux-1inv-4bat-shp3.png',
    tags: ['ecoflow', 'whole-home'],
  },
  {
    id: 'ecoflow-dpux-2inv-4bat-shp3',
    brand: 'EcoFlow',
    name: '2× DELTA Pro Ultra X — 2× Inverters + 4× Batteries + Smart Home Panel 3',
    tagline: '24kW output · 24kWh capacity · scalable to 36kW',
    outputKw: 24,
    capacityKwh: 24,
    components: [
      '2× EcoFlow DELTA Pro Ultra X Inverter',
      '4× Smart Extra Battery (6kWh each)',
      '1× Smart Home Panel 3 (32 circuits)',
      'Scalable to 36kW · <20ms switchover',
    ],
    price: 18699,
    image: '/offgrid/ecoflow-dpux-2inv-4bat-shp3.png',
    tags: ['ecoflow', 'whole-home'],
    flag: 'Most powerful',
  },
  {
    id: 'ecoflow-dpux-1inv-5bat',
    brand: 'EcoFlow',
    name: 'DELTA Pro Ultra X — 1× Inverter + 5× Batteries',
    tagline: '12kW output · 30kWh capacity · 120/240V · <10ms UPS',
    outputKw: 12,
    capacityKwh: 30,
    components: [
      '1× EcoFlow DELTA Pro Ultra X Inverter',
      '5× Smart Extra Battery (6kWh each)',
      '120/240V split-phase · Online UPS',
      'Expandable to 180kWh · Up to 3 inverters',
    ],
    price: 13600,
    image: '/offgrid/ecoflow-dpux-1inv-5bat.webp',
    tags: ['ecoflow', 'whole-home'],
  },
  {
    id: 'ecoflow-dpu-1inv-1bat',
    brand: 'EcoFlow',
    name: 'DELTA Pro Ultra — 1× Inverter + 1× Battery',
    tagline: '7.2kW output · 6kWh capacity · 120/240V · 0ms UPS',
    outputKw: 7.2,
    capacityKwh: 6,
    components: [
      '1× EcoFlow DELTA Pro Ultra Inverter',
      '1× DELTA Pro Ultra Battery (6kWh)',
      '120/240V split-phase · Online UPS',
      'Expandable up to 21.6kWh',
    ],
    price: 4099,
    image: '/offgrid/ecoflow-dpu-1inv-1bat.png',
    tags: ['ecoflow', 'whole-home'],
  },
  {
    id: 'ecoflow-dpu-1inv-2bat',
    brand: 'EcoFlow',
    name: 'DELTA Pro Ultra — 1× Inverter + 2× Batteries',
    tagline: '7.2kW output · 12kWh capacity · 120/240V · 0ms UPS',
    outputKw: 7.2,
    capacityKwh: 12,
    components: [
      '1× EcoFlow DELTA Pro Ultra Inverter',
      '2× DELTA Pro Ultra Battery (6kWh each)',
      '120/240V split-phase · Online UPS',
      'Expandable up to 21.6kWh',
    ],
    price: 5699,
    image: '/offgrid/ecoflow-dpu-1inv-2bat.png',
    tags: ['ecoflow', 'whole-home'],
    flag: 'Recommended',
  },
  {
    id: 'ecoflow-dpu-1inv-3bat',
    brand: 'EcoFlow',
    name: 'DELTA Pro Ultra — 1× Inverter + 3× Batteries',
    tagline: '7.2kW output · 18kWh capacity · 120/240V · 0ms UPS',
    outputKw: 7.2,
    capacityKwh: 18,
    components: [
      '1× EcoFlow DELTA Pro Ultra Inverter',
      '3× DELTA Pro Ultra Battery (6kWh each)',
      '120/240V split-phase · Online UPS',
      'Expandable up to 21.6kWh',
    ],
    price: 7699,
    image: '/offgrid/ecoflow-dpu-1inv-3bat.png',
    tags: ['ecoflow', 'whole-home'],
  },
];

// ---- filters ----

const BRAND_FILTERS: [string, string][] = [
  ['all', 'All Brands'],
  ['ecoflow', 'EcoFlow'],
];
const SORTS: [string, string][] = [
  ['price-asc', 'Price: low to high'],
  ['price-desc', 'Price: high to low'],
  ['output-asc', 'Output: low to high'],
  ['output-desc', 'Output: high to low'],
];

// ---- product card ----

function ProductCard({ p, inQuote, onToggle }: { p: OffGridProduct; inQuote: boolean; onToggle: (id: string) => void }) {
  return (
    <article className="prod-card">
      <div style={{ position: 'relative' }}>
        <div style={{ height: '420px', background: '#f5f6f8', borderRadius: '12px 12px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          <img
            src={p.image}
            alt={p.name}
            style={{ maxWidth: '100%', maxHeight: '100%', width: 'auto', height: 'auto', display: 'block' }}
          />
        </div>
        {p.flag && <span className="prod-flag">{p.flag}</span>}
      </div>
      <div className="prod-body">
        <div className="prod-specs" style={{ marginBottom: '6px' }}>
          <span className="prod-spec" style={{ background: 'rgba(255,201,60,0.12)', color: '#a06000', borderColor: 'rgba(255,201,60,0.3)' }}>Whole-Home Backup</span>
          <span className="prod-spec">{p.outputKw} kW Output</span>
          <span className="prod-spec">{p.capacityKwh} kWh Battery</span>
        </div>
        <h3 className="prod-name">{p.name}</h3>
        <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--ink-3)', letterSpacing: '0.04em', marginBottom: '10px' }}>
          {p.tagline}
        </div>
        <ul style={{ margin: '0 0 12px 0', padding: '0 0 0 14px', fontSize: '12px', color: 'var(--ink-2)', lineHeight: '1.6' }}>
          {p.components.map((c, i) => <li key={i}>{c}</li>)}
        </ul>
        <div className="prod-foot">
          <div className="prod-price">
            <span className="from">Complete system</span>
            <span className="amt"><sup>$</sup>{p.price.toLocaleString()}</span>
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

function Drawer({
  open, onClose, items, onRemove, onClear,
}: {
  open: boolean; onClose: () => void; items: OffGridProduct[]; onRemove: (id: string) => void; onClear: () => void;
}) {
  const waMsg = useMemo(() => {
    if (!items.length) return '';
    const lines = items.map(p => `• ${p.name} — $${p.price.toLocaleString()}`);
    return encodeURIComponent(`Hi Brightify, I'd like a quote on these off-grid systems:\n${lines.join('\n')}`);
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
            <div className="drawer-empty">No systems added yet.<br />Tap "Add to quote" on any system to start.</div>
          ) : (
            items.map((p) => (
              <div className="q-item" key={p.id}>
                <div style={{ width: 44, height: 44, borderRadius: 8, background: 'var(--paper-2)', border: '1px solid var(--rule)', overflow: 'hidden', flexShrink: 0 }}>
                  <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div className="q-meta">
                  <div className="nm">{p.name}</div>
                  <div className="sp">{p.outputKw} kW · {p.capacityKwh} kWh</div>
                  <span className="q-remove" onClick={() => onRemove(p.id)}>Remove</span>
                </div>
                <div className="q-price">${p.price.toLocaleString()}</div>
              </div>
            ))
          )}
        </div>
        <div className="drawer-ft">
          <p className="drawer-note">
            We'll confirm availability, review your site specs, and include any shipping costs before finalising.
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
            <li><a href="/diy-kits">DIY Kits</a></li>
            <li><a href="/batteries">Batteries</a></li>
            <li><a href="/racking">Racking &amp; Mounting</a></li>
            <li><a href="/off-grid">Off-Grid</a></li>
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

// ---- page ----

const STORAGE_KEY = 'brightify_offgrid_quote_v1';

export default function OffGridPage() {
  const [search, setSearch] = useState('');
  const [brand, setBrand] = useState('all');
  const [sort, setSort] = useState('price-asc');
  const [quote, setQuote] = useState<string[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    try { setQuote(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')); } catch { /* empty */ }
  }, []);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(quote));
  }, [quote]);

  const toggle = (id: string) => {
    setQuote(q => q.includes(id) ? q.filter(x => x !== id) : [...q, id]);
  };

  const filtered = useMemo(() => {
    let list = PRODUCTS.filter(p => {
      if (brand !== 'all' && !p.tags.includes(brand)) return false;
      if (search && !p.name.toLowerCase().includes(search.toLowerCase()) &&
          !p.tagline.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
    list = [...list].sort((a, b) => {
      if (sort === 'price-asc') return a.price - b.price;
      if (sort === 'price-desc') return b.price - a.price;
      if (sort === 'output-asc') return a.outputKw - b.outputKw;
      if (sort === 'output-desc') return b.outputKw - a.outputKw;
      return 0;
    });
    return list;
  }, [brand, sort, search]);

  const quoteItems = PRODUCTS.filter(p => quote.includes(p.id));

  return (
    <div>
      <SiteHeader
        active="offgrid"
        search={search}
        onSearchChange={setSearch}
        quoteCount={quote.length}
        onQuote={() => setDrawerOpen(true)}
      />

      <div className="toolbar">
        <div className="wrap">
          <div className="filter-group">
            <span className="filter-label">Brand</span>
            <select className="sort-select" value={brand} onChange={e => setBrand(e.target.value)}>
              {BRAND_FILTERS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
            </select>
          </div>
          <div className="toolbar-right">
            <span className="result-count">{filtered.length} system{filtered.length === 1 ? '' : 's'}</span>
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
                <div className="big">No systems match those filters.</div>
                <div>Try widening your selection.</div>
              </div>
            ) : (
              filtered.map(p => (
                <ProductCard key={p.id} p={p} inQuote={quote.includes(p.id)} onToggle={toggle} />
              ))
            )}
          </div>
        </div>
      </section>

      <section className="help">
        <div className="cta-sun"></div>
        <div className="wrap">
          <div>
            <span className="mono" style={{ color: 'var(--amber)' }}>NEED A CUSTOM SYSTEM?</span>
            <h2>We'll spec the <em>right system</em> for you.</h2>
            <p>
              Tell us your energy usage, load requirements and goals — a Brightify advisor will recommend the right off-grid or whole-home backup solution.
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

      {quote.length > 0 && (
        <div className="quote-bar" onClick={() => setDrawerOpen(true)}>
          <span>{quote.length} system{quote.length === 1 ? '' : 's'} in quote</span>
          <span className="quote-bar-cta">View quote <Arrow /></span>
        </div>
      )}

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        items={quoteItems}
        onRemove={id => setQuote(q => q.filter(x => x !== id))}
        onClear={() => { setQuote([]); setDrawerOpen(false); }}
      />
    </div>
  );
}
