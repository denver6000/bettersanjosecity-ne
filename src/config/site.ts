/**
 * Single source of truth for LGU identity.
 *
 * TODO(data): verify coordinates, address, and contact details against
 * official LGU San Jose City sources before launch.
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
  // TODO(data): add verified San Jose City hotlines.
  hotlines: [{ icon: 'bi-telephone-fill', label: 'National Emergency', number: '911', tel: '911' }],
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
    icon: 'bi-file-earmark-text-fill',
    name: 'Certificates',
    desc: 'Birth, marriage, and death records',
  },
  {
    icon: 'bi-shop',
    name: 'Business',
    desc: 'Permits, licenses, and renewals',
    href: '/business-taxes',
  },
  {
    icon: 'bi-calculator',
    name: 'Tax Estimator',
    desc: 'Estimate your yearly business tax and fees',
    href: '/business-taxes/estimator',
  },
  {
    icon: 'bi-people-fill',
    name: 'Social Services',
    desc: 'Senior citizen, PWD, and welfare programs',
  },
  { icon: 'bi-heart-pulse-fill', name: 'Health', desc: 'City health office and programs' },
  { icon: 'bi-flower1', name: 'Agriculture', desc: 'Farmer support and assistance' },
  { icon: 'bi-cone-striped', name: 'Infrastructure', desc: 'Building permits and engineering' },
  { icon: 'bi-mortarboard-fill', name: 'Education', desc: 'Scholarships and learning programs' },
  {
    icon: 'bi-shield-fill-check',
    name: 'Public Safety',
    desc: 'Disaster risk reduction and peace and order',
  },
  {
    icon: 'bi-tree-fill',
    name: 'Environment',
    desc: 'Waste management and environmental protection',
  },
] as const;
