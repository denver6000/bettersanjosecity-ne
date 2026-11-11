/**
 * Single source of truth for LGU identity.
 *
 * TODO(data): verify coordinates against official LGU San Jose City sources before launch.
 */
export const SITE = {
  name: 'Better San Jose',
  domain: 'sanjose.betternuevaecija.org',
  url: 'https://sanjose.betternuevaecija.org',
  description:
    'Better San Jose - your digital gateway to San Jose City, Nueva Ecija government services, officials, statistics, and transparency data.',
  tagline:
    'Empowering the people of San Jose City with transparent access to the services, programs, and public funds of their city government.',
  lgu: {
    name: 'San Jose City',
    shortName: 'San Jose',
    type: 'City',
    province: 'Nueva Ecija',
    region: 'Region III - Central Luzon',
    postalCode: '3121',
    seatOfGovernment: 'San Jose City Hall',
  },
  // Approximate city center; used for weather (Open-Meteo) and the map.
  coordinates: { lat: 15.7933, lon: 120.9917 },
  mapZoom: 14,
  // KloudTrack AWS; the live feed overrides these once it loads.
  weatherStation: { name: 'San Jose City AWS', lat: 15.794954, lon: 120.993156, radiusKm: 10 },
  // City Hall and hotlines as published on sjc.gov.ph. The street number is left out: the source
  // gives both "15" and "115" Cardenas St.
  cityHall: {
    street: 'Cardenas St.',
    email: 'piosanjosecity@gmail.com',
    source: 'https://www.sjc.gov.ph',
    checked: '2026-11-11',
  },
  // Emergency lines first. Labels are English fallbacks for the `hotline-<id>` keys.
  hotlines: [
    {
      id: 'rescue',
      label: 'MDRRMO Rescue Hotline',
      numbers: ['0915-168-9878'],
      emergency: true,
      keywords: ['rescue', 'sagip', 'emergency', 'MDRRMO'],
    },
    {
      id: 'emergency',
      label: 'National Emergency',
      numbers: ['911'],
      emergency: true,
      keywords: ['emergency', 'emerhensiya'],
    },
    {
      id: 'pnp',
      label: 'PNP San Jose',
      numbers: ['(044) 604-7954', '0998-598-5421'],
      emergency: true,
      keywords: ['police', 'pulis', 'PNP'],
    },
    {
      id: 'bfp',
      label: 'Fire Station (BFP)',
      numbers: ['(044) 940-5258', '0925-453-0777'],
      emergency: true,
      keywords: ['fire', 'sunog', 'bumbero', 'BFP'],
    },
    {
      id: 'hospital',
      label: 'Ospital ng Lungsod',
      numbers: ['(044) 456-6671'],
      emergency: false,
      keywords: ['hospital', 'ospital', 'ambulance', 'ambulansya'],
    },
    {
      id: 'ocm',
      label: 'Office of the City Mayor (OCM)',
      numbers: ['(044) 940-1404'],
      emergency: false,
      keywords: ['mayor', 'punong lungsod', 'city hall', 'munisipyo'],
    },
    {
      id: 'pio',
      label: 'Public Information Office (PIO)',
      numbers: ['(044) 331-0667'],
      emergency: false,
      keywords: ['information', 'impormasyon', 'PIO'],
    },
    {
      id: 'sajelco',
      label: 'SAJELCO',
      numbers: ['(044) 940-5818'],
      emergency: false,
      keywords: ['electricity', 'kuryente', 'brownout', 'power'],
    },
  ],
} as const;

export const LGU_LABEL = `${SITE.lgu.name}, ${SITE.lgu.province}`;

export const NAV = [
  { href: '/', key: 'nav-home', label: 'Home' },
  { href: '/services', key: 'nav-services', label: 'Services' },
  { href: '/business-taxes', key: 'nav-business', label: 'Business' },
  { href: '/government', key: 'nav-government', label: 'Government' },
  { href: '/statistics', key: 'nav-statistics', label: 'Statistics' },
  { href: '/legislative', key: 'nav-legislative', label: 'Legislative' },
  { href: '/budget', key: 'nav-transparency', label: 'Transparency' },
  { href: '/news', key: 'nav-news', label: 'News' },
  { href: '/contact', key: 'nav-contact', label: 'Contact' },
] as const;

export const SERVICE_CATEGORIES = [
  {
    icon: 'ph-file-text',
    name: 'Certificates',
    desc: 'Birth, marriage, and death records',
  },
  {
    icon: 'ph-storefront',
    name: 'Business',
    desc: 'Permits, licenses, and renewals',
    href: '/business-taxes',
  },
  {
    icon: 'ph-calculator',
    name: 'Tax Estimator',
    desc: 'Estimate your yearly business tax and fees',
    href: '/business-taxes/estimator',
  },
  {
    icon: 'ph-users-three',
    name: 'Social Services',
    desc: 'Senior citizen, PWD, and welfare programs',
  },
  { icon: 'ph-heartbeat', name: 'Health', desc: 'City health office and programs' },
  { icon: 'ph-plant', name: 'Agriculture', desc: 'Farmer support and assistance' },
  { icon: 'ph-traffic-cone', name: 'Infrastructure', desc: 'Building permits and engineering' },
  {
    icon: 'ph-graduation-cap',
    name: 'Education',
    desc: 'Scholarships and learning programs',
    href: '/scholarship',
  },
  {
    icon: 'ph-shield-check',
    name: 'Public Safety',
    desc: 'Disaster risk reduction and peace and order',
  },
  {
    icon: 'ph-tree',
    name: 'Environment',
    desc: 'Waste management and environmental protection',
  },
] as const;
