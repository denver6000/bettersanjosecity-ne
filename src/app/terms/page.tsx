import type { Metadata } from 'next';
import PageShell, { DataPending } from '@/components/PageShell';

export const metadata: Metadata = {
  title: 'Terms of Use',
  description: 'Terms of use of Better San Jose.',
  alternates: { canonical: '/terms/' },
};

export default function TermsPage() {
  return (
    <PageShell
      badge="Terms"
      badgeIcon="ph-file-text"
      title="Terms of Use"
      subtitle="Terms governing the use of Better San Jose"
    >
      <DataPending title="Terms being drafted" icon="ph-file-text" as="h2">
        The terms of use will be published before launch.
      </DataPending>
    </PageShell>
  );
}
