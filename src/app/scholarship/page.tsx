import type { Metadata } from 'next';
import Link from 'next/link';
import { T } from '@/i18n/LanguageContext';
import ScholarLookup from '@/components/ScholarLookup';
import ScholarshipStats from '@/components/ScholarshipStats';
import '@/styles/scholarship.css';

export const metadata: Metadata = {
  title: 'City Scholarship Program',
  description:
    'The San Jose City scholarship program: how many scholars it supports each semester, the requirements for new and renewing scholars, and a Student ID lookup for each scholar’s payout status and requirements.',
  alternates: { canonical: '/scholarship/' },
};

/*
 * Not wrapped in PageShell: that shell draws the navy band every other inner page shares. This page
 * has its own cream hero (title left, Student ID lookup right) with the same breadcrumb semantics.
 */
export default function ScholarshipPage() {
  return (
    <div className="scholar-page">
      <div className="container">
        <div className="scholar-hero">
          <div className="scholar-hero-text">
            <nav className="scholar-crumbs" aria-label="Breadcrumb">
              <Link href="/">
                <T k="breadcrumb-home">Home</T>
              </Link>
              <i className="ph ph-caret-right" aria-hidden="true" />
              <Link href="/services/">
                <T k="nav-services">Services</T>
              </Link>
              <i className="ph ph-caret-right" aria-hidden="true" />
              <span aria-current="page">
                <T k="scholar-crumb">Scholarship</T>
              </span>
            </nav>
            <h1>City Scholarship Program</h1>
            <p>
              Financial assistance from the City Government of San Jose for students who live in the
              city.
            </p>
          </div>
          <div className="scholar-lookup-card">
            <ScholarLookup submitLabel={<T k="home-scholar-check">Check</T>} />
          </div>
        </div>

        <ScholarshipStats />

        <section className="scholar-block">
          <h2>New grantees and renewals</h2>
          <dl className="scholar-glossary">
            <div>
              <dt>
                <i className="ph-duotone ph-user-plus" aria-hidden="true" />
                New grantee
              </dt>
              <dd>
                A student in their first semester with the program. New grantees submit the full set
                of requirements, including proof that they live in San Jose City.
              </dd>
            </div>
            <div>
              <dt>
                <i className="ph-duotone ph-arrows-clockwise" aria-hidden="true" />
                Renewing scholar
              </dt>
              <dd>
                A returning scholar. Renewal is done every semester with a shorter list:
                liquidation, proof of enrollment and the latest grades.
              </dd>
            </div>
            <div>
              <dt>
                <i className="ph-duotone ph-seal-check" aria-hidden="true" />
                Qualified for payout
              </dt>
              <dd>
                Submitting requirements does not make a scholar qualified on its own. The
                scholarship office reviews each scholar and approves them for the semester’s payout.
              </dd>
            </div>
          </dl>
        </section>

        <aside className="scholar-privacy">
          <i className="ph-duotone ph-shield-check" aria-hidden="true" />
          <div>
            <h2>About your information</h2>
            <p>
              The figures above are totals only. The Student ID lookup shows a scholar’s own program
              record; addresses, phone numbers and other contact details are kept by the scholarship
              office and are never shown on this site.
            </p>
            <p>
              For application schedules and other questions,{' '}
              <Link href="/contact/">contact us</Link>.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
