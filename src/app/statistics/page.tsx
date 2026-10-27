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
      badge="Statistics"
      badgeIcon="bi-bar-chart-fill"
      title="City Statistics"
      subtitle="Data and statistics about San Jose City, Nueva Ecija"
    >
      <div className="pending-grid">
        <DataPending title="Demographics" icon="bi-people-fill">
          Population, households, and growth rate from the Philippine Statistics Authority.
        </DataPending>
        <DataPending title="Population by Barangay" icon="bi-pin-map-fill">
          Barangay-level population figures.
        </DataPending>
        <DataPending title="Competitiveness Index" icon="bi-graph-up-arrow">
          Cities and Municipalities Competitiveness Index (CMCI) rankings.
        </DataPending>
      </div>
    </PageShell>
  );
}
