import type { Metadata } from 'next';
import PageShell, { PendingNote } from '@/components/PageShell';

export const metadata: Metadata = {
  title: 'Legislative',
  description: 'Ordinances and resolutions of the Sangguniang Panlungsod of San Jose City.',
  alternates: { canonical: '/legislative/' },
};

export default function LegislativePage() {
  return (
    <PageShell
      k="legislative"
      badge="Legislative"
      title="Sangguniang Panlungsod"
      subtitle="Ordinances and resolutions enacted by the San Jose City Council"
    >
      <PendingNote
        items={[
          {
            k: 'legislative-city-ordinances',
            title: 'City Ordinances',
            desc: 'A searchable list of enacted ordinances.',
          },
          {
            k: 'legislative-resolutions',
            title: 'Resolutions',
            desc: 'A searchable list of approved resolutions.',
          },
        ]}
      />
    </PageShell>
  );
}
