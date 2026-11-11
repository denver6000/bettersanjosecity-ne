import type { Metadata } from 'next';
import PageShell, { PendingNote } from '@/components/PageShell';

export const metadata: Metadata = {
  title: 'Government',
  description: 'Elected officials, departments, and barangays of San Jose City, Nueva Ecija.',
  alternates: { canonical: '/government/' },
};

export default function GovernmentPage() {
  return (
    <PageShell
      k="government"
      badge="Government"
      title="City government"
      subtitle="Elected officials, city departments, and barangays of San Jose City"
    >
      <PendingNote
        items={[
          {
            k: 'government-elected-officials',
            title: 'Elected officials',
            desc: 'City Mayor, Vice Mayor, and members of the Sangguniang Panlungsod.',
          },
          {
            k: 'government-city-departments',
            title: 'City departments',
            desc: 'Department heads, offices, and contact directory.',
          },
          {
            k: 'government-barangays',
            title: 'Barangays',
            desc: 'Barangay officials and locations across San Jose City.',
          },
        ]}
      />
    </PageShell>
  );
}
