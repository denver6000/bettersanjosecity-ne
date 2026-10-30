import type { Metadata } from 'next';
import PageShell, { DataPending } from '@/components/PageShell';

export const metadata: Metadata = {
  title: 'Government',
  description: 'Elected officials, departments, and barangays of San Jose City, Nueva Ecija.',
  alternates: { canonical: '/government/' },
};

export default function GovernmentPage() {
  return (
    <PageShell
      badge="Government"
      badgeIcon="ph-bank"
      title="City Government"
      subtitle="Elected officials, city departments, and barangays of San Jose City"
    >
      <div className="pending-grid">
        <DataPending title="Elected Officials" icon="ph-identification-badge">
          City Mayor, Vice Mayor, and members of the Sangguniang Panlungsod.
        </DataPending>
        <DataPending title="City Departments" icon="ph-tree-structure">
          Department heads, offices, and contact directory.
        </DataPending>
        <DataPending title="Barangays" icon="ph-map-pin">
          Barangay officials and locations across San Jose City.
        </DataPending>
      </div>
    </PageShell>
  );
}
