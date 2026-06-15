import { useState, useEffect, useMemo } from 'react';
import '../store.css';
import SiteHeader from './SiteHeader';

// ------------------------------------------------------------------
// Brightify — Batteries category page
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

interface Battery {
  id: string;
  brand: string;
  model: string;
  name: string;
  kwh: number;
  voltage: string;
  chemistry: 'LiFePO4' | 'NMC' | 'Li-ion';
  dims: string;
  weight: string;
  ip: string;
  warranty: string;
  price: number | null;
  image: string;
  tags: string[];           // 'lifepo4' | 'nmc' | 'indoor' | 'outdoor' | 'highvoltage' | 'wallmount' | 'ruixu' | 'eg4' | 'lg' | 'tesla'
  datasheet?: string;
  certifications?: string;
  flag?: string;
  note?: string;            // short extra note e.g. "High-voltage · 400V"
}

const BATTERIES: Battery[] = [
  {
    id: 'ruixu-lithi2-16',
    brand: 'RUiXU',
    model: 'Lithi2-16',
    name: 'Lithi2-16 16kWh LiFePO4',
    kwh: 16,
    voltage: '51.2V',
    chemistry: 'LiFePO4',
    dims: '924×543×250 mm',
    weight: '137 kg',
    ip: 'IP65',
    warranty: '10 yr',
    price: 3299,
    image: '/batteries/ruixu-lithi2-16.webp',
    tags: ['lifepo4', 'outdoor', 'wallmount', 'ruixu'],
    datasheet: '/datasheets/ruixu-lithi2-16.pdf',
    certifications: 'UL1973, UL9540, UL9540A, CEC, SGIP',
    flag: 'IP65',
    note: '48V · Self-heating · Wheels included',
  },
  {
    id: 'lg-resu16h-prime',
    brand: 'LG Energy Solution',
    model: 'RESU16H Prime',
    name: 'RESU16H Prime 16kWh',
    kwh: 16,
    voltage: '400V',
    chemistry: 'NMC',
    dims: '504×1086×295 mm',
    weight: '159 kg',
    ip: 'IP55',
    warranty: '10 yr',
    price: 3000,
    image: '/batteries/lg-resu16h-prime.png',
    tags: ['nmc', 'indoor', 'highvoltage', 'lg'],
    datasheet: '/datasheets/lg-resu16h-prime.pdf',
    certifications: 'UL1973, UL1642, IEC 62619, TÜV',
    note: 'High-voltage · 400V · Requires HV inverter',
  },
  {
    id: 'eg4-wallmount-314ah-indoor',
    brand: 'EG4',
    model: 'WallMount 314Ah Indoor',
    name: 'WallMount 16.1kWh Indoor',
    kwh: 16.1,
    voltage: '51.2V',
    chemistry: 'LiFePO4',
    dims: '924×460×244 mm',
    weight: '133 kg',
    ip: 'IP20',
    warranty: '10 yr',
    price: 3399.99,
    image: '/batteries/eg4-wallmount-314ah-indoor.png',
    tags: ['lifepo4', 'indoor', 'wallmount', 'eg4'],
    datasheet: '/datasheets/eg4-wallmount-314ah-indoor.pdf',
    certifications: 'UL1973, UL9540A',
    note: '48V · 314Ah · Indoor rated · Self-heating',
  },
  {
    id: 'eg4-wallmount-314ah-aw',
    brand: 'EG4',
    model: 'WallMount 314Ah AllWeather',
    name: 'WallMount 16kWh AllWeather',
    kwh: 16,
    voltage: '51.2V',
    chemistry: 'LiFePO4',
    dims: '879×551×236 mm',
    weight: '140 kg',
    ip: 'IP67',
    warranty: '10 yr',
    price: 3749.99,
    image: '/batteries/eg4-wallmount-314ah-aw.png',
    tags: ['lifepo4', 'outdoor', 'wallmount', 'eg4'],
    datasheet: '/datasheets/eg4-wallmount-314ah-aw.pdf',
    certifications: 'UL1973, UL9540',
    flag: 'IP67',
    note: '48V · 314Ah · All-weather outdoor · 448W heater',
  },
  {
    id: 'eg4-wallmount-280ah-aw',
    brand: 'EG4',
    model: 'WallMount 280Ah AllWeather',
    name: 'WallMount 14.3kWh AllWeather',
    kwh: 14.3,
    voltage: '51.2V',
    chemistry: 'LiFePO4',
    dims: '880×566×232 mm',
    weight: '140 kg',
    ip: 'IP65',
    warranty: '10 yr',
    price: 3400,
    image: '/batteries/eg4-wallmount-280ah-aw.jpg',
    tags: ['lifepo4', 'outdoor', 'wallmount', 'eg4'],
    datasheet: '/datasheets/eg4-wallmount-280ah-aw.pdf',
    certifications: 'UL1973, UL9540A',
    flag: 'IP65',
    note: '48V · 280Ah · All-weather outdoor · Self-heating',
  },
  {
    id: 'tesla-powerwall-3',
    brand: 'Tesla',
    model: 'Powerwall 3',
    name: 'Powerwall 3 13.5kWh',
    kwh: 13.5,
    voltage: '52–92V DC',
    chemistry: 'NMC',
    dims: '1105×609×193 mm',
    weight: '132 kg',
    ip: 'IP67',
    warranty: '10 yr',
    price: 8500,
    image: '/batteries/tesla-powerwall-3.jpg',
    tags: ['nmc', 'outdoor', 'wallmount', 'tesla'],
    datasheet: '/datasheets/tesla-powerwall-3.pdf',
    certifications: 'UL1973, UL9540, UL9540A, IEC 62619',
    flag: 'IP67',
    note: 'Integrated inverter · Grid-tied & backup · App monitoring',
  },
  {
    id: 'tesla-powerwall-3-expansion',
    brand: 'Tesla',
    model: 'Powerwall 3 Expansion',
    name: 'Powerwall 3 Expansion 13.5kWh',
    kwh: 13.5,
    voltage: '52–92V DC',
    chemistry: 'NMC',
    dims: '1105×609×168 mm',
    weight: '119 kg',
    ip: 'IP67 / NEMA 3R',
    warranty: '10 yr',
    price: 7200,
    image: '/batteries/tesla-powerwall-3-expansion.png',
    tags: ['nmc', 'outdoor', 'wallmount', 'tesla'],
    datasheet: '/datasheets/tesla-powerwall-3.pdf',
    certifications: 'UL1973, UL9540, UL9540A',
    flag: 'IP67',
    note: 'Requires Powerwall 3 · Up to 3 units stacked (40.5 kWh)',
  },
  {
    id: 'dawnice-5kwh',
    brand: 'Dawnice',
    model: 'HZEB-LCT-5',
    name: 'HZEB-LCT-5 5kWh Wall Battery',
    kwh: 5.12,
    voltage: '51.2V',
    chemistry: 'LiFePO4',
    dims: '400×160×700 mm',
    weight: '59 kg',
    ip: 'IP54',
    warranty: '10 yr',
    price: null,
    image: '/batteries/dawnice-5kwh.webp',
    tags: ['lifepo4', 'indoor', 'wallmount', 'dawnice'],
    datasheet: '/datasheets/dawnice-wallmount.pdf',
    certifications: 'UL1973, IEC62619, CE, RoHS',
    note: '48V · 100Ah · 5,000+ cycles · Wall mount',
  },
  {
    id: 'dawnice-10kwh',
    brand: 'Dawnice',
    model: 'HZEB-LCT-10',
    name: 'HZEB-LCT-10 10kWh Wall Battery',
    kwh: 10.54,
    voltage: '51.2V',
    chemistry: 'LiFePO4',
    dims: '460×245×640 mm',
    weight: '83.5 kg',
    ip: 'IP54',
    warranty: '10 yr',
    price: null,
    image: '/batteries/dawnice-10kwh.webp',
    tags: ['lifepo4', 'indoor', 'wallmount', 'dawnice'],
    datasheet: '/datasheets/dawnice-wallmount.pdf',
    certifications: 'UL1973, IEC62619, CE, RoHS',
    note: '48V · 206Ah · 6,000+ cycles · Wall mount',
  },
  {
    id: 'dawnice-15kwh',
    brand: 'Dawnice',
    model: 'HZEB-LCT-15',
    name: 'HZEB-LCT-15 16kWh Wall Battery',
    kwh: 16.07,
    voltage: '51.2V',
    chemistry: 'LiFePO4',
    dims: '462×245×800 mm',
    weight: '127 kg',
    ip: 'IP54',
    warranty: '10 yr',
    price: 2899,
    image: '/batteries/dawnice-15kwh.webp',
    tags: ['lifepo4', 'indoor', 'wallmount', 'dawnice'],
    datasheet: '/datasheets/dawnice-wallmount.pdf',
    certifications: 'UL1973, IEC62619, CE, RoHS',
    note: '48V · 314Ah · 8,000+ cycles · Wall mount',
  },
  {
    id: 'enphase-iq-battery-5p',
    brand: 'Enphase',
    model: 'IQ Battery 5P',
    name: 'IQ Battery 5P 5kWh',
    kwh: 5.0,
    voltage: '240V AC',
    chemistry: 'LiFePO4',
    dims: '660×394×216 mm',
    weight: '54 kg',
    ip: 'NEMA 3R',
    warranty: '15 yr / 6,000 cycles',
    price: 3299,
    image: '/batteries/enphase-iq-battery-5p.jpg',
    tags: ['lifepo4', 'outdoor', 'wallmount', 'enphase'],
    datasheet: '/datasheets/enphase-iq-battery-5p.pdf',
    certifications: 'UL9540, UL1973, UN38.3',
    flag: 'NEMA 3R',
    note: 'AC-coupled · 6 embedded IQ8D-BAT microinverters · 3.84 kW continuous',
  },
  {
    id: 'dawnice-20kwh',
    brand: 'Dawnice',
    model: 'HZEB-LCT-20',
    name: 'HZEB-LCT-20 20kWh Wall Battery',
    kwh: 20.99,
    voltage: '51.2V',
    chemistry: 'LiFePO4',
    dims: '650×265×850 mm',
    weight: '180 kg',
    ip: 'IP21',
    warranty: '10 yr',
    price: null,
    image: '/batteries/dawnice-20kwh.webp',
    tags: ['lifepo4', 'indoor', 'wallmount', 'dawnice'],
    datasheet: '/datasheets/dawnice-wallmount.pdf',
    certifications: 'UL1973, IEC62619, CE, RoHS',
    note: '48V · 400Ah · 6,000+ cycles · Wall mount',
  },
  {
    id: 'ecoflow-delta-pro-ultra-x-battery-1x',
    brand: 'EcoFlow',
    model: 'DELTA Pro Ultra X Smart Extra Battery (1×)',
    name: 'DELTA Pro Ultra X Smart Extra Battery 6.1kWh',
    kwh: 6.144,
    voltage: '48V',
    chemistry: 'LiFePO4',
    dims: 'N/A',
    weight: 'N/A',
    ip: 'N/A',
    warranty: '5 yr',
    price: 2099,
    image: '/batteries/ecoflow-delta-pro-ultra-x-battery-1x.png',
    tags: ['lifepo4', 'indoor', 'ecoflow'],
    note: '6,144Wh · EV-grade LFP · Plug-and-play · 1×',
  },
  {
    id: 'ecoflow-delta-pro-ultra-x-battery-2x',
    brand: 'EcoFlow',
    model: 'DELTA Pro Ultra X Smart Extra Battery (2×)',
    name: 'DELTA Pro Ultra X Smart Extra Battery 12.3kWh',
    kwh: 12.288,
    voltage: '48V',
    chemistry: 'LiFePO4',
    dims: 'N/A',
    weight: 'N/A',
    ip: 'N/A',
    warranty: '5 yr',
    price: 4099,
    image: '/batteries/ecoflow-delta-pro-ultra-x-battery-2x.png',
    tags: ['lifepo4', 'indoor', 'ecoflow'],
    note: '12,288Wh · EV-grade LFP · Plug-and-play · 2×',
  },
  {
    id: 'ecoflow-delta-pro-ultra-x-battery-3x',
    brand: 'EcoFlow',
    model: 'DELTA Pro Ultra X Smart Extra Battery (3×)',
    name: 'DELTA Pro Ultra X Smart Extra Battery 18.4kWh',
    kwh: 18.432,
    voltage: '48V',
    chemistry: 'LiFePO4',
    dims: 'N/A',
    weight: 'N/A',
    ip: 'N/A',
    warranty: '5 yr',
    price: 6059,
    image: '/batteries/ecoflow-delta-pro-ultra-x-battery-3x.png',
    tags: ['lifepo4', 'indoor', 'ecoflow'],
    note: '18,432Wh · EV-grade LFP · Plug-and-play · 3×',
  },
  {
    id: 'ecoflow-delta-pro-ultra-x-battery-4x',
    brand: 'EcoFlow',
    model: 'DELTA Pro Ultra X Smart Extra Battery (4×)',
    name: 'DELTA Pro Ultra X Smart Extra Battery 24.6kWh',
    kwh: 24.576,
    voltage: '48V',
    chemistry: 'LiFePO4',
    dims: 'N/A',
    weight: 'N/A',
    ip: 'N/A',
    warranty: '5 yr',
    price: 7999,
    image: '/batteries/ecoflow-delta-pro-ultra-x-battery-4x.png',
    tags: ['lifepo4', 'indoor', 'ecoflow'],
    note: '24,576Wh · EV-grade LFP · Plug-and-play · 4×',
    flag: 'Most capacity',
  },
];

// ---- filters ----

const CHEM_FILTERS: [string, string][] = [
  ['all', 'All'],
  ['lifepo4', 'LiFePO4'],
  ['nmc', 'NMC / Li-ion'],
];
const LOCATION_FILTERS: [string, string][] = [
  ['all', 'All'],
  ['indoor', 'Indoor'],
  ['outdoor', 'Outdoor'],
];
const BRAND_FILTERS: [string, string][] = [
  ['all', 'All Brands'],
  ['ruixu', 'RUiXU'],
  ['eg4', 'EG4'],
  ['lg', 'LG'],
  ['tesla', 'Tesla'],
  ['dawnice', 'Dawnice'],
  ['enphase', 'Enphase'],
  ['ecoflow', 'EcoFlow'],
];
const SORTS: [string, string][] = [
  ['kwh-asc', 'Capacity: low to high'],
  ['kwh-desc', 'Capacity: high to low'],
  ['price-asc', 'Price: low to high'],
  ['price-desc', 'Price: high to low'],
];

// ---- tag pill ----

function TagPill({ tag }: { tag: string }) {
  const map: Record<string, [string, React.CSSProperties]> = {
    lifepo4:     ['LiFePO4',    { background: 'rgba(30,100,220,0.07)', color: '#1a4fb5', borderColor: 'rgba(30,100,220,0.2)' }],
    nmc:         ['NMC',        { background: 'rgba(255,85,119,0.08)', color: '#b0003a', borderColor: 'rgba(255,85,119,0.2)' }],
    outdoor:     ['Outdoor',    { background: 'rgba(60,180,80,0.08)', color: '#1a6b2a', borderColor: 'rgba(60,180,80,0.2)' }],
    indoor:      ['Indoor',     { background: '#f0f0f2', color: '#333', borderColor: '#ddd' }],
    highvoltage: ['High-Volt',  { background: 'rgba(255,201,60,0.12)', color: '#a06000', borderColor: 'rgba(255,201,60,0.3)' }],
  };
  const entry = map[tag];
  if (!entry) return null;
  return <span className="prod-spec" style={entry[1]}>{entry[0]}</span>;
}

// ---- product card ----

function BatteryCard({ p, inQuote, onToggle }: { p: Battery; inQuote: boolean; onToggle: (id: string) => void }) {
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
          <span className="prod-spec">{p.kwh} kWh</span>
          <span className="prod-spec">{p.voltage}</span>
          <span className="prod-spec">{p.chemistry}</span>
          {p.tags.filter(t => ['lifepo4','nmc','outdoor','indoor','highvoltage'].includes(t)).slice(0, 2).map(t => (
            <TagPill key={t} tag={t} />
          ))}
        </div>
        {p.note && (
          <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--ink-3)', letterSpacing: '0.04em' }}>
            {p.note}
          </div>
        )}
        <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--ink-3)', letterSpacing: '0.04em' }}>
          {p.dims} · {p.weight} · {p.warranty} warranty
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
                <span className="amt"><sup>$</sup>{p.price.toLocaleString(undefined, { minimumFractionDigits: p.price % 1 !== 0 ? 2 : 0 })}<span className="per"> /unit</span></span>
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
        <rect x="7" y="14" width="32" height="20" rx="3" />
        <path d="M39 21h3v6h-3" />
        <path d="M22 19l-3 6h5l-3 6" />
      </svg>
    </div>
  );
}

function Drawer({
  open, onClose, items, onRemove, onClear,
}: {
  open: boolean; onClose: () => void; items: Battery[]; onRemove: (id: string) => void; onClear: () => void;
}) {
  const waMsg = useMemo(() => {
    if (!items.length) return '';
    const lines = items.map(p => `• ${p.brand} ${p.model} (${p.kwh} kWh, ${p.chemistry})${p.price !== null ? ` — $${p.price.toLocaleString()}/unit` : ' — pricing TBD'}`);
    return encodeURIComponent(`Hi Brightify, I'd like a quote on these batteries:\n${lines.join('\n')}`);
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
            <div className="drawer-empty">No batteries added yet.<br />Tap "Add to quote" on any battery to start.</div>
          ) : (
            items.map(p => (
              <div className="q-item" key={p.id}>
                <QuoteThumb />
                <div className="q-meta">
                  <div className="nm">{p.brand} {p.name}</div>
                  <div className="sp">{p.kwh} kWh · {p.chemistry} · {p.warranty}</div>
                  <span className="q-remove" onClick={() => onRemove(p.id)}>Remove</span>
                </div>
                <div className="q-price">{p.price !== null ? `$${p.price.toLocaleString()}` : 'Quote'}</div>
              </div>
            ))
          )}
        </div>
        <div className="drawer-ft">
          <p className="drawer-note">
            We'll confirm battery compatibility with your inverter, shipping costs, and include permit plans if needed.
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
            <li><a href="/#shop-diy">DIY Kits</a></li>
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

const STORE_KEY = 'brightify_bat_quote_v1';

export default function BatteriesPage() {
  const [chem, setChem] = useState('all');
  const [location, setLocation] = useState('all');
  const [brand, setBrand] = useState('all');
  const [sort, setSort] = useState('kwh-asc');
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
    let list = BATTERIES.filter(p =>
      (chem === 'all' || p.tags.includes(chem)) &&
      (location === 'all' || p.tags.includes(location)) &&
      (brand === 'all' || p.tags.includes(brand)) &&
      (qq === '' || `${p.brand} ${p.model} ${p.name}`.toLowerCase().includes(qq))
    );
    if (sort === 'kwh-asc')   list = [...list].sort((a, b) => a.kwh - b.kwh);
    if (sort === 'kwh-desc')  list = [...list].sort((a, b) => b.kwh - a.kwh);
    if (sort === 'price-asc') list = [...list].sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
    if (sort === 'price-desc')list = [...list].sort((a, b) => (b.price ?? -Infinity) - (a.price ?? -Infinity));
    return list;
  }, [chem, location, brand, sort, query]);

  const quoteItems = useMemo(() => quote.map(id => BATTERIES.find(p => p.id === id)).filter((p): p is Battery => Boolean(p)), [quote]);

  return (
    <>
      <SiteHeader
        active="battery"
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
            <span className="here">Batteries</span>
          </div>
          <h1 className="cat-title" style={{ fontFamily: 'var(--hdisplay)' }}>Batteries</h1>
        </div>
      </section>

      <div className="toolbar">
        <div className="wrap">
          <div className="filter-group">
            <span className="filter-label">Chemistry</span>
            {CHEM_FILTERS.map(([k, l]) => (
              <button key={k} className={`chip${chem === k ? ' active' : ''}`} onClick={() => setChem(k)}>{l}</button>
            ))}
          </div>
          <div className="filter-group">
            <span className="filter-label">Install</span>
            {LOCATION_FILTERS.map(([k, l]) => (
              <button key={k} className={`chip${location === k ? ' active' : ''}`} onClick={() => setLocation(k)}>{l}</button>
            ))}
          </div>
          <div className="filter-group">
            <span className="filter-label">Brand</span>
            <select className="sort-select" value={brand} onChange={e => setBrand(e.target.value)}>
              {BRAND_FILTERS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
            </select>
          </div>
          <div className="toolbar-right">
            <span className="result-count">{filtered.length} batter{filtered.length === 1 ? 'y' : 'ies'}</span>
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
                <div className="big">No batteries match those filters.</div>
                <div>Try widening your selection.</div>
              </div>
            ) : (
              filtered.map(p => (
                <BatteryCard key={p.id} p={p} inQuote={quote.includes(p.id)} onToggle={toggle} />
              ))
            )}
          </div>
        </div>
      </section>

      <section className="help">
        <div className="cta-sun"></div>
        <div className="wrap">
          <div>
            <span className="mono" style={{ color: 'var(--amber)' }}>NOT SURE WHICH BATTERY?</span>
            <h2>Let's spec it <em>together</em>.</h2>
            <p>
              Tell us your inverter, daily usage and backup goals — a Brightify advisor will size the right battery bank and quote a complete, permit-ready system.
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
        <span className="qb-count"><span className="qb-badge">{quote.length}</span> batter{quote.length === 1 ? 'y' : 'ies'} in your quote</span>
        <button className="qb-review" onClick={() => setDrawer(true)}>Review</button>
        <a className="btn btn-grad btn-sm" href="#" onClick={e => { e.preventDefault(); setDrawer(true); }}>Request quote <Arrow /></a>
      </div>

      <Drawer open={drawer} onClose={() => setDrawer(false)} items={quoteItems} onRemove={remove} onClear={clear} />
    </>
  );
}
