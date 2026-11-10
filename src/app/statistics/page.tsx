import type { Metadata } from 'next';
import PageShell, { DataPending } from '@/components/PageShell';

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
      badgeIcon="ph-chart-bar"
      title="City statistics"
      subtitle="Data and statistics about San Jose City, Nueva Ecija"
    >
      <div className="pending-grid">
        <DataPending k="statistics-demographics" title="Demographics" icon="ph-users-three">
          Population, households, and growth rate from the Philippine Statistics Authority.
        </DataPending>
        <DataPending
          k="statistics-population-by-barangay"
          title="Population by barangay"
          icon="ph-map-pin-area"
        >
          Barangay-level population figures.
        </DataPending>
        <DataPending
          k="statistics-competitiveness-index"
          title="Competitiveness index"
          icon="ph-chart-line-up"
        >
          Cities and Municipalities Competitiveness Index (CMCI) rankings.
        </DataPending>
      </div>
    </PageShell>
  );
}
