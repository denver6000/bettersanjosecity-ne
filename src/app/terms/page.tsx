import type { Metadata } from 'next';
import PageShell, { PendingNote } from '@/components/PageShell';

export const metadata: Metadata = {
  title: 'Terms of use',
  description: 'Terms of use of Better San Jose.',
  alternates: { canonical: '/terms/' },
};

export default function TermsPage() {
  return (
    <PageShell
      k="terms"
      badge="Terms"
      title="Terms of use"
      subtitle="Terms governing the use of Better San Jose"
    >
      <PendingNote
        items={[
          {
            k: 'terms-terms-being-drafted',
            title: 'Terms being drafted',
            desc: 'The terms of use will be published before launch.',
          },
        ]}
      />
    </PageShell>
  );
}
