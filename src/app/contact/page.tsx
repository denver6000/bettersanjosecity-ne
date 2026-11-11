import type { Metadata } from 'next';
import PageShell, { PendingNote } from '@/components/PageShell';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Contact information and emergency hotlines for San Jose City, Nueva Ecija.',
  alternates: { canonical: '/contact/' },
};

export default function ContactPage() {
  return (
    <PageShell
      k="contact"
      badge="Contact"
      title="Contact & hotlines"
      subtitle="Reach the City Government of San Jose and its emergency services"
    >
      <PendingNote
        items={[
          {
            k: 'contact-emergency-hotlines',
            title: 'Emergency Hotlines',
            desc: 'Police, fire, CDRRMO, and medical emergency numbers. For any emergency, call 911.',
          },
          {
            k: 'contact-city-hall',
            title: 'City Hall',
            desc: 'Address, office hours, phone, and email of San Jose City Hall.',
          },
          {
            k: 'contact-office-directory',
            title: 'Office Directory',
            desc: 'Direct lines of city departments.',
          },
        ]}
      />
    </PageShell>
  );
}
