import React, { useState } from 'react';
import '../store.css';
import SiteHeader from './SiteHeader';

// ------------------------------------------------------------------
// Brightify — Store Homepage
// ------------------------------------------------------------------

// ---- shared ----

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

// ---- category icons ----

const sw: React.SVGProps<SVGSVGElement> = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as React.SVGProps<SVGSVGElement>;

const IconSolar = () => (
  <svg viewBox="0 0 48 48" {...sw}>
    <path d="M6 30h36l-4-16H10L6 30Z" />
    <path d="M6 30h36M24 14v16M14 14l-2 16M34 14l2 16" />
    <path d="M16 30v4m16-4v4" />
  </svg>
);
const IconDIY = () => (
  <svg viewBox="0 0 48 48" {...sw}>
    <path d="M24 6 8 14v20l16 8 16-8V14L24 6Z" />
    <path d="M8 14l16 8 16-8M24 22v20" />
    <path d="M16 10l16 8" />
  </svg>
);
const IconRacking = () => (
  <svg viewBox="0 0 48 48" {...sw}>
    <path d="M5 18h38M9 18l3 22M39 18l-3 22M16 18l1.5 22M32 18l-1.5 22M24 18v22" />
    <path d="M12 40h24" />
  </svg>
);
const IconOffgrid = () => (
  <svg viewBox="0 0 48 48" {...sw}>
    <circle cx="24" cy="14" r="6" />
    <path d="M24 4v2M24 22v2M14 14h2M32 14h2M17 7l1.4 1.4M29.6 19.6 31 21M31 7l-1.4 1.4M18.4 19.6 17 21" />
    <path d="M9 42V28l15-9 15 9v14" />
    <path d="M20 42v-9h8v9" />
  </svg>
);
const IconInverter = () => (
  <svg viewBox="0 0 48 48" {...sw}>
    <rect x="8" y="10" width="32" height="28" rx="3" />
    <path d="M14 24c2-6 4-6 6 0s4 6 6 0 4-6 6 0" />
    <path d="M14 33h8" />
  </svg>
);
const IconBattery = () => (
  <svg viewBox="0 0 48 48" {...sw}>
    <rect x="7" y="14" width="32" height="20" rx="3" />
    <path d="M39 21h3v6h-3" />
    <path d="M22 19l-3 6h5l-3 6" />
  </svg>
);

// ---- hero ----

function HomeHero() {
  return (
    <header className="hero h-hero">
      <div className="hero-sun"></div>
      <div className="wrap">
        <div>
          <div className="hero-eyebrow">
            <span className="pill">SHOP</span>
            <span>Solar gear for home &amp; pro</span>
          </div>
          <h1>
            Everything under<br />
            the <em className="hgrad-text">sun</em>.
          </h1>
          <p className="lead">
            Panels, batteries, inverters, racking and complete DIY kits — shipped to your
            door. Pick a category to start.
          </p>
          <div className="h-hero-ctas">
            <a className="btn btn-grad btn-lg" href="#explore">Shop by category <Arrow /></a>
            <a className="btn btn-ghost btn-lg" href="#quote">Talk to an advisor</a>
          </div>
        </div>

        <div className="h-hero-visual" aria-hidden="true">
          <div className="panel-card">
            <div className="pv-grid">
              {Array.from({ length: 60 }).map((_, i) => <div key={i} className="pv-cell"></div>)}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

// ---- categories ----

interface Category {
  key: string;
  media: string;
  Icon: React.FC;
  hook: string;
  name: string;
  desc: string;
  page?: string;
}

const CATEGORIES: Category[] = [
  {
    key: 'solar', media: 'media-solar', Icon: IconSolar,
    hook: '400–550 W', name: 'Solar Panels',
    desc: 'Tier-1 monocrystalline modules for rooftop and ground mounts — the engine of every system.',
    page: '/solar-panels',
  },
  {
    key: 'diy', media: 'media-diy', Icon: IconDIY,
    hook: 'All-in-one', name: 'DIY Kits',
    desc: 'Complete grid-tie and hybrid systems sized for your roof — panels, inverter, racking and wiring in one box.',
  },
  {
    key: 'battery', media: 'media-battery', Icon: IconBattery,
    hook: 'LiFePO4', name: 'Batteries',
    desc: 'Backup-ready lithium storage and whole-home ESS to keep the lights on after dark.',
    page: '/batteries',
  },
  {
    key: 'inverter', media: 'media-inverter', Icon: IconInverter,
    hook: 'String · micro · hybrid', name: 'Inverters',
    desc: 'Turn DC into usable AC — string, micro and hybrid inverters from the brands installers trust.',
    page: '/inverters',
  },
  {
    key: 'racking', media: 'media-racking', Icon: IconRacking,
    hook: 'Roof · ground · ballast', name: 'Racking & Mounting',
    desc: 'Rails, clamps, flashing and ground-mount hardware to get every module locked down.',
    page: '/racking',
  },
  {
    key: 'offgrid', media: 'media-offgrid', Icon: IconOffgrid,
    hook: 'Cabins · RVs · remote', name: 'Off-Grid',
    desc: 'Charge controllers, all-in-one power units and kits for cabins, vans and anywhere the grid isn\'t.',
  },
];

function CategoryTile({ c }: { c: Category }) {
  return (
    <a className="tile" id={`shop-${c.key}`} href={c.page || '#quote'}>
      <div className={`tile-media ${c.media}`}>
        <div className="tile-illus">
          <c.Icon />
        </div>
        <span className="tile-hook">{c.hook}</span>
      </div>
      <div className="tile-body">
        <h3>{c.name}</h3>
        <p>{c.desc}</p>
        <span className="tile-go">Shop {c.name} <Arrow /></span>
      </div>
    </a>
  );
}

function Explore() {
  return (
    <section className="explore" id="explore">
      <div className="wrap">
        <div className="explore-head">
          <h2 style={{ fontFamily: 'var(--hdisplay)' }}>Shop by <em className="hgrad-text">category</em></h2>
          <a className="explore-all" href="/solar-panels">Browse all products <Arrow /></a>
        </div>
        <div className="explore-grid">
          {CATEGORIES.map((c) => <CategoryTile key={c.key} c={c} />)}
        </div>
      </div>
    </section>
  );
}

function ShopHelp() {
  return (
    <section className="shop-help" id="quote">
      <div className="wrap">
        <div className="sh-inner">
          <div className="sh-copy">
            <h2 style={{ fontFamily: 'var(--hdisplay)' }}>Not sure what you need?</h2>
            <p>Tell us about your project and a Brightify advisor will size the right system for your roof and budget — free, no obligation.</p>
          </div>
          <div className="sh-actions">
            <a className="btn btn-grad btn-lg" href="https://wa.me/14084643739">Talk to an advisor <Arrow /></a>
            <a className="btn btn-ghost btn-lg" href="#explore">Browse categories</a>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer>
      <div className="wrap">
        <div className="col">
          <div className="brand-foot">
            <img className="mark" src="/brightify-logo.png" alt="Brightify" />
            <span className="wm">BRIGHTIFY</span>
          </div>
          <p className="foot-tag">
            Solar gear and permit design for installers and DIY homeowners — from first panel
            to final inspection.
          </p>
          <div className="foot-contact">
            <div><a href="mailto:info@brightifysolar.com">info@brightifysolar.com</a></div>
          </div>
        </div>
        <div className="col">
          <h4>Shop</h4>
          <ul>
            <li><a href="/solar-panels">Solar Panels</a></li>
            <li><a href="#explore">DIY Kits</a></li>
            <li><a href="#explore">Batteries</a></li>
            <li><a href="#explore">Inverters</a></li>
            <li><a href="#explore">Racking &amp; Mounting</a></li>
            <li><a href="#explore">Off-Grid</a></li>
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
            <li><a href="#quote">Get a quote</a></li>
            <li><a href="#explore">Shop all</a></li>
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

export default function StoreLandingPage() {
  const [search, setSearch] = useState('');

  return (
    <div>
      <SiteHeader
        onHome={true}
        search={search}
        onSearchChange={setSearch}
        onSearchSubmit={() => { window.location.href = '/solar-panels'; }}
      />
      <Explore />
      <ShopHelp />
      <Footer />
      <WhatsAppFab />
    </div>
  );
}
