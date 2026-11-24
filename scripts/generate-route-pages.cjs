// Post-build script: writes a static, crawlable HTML file for every route.
// The app is a client-rendered React SPA, so without this crawlers (Google, ChatGPT/OAI-SearchBot,
// Perplexity, Claude, etc.) would see an empty <div id="root">. Each route gets:
//   - its own <title>, description, canonical, Open Graph / Twitter tags
//   - real content (h1, copy, internal links, FAQ) inside #root (React replaces it on load)
//   - route-specific JSON-LD structured data
// Run after `vite build`.

const fs = require('fs');
const path = require('path');

const BASE = 'https://brightifysolar.com';
const OG_IMAGE = `${BASE}/brightify-og.jpg`;
const EMAIL = 'info@brightifysolar.com';
const PHONE_DISPLAY = '(408) 464-3739';
const ORG_ID = `${BASE}/#org`;

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const NAV = [
  ['/solar-panels', 'Solar Panels'],
  ['/inverters', 'Inverters'],
  ['/batteries', 'Batteries'],
  ['/racking', 'Racking & Mounting'],
  ['/diy-kits', 'DIY Solar Kits'],
  ['/offgrid', 'Off-Grid Solar'],
  ['/design', 'Solar Permit Plansets'],
  ['/roof', 'Free Roof Evaluation'],
];

const DESIGN_FAQ = [
  ['How fast can I get my solar planset?', '90% of residential projects are completed within 24 hours of intake confirmation. Battery and commercial projects take 2–5 business days depending on scope. Same-day expedites are available for $99 extra.'],
  ['What happens if my AHJ red-lines the design?', "Revisions are always free. We keep iterating with your AHJ's reviewer until the plan set is approved."],
  ["What's in a Brightify planset?", 'Site plan with equipment, property lines and fire setbacks; system layout with attachment pattern; structural details; wire diagrams (1- or 3-line) with wire and conduit sizing; labeling and placards; spec sheets for major equipment; certification documentation; and a bill of materials.'],
  ['Do you offer PE stamps or structural letters?', "No. Brightify offers solar planset drafting only. When your AHJ requires a PE stamp or structural letter, hire a licensed engineer; we can refer qualified electrical or structural PE firms serving all 50 states."],
  ['Do you design battery storage and EV charger circuits?', 'Yes. We design Tesla Powerwall, Enphase IQ Battery, FranklinWH and most major ESS platforms, plus standalone EV charger circuits. PV + ESS plansets start at $399.'],
  ['Can DIY homeowners use Brightify?', "Yes. About a third of our customers are DIY homeowners or owner-builders. We review your equipment list, site photos and AHJ requirements and deliver a permit-ready set. No installer license is required to purchase."],
  ['What information do you need to start a planset?', 'Address, utility, main panel specs, module, inverter and battery selection, and clear site survey photos.'],
];

const HOME_FAQ = [
  ['What does Brightify Solar sell?', 'Brightify Solar sells solar panels, inverters (string, micro and hybrid), batteries, racking and mounting hardware, pre-matched DIY solar kits and off-grid systems, and offers AHJ-ready solar permit plansets for all 50 states.'],
  ['Does Brightify Solar help with solar permits?', 'Yes. Brightify designs permit-ready solar plansets for residential PV, PV + battery and commercial projects in all 50 states, starting at $299 for residential PV. Revisions are free until your AHJ approves.'],
  ['Where is Brightify Solar based?', 'Brightify Solar, LLC is based in California and ships equipment across the United States.'],
  ['How do I contact Brightify Solar?', `Email ${EMAIL} or message us on WhatsApp at ${PHONE_DISPLAY}.`],
];

const ROUTES = [
  {
    file: 'index.html',
    path: '/',
    title: 'Brightify Solar — Panels, Inverters, Batteries & DIY Kits',
    description:
      'Shop solar panels, inverters, batteries, racking and complete DIY kits. Permit plansets for all 50 states. Brightify Solar — from panel to permit.',
    h1: 'Brightify Solar — Solar Panels, Inverters, Batteries & DIY Solar Kits',
    intro:
      'Brightify Solar is a California-based online solar store. Buy solar panels, inverters, batteries, racking and pre-matched DIY solar kits, and get AHJ-ready solar permit plansets for all 50 states — from panel to permit.',
    sections: [
      ['Shop solar equipment', 'Browse residential and commercial solar panels from Trina, JA Solar, Jinko, Qcells and Risen; string, micro and hybrid inverters from EG4, RUiXU, Growatt, SolarEdge and Enphase; LiFePO4 and NMC batteries including Tesla Powerwall; SnapNRack racking; and complete DIY solar kits with panels, inverter and battery matched for you.'],
      ['Solar permit plansets', 'Our designers produce permit-ready solar plansets (site plan, layout, structural details, electrical diagrams, labels and spec sheets) for residential PV, PV + battery and commercial systems. Residential PV starts at $299, PV + battery at $399, and most residential sets are delivered within 24 hours.'],
      ['Free roof evaluation and advisors', 'Not sure what size system you need? Use our free roof evaluation or talk to a Brightify advisor to size the right system for your roof and budget — no obligation.'],
    ],
    faq: HOME_FAQ,
    type: 'WebPage',
  },
  {
    file: 'solar-panels.html',
    path: '/solar-panels',
    title: 'Solar Panels — TOPCon, HJT & PERC | Brightify Solar',
    description:
      'Shop 400–585W mono solar panels from Trina, JA Solar, Jinko, Qcells, Risen and more. Residential all-black and commercial bifacial modules in stock.',
    h1: 'Solar Panels — TOPCon, HJT & PERC Modules',
    intro:
      'Buy residential all-black and commercial bifacial solar panels from Trina Solar, JA Solar, Jinko, Qcells and Risen. Browse N-type TOPCon, HJT and PERC modules from 400W to 600W+ with datasheets and per-panel pricing.',
    sections: [
      ['Residential and commercial modules', 'All-black residential panels for rooftop arrays and high-wattage bifacial modules for commercial and ground-mount projects, shipped from stock.'],
    ],
    type: 'CollectionPage',
  },
  {
    file: 'inverters.html',
    path: '/inverters',
    title: 'Solar Inverters — String, Micro & Hybrid | Brightify Solar',
    description:
      'String, microinverter and hybrid inverters from EG4, RUiXU, Growatt, SolarEdge and Enphase. Off-grid and grid-tie options for every system size.',
    h1: 'Solar Inverters — String, Micro & Hybrid',
    intro:
      'Shop string, microinverter and hybrid solar inverters from EG4, RUiXU, Growatt, SolarEdge and Enphase, with off-grid and grid-tie options for every system size.',
    sections: [],
    type: 'CollectionPage',
  },
  {
    file: 'batteries.html',
    path: '/batteries',
    title: 'Solar Batteries — LiFePO4 & NMC Storage | Brightify Solar',
    description:
      'Whole-home battery storage from EG4, RUiXU, Tesla Powerwall, LG and Enphase. LiFePO4 and NMC options for indoor and outdoor install.',
    h1: 'Solar Batteries — LiFePO4 & NMC Home Storage',
    intro:
      'Whole-home solar battery storage from EG4, RUiXU, Tesla Powerwall, LG and Enphase. Choose LiFePO4 or NMC chemistry in indoor and outdoor install options.',
    sections: [],
    type: 'CollectionPage',
  },
  {
    file: 'racking.html',
    path: '/racking',
    title: 'Solar Racking & Mounting | Brightify Solar',
    description:
      'Rails, clamps, anchors and ground-mount hardware from SnapNRack. Roof, ground and ballast mounting systems shipped direct.',
    h1: 'Solar Racking & Mounting Hardware',
    intro:
      'Rails, clamps, anchors and ground-mount hardware from SnapNRack. Roof, ground and ballast mounting systems shipped direct.',
    sections: [],
    type: 'CollectionPage',
  },
  {
    file: 'diy-kits.html',
    path: '/diy-kits',
    title: 'DIY Solar Kits — 8–11kW Hybrid Systems | Brightify Solar',
    description:
      'Pre-matched DIY hybrid solar kits starting at $12,769. EG4 FlexBOSS18 and RUiXU RX-12K systems with panels and 32 kWh battery included.',
    h1: 'DIY Solar Kits — Pre-Matched Hybrid Systems',
    intro:
      'Pre-matched DIY solar kits with panels, hybrid inverter and battery included: EG4 FlexBOSS18 and RUiXU RX-12K systems from 8 kW to 11 kW, plus Tesla and Enphase kits. Pair any kit with a Brightify permit planset.',
    sections: [],
    type: 'CollectionPage',
  },
  {
    file: 'offgrid.html',
    path: '/offgrid',
    title: 'Off-Grid Solar Systems & Kits | Brightify Solar',
    description:
      'Off-grid solar kits, inverters and battery banks for cabins, homes and remote sites. Pre-matched systems shipped from Brightify Solar.',
    h1: 'Off-Grid Solar Systems & Kits',
    intro:
      'Off-grid solar kits, inverters and battery banks for cabins, homes and remote sites, matched and shipped by Brightify Solar.',
    sections: [],
    type: 'CollectionPage',
  },
  {
    file: 'design.html',
    path: '/design',
    title: 'Solar Permit Plansets — AHJ-Ready | Brightify Solar',
    description:
      'AHJ-compliant solar permit designs for all 50 states. Residential PV, PV+Battery and commercial plansets. Permit-ready PDF delivered fast.',
    h1: 'Solar Permit Plansets — AHJ-Ready Designs for All 50 States',
    intro:
      'Brightify designs AHJ-compliant solar permit plansets for residential PV, PV + battery and commercial projects in all 50 states. Residential PV starts at $299 and PV + battery at $399, with free revisions until your permit is approved.',
    sections: [
      ['Pricing', 'Residential PV from $299 per planset (5-pack and 10-pack credits available and never expire). PV + battery storage from $399. Same-day expedite available for $99.'],
    ],
    faq: DESIGN_FAQ,
    type: 'Service',
    sampleLink: ['/sample-planset.pdf', 'View a sample planset (PDF)'],
  },
  {
    file: 'planset.html',
    path: '/planset',
    title: 'Solar Planset Intake | Brightify Solar',
    description:
      'Submit your solar project details, site photos and equipment specs to start your permit planset design with Brightify Solar.',
    h1: 'Start Your Solar Permit Planset',
    intro:
      'Submit your address, utility, main panel specs, equipment selection and site photos to start your permit planset design with Brightify Solar.',
    sections: [],
    type: 'WebPage',
    noindex: false,
  },
  {
    file: 'roof.html',
    path: '/roof',
    title: 'Free Solar Roof Evaluation | Brightify Solar',
    description:
      'Enter your address and Brightify will analyze your roof and estimate how many solar panels can fit.',
    h1: 'Free Solar Roof Evaluation',
    intro: 'Enter your address so we can analyze your roof and estimate how many solar panels can fit.',
    sections: [],
    type: 'WebPage',
  },
];

function staticContent(r) {
  const nav = NAV.map(([h, l]) => `<li><a href="${h}">${esc(l)}</a></li>`).join('');
  const sections = (r.sections || [])
    .map(([h, t]) => `<section><h2>${esc(h)}</h2><p>${esc(t)}</p></section>`)
    .join('');
  const faq = r.faq
    ? `<section><h2>Frequently asked questions</h2>${r.faq
        .map(([q, a]) => `<h3>${esc(q)}</h3><p>${esc(a)}</p>`)
        .join('')}</section>`
    : '';
  const sample = r.sampleLink ? `<p><a href="${r.sampleLink[0]}">${esc(r.sampleLink[1])}</a></p>` : '';
  return (
    `<header><a href="/">Brightify Solar</a><nav aria-label="Main"><ul>${nav}</ul></nav></header>` +
    `<main><h1>${esc(r.h1)}</h1><p>${esc(r.intro)}</p>${sections}${sample}${faq}</main>` +
    `<footer><p>Brightify Solar, LLC — California. Email <a href="mailto:${EMAIL}">${EMAIL}</a> · ` +
    `WhatsApp <a href="https://wa.me/14084643739">${PHONE_DISPLAY}</a></p></footer>`
  );
}

function jsonLd(r) {
  const url = BASE + (r.path === '/' ? '/' : r.path);
  const graph = [];
  if (r.path !== '/') {
    graph.push({
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE}/` },
        { '@type': 'ListItem', position: 2, name: r.h1.split(' — ')[0], item: url },
      ],
    });
  }
  if (r.type === 'Service') {
    graph.push({
      '@type': 'Service',
      name: 'Solar permit planset design',
      serviceType: 'Solar PV permit plan set drafting',
      description: r.description,
      url,
      provider: { '@id': ORG_ID },
      areaServed: { '@type': 'Country', name: 'United States' },
      offers: [
        { '@type': 'Offer', name: 'Residential PV planset', price: '299', priceCurrency: 'USD' },
        { '@type': 'Offer', name: 'PV + battery planset', price: '399', priceCurrency: 'USD' },
      ],
    });
  } else {
    graph.push({ '@type': r.type, name: r.title, description: r.description, url, isPartOf: { '@id': `${BASE}/#website` }, publisher: { '@id': ORG_ID } });
  }
  if (r.faq) {
    graph.push({
      '@type': 'FAQPage',
      mainEntity: r.faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
    });
  }
  return `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': graph })}</script>`;
}

const distDir = path.join(__dirname, '..', 'dist');
const template = fs.readFileSync(path.join(distDir, 'index.html'), 'utf-8');

for (const r of ROUTES) {
  const url = BASE + (r.path === '/' ? '/' : r.path);
  const head = [
    `<title>${esc(r.title)}</title>`,
    `<meta name="description" content="${esc(r.description)}" />`,
    `<meta property="og:title" content="${esc(r.title)}" />`,
    `<meta property="og:description" content="${esc(r.description)}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="Brightify Solar" />`,
    `<meta property="og:image" content="${OG_IMAGE}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(r.title)}" />`,
    `<meta name="twitter:description" content="${esc(r.description)}" />`,
    `<link rel="canonical" href="${url}" />`,
    jsonLd(r),
  ].join('\n    ');

  const html = template
    .replace(/<title>[^<]*<\/title>/, '')
    .replace(/<meta\s+name="description"[^>]*\/?>/, '')
    .replace(/<meta\s+property="og:[^"]*"[^>]*\/?>/g, '')
    .replace(/<meta\s+name="twitter:[^"]*"[^>]*\/?>/g, '')
    .replace(/<link\s+rel="canonical"[^>]*\/?>/, '')
    .replace(/\n\s*\n/g, '\n')
    .replace('</head>', `    ${head}\n  </head>`)
    .replace('<!--ssr-start--><!--ssr-end-->', `<!--ssr-start-->${staticContent(r)}<!--ssr-end-->`);

  fs.writeFileSync(path.join(distDir, r.file), html);
  console.log(`  ✓ ${r.file}`);
}
console.log(`\nGenerated ${ROUTES.length} route HTML files.`);
