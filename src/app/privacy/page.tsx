import type { Metadata } from 'next';
import PageShell, { PendingNote } from '@/components/PageShell';

export const metadata: Metadata = {
  title: 'Privacy policy',
  description: 'Privacy policy of Better San Jose.',
  alternates: { canonical: '/privacy/' },
};

export default function PrivacyPage() {
  return (
    <PageShell
      k="privacy"
      badge="Privacy"
      title="Privacy policy"
      subtitle="How Better San Jose handles your information"
    >
      <PendingNote
        items={[
          {
            k: 'privacy-policy-being-drafted',
            title: 'Policy being drafted',
            desc: 'The privacy policy will be published before launch, in line with the Data Privacy Act of 2012 (RA 10173).',
          },
        ]}
      />
    </PageShell>
  );
}
