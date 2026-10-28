import type { Metadata } from 'next';
import Link from 'next/link';
import PageShell from '@/components/PageShell';
import ScholarshipStats from '@/components/ScholarshipStats';
import { SCHOLARSHIP_SIS_URL } from '@/config/site';
import '@/styles/scholarship.css';

export const metadata: Metadata = {
  title: 'City Scholarship Program',
  description:
    'The San Jose City scholarship program: how many scholars it supports each semester, the requirements for new and renewing scholars, and where scholars can check their payout eligibility.',
  alternates: { canonical: '/scholarship/' },
};

export default function ScholarshipPage() {
  return (
    <PageShell
      badge="Scholarship"
      badgeIcon="bi-mortarboard-fill"
      title="City Scholarship Program"
      subtitle="Financial assistance from the City Government of San Jose for students who live in the city."
      parents={[{ href: '/services/', label: 'Services' }]}
    >
      <div className="scholar-page">
        <a href={`${SCHOLARSHIP_SIS_URL}/eligibility`} className="scholar-callout">
          <i className="bi bi-search" aria-hidden="true" />
          <span>
            <strong>Already a scholar? Check your payout eligibility</strong>
            <span>
              Enter your scholar ID to see whether you are cleared for this semester’s payout and
              which requirements are still missing.
            </span>
          </span>
          <i className="bi bi-box-arrow-up-right" aria-hidden="true" />
        </a>

        <ScholarshipStats />

        <section className="scholar-block">
          <h2>New grantees and renewals</h2>
          <dl className="scholar-glossary">
            <div>
              <dt>New grantee</dt>
              <dd>
                A student in their first semester with the program. New grantees submit the full set
                of requirements, including proof that they live in San Jose City.
              </dd>
            </div>
            <div>
              <dt>Renewing scholar</dt>
              <dd>
                A returning scholar. Renewal is done every semester with a shorter list:
                liquidation, proof of enrollment and the latest grades.
              </dd>
            </div>
            <div>
              <dt>Qualified for payout</dt>
              <dd>
                Submitting requirements does not make a scholar qualified on its own. The
                scholarship office reviews each scholar and approves them for the semester’s payout.
              </dd>
            </div>
          </dl>
        </section>

        <aside className="scholar-privacy">
          <h2>About these figures</h2>
          <p>
            Only totals are published here. Names, addresses and other personal details of scholars
            are kept by the scholarship office and are not shown on this site.
          </p>
          <p>
            For application schedules and other questions, <Link href="/contact/">contact us</Link>.
          </p>
        </aside>
      </div>
    </PageShell>
  );
}
