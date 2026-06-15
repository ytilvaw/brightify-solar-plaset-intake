import { useMemo } from 'react';
import '../store.css';
import SiteHeader from './SiteHeader';
import { searchCatalog, CatalogItem } from '../lib/catalog';

const Arrow = ({ size = 14 }: { size?: number }) => (
  <svg className="arrow" width={size} height={size} viewBox="0 0 14 14" fill="none">
    <path d="M2 7h10m0 0L8 3m4 4L8 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const WhatsAppFab = () => (
  <a className="wa-fab" href="https://wa.me/14084643739" target="_blank" rel="noopener noreferrer" aria-label="Chat with us on WhatsApp">
    <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.13h-.01a8.2 8.2 0 0 1-4.18-1.14l-.3-.18-3.12.82.83-3.04-.2-.31a8.18 8.18 0 0 1-1.26-4.37c0-4.54 3.7-8.24 8.25-8.24a8.2 8.2 0 0 1 8.23 8.25c0 4.54-3.7 8.24-8.24 8.24Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.51.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43l-.48-.01c-.17 0-.43.06-.66.31-.23.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.28Z" />
    </svg>
  </a>
);

const CATEGORY_COLORS: Record<string, { bg: string; color: string }> = {
  'Solar Panels': { bg: 'rgba(255,180,0,0.10)', color: '#a06000' },
  'Batteries':    { bg: 'rgba(34,197,94,0.10)', color: '#166534' },
  'Inverters':    { bg: 'rgba(99,102,241,0.10)', color: '#3730a3' },
  'Off-Grid':     { bg: 'rgba(249,115,22,0.10)', color: '#9a3412' },
  'DIY Kits':     { bg: 'rgba(14,165,233,0.10)', color: '#0c4a6e' },
  'Racking':      { bg: 'rgba(100,116,139,0.10)', color: '#334155' },
};

function ResultCard({ item }: { item: CatalogItem }) {
  const cat = CATEGORY_COLORS[item.category] ?? { bg: 'rgba(0,0,0,0.06)', color: '#444' };
  return (
    <a href={item.categoryUrl} className="search-card">
      <div className="sc-img">
        <img src={item.image} alt={item.name} loading="lazy" />
      </div>
      <div className="sc-body">
        <span className="sc-cat" style={{ background: cat.bg, color: cat.color }}>{item.category}</span>
        <div className="sc-brand">{item.brand}</div>
        <div className="sc-name">{item.name}</div>
        {item.price != null
          ? <div className="sc-price">${item.price.toLocaleString()}</div>
          : <div className="sc-price sc-price--quote">Get a quote</div>}
      </div>
      <div className="sc-go"><Arrow /></div>
    </a>
  );
}

export default function SearchPage() {
  const params = new URLSearchParams(window.location.search);
  const query = params.get('q') ?? '';

  const results = useMemo(() => searchCatalog(query), [query]);

  // group by category
  const grouped = useMemo(() => {
    const map: Record<string, CatalogItem[]> = {};
    for (const item of results) {
      (map[item.category] ??= []).push(item);
    }
    return map;
  }, [results]);

  const handleSearch = (q: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set('q', q);
    window.history.replaceState(null, '', url.toString());
    // re-render by forcing reload is simplest here since we read from URL
    window.location.replace(url.toString());
  };

  return (
    <div>
      <SiteHeader
        search={query}
        onSearchSubmit={() => {/* handled inline */}}
        onSearchChange={() => {}}
      />
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px 80px' }}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const input = (e.currentTarget.querySelector('input[name=q]') as HTMLInputElement).value;
            handleSearch(input);
          }}
          style={{ marginBottom: 32, display: 'flex', gap: 10 }}
        >
          <input
            name="q"
            defaultValue={query}
            placeholder="Search products, brands, categories…"
            autoFocus
            style={{
              flex: 1, height: 46, padding: '0 16px', borderRadius: 10,
              border: '1.5px solid #e0e0e8', fontSize: 15, fontFamily: 'inherit',
              background: '#fff', outline: 'none',
            }}
          />
          <button
            type="submit"
            style={{
              height: 46, padding: '0 22px', borderRadius: 10, border: 'none',
              background: '#18181b', color: '#fff', fontWeight: 600, fontSize: 14,
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >Search</button>
        </form>

        {query === '' ? (
          <p style={{ color: '#888', fontSize: 15 }}>Enter a search term above to find products.</p>
        ) : results.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <p style={{ fontSize: 18, fontWeight: 600, color: '#18181b', marginBottom: 8 }}>No results for "{query}"</p>
            <p style={{ color: '#888', fontSize: 14 }}>Try searching for a brand (EcoFlow, EG4, Trina…) or product type (battery, inverter, panel…)</p>
          </div>
        ) : (
          <>
            <p style={{ color: '#666', fontSize: 14, marginBottom: 28 }}>
              {results.length} result{results.length !== 1 ? 's' : ''} for <strong>"{query}"</strong>
            </p>
            {Object.entries(grouped).map(([cat, items]) => (
              <section key={cat} style={{ marginBottom: 40 }}>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: '#18181b', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {cat} <span style={{ color: '#aaa', fontWeight: 400 }}>({items.length})</span>
                </h2>
                <div className="search-grid">
                  {items.map((item) => <ResultCard key={item.id} item={item} />)}
                </div>
              </section>
            ))}
          </>
        )}
      </main>
      <WhatsAppFab />
    </div>
  );
}
