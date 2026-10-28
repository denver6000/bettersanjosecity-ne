import type { Metadata } from 'next';
import PageShell from '@/components/PageShell';
import Link from 'next/link';
import { NAV } from '@/config/site';

const PAGES = [
  ...NAV,
  { href: '/business-taxes', label: 'Business Taxes and Fees' },
  { href: '/business-taxes/estimator', label: 'Business Tax Estimator' },
  { href: '/scholarship', label: 'City Scholarship Program' },
  { href: '/faq', label: 'FAQ' },
  { href: '/privacy', label: 'Privacy Policy' },
  { href: '/terms', label: 'Terms of Use' },
  { href: '/accessibility', label: 'Accessibility' },
];

export const metadata: Metadata = {
  title: 'Sitemap',
  description: 'Every page on Better San Jose.',
  alternates: { canonical: '/sitemap/' },
};

export default function SitemapPage() {
  return (
    <PageShell
      badge="Sitemap"
      badgeIcon="bi-diagram-2-fill"
      title="Sitemap"
      subtitle="Every page on Better San Jose"
    >
      <ul className="footer-links-new" style={{ display: 'grid', gap: 10 }}>
        {PAGES.map((p) => (
          <li key={p.href}>
            <Link href={p.href}>{p.label}</Link>
          </li>
        ))}
      </ul>
    </PageShell>
  );
}
