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
  hotlines: [{ icon: 'ph-phone', label: 'National Emergency', number: '911', tel: '911' }],
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
