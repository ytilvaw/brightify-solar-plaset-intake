import React, { useState } from 'react';

// ------------------------------------------------------------------
// Shared SITE HEADER — two rows + always-visible category bar.
// ------------------------------------------------------------------

export interface SiteHeaderProps {
  onHome?: boolean;
  active?: string | null;
  search?: string;
  onSearchChange?: (v: string) => void;
  onSearchSubmit?: () => void;
  quoteCount?: number;
  onQuote?: () => void;
}

// ---- icon stroke props ----
const SW: React.SVGProps<SVGSVGElement> = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as React.SVGProps<SVGSVGElement>;

const SHIcoSolar = () => (
  <svg viewBox="0 0 48 48" {...SW}>
    <path d="M6 30h36l-4-16H10L6 30Z" />
    <path d="M6 30h36M24 14v16M14 14l-2 16M34 14l2 16" />
    <path d="M16 30v4m16-4v4" />
  </svg>
);
const SHIcoDIY = () => (
  <svg viewBox="0 0 48 48" {...SW}>
    <path d="M24 6 8 14v20l16 8 16-8V14L24 6Z" />
    <path d="M8 14l16 8 16-8M24 22v20" />
    <path d="M16 10l16 8" />
  </svg>
);
const SHIcoRacking = () => (
  <svg viewBox="0 0 48 48" {...SW}>
    <path d="M5 18h38M9 18l3 22M39 18l-3 22M16 18l1.5 22M32 18l-1.5 22M24 18v22" />
    <path d="M12 40h24" />
  </svg>
);
const SHIcoOffgrid = () => (
  <svg viewBox="0 0 48 48" {...SW}>
    <circle cx="24" cy="14" r="6" />
    <path d="M24 4v2M24 22v2M14 14h2M32 14h2M17 7l1.4 1.4M29.6 19.6 31 21M31 7l-1.4 1.4M18.4 19.6 17 21" />
    <path d="M9 42V28l15-9 15 9v14" />
    <path d="M20 42v-9h8v9" />
  </svg>
);
const SHIcoInverter = () => (
  <svg viewBox="0 0 48 48" {...SW}>
    <rect x="8" y="10" width="32" height="28" rx="3" />
    <path d="M14 24c2-6 4-6 6 0s4 6 6 0 4-6 6 0" />
    <path d="M14 33h8" />
  </svg>
);
const SHIcoBattery = () => (
  <svg viewBox="0 0 48 48" {...SW}>
    <rect x="7" y="14" width="32" height="20" rx="3" />
    <path d="M39 21h3v6h-3" />
    <path d="M22 19l-3 6h5l-3 6" />
  </svg>
);

const SHArrow = ({ size = 14 }: { size?: number }) => (
  <svg className="arrow" width={size} height={size} viewBox="0 0 14 14" fill="none">
    <path d="M2 7h10m0 0L8 3m4 4L8 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const SHCaret = () => (
  <svg className="caret" width="11" height="11" viewBox="0 0 12 12" fill="none">
    <path d="M3 4.5 6 7.5 9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const SHSearchIco = () => (
  <svg className="s-ico" width="18" height="18" viewBox="0 0 20 20" fill="none">
    <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.6" />
    <path d="m14 14 3.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

interface Cat {
  key: string;
  name: string;
  hook: string;
  Icon: React.FC;
  short?: string;
}

const SH_CATS: Cat[] = [
  { key: 'solar', name: 'Solar Panels', hook: '400–550 W', Icon: SHIcoSolar },
  { key: 'diy', name: 'DIY Kits', hook: 'All-in-one', Icon: SHIcoDIY },
  { key: 'battery', name: 'Batteries', hook: 'LiFePO4', Icon: SHIcoBattery },
  { key: 'inverter', name: 'Inverters', hook: 'String · micro · hybrid', Icon: SHIcoInverter },
  { key: 'racking', name: 'Racking & Mounting', hook: 'Roof · ground · ballast', Icon: SHIcoRacking, short: 'Racking' },
  { key: 'offgrid', name: 'Off-Grid', hook: 'Cabins · RVs · remote', Icon: SHIcoOffgrid },
];

function shCatHref(key: string, onHome: boolean): string {
  if (key === 'solar') return '/solar-panels';
  if (key === 'inverter') return '/inverters';
  if (key === 'battery') return '/batteries';
  return onHome ? `#shop-${key}` : `/#shop-${key}`;
}

// ---- announce strip ----

function SiteAnnounce() {
  return (
    <div className="site-announce">
      <div className="wrap">
        <div className="left"><span className="dot"></span>Free shipping on orders over $2,500</div>
        <div className="right">Solar from panel to permit</div>
      </div>
    </div>
  );
}

// ---- All Products mega dropdown ----

function AllProducts({ onHome }: { onHome: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`allprod${open ? ' open' : ''}`}>
      <button className="allprod-btn" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <span className="burger"><span></span><span></span><span></span></span>
        All Products <SHCaret />
      </button>
      {open && <div className="allprod-scrim" onClick={() => setOpen(false)}></div>}
      <div className="allprod-menu" role="menu">
        <div className="hd">Shop by category</div>
        <div className="allprod-grid">
          {SH_CATS.map((c) => (
            <a key={c.key} className="apm-item" href={shCatHref(c.key, onHome)} onClick={() => setOpen(false)}>
              <span className="apm-ico"><c.Icon /></span>
              <span className="apm-text">
                <span className="apm-name">{c.name}</span>
                <span className="apm-hook">{c.hook}</span>
              </span>
            </a>
          ))}
        </div>
        <a className="apm-design" href="/design" onClick={() => setOpen(false)}>
          <span className="apm-ico">
            <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M32 8l8 8-20 20H12v-8L32 8Z" />
              <path d="M28 12l8 8" />
            </svg>
          </span>
          <span className="apm-text">
            <span className="apm-name">Design Studio</span>
            <span className="apm-hook">Permit plansets</span>
          </span>
        </a>
      </div>
    </div>
  );
}

// ---- main header ----

export default function SiteHeader({
  onHome = false,
  active = null,
  search = '',
  onSearchChange,
  onSearchSubmit,
  quoteCount,
  onQuote,
}: SiteHeaderProps) {
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearchSubmit) {
      onSearchSubmit();
    } else {
      window.location.href = '/solar-panels';
    }
  };

  return (
    <>
      <SiteAnnounce />
      <div className="site-head" id="top">
        <div className="site-row1">
          <div className="wrap">
            <a href="/" className="site-brand">
              <img className="mark" src="/brightify-logo.png" alt="Brightify" />
              <span>BRIGHTIFY</span>
            </a>
            <div className="site-search">
              <form onSubmit={submit}>
                <SHSearchIco />
                <input
                  type="text"
                  placeholder="Search panels, kits, inverters, batteries…"
                  value={search}
                  onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
                />
                <button type="submit" className="s-go">Search</button>
              </form>
            </div>
            <div className="site-util">
              <a className="ulink" href="/design">Design</a>
              <a className="ulink" href="https://wa.me/14084643739">Contact</a>
              {quoteCount != null && (
                <button className="site-quote" onClick={onQuote}>
                  Quote {quoteCount > 0 && <span className="qn">{quoteCount}</span>}
                </button>
              )}
              <a className="btn btn-grad btn-sm" href="https://wa.me/14084643739">Get a quote <SHArrow /></a>
            </div>
          </div>
        </div>

        <div className="site-catbar">
          <div className="wrap">
            <AllProducts onHome={onHome} />
            {SH_CATS.map((c) => (
              <a
                key={c.key}
                className={`cat-link${active === c.key ? ' active' : ''}`}
                href={shCatHref(c.key, onHome)}
              >
                {c.short || c.name}
              </a>
            ))}
            <a className="cat-link design" href="/design">Design</a>
          </div>
        </div>
      </div>
    </>
  );
}
