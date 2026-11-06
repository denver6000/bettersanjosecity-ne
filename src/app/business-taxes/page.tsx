import type { Metadata } from 'next';
import Link from 'next/link';
import PageShell from '@/components/PageShell';
import BusinessTabs from '@/components/taxes/BusinessTabs';
import TaxBrowser from '@/components/taxes/TaxBrowser';
import { T } from '@/i18n/LanguageContext';
import { allCodes, codeAnchor, EFFECTIVITY, PRINTED_ON, schedules, totals } from '@/data/revenue';
import '@/styles/taxes.css';

export const metadata: Metadata = {
  title: 'Business Taxes and Fees',
  description:
    'Every business tax and fee code of San Jose City, Nueva Ecija, as printed by the City Treasurer: business tax, mayor’s permit, sanitary, garbage and fixed fees.',
  alternates: { canonical: '/business-taxes/' },
};

const flagged = allCodes.filter(({ code }) => code.notes?.length);

export default function BusinessTaxesPage() {
  return (
    <PageShell
      k="business-taxes"
      badge="Business Taxes and Fees"
      badgeIcon="ph-coins"
      title="Business Taxes and Fees"
      subtitle={`Every tax and fee code a business in San Jose City may be charged, copied from the Treasurer’s schedules (effective ${EFFECTIVITY}). Search for your line of business, or find your row by gross sales.`}
    >
      <div className="tax-page">
        <BusinessTabs current="schedules" />
        <dl className="tax-stats">
          <div>
            <dt>
              <T k="bt-stat-schedules">Schedules</T>
            </dt>
            <dd>{totals.schedules}</dd>
          </div>
          <div>
            <dt>
              <T k="bt-stat-codes">Tax and fee codes</T>
            </dt>
            <dd>{totals.codes}</dd>
          </div>
          <div>
            <dt>
              <T k="bt-stat-rows">Printed rows</T>
            </dt>
            <dd>{totals.rows}</dd>
          </div>
          <div>
            <dt>
              <T k="bt-stat-printed-on">Printed on</T>
            </dt>
            <dd className="tax-stats-date">{PRINTED_ON}</dd>
          </div>
        </dl>

        <Link href="/business-taxes/estimator/" className="est-callout">
          <i className="ph ph-calculator" aria-hidden="true" />
          <span>
            <strong>
              <T k="bt-callout-title">Estimate your yearly taxes and fees</T>
            </strong>
            <span>
              <T k="bt-callout-desc">
                Find your business in PSA’s industry classification and enter your gross sales.
              </T>
            </span>
          </span>
          <i className="ph ph-arrow-right" aria-hidden="true" />
        </Link>

        <TaxBrowser />

        <aside className="disclaimer">
          <h2>
            <T k="bt-before-title">Before you pay</T>
          </h2>
          <p>
            <T k="bt-before-p1">
              This page reproduces printed schedules so they are easier to read. It is not an
              assessment. Surcharges, penalties, discounts and other charges are not shown, and the
              rule for applying a printed rate is set by the city’s revenue code. The City
              Treasurer’s Office computes what you owe, and its official receipt is the only proof
              of payment.
            </T>
          </p>
          <p>
            <T k="bt-spotted">Spotted a figure that does not match your printout?</T>{' '}
            <Link href="/contact/">
              <T k="bt-tell-us">Tell us</T>
            </Link>
            .
          </p>
        </aside>

        <section id="how-to-read" className="tax-guide">
          <h2>
            <T k="bt-read-title">How to read the schedules</T>
          </h2>
          <dl className="glossary">
            <div>
              <dt>
                <T k="bt-g-code">Code</T>
              </dt>
              <dd>
                <T k="bt-g-code-d">
                  The Treasurer’s reference for a tax or fee, such as 582-10 or 3002. Permit codes
                  often end in “MP” (mayor’s permit).
                </T>
              </dd>
            </div>
            <div>
              <dt>
                <T k="bt-g-fromto">From / To</T>
              </dt>
              <dd>
                <T k="bt-g-fromto-d">
                  The band your gross sales or receipts (or your business area, for the sanitary
                  fee) must fall in. A top row printed as 9,999,999,999,999.00 is shown here as “and
                  above”.
                </T>
              </dd>
            </div>
            <div>
              <dt>
                <T k="bt-g-amount">Amount</T>
              </dt>
              <dd>
                <T k="bt-g-amount-d">The peso amount printed for that row.</T>
              </dd>
            </div>
            <div>
              <dt>
                <T k="bt-g-rate">Rate</T>
              </dt>
              <dd>
                <T k="bt-g-rate-d">
                  A rate printed beside a row, shown as a percentage: 0.005625 becomes 0.5625%.
                  Rates mostly appear on the top row of a schedule, and on the retailer and bank
                  codes. How a rate combines with the amount is set by the revenue code; ask the
                  Treasurer’s Office before relying on your own sum.
                </T>
              </dd>
            </div>
            <div>
              <dt>
                <T k="bt-g-newren">New, Renewal</T>
              </dt>
              <dd>
                <T k="bt-g-newren-d">
                  Tick boxes printed beside each code, marking whether it is charged on new
                  applications, on renewals, or both. All business tax codes are marked for renewal
                  only.
                </T>
              </dd>
            </div>
            <div>
              <dt>
                <T k="bt-g-ess">With essential, Higher value comparison</T>
              </dt>
              <dd>
                <T k="bt-g-ess-d">
                  Two more tick boxes on the printout. Only the retailer code (582-07) has one
                  ticked: “with essential”. The flags are shown exactly as printed, without guessing
                  at their effect.
                </T>
              </dd>
            </div>
          </dl>
        </section>

        <section id="flagged" className="tax-guide">
          <h2>
            <T k="bt-flag-title">Rows kept as printed</T>
          </h2>
          <p>
            <T k="bt-flag-p">
              Figures are copied exactly. Where a printed row looks irregular, it is kept and the
              code carries a note, rather than being corrected here. These codes have a note:
            </T>
          </p>
          <ul className="flag-list">
            {flagged.map(({ code }) => (
              <li key={code.code}>
                <a href={`#${codeAnchor(code.code)}`}>
                  <strong>{code.code}</strong> {code.title}
                </a>
                <span>{code.notes![0]}</span>
              </li>
            ))}
          </ul>
        </section>

        <section id="sources" className="tax-guide">
          <h2>
            <T k="bt-sources-title">Sources</T>
          </h2>
          <p>
            <T k="bt-src-a">Five schedules printed by the Treasurer’s Office on</T> {PRINTED_ON}
            <T k="bt-src-b">
              , each headed “Effectivity: 2014 - Present”. The printouts are not published here;
              every figure on this page is transcribed from them. To see an original, ask the City
              Treasurer’s Office.
            </T>
          </p>
          <ul className="source-list">
            {schedules.map((s) => (
              <li key={s.id}>
                <i className="ph-duotone ph-file-text" aria-hidden="true" />
                <span>
                  <span className="source-name">
                    {s.name}{' '}
                    <span className="muted">
                      · <T k="bt-printed-as">printed as</T> “{s.printedHeading}”
                    </span>
                  </span>
                  <span className="source-meta">
                    {s.source.label} · {s.source.pages}{' '}
                    {s.source.pages === 1 ? <T k="bt-page">page</T> : <T k="bt-pages">pages</T>} ·{' '}
                    <T k="bt-printed">printed</T> {s.source.printed}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </PageShell>
  );
}
