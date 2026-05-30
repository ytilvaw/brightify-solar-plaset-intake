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
  model: string;
  name: string;
  watt: number;
  eff: string;         // e.g. "22.3%"
  tech: string;        // display: "N-Type TOPCon", "HJT", etc.
  dims: string;        // e.g. "1762×1134×30mm"
  weight: string;
  use: 'res' | 'com';
  productWarranty: string;
  powerWarranty: string;
  price: number;       // per panel ($/W + 0.10) × watt
  pricePerW: string;   // display e.g. "$0.31/W"
  art: 'allblack' | 'silver'; // CSS art variant
  tags: string[];      // 'topcon' | 'hjt' | 'bifacial' | 'allblack'
  datasheet?: string;  // URL to PDF datasheet
  flag?: string;
}

// Prices = (USA list $/W + $0.10) × wattage, rounded to 2 dp
const PRODUCTS: Product[] = [
  {
    id: 'risen-rsm108-9-435',
    brand: 'Risen Energy',
    model: 'RSM108-9-435BNDG',
    name: 'RSM108-9-435 435W',
    watt: 435,
    eff: '22.3%',
    tech: 'N-Type TOPCon',
    dims: '1722×1134×30 mm',
    weight: '24.5 kg',
    use: 'res',
    productWarranty: '15 yr',
    powerWarranty: '30 yr',
    price: 134.85,    // ($0.21 + $0.10) × 435
    pricePerW: '$0.31/W',
    art: 'silver',
    tags: ['topcon', 'bifacial'],
    datasheet: 'https://en.risen.com/uploads/20240416/Risen_TDS%20for%20N-type%20Dual%20Glass%20Modules-20240416.pdf',
  },
  {
    id: 'trina-tsm-435neg9r',
    brand: 'Trina Solar',
    model: 'TSM-435NEG9R.28',
    name: 'Vertex S+ 435W',
    watt: 435,
    eff: '21.8%',
    tech: 'N-Type TOPCon',
    dims: '1762×1134×30 mm',
    weight: '21.1 kg',
    use: 'res',
    productWarranty: '25 yr',
    powerWarranty: '30 yr',
    price: 147.90,    // ($0.24 + $0.10) × 435
    pricePerW: '$0.34/W',
    art: 'silver',
    tags: ['topcon'],
    datasheet: 'https://static.trinasolar.com/sites/default/files/230531_Datasheet_Vertex%20S+_NEG9R.28_EN_2023_B_web.pdf',
  },
  {
    id: 'trina-tsm-445neg9r',
    brand: 'Trina Solar',
    model: 'TSM-445NEG9R.28',
    name: 'Vertex S+ 445W',
    watt: 445,
    eff: '22.3%',
    tech: 'N-Type TOPCon',
    dims: '1762×1134×30 mm',
    weight: '21.1 kg',
    use: 'res',
    productWarranty: '25 yr',
    powerWarranty: '30 yr',
    price: 151.30,    // ($0.24 + $0.10) × 445
    pricePerW: '$0.34/W',
    art: 'silver',
    tags: ['topcon'],
    flag: 'Best seller',
    datasheet: 'https://static.trinasolar.com/sites/default/files/230531_Datasheet_Vertex%20S+_NEG9R.28_EN_2023_B_web.pdf',
  },
  {
    id: 'trina-tsm-585neg18c',
    brand: 'Trina Solar',
    model: 'TSM-585NEG18C.20',
    name: 'Vertex 585W Bifacial',
    watt: 585,
    eff: '22.6%',
    tech: 'N-Type TOPCon',
    dims: '2278×1134×30 mm',
    weight: '31.9 kg',
    use: 'com',
    productWarranty: '12 yr',
    powerWarranty: '30 yr',
    price: 187.20,    // ($0.22 + $0.10) × 585
    pricePerW: '$0.32/W',
    art: 'silver',
    tags: ['topcon', 'bifacial', 'commercial'],
    datasheet: 'https://dpvenergy.com/wp-content/uploads/2024/05/DOC-20250305-WA0001.pdf',
  },
  {
    id: 'trina-tsm-610neg19rc',
    brand: 'Trina Solar',
    model: 'TSM-610NEG19RC.20',
    name: 'Vertex 610W Bifacial',
    watt: 610,
    eff: '22.58%',
    tech: 'N-Type TOPCon',
    dims: '2382×1134×30 mm',
    weight: '33.7 kg',
    use: 'com',
    productWarranty: '12 yr',
    powerWarranty: '30 yr',
    price: 195.20,    // ($0.22 + $0.10) × 610
    pricePerW: '$0.32/W',
    art: 'silver',
    tags: ['topcon', 'bifacial', 'commercial'],
    flag: 'Max power',
    datasheet: 'https://static.trinasolar.com/sites/default/files/Datasheet_Vertex_NEG19RC.20_EN_2023_A.pdf',
  },
  {
    id: 'canadian-cs6w-585tb',
    brand: 'Canadian Solar',
    model: 'CS6W-585TB-AG',
    name: 'HiKu6 585W Bifacial',
    watt: 585,
    eff: '22.6%',
    tech: 'N-Type TOPCon',
    dims: '2278×1134×30 mm',
    weight: '32.3 kg',
    use: 'com',
    productWarranty: '12 yr',
    powerWarranty: '30 yr',
    price: 187.20,    // ($0.22 + $0.10) × 585
    pricePerW: '$0.32/W',
    art: 'silver',
    tags: ['topcon', 'bifacial', 'commercial'],
    datasheet: 'https://static.csisolar.com/wp-content/uploads/2022/09/06160941/CS-Datasheet-TOPBiHiKu6-TOPCon_CS6W-TB-AG_v1.8_EN.pdf',
  },
  {
    id: 'ja-jam54d40-455lb',
    brand: 'JA Solar',
    model: 'JAM54D40-455/LB',
    name: 'DeepBlue 4.0 455W',
    watt: 455,
    eff: '22.8%',
    tech: 'N-Type TOPCon',
    dims: '1762×1134×30 mm',
    weight: '22.0 kg',
    use: 'res',
    productWarranty: '25 yr',
    powerWarranty: '30 yr',
    price: 154.70,    // ($0.24 + $0.10) × 455
    pricePerW: '$0.34/W',
    art: 'allblack',
    tags: ['topcon', 'bifacial', 'allblack'],
    flag: 'High efficiency',
    datasheet: '/datasheets/ja-jam54d40-455lb.pdf',
  },
  {
    id: 'znshine-zxmr-uhldd96-450',
    brand: 'Znshine Solar',
    model: 'ZXMR-UHLDD96-450N',
    name: 'Full Black 450W',
    watt: 450,
    eff: '22.52%',
    tech: 'N-Type SMBB',
    dims: '1762×1134×30 mm',
    weight: '26.0 kg',
    use: 'res',
    productWarranty: '12 yr',
    powerWarranty: '30 yr',
    price: 146.25,    // ($0.225 + $0.10) × 450
    pricePerW: '$0.325/W',
    art: 'allblack',
    tags: ['topcon', 'bifacial', 'allblack'],
    datasheet: 'https://sunwatts.com/content/specs/ZNShine%20450%20datasheet.pdf',
  },
  {
    id: 'ht-ht54-18x-f-455',
    brand: 'HT-SAAE',
    model: 'HT54-18X(ND)-F-455',
    name: 'Full Black 455W',
    watt: 455,
    eff: '22.8%',
    tech: 'N-Type TOPCon',
    dims: '1722×1134×30 mm',
    weight: '24.0 kg',
    use: 'res',
    productWarranty: '15 yr',
    powerWarranty: '30 yr',
    price: 147.88,    // ($0.225 + $0.10) × 455
    pricePerW: '$0.325/W',
    art: 'allblack',
    tags: ['topcon', 'bifacial', 'allblack'],
    datasheet: 'https://ussolarsupplier.com/cdn/shop/files/SPEC_HT54-18X_ND_-F_455W_USSS.pdf',
  },
  {
    id: 'ht-ht54-18x-f-435',
    brand: 'HT-SAAE',
    model: 'HT54-18X(ND)-F-435',
    name: 'Full Black 435W',
    watt: 435,
    eff: '21.8%',
    tech: 'N-Type TOPCon',
    dims: '1722×1134×30 mm',
    weight: '22.0 kg',
    use: 'res',
    productWarranty: '25 yr',
    powerWarranty: '30 yr',
    price: 141.38,    // ($0.225 + $0.10) × 435
    pricePerW: '$0.325/W',
    art: 'allblack',
    tags: ['topcon', 'bifacial', 'allblack'],
    datasheet: 'https://ussolarsupplier.com/cdn/shop/files/SPEC_HT54-18X_ND_-F_455W_USSS.pdf',
  },
  {
    id: 'huasun-hsn-210r-b96dsn440',
    brand: 'Huasun',
    model: 'HSN-210R-B96DSN440',
    name: 'Himalaya 440W HJT',
    watt: 440,
    eff: '22.0%',
    tech: 'HJT (Heterojunction)',
    dims: '1762×1134×30 mm',
    weight: '21.8 kg',
    use: 'res',
    productWarranty: '15 yr',
    powerWarranty: '30 yr',
    price: 143.00,    // ($0.225 + $0.10) × 440
    pricePerW: '$0.325/W',
    art: 'allblack',
    tags: ['hjt', 'bifacial', 'allblack'],
    datasheet: 'https://www.huasunsolar.com/uploads/file/hsn-210r-b96dsn-435-460-en.pdf',
  },
  {
    id: 'jinko-jkm585n-72hl4-bdv',
    brand: 'Jinko Solar',
    model: 'JKM585N-72HL4-BDV',
    name: 'Tiger Neo 585W',
    watt: 585,
    eff: '22.65%',
    tech: 'N-Type TOPCon',
    dims: '2278×1134×30 mm',
    weight: '31.0 kg',
    use: 'com',
    productWarranty: '12 yr',
    powerWarranty: '30 yr',
    price: 198.90,    // ($0.24 + $0.10) × 585
    pricePerW: '$0.34/W',
    art: 'silver',
    tags: ['topcon', 'bifacial', 'commercial'],
    datasheet: 'https://jinkosolar.eu/wp-content/uploads/JKM560-580N-72HL4-BDV-F3-EN.pdf',
  },
  {
    id: 'jinko-jkm470n-60hl4-v',
    brand: 'Jinko Solar',
    model: 'JKM470N-60HL4-V',
    name: 'Tiger Neo 470W',
    watt: 470,
    eff: '21.78%',
    tech: 'N-Type TOPCon',
    dims: '1903×1134×30 mm',
    weight: '22.5 kg',
    use: 'res',
    productWarranty: '12 yr',
    powerWarranty: '30 yr',
    price: 159.80,    // ($0.24 + $0.10) × 470
    pricePerW: '$0.34/W',
    art: 'silver',
    tags: ['topcon'],
    datasheet: 'https://jinkosolar.com.au/wp-content/uploads/2022/11/JKM470-490N-60HL4R-V-AUS.pdf',
  },

  // ---- New inventory (added from spec sheets) ----

  {
    id: 'risen-rsm96-11-475bndg',
    brand: 'Risen Energy',
    model: 'RSM96-11-475BNDG',
    name: 'RSM96-11-475 475W',
    watt: 475,
    eff: '23.8%',
    tech: 'N-Type TOPCon',
    dims: '1762×1134×30 mm',
    weight: '21.5 kg',
    use: 'res',
    productWarranty: '15 yr',
    powerWarranty: '30 yr',
    price: 142.50,    // $0.30 × 475
    pricePerW: '$0.30/W',
    art: 'silver',
    tags: ['topcon', 'bifacial'],
    datasheet: '/datasheets/risen-rsm96-11-475bndg.pdf',
  },
  {
    id: 'ja-jam54d41-lr-455w',
    brand: 'JA Solar',
    model: 'JAM54D41/LR 440-455W',
    name: 'DeepBlue 4.0 Pro 455W',
    watt: 455,
    eff: '22.8%',
    tech: 'N-Type TOPCon',
    dims: '1762×1134×30 mm',
    weight: '22.0 kg',
    use: 'res',
    productWarranty: '25 yr',
    powerWarranty: '30 yr',
    price: 150.15,    // $0.33 × 455
    pricePerW: '$0.33/W',
    art: 'allblack',
    tags: ['topcon', 'bifacial', 'allblack'],
    datasheet: '/datasheets/ja-jam54d41-lr-455w.pdf',
  },
  {
    id: 'ja-jam54d41-lr-465w',
    brand: 'JA Solar',
    model: 'JAM54D41/LR 440-465W',
    name: 'DeepBlue 4.0 Pro 465W',
    watt: 465,
    eff: '23.3%',
    tech: 'N-Type TOPCon',
    dims: '1762×1134×30 mm',
    weight: '22.0 kg',
    use: 'res',
    productWarranty: '25 yr',
    powerWarranty: '30 yr',
    price: 153.45,    // $0.33 × 465
    pricePerW: '$0.33/W',
    art: 'allblack',
    tags: ['topcon', 'bifacial', 'allblack'],
    datasheet: '/datasheets/ja-jam54d41-lr-465w.pdf',
  },
  {
    id: 'ja-jam72d40-mb-595w',
    brand: 'JA Solar',
    model: 'JAM72D40/MB 580-605W',
    name: 'DeepBlue 4.0 Pro 595W',
    watt: 595,
    eff: '21.8%',
    tech: 'N-Type TOPCon',
    dims: '2278×1134×30 mm',
    weight: '31.8 kg',
    use: 'com',
    productWarranty: '12 yr',
    powerWarranty: '30 yr',
    price: 196.35,    // $0.33 × 595
    pricePerW: '$0.33/W',
    art: 'allblack',
    tags: ['topcon', 'bifacial', 'allblack', 'commercial'],
    datasheet: '/datasheets/ja-jam72d40-mb-595w.pdf',
  },
  {
    id: 'jinko-jkm470n-48ql6-db',
    brand: 'Jinko Solar',
    model: 'JKM460-485N-48QL6-DB',
    name: 'Tiger Neo 470W Full Black',
    watt: 470,
    eff: '23.52%',
    tech: 'N-Type TOPCon',
    dims: '1762×1134×30 mm',
    weight: '24.4 kg',
    use: 'res',
    productWarranty: '25 yr',
    powerWarranty: '30 yr',
    price: 159.80,    // $0.34 × 470
    pricePerW: '$0.34/W',
    art: 'allblack',
    tags: ['topcon', 'allblack'],
    datasheet: '/datasheets/jinko-jkm460-485n-48ql6-db.pdf',
  },
  {
    id: 'sunplus-sr4-54htb-445m',
    brand: 'Sunplus',
    model: 'SR4-54HTB-445M',
    name: 'SR4 445W N-Type',
    watt: 445,
    eff: '23.0%',
    tech: 'N-Type TOPCon',
    dims: '1762×1134×30 mm',
    weight: '21.5 kg',
    use: 'res',
    productWarranty: '25 yr',
    powerWarranty: '30 yr',
    price: 133.50,    // $0.30 × 445
    pricePerW: '$0.30/W',
    art: 'allblack',
    tags: ['topcon', 'allblack'],
    datasheet: '/datasheets/sunplus-sr4-54htb-445m.pdf',
  },
  {
    id: 'trina-tsm-neg9rc27-450w',
    brand: 'Trina Solar',
    model: 'TSM-NEG9RC.27',
    name: 'Vertex S+ 450W Bifacial',
    watt: 450,
    eff: '22.5%',
    tech: 'N-Type i-TOPCon',
    dims: '1762×1134×30 mm',
    weight: '21.0 kg',
    use: 'res',
    productWarranty: '25 yr',
    powerWarranty: '30 yr',
    price: 153.00,    // ($0.24 + $0.10) × 450 — price TBC with Trina rep
    pricePerW: '$0.34/W',
    art: 'silver',
    tags: ['topcon', 'bifacial'],
    datasheet: '/datasheets/trina-tsm-neg9rc27-450w.pdf',
  },
];

const TAG_FILTERS: [string, string][] = [
  ['all', 'All'],
  ['topcon', 'TOPCon'],
  ['hjt', 'HJT'],
  ['allblack', 'All-Black'],
  ['bifacial', 'Bifacial'],
];
const USE_FILTERS: [string, string][] = [['all', 'All'], ['res', 'Residential'], ['com', 'Commercial']];
const SORTS: [string, string][] = [['featured', 'Featured'], ['price-asc', 'Price: low to high'], ['price-desc', 'Price: high to low'], ['watt-desc', 'Wattage: high to low'], ['eff-desc', 'Efficiency: high to low']];

// ---- product card ----

function ModuleArt({ art }: { art: Product['art'] }) {
  const cls = art === 'allblack' ? 'allblack' : 'silver';
  return (
    <div className={`prod-media ${cls}`}>
      <div className="mod">{Array.from({ length: 24 }).map((_, i) => <span key={i}></span>)}</div>
    </div>
  );
}

function TagPill({ tag }: { tag: string }) {
  const labels: Record<string, string> = {
    topcon: 'TOPCon', hjt: 'HJT', bifacial: 'Bifacial',
    allblack: 'All-Black', commercial: 'Commercial',
  };
  if (!labels[tag]) return null;
  const colors: Record<string, React.CSSProperties> = {
    bifacial: { background: 'rgba(255,201,60,0.12)', color: '#a06000', borderColor: 'rgba(255,201,60,0.3)' },
    allblack: { background: '#f0f0f2', color: '#333', borderColor: '#ddd' },
    hjt: { background: 'rgba(255,85,119,0.08)', color: '#b0003a', borderColor: 'rgba(255,85,119,0.2)' },
    topcon: { background: 'rgba(30,100,220,0.07)', color: '#1a4fb5', borderColor: 'rgba(30,100,220,0.2)' },
    commercial: { background: 'rgba(60,180,80,0.08)', color: '#1a6b2a', borderColor: 'rgba(60,180,80,0.2)' },
  };
  return (
    <span className="prod-spec" style={colors[tag] ?? {}}>
      {labels[tag]}
    </span>
  );
}

function ProductCard({ p, inQuote, onToggle }: { p: Product; inQuote: boolean; onToggle: (id: string) => void }) {
  return (
    <article className="prod-card">
      <div style={{ position: 'relative' }}>
        <ModuleArt art={p.art} />
        <span className="prod-brand">{p.brand}</span>
        {p.flag && <span className="prod-flag">{p.flag}</span>}
      </div>
      <div className="prod-body">
        <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: '-4px' }}>
          {p.model}
        </div>
        <h3 className="prod-name">{p.brand.toUpperCase()} {p.name}</h3>
        <div className="prod-specs">
          <span className="prod-spec">{p.watt} W</span>
          <span className="prod-spec">{p.eff}</span>
          <span className="prod-spec">{p.tech}</span>
          {p.tags.filter(t => ['bifacial','allblack','hjt','commercial'].includes(t)).slice(0,2).map(t => <TagPill key={t} tag={t} />)}
        </div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--ink-3)', letterSpacing: '0.04em' }}>
          {p.dims} · {p.weight} · {p.use === 'res' ? 'Residential' : 'Commercial'}
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
            <span className="from">{p.pricePerW}</span>
            <span className="amt"><sup>$</sup>{p.price.toFixed(2)}<span className="per"> /panel</span></span>
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
    const lines = items.map((p) => `• ${p.brand} ${p.model} (${p.watt}W, ${p.tech}) — $${p.price.toFixed(2)}/panel`);
    return encodeURIComponent(`Hi Brightify, I'd like a quote on these solar panels:\n${lines.join('\n')}`);
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
                  <div className="sp">{p.watt} W · {p.tech} · {p.productWarranty}</div>
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
  const [tag, setTag] = useState('all');
  const [use, setUse] = useState('all');
  const [sort, setSort] = useState('price-asc');
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
      (tag === 'all' || p.tags.includes(tag)) &&
      (use === 'all' || p.use === use) &&
      (qq === '' || `${p.brand} ${p.model} ${p.name} ${p.tech}`.toLowerCase().includes(qq))
    );
    if (sort === 'price-asc') list = [...list].sort((a, b) => a.price - b.price);
    else if (sort === 'price-desc') list = [...list].sort((a, b) => b.price - a.price);
    else if (sort === 'watt-desc') list = [...list].sort((a, b) => b.watt - a.watt);
    else if (sort === 'eff-desc') list = [...list].sort((a, b) => parseFloat(b.eff) - parseFloat(a.eff));
    return list;
  }, [tag, use, sort, query]);

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
            <span className="filter-label">Type</span>
            {TAG_FILTERS.map(([k, l]) => (
              <button key={k} className={`chip${tag === k ? ' active' : ''}`} onClick={() => setTag(k)}>{l}</button>
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
