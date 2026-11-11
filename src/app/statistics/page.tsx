import type { Metadata } from 'next';
import PageShell, { PendingNote } from '@/components/PageShell';

export const metadata: Metadata = {
  title: 'Statistics',
  description:
    'Demographic, economic, and competitiveness statistics of San Jose City, Nueva Ecija.',
  alternates: { canonical: '/statistics/' },
};

export default function StatisticsPage() {
  return (
    <PageShell
      k="statistics"
      badge="Statistics"
      title="City statistics"
      subtitle="Data and statistics about San Jose City, Nueva Ecija"
    >
      <PendingNote
        items={[
          {
            k: 'statistics-demographics',
            title: 'Demographics',
            desc: 'Population, households, and growth rate from the Philippine Statistics Authority.',
          },
          {
            k: 'statistics-population-by-barangay',
            title: 'Population by barangay',
            desc: 'Barangay-level population figures.',
          },
          {
            k: 'statistics-competitiveness-index',
            title: 'Competitiveness index',
            desc: 'Cities and Municipalities Competitiveness Index (CMCI) rankings.',
          },
        ]}
      />
    </PageShell>
  );
}
