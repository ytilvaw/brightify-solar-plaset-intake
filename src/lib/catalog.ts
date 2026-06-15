// Unified product catalog for site-wide search.
// Each entry is a lightweight record pointing to its category page.

export interface CatalogItem {
  id: string;
  brand: string;
  name: string;
  price: number | null;
  image: string;
  category: string;      // display label
  categoryUrl: string;   // route to the category page
  tags: string[];        // used for keyword matching
}

const CATALOG: CatalogItem[] = [
  // ── Solar Panels ────────────────────────────────────────────────
  { id: 'risen-rsm108-9-435', brand: 'Risen Energy', name: 'RSM108-9-435 435W', price: null, image: '/panels/risen-rsm108-9-435.jpg', category: 'Solar Panels', categoryUrl: '/solar-panels', tags: ['solar', 'risen', 'monocrystalline'] },
  { id: 'trina-tsm-435neg9r', brand: 'Trina Solar', name: 'Vertex S+ 435W', price: null, image: '/panels/trina-tsm-435neg9r.png', category: 'Solar Panels', categoryUrl: '/solar-panels', tags: ['solar', 'trina'] },
  { id: 'trina-tsm-445neg9r', brand: 'Trina Solar', name: 'Vertex S+ 445W', price: null, image: '/panels/trina-tsm-445neg9r.png', category: 'Solar Panels', categoryUrl: '/solar-panels', tags: ['solar', 'trina'] },
  { id: 'trina-tsm-585neg18c', brand: 'Trina Solar', name: 'Vertex 585W Bifacial', price: null, image: '/panels/trina-tsm-585neg18c.png', category: 'Solar Panels', categoryUrl: '/solar-panels', tags: ['solar', 'trina', 'bifacial'] },
  { id: 'trina-tsm-610neg19rc', brand: 'Trina Solar', name: 'Vertex 610W Bifacial', price: null, image: '/panels/trina-tsm-610neg19rc.jpg', category: 'Solar Panels', categoryUrl: '/solar-panels', tags: ['solar', 'trina', 'bifacial'] },
  { id: 'canadian-cs6w-585tb', brand: 'Canadian Solar', name: 'HiKu6 585W Bifacial', price: null, image: '/panels/canadian-cs6w-585tb.png', category: 'Solar Panels', categoryUrl: '/solar-panels', tags: ['solar', 'canadian solar', 'bifacial'] },
  { id: 'ja-jam54d40-455lb', brand: 'JA Solar', name: 'DeepBlue 4.0 455W', price: null, image: '/panels/ja-jam54d40-455lb.jpg', category: 'Solar Panels', categoryUrl: '/solar-panels', tags: ['solar', 'ja solar'] },
  { id: 'znshine-zxmr-uhldd96-450', brand: 'Znshine Solar', name: 'Full Black 450W', price: null, image: '/panels/znshine-zxmr-uhldd96-450.jpg', category: 'Solar Panels', categoryUrl: '/solar-panels', tags: ['solar', 'znshine', 'full black'] },
  { id: 'ht-ht54-18x-f-455', brand: 'HT-SAAE', name: 'Full Black 455W', price: null, image: '/panels/ht-ht54-18x-f-455.jpg', category: 'Solar Panels', categoryUrl: '/solar-panels', tags: ['solar', 'ht-saae', 'full black'] },
  { id: 'ht-ht54-18x-f-435', brand: 'HT-SAAE', name: 'Full Black 435W', price: null, image: '/panels/ht-ht54-18x-f-435.jpg', category: 'Solar Panels', categoryUrl: '/solar-panels', tags: ['solar', 'ht-saae', 'full black'] },
  { id: 'huasun-hsn-210r-b96dsn440', brand: 'Huasun', name: 'Himalaya 440W HJT', price: null, image: '/panels/huasun-hsn-210r-b96dsn440.jpg', category: 'Solar Panels', categoryUrl: '/solar-panels', tags: ['solar', 'huasun', 'hjt'] },
  { id: 'jinko-jkm585n-72hl4-bdv', brand: 'Jinko Solar', name: 'Tiger Neo 585W', price: null, image: '/panels/jinko-jkm585n-72hl4-bdv.jpg', category: 'Solar Panels', categoryUrl: '/solar-panels', tags: ['solar', 'jinko'] },
  { id: 'jinko-jkm470n-60hl4-v', brand: 'Jinko Solar', name: 'Tiger Neo 470W', price: null, image: '/panels/jinko-jkm470n-60hl4-v.jpg', category: 'Solar Panels', categoryUrl: '/solar-panels', tags: ['solar', 'jinko'] },
  { id: 'risen-rsm96-11-475bndg', brand: 'Risen Energy', name: 'RSM96-11-475 475W', price: null, image: '/panels/risen-rsm96-11-475bndg.jpg', category: 'Solar Panels', categoryUrl: '/solar-panels', tags: ['solar', 'risen'] },
  { id: 'ja-jam54d41-lr-455w', brand: 'JA Solar', name: 'DeepBlue 4.0 Pro 455W', price: null, image: '/panels/ja-jam54d41-lr-455w.jpg', category: 'Solar Panels', categoryUrl: '/solar-panels', tags: ['solar', 'ja solar'] },
  { id: 'ja-jam54d41-lr-465w', brand: 'JA Solar', name: 'DeepBlue 4.0 Pro 465W', price: null, image: '/panels/ja-jam54d41-lr-465w.jpg', category: 'Solar Panels', categoryUrl: '/solar-panels', tags: ['solar', 'ja solar'] },
  { id: 'ja-jam72d40-mb-595w', brand: 'JA Solar', name: 'DeepBlue 4.0 Pro 595W', price: null, image: '/panels/ja-jam72d40-mb-595w.jpg', category: 'Solar Panels', categoryUrl: '/solar-panels', tags: ['solar', 'ja solar'] },
  { id: 'jinko-jkm470n-48ql6-db', brand: 'Jinko Solar', name: 'Tiger Neo 470W Full Black', price: null, image: '/panels/jinko-jkm470n-48ql6-db.jpg', category: 'Solar Panels', categoryUrl: '/solar-panels', tags: ['solar', 'jinko', 'full black'] },
  { id: 'sunplus-sr4-54htb-445m', brand: 'Sunplus', name: 'SR4 445W N-Type', price: null, image: '/panels/sunplus-sr4-54htb-445m.jpg', category: 'Solar Panels', categoryUrl: '/solar-panels', tags: ['solar', 'sunplus'] },
  { id: 'trina-tsm-neg9rc27-450w', brand: 'Trina Solar', name: 'Vertex S+ 450W Bifacial', price: null, image: '/panels/trina-tsm-neg9rc27-450w.jpg', category: 'Solar Panels', categoryUrl: '/solar-panels', tags: ['solar', 'trina', 'bifacial'] },

  // ── Batteries ───────────────────────────────────────────────────
  { id: 'ruixu-lithi2-16', brand: 'RUiXU', name: 'Lithi2-16 16kWh LiFePO4', price: 3299, image: '/batteries/ruixu-lithi2-16.webp', category: 'Batteries', categoryUrl: '/batteries', tags: ['battery', 'ruixu', 'lifepo4'] },
  { id: 'lg-resu16h-prime', brand: 'LG Energy Solution', name: 'RESU16H Prime 16kWh', price: 3000, image: '/batteries/lg-resu16h-prime.png', category: 'Batteries', categoryUrl: '/batteries', tags: ['battery', 'lg'] },
  { id: 'eg4-wallmount-314ah-indoor', brand: 'EG4', name: 'WallMount 16.1kWh Indoor', price: 3399, image: '/batteries/eg4-wallmount-314ah-indoor.png', category: 'Batteries', categoryUrl: '/batteries', tags: ['battery', 'eg4', 'lifepo4', 'indoor'] },
  { id: 'eg4-wallmount-314ah-aw', brand: 'EG4', name: 'WallMount 16kWh AllWeather', price: 3749, image: '/batteries/eg4-wallmount-314ah-aw.png', category: 'Batteries', categoryUrl: '/batteries', tags: ['battery', 'eg4', 'lifepo4', 'outdoor'] },
  { id: 'eg4-wallmount-280ah-aw', brand: 'EG4', name: 'WallMount 14.3kWh AllWeather', price: 3400, image: '/batteries/eg4-wallmount-280ah-aw.jpg', category: 'Batteries', categoryUrl: '/batteries', tags: ['battery', 'eg4', 'lifepo4', 'outdoor'] },
  { id: 'tesla-powerwall-3', brand: 'Tesla', name: 'Powerwall 3 13.5kWh', price: 8500, image: '/batteries/tesla-powerwall-3.jpg', category: 'Batteries', categoryUrl: '/batteries', tags: ['battery', 'tesla', 'powerwall'] },
  { id: 'tesla-powerwall-3-expansion', brand: 'Tesla', name: 'Powerwall 3 Expansion 13.5kWh', price: 7200, image: '/batteries/tesla-powerwall-3-expansion.png', category: 'Batteries', categoryUrl: '/batteries', tags: ['battery', 'tesla', 'powerwall'] },
  { id: 'dawnice-5kwh', brand: 'Dawnice', name: 'HZEB-LCT-5 5kWh Wall Battery', price: null, image: '/batteries/dawnice-5kwh.webp', category: 'Batteries', categoryUrl: '/batteries', tags: ['battery', 'dawnice'] },
  { id: 'dawnice-10kwh', brand: 'Dawnice', name: 'HZEB-LCT-10 10kWh Wall Battery', price: null, image: '/batteries/dawnice-10kwh.webp', category: 'Batteries', categoryUrl: '/batteries', tags: ['battery', 'dawnice'] },
  { id: 'dawnice-15kwh', brand: 'Dawnice', name: 'HZEB-LCT-15 16kWh Wall Battery', price: 2899, image: '/batteries/dawnice-15kwh.webp', category: 'Batteries', categoryUrl: '/batteries', tags: ['battery', 'dawnice'] },
  { id: 'dawnice-20kwh', brand: 'Dawnice', name: 'HZEB-LCT-20 20kWh Wall Battery', price: null, image: '/batteries/dawnice-20kwh.webp', category: 'Batteries', categoryUrl: '/batteries', tags: ['battery', 'dawnice'] },
  { id: 'enphase-iq-battery-5p', brand: 'Enphase', name: 'IQ Battery 5P 5kWh', price: 3299, image: '/batteries/enphase-iq-battery-5p.jpg', category: 'Batteries', categoryUrl: '/batteries', tags: ['battery', 'enphase'] },
  { id: 'ecoflow-delta-pro-ultra-x-battery-1x', brand: 'EcoFlow', name: 'DELTA Pro Ultra X Smart Extra Battery 6.1kWh', price: 2099, image: '/batteries/ecoflow-delta-pro-ultra-x-battery-1x.png', category: 'Batteries', categoryUrl: '/batteries', tags: ['battery', 'ecoflow', 'lifepo4'] },
  { id: 'ecoflow-delta-pro-ultra-x-battery-2x', brand: 'EcoFlow', name: 'DELTA Pro Ultra X Smart Extra Battery 12.3kWh', price: 4099, image: '/batteries/ecoflow-delta-pro-ultra-x-battery-2x.png', category: 'Batteries', categoryUrl: '/batteries', tags: ['battery', 'ecoflow', 'lifepo4'] },
  { id: 'ecoflow-delta-pro-ultra-x-battery-3x', brand: 'EcoFlow', name: 'DELTA Pro Ultra X Smart Extra Battery 18.4kWh', price: 6059, image: '/batteries/ecoflow-delta-pro-ultra-x-battery-3x.png', category: 'Batteries', categoryUrl: '/batteries', tags: ['battery', 'ecoflow', 'lifepo4'] },
  { id: 'ecoflow-delta-pro-ultra-x-battery-4x', brand: 'EcoFlow', name: 'DELTA Pro Ultra X Smart Extra Battery 24.6kWh', price: 7999, image: '/batteries/ecoflow-delta-pro-ultra-x-battery-4x.png', category: 'Batteries', categoryUrl: '/batteries', tags: ['battery', 'ecoflow', 'lifepo4'] },

  // ── Inverters ───────────────────────────────────────────────────
  { id: 'ruixu-sunon3-6', brand: 'RUiXU', name: 'SUNON3.6 3.6kW Off-Grid', price: 499, image: '/inverters/ruixu-sunon3-6.jpg', category: 'Inverters', categoryUrl: '/inverters', tags: ['inverter', 'ruixu', 'offgrid'] },
  { id: 'ruixu-sunon7-2', brand: 'RUiXU', name: 'SUNON7.2 7.2kW Off-Grid', price: 1219, image: '/inverters/ruixu-sunon7-2.png', category: 'Inverters', categoryUrl: '/inverters', tags: ['inverter', 'ruixu', 'offgrid'] },
  { id: 'ruixu-rx-12k', brand: 'RUiXU', name: 'RX-12K 11.4kW Hybrid', price: 3299, image: '/inverters/ruixu-rx-12k.jpg', category: 'Inverters', categoryUrl: '/inverters', tags: ['inverter', 'ruixu', 'hybrid'] },
  { id: 'eg4-6000xp', brand: 'EG4', name: '6000XP 6kW Off-Grid', price: 1793, image: '/inverters/eg4-6000xp.jpg', category: 'Inverters', categoryUrl: '/inverters', tags: ['inverter', 'eg4', 'offgrid'] },
  { id: 'eg4-18kpv', brand: 'EG4', name: '18kPV 12kW Hybrid', price: 5143, image: '/inverters/eg4-18kpv.jpg', category: 'Inverters', categoryUrl: '/inverters', tags: ['inverter', 'eg4', 'hybrid'] },
  { id: 'eg4-12kpv', brand: 'EG4', name: '12kPV 8kW Hybrid', price: 3495, image: '/inverters/eg4-12kpv.jpg', category: 'Inverters', categoryUrl: '/inverters', tags: ['inverter', 'eg4', 'hybrid'] },
  { id: 'eg4-flexboss21', brand: 'EG4', name: 'FlexBOSS21 16kW Hybrid', price: 3811, image: '/inverters/eg4-flexboss21.jpg', category: 'Inverters', categoryUrl: '/inverters', tags: ['inverter', 'eg4', 'hybrid'] },
  { id: 'eg4-flexboss18', brand: 'EG4', name: 'FlexBOSS18 13kW Hybrid', price: 3370, image: '/inverters/eg4-flexboss18.jpg', category: 'Inverters', categoryUrl: '/inverters', tags: ['inverter', 'eg4', 'hybrid'] },
  { id: 'eg4-12000xp', brand: 'EG4', name: '12000XP 12kW Off-Grid', price: 2090, image: '/inverters/eg4-12000xp.jpg', category: 'Inverters', categoryUrl: '/inverters', tags: ['inverter', 'eg4', 'offgrid'] },
  { id: 'ruixu-sunon12', brand: 'RUiXU', name: 'SUNON12 12kW Off-Grid', price: null, image: '/inverters/ruixu-sunon12.jpg', category: 'Inverters', categoryUrl: '/inverters', tags: ['inverter', 'ruixu', 'offgrid'] },
  { id: 'growatt-sph-10k', brand: 'Growatt', name: 'SPH 10000TL 10kW Hybrid', price: 2816, image: '/inverters/growatt-sph-10k.jpg', category: 'Inverters', categoryUrl: '/inverters', tags: ['inverter', 'growatt', 'hybrid'] },
  { id: 'solaredge-energy-hub', brand: 'SolarEdge', name: 'SE7600H 7.6kW Energy Hub', price: 1599, image: '/inverters/solaredge-energy-hub.png', category: 'Inverters', categoryUrl: '/inverters', tags: ['inverter', 'solaredge', 'hybrid'] },
  { id: 'solis-s6-11-4kw', brand: 'Solis', name: 'S6 11.4kW High-Voltage Hybrid', price: 2225, image: '/inverters/solis-s6-11-4kw.png', category: 'Inverters', categoryUrl: '/inverters', tags: ['inverter', 'solis', 'hybrid'] },
  { id: 'enphase-iq8hc', brand: 'Enphase', name: 'IQ8HC Microinverter 384W', price: 192, image: '/inverters/enphase-iq8hc.jpg', category: 'Inverters', categoryUrl: '/inverters', tags: ['inverter', 'enphase', 'microinverter'] },
  { id: 'enphase-iq8ac', brand: 'Enphase', name: 'IQ8AC Microinverter 366W', price: 175, image: '/inverters/enphase-iq8ac.jpg', category: 'Inverters', categoryUrl: '/inverters', tags: ['inverter', 'enphase', 'microinverter'] },
  { id: 'enphase-iq8mc', brand: 'Enphase', name: 'IQ8MC Microinverter 330W', price: 164, image: '/inverters/enphase-iq8mc.jpg', category: 'Inverters', categoryUrl: '/inverters', tags: ['inverter', 'enphase', 'microinverter'] },
  { id: 'tigo-tsi-3-8k-us', brand: 'Tigo', name: 'TSI-3.8K-US 3.8kW Hybrid', price: 1950, image: '/inverters/tigo-tsi-3-8k-us.jpg', category: 'Inverters', categoryUrl: '/inverters', tags: ['inverter', 'tigo', 'hybrid'] },
  { id: 'tigo-tsi-7-6k-us', brand: 'Tigo', name: 'TSI-7.6K-US 7.6kW Hybrid', price: 2400, image: '/inverters/tigo-tsi-7-6k-us.jpg', category: 'Inverters', categoryUrl: '/inverters', tags: ['inverter', 'tigo', 'hybrid'] },
  { id: 'ecoflow-delta-pro-ultra-x-inverter', brand: 'EcoFlow', name: 'DELTA Pro Ultra X 12kW Inverter', price: 3799, image: '/inverters/ecoflow-delta-pro-ultra-x-inverter.png', category: 'Inverters', categoryUrl: '/inverters', tags: ['inverter', 'ecoflow', 'offgrid'] },
  { id: 'ecoflow-delta-pro-ultra-inverter', brand: 'EcoFlow', name: 'DELTA Pro Ultra 7.2kW Inverter', price: 2799, image: '/inverters/ecoflow-delta-pro-ultra-inverter.png', category: 'Inverters', categoryUrl: '/inverters', tags: ['inverter', 'ecoflow', 'offgrid'] },

  // ── Off-Grid ────────────────────────────────────────────────────
  { id: 'ecoflow-dpux-1inv-2bat', brand: 'EcoFlow', name: 'DELTA Pro Ultra X — 1× Inverter + 2× Batteries', price: 7899, image: '/offgrid/ecoflow-dpux-1inv-2bat.png', category: 'Off-Grid', categoryUrl: '/offgrid', tags: ['offgrid', 'ecoflow', 'whole-home'] },
  { id: 'ecoflow-dpux-1inv-2bat-shp3', brand: 'EcoFlow', name: 'DELTA Pro Ultra X — 1× Inv + 2× Bat + Smart Home Panel 3', price: 10699, image: '/offgrid/ecoflow-dpux-1inv-2bat-shp3.png', category: 'Off-Grid', categoryUrl: '/offgrid', tags: ['offgrid', 'ecoflow', 'whole-home'] },
  { id: 'ecoflow-dpux-1inv-2bat-sg200a', brand: 'EcoFlow', name: 'DELTA Pro Ultra X — 1× Inv + 2× Bat + Smart Gateway 200A', price: 9899, image: '/offgrid/ecoflow-dpux-1inv-2bat-sg200a.png', category: 'Off-Grid', categoryUrl: '/offgrid', tags: ['offgrid', 'ecoflow', 'whole-home'] },
  { id: 'ecoflow-dpux-1inv-2bat-ev', brand: 'EcoFlow', name: 'DELTA Pro Ultra X — 1× Inv + 2× Bat + EV Charger', price: 8199, image: '/offgrid/ecoflow-dpux-1inv-2bat-ev.png', category: 'Off-Grid', categoryUrl: '/offgrid', tags: ['offgrid', 'ecoflow', 'ev'] },
  { id: 'ecoflow-dpux-1inv-4bat-shp3', brand: 'EcoFlow', name: 'DELTA Pro Ultra X — 1× Inv + 4× Bat + Smart Home Panel 3', price: 13699, image: '/offgrid/ecoflow-dpux-1inv-4bat-shp3.png', category: 'Off-Grid', categoryUrl: '/offgrid', tags: ['offgrid', 'ecoflow', 'whole-home'] },
  { id: 'ecoflow-dpux-2inv-4bat-shp3', brand: 'EcoFlow', name: '2× DELTA Pro Ultra X — 2× Inv + 4× Bat + Smart Home Panel 3', price: 18699, image: '/offgrid/ecoflow-dpux-2inv-4bat-shp3.png', category: 'Off-Grid', categoryUrl: '/offgrid', tags: ['offgrid', 'ecoflow', 'whole-home'] },
  { id: 'ecoflow-dpux-1inv-5bat', brand: 'EcoFlow', name: 'DELTA Pro Ultra X — 1× Inverter + 5× Batteries', price: 13600, image: '/offgrid/ecoflow-dpux-1inv-5bat.webp', category: 'Off-Grid', categoryUrl: '/offgrid', tags: ['offgrid', 'ecoflow', 'whole-home'] },
  { id: 'ecoflow-dpu-1inv-1bat', brand: 'EcoFlow', name: 'DELTA Pro Ultra — 1× Inverter + 1× Battery', price: 4099, image: '/offgrid/ecoflow-dpu-1inv-1bat.png', category: 'Off-Grid', categoryUrl: '/offgrid', tags: ['offgrid', 'ecoflow', 'whole-home'] },
  { id: 'ecoflow-dpu-1inv-2bat', brand: 'EcoFlow', name: 'DELTA Pro Ultra — 1× Inverter + 2× Batteries', price: 5699, image: '/offgrid/ecoflow-dpu-1inv-2bat.png', category: 'Off-Grid', categoryUrl: '/offgrid', tags: ['offgrid', 'ecoflow', 'whole-home'] },
  { id: 'ecoflow-dpu-1inv-3bat', brand: 'EcoFlow', name: 'DELTA Pro Ultra — 1× Inverter + 3× Batteries', price: 7699, image: '/offgrid/ecoflow-dpu-1inv-3bat.png', category: 'Off-Grid', categoryUrl: '/offgrid', tags: ['offgrid', 'ecoflow', 'whole-home'] },

  // ── DIY Kits ────────────────────────────────────────────────────
  { id: 'eg4-8kw-hybrid-32kwh', brand: 'EG4', name: '8kW Hybrid Solar DIY Kit', price: null, image: '/kits/kit-eg4-8kw.jpg', category: 'DIY Kits', categoryUrl: '/diy-kits', tags: ['kit', 'eg4', 'hybrid'] },
  { id: 'eg4-9kw-hybrid-32kwh', brand: 'EG4', name: '9kW Hybrid Solar DIY Kit', price: null, image: '/kits/kit-eg4-9kw.jpg', category: 'DIY Kits', categoryUrl: '/diy-kits', tags: ['kit', 'eg4', 'hybrid'] },
  { id: 'eg4-10kw-hybrid-32kwh', brand: 'EG4', name: '10kW Hybrid Solar DIY Kit', price: null, image: '/kits/kit-eg4-10kw.jpg', category: 'DIY Kits', categoryUrl: '/diy-kits', tags: ['kit', 'eg4', 'hybrid'] },
  { id: 'eg4-11kw-hybrid-32kwh', brand: 'EG4', name: '11kW Hybrid Solar DIY Kit', price: null, image: '/kits/kit-eg4-11kw.jpg', category: 'DIY Kits', categoryUrl: '/diy-kits', tags: ['kit', 'eg4', 'hybrid'] },
  { id: 'ruixu-8kw-hybrid-32kwh', brand: 'RUiXU', name: '8kW Hybrid Solar DIY Kit', price: null, image: '/kits/kit-ruixu-8kw.jpg', category: 'DIY Kits', categoryUrl: '/diy-kits', tags: ['kit', 'ruixu', 'hybrid'] },
  { id: 'ruixu-9kw-hybrid-32kwh', brand: 'RUiXU', name: '9kW Hybrid Solar DIY Kit', price: null, image: '/kits/kit-ruixu-9kw.jpg', category: 'DIY Kits', categoryUrl: '/diy-kits', tags: ['kit', 'ruixu', 'hybrid'] },
  { id: 'ruixu-10kw-hybrid-32kwh', brand: 'RUiXU', name: '10kW Hybrid Solar DIY Kit', price: null, image: '/kits/kit-ruixu-10kw.jpg', category: 'DIY Kits', categoryUrl: '/diy-kits', tags: ['kit', 'ruixu', 'hybrid'] },
  { id: 'ecoflow-5kw-delta-pro-ultra-6kwh', brand: 'EcoFlow', name: '5kW EcoFlow Delta Pro Ultra DIY Kit', price: 5960, image: '/kits/kit-ecoflow-5kw-delta-pro-ultra.jpg', category: 'DIY Kits', categoryUrl: '/diy-kits', tags: ['kit', 'ecoflow', 'hybrid'] },
  { id: 'ecoflow-6kw-delta-pro-ultra-x-12kwh', brand: 'EcoFlow', name: '6kW EcoFlow Delta Pro Ultra X DIY Kit', price: 10300, image: '/kits/kit-ecoflow-6kw-delta-pro-ultra-x.jpg', category: 'DIY Kits', categoryUrl: '/diy-kits', tags: ['kit', 'ecoflow', 'hybrid'] },
  { id: 'ecoflow-8kw-delta-pro-ultra-x-18kwh', brand: 'EcoFlow', name: '8kW EcoFlow Delta Pro Ultra X DIY Kit', price: 13200, image: '/kits/kit-ecoflow-8kw-delta-pro-ultra-x.jpg', category: 'DIY Kits', categoryUrl: '/diy-kits', tags: ['kit', 'ecoflow', 'hybrid'] },
  { id: 'ecoflow-10kw-delta-pro-ultra-x-24kwh', brand: 'EcoFlow', name: '10kW EcoFlow Delta Pro Ultra X DIY Kit', price: 16200, image: '/kits/kit-ecoflow-10kw-delta-pro-ultra-x.jpg', category: 'DIY Kits', categoryUrl: '/diy-kits', tags: ['kit', 'ecoflow', 'hybrid'] },
];

export function searchCatalog(query: string): CatalogItem[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  const terms = q.split(/\s+/);
  return CATALOG.filter((item) => {
    const haystack = [item.brand, item.name, item.category, ...item.tags].join(' ').toLowerCase();
    return terms.every((t) => haystack.includes(t));
  });
}

export default CATALOG;
