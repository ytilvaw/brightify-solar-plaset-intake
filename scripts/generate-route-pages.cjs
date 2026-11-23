// Post-build script: generates per-route HTML files with correct OG meta tags.
// Run after `vite build`. Each route gets its own HTML with the right title,
// description and og: tags so WhatsApp / Slack previews show route-specific info.

const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://brightifysolar.com';
const OG_IMAGE = `${BASE_URL}/brightify-og.jpg`;

const ROUTES = [
  {
    file: 'solar-panels.html',
    title: 'Buy Solar Panels — TOPCon & Bifacial | Brightify Solar',
    description:
      'Buy 400–585W monocrystalline solar panels from Trina, JA Solar, Jinko, Qcells and Risen. All-black residential and bifacial commercial solar modules, shipped direct.',
    url: `${BASE_URL}/solar-panels`,
  },
  {
    file: 'inverters.html',
    title: 'Hybrid & String Solar Inverters | Brightify Solar',
    description:
      'Buy hybrid, string and microinverters from EG4, RUiXU, Growatt, SolarEdge and Enphase. Off-grid, grid-tie and split-phase solar inverters for every system size.',
    url: `${BASE_URL}/inverters`,
  },
  {
    file: 'batteries.html',
    title: 'Solar Batteries — LiFePO4 Home Battery Storage | Brightify Solar',
    description:
      'Buy whole-home solar battery storage from EG4, RUiXU, Tesla Powerwall, LG and Enphase. LiFePO4 and NMC server-rack and wall-mount batteries for backup power.',
    url: `${BASE_URL}/batteries`,
  },
  {
    file: 'racking.html',
    title: 'Solar Racking & Mounting | Brightify Solar',
    description:
      'Buy solar panel racking from SnapNRack: rails, clamps, flashing, anchors and ground-mount hardware. Roof mount, ground mount and ballast systems shipped direct.',
    url: `${BASE_URL}/racking`,
  },
  {
    file: 'diy-kits.html',
    title: 'DIY Solar Kits with Battery | Brightify Solar',
    description:
      'Complete DIY solar kits with battery from $12,769. Pre-matched EG4 FlexBOSS18 and RUiXU RX-12K hybrid systems with panels and 32 kWh storage included.',
    url: `${BASE_URL}/diy-kits`,
  },
  {
    file: 'design.html',
    title: 'Solar Permit Plansets — All 50 States | Brightify Solar',
    description:
      'Order AHJ-compliant solar permit plansets for all 50 states. Residential PV, PV+battery and commercial permit drawings with single-line diagrams, delivered fast as PDF.',
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
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<link rel="canonical" href="${route.url}" />`,
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
    .replace(/<link\s+rel="canonical"[^>]*\/?>/, '')
    .replace(/\n\s*\n/g, '\n') // collapse blank lines left behind
    .replace('</head>', `    ${ogTags}\n  </head>`);

  fs.writeFileSync(path.join(distDir, route.file), html);
  console.log(`  ✓ ${route.file}`);
}

console.log(`\nGenerated ${ROUTES.length} route HTML files.`);
