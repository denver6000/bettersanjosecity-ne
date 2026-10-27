import type { Metadata } from 'next';
import PageShell from '@/components/PageShell';
import { NewsGrid } from '@/components/NewsList';

export const metadata: Metadata = {
  title: 'News',
  description: 'Latest news, announcements, and advisories from San Jose City, Nueva Ecija.',
  alternates: { canonical: '/news/' },
};

export default function NewsPage() {
  return (
    <PageShell
      badge="News"
      badgeIcon="bi-newspaper"
      title="News & Updates"
      subtitle="Announcements and advisories from the City Government of San Jose"
    >
      <NewsGrid />
    </PageShell>
  );
}
