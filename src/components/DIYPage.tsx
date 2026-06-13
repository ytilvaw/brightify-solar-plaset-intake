import { useState, useEffect, useMemo } from 'react';
import '../store.css';
import SiteHeader from './SiteHeader';

// ------------------------------------------------------------------
// Brightify — DIY Kits category page
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

interface Kit {
  id: string;
  name: string;
  tagline: string;
  type: 'hybrid' | 'offgrid' | 'battery-backup'; // kept for future use
  solarKw: number;
  batteryKwh: number;
  components: string[];
  price: number;
  image: string;
  tags: string[];
  flag?: string;
  includesInstallation?: boolean;
}

// Pricing logic:
// Panel: 450W @ $165 each → panels = ceil(solarKw * 1000 / 450)
// Battery: RUiXU 16kWh @ $3,250 each → 2 units = 32kWh
// EG4 FlexBOSS18 inverter: $3,600
// RUiXU RX-12K inverter: $3,299

const KITS: Kit[] = [
  {
    id: 'eg4-8kw-hybrid-32kwh',
    name: '8kW Hybrid Solar DIY Kit',
    tagline: 'EG4 FlexBOSS18 · 2× RUiXU 160U · 18 panels (8.1kW)',
    type: 'hybrid',
    solarKw: 8,
    batteryKwh: 32,
    // 18 panels × $165 = $2,970 | 2 batteries × $3,250 = $6,500 | inverter $3,600 → $13,070
    components: [
      '18× 450W all-black solar panels (8.1 kW)',
      'EG4 FlexBOSS18 13kW Hybrid Inverter',
      '2× RUiXU Lithi2-16 (32 kWh total)',
    ],
    price: 13100,
    image: '/kits/kit-eg4-8kw-hybrid.jpg',
    tags: ['hybrid', 'eg4'],
  },
  {
    id: 'eg4-9kw-hybrid-32kwh',
    name: '9kW Hybrid Solar DIY Kit',
    tagline: 'EG4 FlexBOSS18 · 2× RUiXU 160U · 20 panels (9kW)',
    type: 'hybrid',
    solarKw: 9,
    batteryKwh: 32,
    // 20 panels × $165 = $3,300 | 2 batteries × $3,250 = $6,500 | inverter $3,600 → $13,400
    components: [
      '20× 450W all-black solar panels (9 kW)',
      'EG4 FlexBOSS18 13kW Hybrid Inverter',
      '2× RUiXU Lithi2-16 (32 kWh total)',
    ],
    price: 13400,
    image: '/kits/kit-eg4-9kw-hybrid.jpg',
    tags: ['hybrid', 'eg4'],
  },
  {
    id: 'eg4-10kw-hybrid-32kwh',
    name: '10kW Hybrid Solar DIY Kit',
    tagline: 'EG4 FlexBOSS18 · 2× RUiXU 160U · 23 panels (10.35kW)',
    type: 'hybrid',
    solarKw: 10,
    batteryKwh: 32,
    // 23 panels × $165 = $3,795 | 2 batteries × $3,250 = $6,500 | inverter $3,600 → $13,895
    components: [
      '23× 450W all-black solar panels (10.35 kW)',
      'EG4 FlexBOSS18 13kW Hybrid Inverter',
      '2× RUiXU Lithi2-16 (32 kWh total)',
    ],
    price: 13900,
    image: '/kits/kit-eg4-10kw-hybrid.jpg',
    tags: ['hybrid', 'eg4'],
  },
  {
    id: 'ruixu-8kw-hybrid-32kwh',
    name: '8kW Hybrid Solar DIY Kit',
    tagline: 'RUiXU RX-12K · 2× RUiXU 160U · 18 panels (8.1kW)',
    type: 'hybrid',
    solarKw: 8,
    batteryKwh: 32,
    // 18 panels × $165 = $2,970 | 2 batteries × $3,250 = $6,500 | inverter $3,299 → $12,769
    components: [
      '18× 450W all-black solar panels (8.1 kW)',
      'RUiXU RX-12K 11.4kW Hybrid Inverter',
      '2× RUiXU Lithi2-16 (32 kWh total)',
    ],
    price: 12800,
    image: '/kits/kit-ruixu-8kw-hybrid.jpg',
    tags: ['hybrid', 'ruixu'],
  },
  {
    id: 'ruixu-9kw-hybrid-32kwh',
    name: '9kW Hybrid Solar DIY Kit',
    tagline: 'RUiXU RX-12K · 2× RUiXU 160U · 20 panels (9kW)',
    type: 'hybrid',
    solarKw: 9,
    batteryKwh: 32,
    // 20 panels × $165 = $3,300 | 2 batteries × $3,250 = $6,500 | inverter $3,299 → $13,099
    components: [
      '20× 450W all-black solar panels (9 kW)',
      'RUiXU RX-12K 11.4kW Hybrid Inverter',
      '2× RUiXU Lithi2-16 (32 kWh total)',
    ],
    price: 13100,
    image: '/kits/kit-ruixu-9kw-hybrid.jpg',
    tags: ['hybrid', 'ruixu'],
  },
  {
    id: 'ruixu-10kw-hybrid-32kwh',
    name: '10kW Hybrid Solar DIY Kit',
    tagline: 'RUiXU RX-12K · 2× RUiXU 160U · 23 panels (10.35kW)',
    type: 'hybrid',
    solarKw: 10,
    batteryKwh: 32,
    // 23 panels × $165 = $3,795 | 2 batteries × $3,250 = $6,500 | inverter $3,299 → $13,594
    components: [
      '23× 450W all-black solar panels (10.35 kW)',
      'RUiXU RX-12K 11.4kW Hybrid Inverter',
      '2× RUiXU Lithi2-16 (32 kWh total)',
    ],
    price: 13600,
    image: '/kits/kit-ruixu-10kw-hybrid.jpg',
    tags: ['hybrid', 'ruixu'],
  },
  {
    id: 'eg4-11kw-hybrid-32kwh',
    name: '11kW Hybrid Solar DIY Kit',
    tagline: 'EG4 FlexBOSS18 · 2× RUiXU 160U · 25 panels (11.25kW)',
    type: 'hybrid',
    solarKw: 11,
    batteryKwh: 32,
    // 25 panels × $165 = $4,125 | 2 batteries × $3,250 = $6,500 | inverter $3,600 → $14,225
    components: [
      '25× 450W all-black solar panels (11.25 kW)',
      'EG4 FlexBOSS18 13kW Hybrid Inverter',
      '2× RUiXU Lithi2-16 (32 kWh total)',
    ],
    price: 14300,
    image: '/kits/kit-eg4-11kw-hybrid.jpg',
    tags: ['hybrid', 'eg4'],
    flag: 'Most powerful',
  },
];

// ---- filters ----

const BRAND_FILTERS: [string, string][] = [
  ['all', 'All Brands'],
  ['eg4', 'EG4'],
  ['ruixu', 'RUiXU'],
];
const SORTS: [string, string][] = [
  ['price-asc', 'Price: low to high'],
  ['price-desc', 'Price: high to low'],
  ['solar-asc', 'Solar: low to high'],
  ['solar-desc', 'Solar: high to low'],
];

// ---- kit card ----

function KitCard({ k, inQuote, onToggle }: { k: Kit; inQuote: boolean; onToggle: (id: string) => void }) {
  const typeLabel: Record<Kit['type'], string> = {
    hybrid: 'Hybrid',
    offgrid: 'Off-Grid',
    'battery-backup': 'Battery Backup',
  };
  const typeStyle: Record<Kit['type'], React.CSSProperties> = {
    hybrid: { background: 'rgba(30,100,220,0.07)', color: '#1a4fb5', borderColor: 'rgba(30,100,220,0.2)' },
    offgrid: { background: 'rgba(255,201,60,0.12)', color: '#a06000', borderColor: 'rgba(255,201,60,0.3)' },
    'battery-backup': { background: 'rgba(60,180,80,0.08)', color: '#1a6b2a', borderColor: 'rgba(60,180,80,0.2)' },
  };

  return (
    <article className="prod-card">
      <div style={{ position: 'relative' }}>
        <div style={{ height: '420px', background: '#f5f6f8', borderRadius: '12px 12px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          <img
            src={k.image}
            alt={k.name}
            style={{ maxWidth: '100%', maxHeight: '100%', width: 'auto', height: 'auto', display: 'block' }}
          />
        </div>
        {k.flag && <span className="prod-flag">{k.flag}</span>}
      </div>
      <div className="prod-body">
        <div className="prod-specs" style={{ marginBottom: '6px' }}>
          <span className="prod-spec" style={typeStyle[k.type]}>{typeLabel[k.type]}</span>
          <span className="prod-spec">{k.solarKw} kW Solar</span>
          <span className="prod-spec">{k.batteryKwh} kWh Battery</span>
          {k.includesInstallation && (
            <span className="prod-spec" style={{ background: 'rgba(255,130,0,0.08)', color: '#b34a00', borderColor: 'rgba(255,130,0,0.25)' }}>
              Incl. Installation
            </span>
          )}
        </div>
        <h3 className="prod-name">{k.name}</h3>
        <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--ink-3)', letterSpacing: '0.04em', marginBottom: '10px' }}>
          {k.tagline}
        </div>
        <ul style={{ margin: '0 0 12px 0', padding: '0 0 0 14px', fontSize: '12px', color: 'var(--ink-2)', lineHeight: '1.6' }}>
          {k.components.map((c, i) => <li key={i}>{c}</li>)}
        </ul>
        <div className="prod-foot">
          <div className="prod-price">
            <span className="from">Complete kit</span>
            <span className="amt"><sup>$</sup>{k.price.toLocaleString()}</span>
          </div>
          <button className={`btn-add${inQuote ? ' added' : ''}`} onClick={() => onToggle(k.id)}>
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
  open: boolean; onClose: () => void; items: Kit[]; onRemove: (id: string) => void; onClear: () => void;
}) {
  const waMsg = useMemo(() => {
    if (!items.length) return '';
    const lines = items.map(k => `• ${k.name} — $${k.price.toLocaleString()}`);
    return encodeURIComponent(`Hi Brightify, I'd like a quote on these DIY kits:\n${lines.join('\n')}`);
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
            <div className="drawer-empty">No kits added yet.<br />Tap "Add to quote" on any kit to start.</div>
          ) : (
            items.map((k) => (
              <div className="q-item" key={k.id}>
                <div style={{ width: 44, height: 44, borderRadius: 8, background: 'var(--paper-2)', border: '1px solid var(--rule)', overflow: 'hidden', flexShrink: 0 }}>
                  <img src={k.image} alt={k.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div className="q-meta">
                  <div className="nm">{k.name}</div>
                  <div className="sp">{k.solarKw} kW · {k.batteryKwh} kWh</div>
                  <span className="q-remove" onClick={() => onRemove(k.id)}>Remove</span>
                </div>
                <div className="q-price">${k.price.toLocaleString()}</div>
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

const STORAGE_KEY = 'brightify_diy_quote_v1';

export default function DIYPage() {
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
    let list = KITS.filter(k => {
      if (brand !== 'all' && !k.tags.includes(brand)) return false;
      if (search && !k.name.toLowerCase().includes(search.toLowerCase()) &&
          !k.tagline.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
    list = [...list].sort((a, b) => {
      if (sort === 'price-asc') return a.price - b.price;
      if (sort === 'price-desc') return b.price - a.price;
      if (sort === 'solar-asc') return a.solarKw - b.solarKw;
      if (sort === 'solar-desc') return b.solarKw - a.solarKw;
      return 0;
    });
    return list;
  }, [brand, sort, search]);

  const quoteItems = KITS.filter(k => quote.includes(k.id));

  return (
    <div>
      <SiteHeader
        active="diy"
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
            <span className="result-count">{filtered.length} kit{filtered.length === 1 ? '' : 's'}</span>
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
                <div className="big">No kits match those filters.</div>
                <div>Try widening your selection.</div>
              </div>
            ) : (
              filtered.map(k => (
                <KitCard key={k.id} k={k} inQuote={quote.includes(k.id)} onToggle={toggle} />
              ))
            )}
          </div>
        </div>
      </section>

      <section className="help">
        <div className="cta-sun"></div>
        <div className="wrap">
          <div>
            <span className="mono" style={{ color: 'var(--amber)' }}>NEED A CUSTOM SIZE?</span>
            <h2>We'll build the <em>perfect kit</em> for you.</h2>
            <p>
              Tell us your energy usage, roof size and goals — a Brightify advisor will spec a complete, permit-ready system matched to your home.
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
          <span>{quote.length} kit{quote.length === 1 ? '' : 's'} in quote</span>
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
