import type { Metadata } from 'next';
import Link from 'next/link';
import PageShell from '@/components/PageShell';
import BusinessTabs from '@/components/taxes/BusinessTabs';
import Estimator from '@/components/taxes/Estimator';
import { T } from '@/i18n/LanguageContext';
import { PSIC_SOURCE } from '@/lib/psic';
import '@/styles/taxes.css';
import '@/styles/estimator.css';

export const metadata: Metadata = {
  title: 'Business Tax Estimator',
  description:
    'Estimate the yearly business tax and fees for a business in San Jose City, Nueva Ecija. Find your activity in the PSA industry classification (PSIC), then enter your gross sales.',
  alternates: { canonical: '/business-taxes/estimator/' },
};

export default function EstimatorPage() {
  return (
    <PageShell
      k="estimator"
      badge="Tax Estimator"
      badgeIcon="ph-calculator"
      parents={[
        { href: '/business-taxes/', label: 'Business Taxes and Fees', k: 'foot-business-taxes' },
      ]}
      title="Business Tax Estimator"
      subtitle="Find what your business does, enter a few details, and see the city taxes and fees that likely apply, worked out from the Treasurer’s printed schedules."
    >
      <div className="tax-page">
        <BusinessTabs current="estimator" />
        <Estimator />

        <section className="tax-guide est-about">
          <h2>
            <T k="est-about-title">How the estimate works</T>
          </h2>
          <ol>
            <li>
              <T k="est-about-1a">Your activity is looked up in the</T> {PSIC_SOURCE.edition}{' '}
              <T k="est-about-1b">
                detailed structure released by the Philippine Statistics Authority on
              </T>{' '}
              {PSIC_SOURCE.released}.
            </li>
            <li>
              <T k="est-about-2">
                Its section, division or class decides which business tax code applies:
                manufacturing goes to 582-01, wholesale to 582-02, retail to 582-07, construction
                and repair to 582-08, finance to 582-09, and most services to 582-10. The suggestion
                is a starting point; the Treasurer’s Office makes the final classification.
              </T>
            </li>
            <li>
              <T k="est-about-3a">Each charge is read from the</T>{' '}
              <Link href="/business-taxes/">
                <T k="est-about-3b">printed schedules</T>
              </Link>
              <T k="est-about-3c">
                . Where a row also prints a rate, the rate is applied to the part of your gross
                sales above the row’s start. Where the printout has no row for your figure, the
                estimate says so instead of guessing.
              </T>
            </li>
            <li>
              <T k="est-about-4">Nothing you type leaves your browser.</T>
            </li>
          </ol>
        </section>
      </div>
    </PageShell>
  );
}
