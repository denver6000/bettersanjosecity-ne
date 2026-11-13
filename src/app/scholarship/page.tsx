import type { Metadata } from 'next';
import Link from 'next/link';
import { T } from '@/i18n/LanguageContext';
import ScholarLookup from '@/components/ScholarLookup';
import ScholarshipStats from '@/components/ScholarshipStats';
import '@/styles/scholarship.css';

export const metadata: Metadata = {
  title: 'City Scholarship Program',
  description:
    'The San Jose City Scholarship Program: how many scholars it supports each semester, the requirements for new and renewing scholars, and a Student ID lookup for each scholar’s payout status and requirements.',
  alternates: { canonical: '/scholarship/' },
};

/*
 * Not wrapped in PageShell: this page puts the Student ID lookup beside its title, which the shared
 * intro has no slot for. It keeps the same cream, left-aligned look and breadcrumb semantics.
 */
export default function ScholarshipPage() {
  return (
    <div className="scholar-page">
      <div className="container">
        <div className="scholar-hero">
          <div className="scholar-hero-text">
            <span id="crumb-label" className="sr-only">
              <T k="breadcrumb-aria">Breadcrumb</T>
            </span>
            <nav className="scholar-crumbs" aria-labelledby="crumb-label">
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
            <h1>
              <T k="sitemap-scholarship">City Scholarship Program</T>
            </h1>
            <p>
              <T k="sch-lede">
                Financial assistance from the City Government of San Jose for students who live in
                the city.
              </T>
            </p>
          </div>
          <div className="scholar-lookup-card">
            <ScholarLookup submitLabel={<T k="home-scholar-check">Check</T>} />
          </div>
        </div>

        <ScholarshipStats />

        <section className="scholar-block">
          <h2>
            <T k="sch-new-renew">New grantees and renewals</T>
          </h2>
          <dl className="scholar-glossary" data-reveal-children>
            <div>
              <dt>
                <i className="ph-duotone ph-user-plus" aria-hidden="true" />
                <T k="sch-new-grantee">New grantee</T>
              </dt>
              <dd>
                <T k="sch-new-grantee-d">
                  A student in their first semester with the program. New grantees submit the full
                  set of requirements, including proof that they live in San Jose City.
                </T>
              </dd>
            </div>
            <div>
              <dt>
                <i className="ph-duotone ph-arrows-clockwise" aria-hidden="true" />
                <T k="sch-renewing-scholar">Renewing scholar</T>
              </dt>
              <dd>
                <T k="sch-renewing-scholar-d">
                  A returning scholar. Renewal is done every semester with a shorter list:
                  liquidation, proof of enrollment and the latest grades.
                </T>
              </dd>
            </div>
            <div>
              <dt>
                <i className="ph-duotone ph-seal-check" aria-hidden="true" />
                <T k="sch-qualified">Qualified for payout</T>
              </dt>
              <dd>
                <T k="sch-qualified-d">
                  Submitting requirements does not make a scholar qualified on its own. The
                  scholarship office reviews each scholar and approves them for the semester’s
                  payout.
                </T>
              </dd>
            </div>
          </dl>
        </section>

        <aside className="scholar-privacy" data-reveal>
          <i className="ph-duotone ph-shield-check" aria-hidden="true" />
          <div>
            <h2>
              <T k="sch-privacy-h">About your information</T>
            </h2>
            <p>
              <T k="sch-privacy-p">
                The figures above are totals only. The Student ID lookup shows a scholar’s own
                program record; addresses, phone numbers and other contact details are kept by the
                scholarship office and are never shown on this site.
              </T>
            </p>
            <p>
              <T k="sch-contact-a">For application schedules and other questions,</T>{' '}
              <Link href="/contact/">
                <T k="sch-contact-link">contact us</T>
              </Link>
              .
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
