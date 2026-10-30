import type { Metadata } from 'next';
import PageShell, { DataPending } from '@/components/PageShell';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy policy of Better San Jose.',
  alternates: { canonical: '/privacy/' },
};

export default function PrivacyPage() {
  return (
    <PageShell
      badge="Privacy"
      badgeIcon="ph-lock"
      title="Privacy Policy"
      subtitle="How Better San Jose handles your information"
    >
      <DataPending title="Policy being drafted" icon="ph-file-lock" as="h2">
        The privacy policy will be published before launch, in line with the Data Privacy Act of
        2012 (RA 10173).
      </DataPending>
    </PageShell>
  );
}
