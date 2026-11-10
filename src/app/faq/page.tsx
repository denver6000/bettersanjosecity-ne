import type { Metadata } from 'next';
import PageShell, { DataPending } from '@/components/PageShell';

export const metadata: Metadata = {
  title: 'FAQ',
  description: 'Frequently asked questions about San Jose City government services.',
  alternates: { canonical: '/faq/' },
};

export default function FaqPage() {
  return (
    <PageShell
      k="faq"
      badge="FAQ"
      badgeIcon="ph-question"
      title="Frequently asked questions"
      subtitle="Answers to common questions about city services"
    >
      <DataPending
        k="faq-questions-are-being-compiled"
        title="Questions are being compiled"
        as="h2"
      >
        Common questions about certificates, permits, taxes, and city programs will be answered
        here.
      </DataPending>
    </PageShell>
  );
}
