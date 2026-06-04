// Post-build script: generates per-route HTML files with correct OG meta tags.
// Run after `vite build`. Each route gets its own HTML with the right title,
// description and og: tags so WhatsApp / Slack previews show route-specific info.

const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://brightifysolar.com';
const OG_IMAGE = `${BASE_URL}/brightify-logo.png`;

const ROUTES = [
  {
    file: 'solar-panels.html',
    title: 'Solar Panels — TOPCon, HJT & PERC | Brightify Solar',
    description:
      'Shop 400–585W mono solar panels from Trina, JA Solar, Jinko, Qcells, Risen and more. Residential all-black and commercial bifacial modules in stock.',
    url: `${BASE_URL}/solar-panels`,
  },
  {
    file: 'inverters.html',
    title: 'Solar Inverters — String, Micro & Hybrid | Brightify Solar',
    description:
      'String, microinverter and hybrid inverters from EG4, RUiXU, Growatt, SolarEdge and Enphase. Off-grid and grid-tie options for every system size.',
    url: `${BASE_URL}/inverters`,
  },
  {
    file: 'batteries.html',
    title: 'Solar Batteries — LiFePO4 & NMC Storage | Brightify Solar',
    description:
      'Whole-home battery storage from EG4, RUiXU, Tesla Powerwall, LG and Enphase. LiFePO4 and NMC options for indoor and outdoor install.',
    url: `${BASE_URL}/batteries`,
  },
  {
    file: 'racking.html',
    title: 'Solar Racking & Mounting — SnapNRack | Brightify Solar',
    description:
      'Rails, clamps, anchors and ground-mount hardware from SnapNRack. Roof, ground and ballast mounting systems shipped direct.',
    url: `${BASE_URL}/racking`,
  },
  {
    file: 'diy-kits.html',
    title: 'DIY Solar Kits — 8–11kW Hybrid Systems | Brightify Solar',
    description:
      'Pre-matched DIY hybrid solar kits starting at $12,769. EG4 FlexBOSS18 and RUiXU RX-12K systems with panels and 32 kWh battery included.',
    url: `${BASE_URL}/diy-kits`,
  },
  {
    file: 'design.html',
    title: 'Solar Permit Plansets — AHJ-Ready | Brightify Solar',
    description:
      'AHJ-compliant solar permit designs for all 50 states. Residential PV, PV+Battery and commercial plansets. Permit-ready PDF delivered fast.',
    url: `${BASE_URL}/design`,
  },
  {
    file: 'planset.html',
    title: 'Solar Planset Intake | Brightify Solar',
    description:
      'Submit your solar project details, site photos and equipment specs to start your permit planset design with Brightify Solar.',
    url: `${BASE_URL}/planset`,
  },
];

const distDir = path.join(__dirname, '..', 'dist');
const indexHtml = fs.readFileSync(path.join(distDir, 'index.html'), 'utf-8');

for (const route of ROUTES) {
  const ogTags = [
    `<title>${route.title}</title>`,
    `<meta name="description" content="${route.description}" />`,
    `<meta property="og:title" content="${route.title}" />`,
    `<meta property="og:description" content="${route.description}" />`,
    `<meta property="og:url" content="${route.url}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="Brightify Solar" />`,
    `<meta property="og:image" content="${OG_IMAGE}" />`,
    `<meta name="twitter:card" content="summary" />`,
    `<meta name="twitter:title" content="${route.title}" />`,
    `<meta name="twitter:description" content="${route.description}" />`,
  ].join('\n    ');

  // Strip ALL existing title, description, og: and twitter: tags from index.html,
  // then inject the route-specific set
  let html = indexHtml
    .replace(/<title>[^<]*<\/title>/, '')
    .replace(/<meta\s+name="description"[^>]*\/?>/, '')
    .replace(/<meta\s+property="og:[^"]*"[^>]*\/?>/g, '')
    .replace(/<meta\s+name="twitter:[^"]*"[^>]*\/?>/g, '')
    .replace(/\n\s*\n/g, '\n') // collapse blank lines left behind
    .replace('</head>', `    ${ogTags}\n  </head>`);

  fs.writeFileSync(path.join(distDir, route.file), html);
  console.log(`  ✓ ${route.file}`);
}

console.log(`\nGenerated ${ROUTES.length} route HTML files.`);
