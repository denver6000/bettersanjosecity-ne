import type { Metadata } from 'next';
import PageShell, { DataPending } from '@/components/PageShell';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Contact information and emergency hotlines for San Jose City, Nueva Ecija.',
  alternates: { canonical: '/contact/' },
};

export default function ContactPage() {
  return (
    <PageShell
      badge="Contact"
      badgeIcon="ph-phone"
      title="Contact & Hotlines"
      subtitle="Reach the City Government of San Jose and its emergency services"
    >
      <div className="pending-grid">
        <DataPending title="Emergency Hotlines" icon="ph-warning">
          Police, fire, CDRRMO, and medical emergency numbers. For any emergency, call 911.
        </DataPending>
        <DataPending title="City Hall" icon="ph-buildings">
          Address, office hours, phone, and email of San Jose City Hall.
        </DataPending>
        <DataPending title="Office Directory" icon="ph-notebook">
          Direct lines of city departments.
        </DataPending>
      </div>
    </PageShell>
  );
}
