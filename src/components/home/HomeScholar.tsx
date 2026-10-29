import Link from 'next/link';
import { T } from '@/i18n/LanguageContext';
import ScholarLookup from '@/components/ScholarLookup';

export default function HomeScholar() {
  return (
    <section className="home-sec">
      <div className="container">
        <div className="home-scholar">
          <div>
            <h2>
              <T k="home-scholar-title">Check your scholarship</T>
            </h2>
            <p className="home-scholar-lede">
              <T k="home-scholar-lede">
                City scholars: see your payout status and missing requirements.
              </T>
            </p>
            <Link href="/scholarship" className="home-scholar-details">
              <T k="home-scholar-details">Program details</T>
              <i className="ph-bold ph-arrow-right" aria-hidden="true" />
            </Link>
          </div>
          <ScholarLookup heading={false} submitLabel={<T k="home-scholar-check">Check</T>} />
        </div>
      </div>
    </section>
  );
}
