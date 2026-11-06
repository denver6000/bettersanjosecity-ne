'use client';

import Link from 'next/link';
import { useLanguage } from '@/i18n/LanguageContext';

const TABS = [
  {
    id: 'schedules',
    href: '/business-taxes/',
    icon: 'ph-table',
    k: 'bt-tab-schedules',
    label: 'Taxes and fees',
  },
  {
    id: 'estimator',
    href: '/business-taxes/estimator/',
    icon: 'ph-calculator',
    k: 'bt-tab-estimator',
    label: 'Tax estimator',
  },
] as const;

/** Switches between the pages of the business taxes section. */
export default function BusinessTabs({ current }: { current: (typeof TABS)[number]['id'] }) {
  const { t } = useLanguage();
  return (
    <nav className="biz-tabs" aria-label={t('bt-tabs-aria', 'Business taxes and fees')}>
      {TABS.map((tab) => (
        <Link
          key={tab.id}
          href={tab.href}
          className={tab.id === current ? 'is-active' : undefined}
          aria-current={tab.id === current ? 'page' : undefined}
        >
          <i className={`ph ${tab.icon}`} aria-hidden="true" /> {t(tab.k, tab.label)}
        </Link>
      ))}
    </nav>
  );
}
