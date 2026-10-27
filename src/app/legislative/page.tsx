import type { Metadata } from 'next';
import PageShell, { DataPending } from '@/components/PageShell';

export const metadata: Metadata = {
  title: 'Legislative',
  description: 'Ordinances and resolutions of the Sangguniang Panlungsod of San Jose City.',
  alternates: { canonical: '/legislative/' },
};

export default function LegislativePage() {
  return (
    <PageShell
      badge="Legislative"
      badgeIcon="bi-journal-bookmark-fill"
      title="Sangguniang Panlungsod"
      subtitle="Ordinances and resolutions enacted by the San Jose City Council"
    >
      <div className="pending-grid">
        <DataPending title="City Ordinances" icon="bi-file-earmark-ruled-fill">
          A searchable list of enacted ordinances.
        </DataPending>
        <DataPending title="Resolutions" icon="bi-file-earmark-check-fill">
          A searchable list of approved resolutions.
        </DataPending>
      </div>
    </PageShell>
  );
}
