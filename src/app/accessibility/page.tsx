import type { Metadata } from 'next';
import PageShell, { DataPending } from '@/components/PageShell';

export const metadata: Metadata = {
  title: 'Accessibility',
  description: 'Accessibility statement of Better San Jose.',
  alternates: { canonical: '/accessibility/' },
};

export default function AccessibilityPage() {
  return (
    <PageShell
      badge="Accessibility"
      badgeIcon="bi-universal-access"
      title="Accessibility Statement"
      subtitle="Our commitment to an accessible website for everyone"
    >
      <DataPending title="Statement being drafted" icon="bi-universal-access-circle" as="h2">
        Better San Jose targets WCAG 2.1 AA. A full accessibility statement and feedback channel
        will be published here.
      </DataPending>
    </PageShell>
  );
}
