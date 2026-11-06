import type { Metadata } from 'next';
import PageShell from '@/components/PageShell';
import Link from 'next/link';
import { NAV } from '@/config/site';
import { T } from '@/i18n/LanguageContext';

const PAGES = [
  ...NAV,
  { href: '/business-taxes', key: 'foot-business-taxes', label: 'Business Taxes and Fees' },
  { href: '/business-taxes/estimator', key: 'foot-estimator', label: 'Business Tax Estimator' },
  { href: '/scholarship', key: 'sitemap-scholarship', label: 'City Scholarship Program' },
  { href: '/faq', key: 'sitemap-faq', label: 'FAQ' },
  { href: '/privacy', key: 'home-privacy-policy', label: 'Privacy Policy' },
  { href: '/terms', key: 'home-terms-of-use', label: 'Terms of Use' },
  { href: '/accessibility', key: 'home-accessibility', label: 'Accessibility' },
];

export const metadata: Metadata = {
  title: 'Sitemap',
  description: 'Every page on Better San Jose.',
  alternates: { canonical: '/sitemap/' },
};

export default function SitemapPage() {
  return (
    <PageShell
      k="sitemap"
      badge="Sitemap"
      badgeIcon="ph-tree-structure"
      title="Sitemap"
      subtitle="Every page on Better San Jose"
    >
      <ul className="footer-links-new" style={{ display: 'grid', gap: 10 }}>
        {PAGES.map((p) => (
          <li key={p.href}>
            <Link href={p.href}>
              <T k={p.key}>{p.label}</T>
            </Link>
          </li>
        ))}
      </ul>
    </PageShell>
  );
}
