import type { Metadata } from 'next';
import PageShell, { PendingNote } from '@/components/PageShell';
import OfficeList from '@/components/OfficeList';
import SourceLine from '@/components/SourceLine';
import { T } from '@/i18n/LanguageContext';
import { SITE } from '@/config/site';
import { toTel } from '@/lib/phone';
import officials from '@/data/officials.json';
import offices from '@/data/offices.json';

export const metadata: Metadata = {
  title: 'Government',
  description: 'Elected officials, departments, and barangays of San Jose City, Nueva Ecija.',
  alternates: { canonical: '/government/' },
};

const SECTIONS = [
  { id: 'officials', k: 'government-elected-officials-t', label: 'Elected officials' },
  { id: 'offices', k: 'government-city-offices', label: 'City offices' },
  { id: 'barangays', k: 'government-barangays-t', label: 'Barangays' },
];

const OCM = SITE.hotlines.find((h) => h.id === 'ocm')!.numbers[0];

function Official({ titleKey, title, name }: { titleKey: string; title: string; name: string }) {
  return (
    <>
      <p className="official-title">
        <T k={titleKey}>{title}</T>
      </p>
      <p className="official-name">{name}</p>
    </>
  );
}

export default function GovernmentPage() {
  return (
    <PageShell
      k="government"
      badge="Government"
      title="City government"
      subtitle="Elected officials, city departments, and barangays of San Jose City"
      sections={SECTIONS}
    >
      <section id="officials" className="page-section">
        <h2>
          <T k="government-elected-officials-t">Elected officials</T>
        </h2>
        <div className="official-leads">
          <div className="official-card is-lead">
            <Official titleKey="official-mayor" title="City Mayor" name={officials.mayor} />
          </div>
          <div className="official-card is-lead">
            <Official
              titleKey="official-vice-mayor"
              title="City Vice Mayor"
              name={officials.viceMayor}
            />
          </div>
        </div>
        <ul className="official-grid">
          {officials.councilors.map((name) => (
            <li key={name} className="official-card">
              <Official titleKey="official-councilor" title="City Councilor" name={name} />
            </li>
          ))}
        </ul>
        <SourceLine source={officials.source} checked={officials.checked} />
      </section>

      <section id="offices" className="page-section">
        <h2>
          <T k="government-city-offices">City offices</T>
        </h2>
        <p className="offices-note">
          <T k="offices-heads-note">
            Office heads are not published yet. For enquiries, call the Office of the City Mayor at
          </T>{' '}
          <a href={`tel:${toTel(OCM)}`}>{OCM}</a>.
        </p>
        <OfficeList />
        <SourceLine source={offices.source} checked={offices.checked} />
      </section>

      <section id="barangays" className="page-section">
        <h2>
          <T k="government-barangays-t">Barangays</T>
        </h2>
        <PendingNote
          items={[
            {
              k: 'government-barangays',
              title: 'Barangays',
              desc: 'Barangay officials and locations across San Jose City.',
            },
          ]}
        />
      </section>
    </PageShell>
  );
}
