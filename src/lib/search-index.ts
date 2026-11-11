/**
 * Everything the site search covers, built from data the site already has: page titles and intros
 * (both languages), officials, offices, hotlines and services.
 */
import { translations } from '@/i18n/translations';
import { SITE } from '@/config/site';
import officials from '@/data/officials.json';
import officesJson from '@/data/offices.json';
import { services } from '@/lib/data';
import type { SearchEntry } from '@/lib/search';

const en = translations.en;
const fil = translations.fil;

/** Route, title key, intro key and extra search words per page. */
const PAGES: [href: string, title: string, sub?: string, words?: string][] = [
  ['/', 'nav-home'],
  ['/services/', 'pg-services-title', 'pg-services-sub'],
  ['/scholarship/', 'sitemap-scholarship', 'sch-lede', 'iskolar scholar student estudyante'],
  [
    '/business-taxes/',
    'pg-business-taxes-title',
    'pg-business-taxes-sub',
    "business permit mayor's permit permiso negosyo",
  ],
  ['/business-taxes/estimator/', 'pg-estimator-title', 'pg-estimator-sub'],
  ['/government/', 'pg-government-title', 'pg-government-sub'],
  ['/legislative/', 'pg-legislative-title', 'pg-legislative-sub'],
  ['/budget/', 'pg-budget-title', 'pg-budget-sub'],
  ['/statistics/', 'pg-statistics-title', 'pg-statistics-sub'],
  ['/news/', 'pg-news-title', 'pg-news-sub'],
  ['/contact/', 'pg-contact-title', 'pg-contact-sub'],
  ['/faq/', 'pg-faq-title', 'pg-faq-sub'],
  ['/privacy/', 'pg-privacy-title', 'pg-privacy-sub'],
  ['/terms/', 'pg-terms-title', 'pg-terms-sub'],
  ['/accessibility/', 'pg-accessibility-title', 'pg-accessibility-sub'],
  ['/sitemap/', 'pg-sitemap-title', 'pg-sitemap-sub'],
];

const both = (k: string) => `${en[k] ?? ''} ${fil[k] ?? ''}`;

function official(name: string, titleKey: string): SearchEntry {
  return {
    type: 'official',
    en: name,
    fil: name,
    extra: both(titleKey),
    href: '/government/#officials',
  };
}

export function buildSiteIndex(): SearchEntry[] {
  return [
    ...PAGES.map(([href, title, sub, words = '']): SearchEntry => ({
      type: 'page',
      en: en[title],
      fil: fil[title] ?? en[title],
      extra: `${sub ? both(sub) : ''} ${words}`,
      href,
    })),
    official(officials.mayor, 'official-mayor'),
    official(officials.viceMayor, 'official-vice-mayor'),
    ...officials.councilors.map((n) => official(n, 'official-councilor')),
    ...officesJson.offices.map((o): SearchEntry => ({
      type: 'office',
      en: o.name,
      fil: o.name,
      extra: (o.keywords ?? []).join(' '),
      href: '/government/#offices',
    })),
    ...SITE.hotlines.map((h): SearchEntry => ({
      type: 'hotline',
      en: en[`hotline-${h.id}`] ?? h.label,
      fil: fil[`hotline-${h.id}`] ?? h.label,
      extra: [...h.keywords, ...h.numbers].join(' '),
      href: '/contact/#hotlines',
      tel: [...h.numbers],
    })),
    ...services.map((s): SearchEntry => ({
      type: 'service',
      en: s.title,
      fil: s.title,
      extra: [s.category, s.description, s.office, ...(s.keywords ?? [])].join(' '),
      href: s.url || '/services/',
    })),
  ];
}

export const SITE_INDEX = buildSiteIndex();
