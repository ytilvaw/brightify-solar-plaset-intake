import { useState, useEffect, useMemo } from 'react';
import '../store.css';
import SiteHeader from './SiteHeader';

// ------------------------------------------------------------------
// Brightify — Solar Panels category page
// ------------------------------------------------------------------

// ---- shared icons ----

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

interface Product {
  id: string;
  brand: string;
  name: string;
  watt: number;
  eff: number;
  cell: string;
  use: string;
  warranty: number;
  price: number;
  flag?: string;
}

const PRODUCTS: Product[] = [
  { id: 'bf-mono-450', brand: 'Brightify', name: 'House Mono 450', watt: 450, eff: 21.3, cell: 'mono', use: 'res', warranty: 25, price: 189, flag: 'House brand' },
  { id: 'helios-bi-550', brand: 'Helios', name: 'Bifacial 550', watt: 550, eff: 21.8, cell: 'bifacial', use: 'com', warranty: 30, price: 229 },
  { id: 'north-ab-410', brand: 'Northstar', name: 'All-Black 410', watt: 410, eff: 20.9, cell: 'allblack', use: 'res', warranty: 25, price: 179, flag: 'Best seller' },
  { id: 'aurora-n-440', brand: 'Aurora', name: 'N-Type 440', watt: 440, eff: 22.3, cell: 'ntype', use: 'res', warranty: 30, price: 209, flag: 'High efficiency' },
  { id: 'sunforge-500', brand: 'SunForge', name: 'Mono 500', watt: 500, eff: 21.5, cell: 'mono', use: 'com', warranty: 25, price: 215 },
  { id: 'lumen-ab-400', brand: 'Lumen', name: 'All-Black 400', watt: 400, eff: 20.6, cell: 'allblack', use: 'res', warranty: 25, price: 169 },
  { id: 'helios-mono-480', brand: 'Helios', name: 'Mono 480', watt: 480, eff: 21.6, cell: 'mono', use: 'res', warranty: 25, price: 199 },
  { id: 'vela-bi-575', brand: 'Vela', name: 'Bifacial 575', watt: 575, eff: 22.0, cell: 'bifacial', use: 'com', warranty: 30, price: 239, flag: 'Max power' },
  { id: 'bf-mono-415', brand: 'Brightify', name: 'House Mono 415', watt: 415, eff: 21.0, cell: 'mono', use: 'res', warranty: 25, price: 175 },
];

const CELL_LABEL: Record<string, string> = { mono: 'Mono PERC', bifacial: 'Bifacial', allblack: 'All-black', ntype: 'N-type TOPCon' };
const CELL_FILTERS: [string, string][] = [['all', 'All'], ['mono', 'Mono'], ['allblack', 'All-black'], ['bifacial', 'Bifacial'], ['ntype', 'N-type']];
const USE_FILTERS: [string, string][] = [['all', 'All'], ['res', 'Residential'], ['com', 'Commercial']];
const SORTS: [string, string][] = [['featured', 'Featured'], ['price-asc', 'Price: low to high'], ['price-desc', 'Price: high to low'], ['watt-desc', 'Wattage: high to low'], ['eff-desc', 'Efficiency: high to low']];

// ---- product card ----

function ModuleArt({ cell }: { cell: string }) {
  const cls = cell === 'allblack' ? 'allblack' : cell === 'bifacial' ? 'bifacial' : '';
  return (
    <div className={`prod-media ${cls}`}>
      <div className="mod">{Array.from({ length: 24 }).map((_, i) => <span key={i}></span>)}</div>
    </div>
  );
}

function ProductCard({ p, inQuote, onToggle }: { p: Product; inQuote: boolean; onToggle: (id: string) => void }) {
  return (
    <article className="prod-card">
      <div style={{ position: 'relative' }}>
        <ModuleArt cell={p.cell} />
        <span className="prod-brand">{p.brand}</span>
        {p.flag && <span className="prod-flag">{p.flag}</span>}
      </div>
      <div className="prod-body">
        <h3 className="prod-name">{p.brand} {p.name}</h3>
        <div className="prod-specs">
          <span className="prod-spec">{p.watt} W</span>
          <span className="prod-spec">{p.eff}% eff</span>
          <span className="prod-spec">{CELL_LABEL[p.cell]}</span>
          <span className="prod-spec">{p.warranty}-yr</span>
        </div>
        <div className="prod-foot">
          <div className="prod-price">
            <span className="from">From</span>
            <span className="amt"><sup>$</sup>{p.price}<span className="per"> /panel</span></span>
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
  return <div className="q-thumb">{Array.from({ length: 12 }).map((_, i) => <span key={i}></span>)}</div>;
}

function Drawer({
  open,
  onClose,
  items,
  onRemove,
  onClear,
}: {
  open: boolean;
  onClose: () => void;
  items: Product[];
  onRemove: (id: string) => void;
  onClear: () => void;
}) {
  const waMsg = useMemo(() => {
    if (!items.length) return '';
    const lines = items.map((p) => `• ${p.brand} ${p.name} (${p.watt}W, ${CELL_LABEL[p.cell]}) — from $${p.price}/panel`);
    return encodeURIComponent(`Hi Brightify, I'd like a quote on these solar panels:\n${lines.join('\n')}\n\nMy project: `);
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
            <div className="drawer-empty">No panels added yet.<br />Tap "Add to quote" on any panel to start.</div>
          ) : (
            items.map((p) => (
              <div className="q-item" key={p.id}>
                <QuoteThumb />
                <div className="q-meta">
                  <div className="nm">{p.brand} {p.name}</div>
                  <div className="sp">{p.watt} W · {CELL_LABEL[p.cell]} · {p.warranty}-yr</div>
                  <span className="q-remove" onClick={() => onRemove(p.id)}>Remove</span>
                </div>
                <div className="q-price">${p.price}</div>
              </div>
            ))
          )}
        </div>
        <div className="drawer-ft">
          <p className="drawer-note">
            We quote complete systems — we'll confirm panel pricing, racking, inverter and shipping,
            and include permit plans if you need them.
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
            <div><a href="tel:+14084643739">(408) 464-3739</a></div>
            <div><a href="https://wa.me/14084643739">WhatsApp — (408) 464-3739</a></div>
            <div><a href="mailto:info@brightifysolar.com">info@brightifysolar.com</a></div>
          </div>
        </div>
        <div className="col">
          <h4>Shop</h4>
          <ul>
            <li><a href="/solar-panels">Solar Panels</a></li>
            <li><a href="/#shop-diy">DIY Kits</a></li>
            <li><a href="/#shop-battery">Batteries</a></li>
            <li><a href="/#shop-inverter">Inverters</a></li>
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

// ---- localStorage key ----
const STORE_KEY = 'brightify_quote_v1';

// ---- page ----

export default function SolarPanelsPage() {
  const [cell, setCell] = useState('all');
  const [use, setUse] = useState('all');
  const [sort, setSort] = useState('featured');
  const [query, setQuery] = useState('');
  const [quote, setQuote] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORE_KEY);
      return stored ? (JSON.parse(stored) as string[]) : [];
    } catch {
      return [];
    }
  });
  const [drawer, setDrawer] = useState(false);

  useEffect(() => {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(quote)); } catch { /* noop */ }
  }, [quote]);

  const toggle = (id: string) => setQuote((q) => q.includes(id) ? q.filter((x) => x !== id) : [...q, id]);
  const remove = (id: string) => setQuote((q) => q.filter((x) => x !== id));
  const clear = () => setQuote([]);

  const filtered = useMemo(() => {
    const qq = query.trim().toLowerCase();
    let list = PRODUCTS.filter((p) =>
      (cell === 'all' || p.cell === cell) &&
      (use === 'all' || p.use === use) &&
      (qq === '' || `${p.brand} ${p.name} ${CELL_LABEL[p.cell]}`.toLowerCase().includes(qq))
    );
    if (sort === 'price-asc') list = [...list].sort((a, b) => a.price - b.price);
    else if (sort === 'price-desc') list = [...list].sort((a, b) => b.price - a.price);
    else if (sort === 'watt-desc') list = [...list].sort((a, b) => b.watt - a.watt);
    else if (sort === 'eff-desc') list = [...list].sort((a, b) => b.eff - a.eff);
    return list;
  }, [cell, use, sort, query]);

  const quoteItems = useMemo(() => quote.map((id) => PRODUCTS.find((p) => p.id === id)).filter((p): p is Product => Boolean(p)), [quote]);

  return (
    <>
      <SiteHeader
        active="solar"
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
            <span className="here">Solar Panels</span>
          </div>
          <h1 className="cat-title" style={{ fontFamily: 'var(--hdisplay)' }}>Solar Panels</h1>
        </div>
      </section>

      <div className="toolbar">
        <div className="wrap">
          <div className="filter-group">
            <span className="filter-label">Cell</span>
            {CELL_FILTERS.map(([k, l]) => (
              <button key={k} className={`chip${cell === k ? ' active' : ''}`} onClick={() => setCell(k)}>{l}</button>
            ))}
          </div>
          <div className="filter-group">
            <span className="filter-label">Use</span>
            {USE_FILTERS.map(([k, l]) => (
              <button key={k} className={`chip${use === k ? ' active' : ''}`} onClick={() => setUse(k)}>{l}</button>
            ))}
          </div>
          <div className="toolbar-right">
            <span className="result-count">{filtered.length} panel{filtered.length === 1 ? '' : 's'}</span>
            <select className="sort-select" value={sort} onChange={(e) => setSort(e.target.value)}>
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
                <div className="big">No panels match those filters.</div>
                <div>Try widening your selection.</div>
              </div>
            ) : (
              filtered.map((p) => (
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
            <span className="mono" style={{ color: 'var(--amber)' }}>NOT SURE WHICH PANEL?</span>
            <h2>Let's spec it <em>together</em>.</h2>
            <p>
              Tell us your roof, your budget and your goals — a Brightify advisor will match the
              right module to your array and quote the complete system, plans included.
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
        <span className="qb-count"><span className="qb-badge">{quote.length}</span> panel{quote.length === 1 ? '' : 's'} in your quote</span>
        <button className="qb-review" onClick={() => setDrawer(true)}>Review</button>
        <a className="btn btn-grad btn-sm" href="#" onClick={(e) => { e.preventDefault(); setDrawer(true); }}>Request quote <Arrow /></a>
      </div>

      <Drawer open={drawer} onClose={() => setDrawer(false)} items={quoteItems} onRemove={remove} onClear={clear} />
    </>
  );
}
