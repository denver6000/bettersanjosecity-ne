import type { Metadata } from 'next';
import PageShell, { PendingNote } from '@/components/PageShell';

export const metadata: Metadata = {
  title: 'Accessibility',
  description: 'Accessibility statement of Better San Jose.',
  alternates: { canonical: '/accessibility/' },
};

export default function AccessibilityPage() {
  return (
    <PageShell
      k="accessibility"
      badge="Accessibility"
      title="Accessibility statement"
      subtitle="Our commitment to an accessible website for everyone"
    >
      <PendingNote
        items={[
          {
            k: 'accessibility-statement-being-drafted',
            title: 'Statement being drafted',
            desc: 'Better San Jose targets WCAG 2.1 AA. A full accessibility statement and feedback channel will be published here.',
          },
        ]}
      />
    </PageShell>
  );
}
