import Link from 'next/link';

const TABS = [
  { id: 'schedules', href: '/business-taxes/', icon: 'bi-table', label: 'Taxes and fees' },
  {
    id: 'estimator',
    href: '/business-taxes/estimator/',
    icon: 'bi-calculator',
    label: 'Tax estimator',
  },
] as const;

/** Switches between the pages of the business taxes section. */
export default function BusinessTabs({ current }: { current: (typeof TABS)[number]['id'] }) {
  return (
    <nav className="biz-tabs" aria-label="Business taxes and fees">
      {TABS.map((t) => (
        <Link
          key={t.id}
          href={t.href}
          className={t.id === current ? 'is-active' : undefined}
          aria-current={t.id === current ? 'page' : undefined}
        >
          <i className={`bi ${t.icon}`} aria-hidden="true" /> {t.label}
        </Link>
      ))}
    </nav>
  );
}
