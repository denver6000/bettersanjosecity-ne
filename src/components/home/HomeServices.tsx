import Link from 'next/link';
import { T } from '@/i18n/LanguageContext';
import { SERVICE_CATEGORIES } from '@/config/site';

// Tiles are matched to SERVICE_CATEGORIES by name; `k` is the translation key for the label.
const POPULAR = [
  { name: 'Certificates', k: 'home-svc-certificates' },
  { name: 'Business', k: 'home-svc-business' },
  { name: 'Tax Estimator', k: 'home-svc-tax-estimator' },
  { name: 'Social Services', k: 'home-svc-social-services' },
  { name: 'Health', k: 'home-svc-health' },
  { name: 'Agriculture', k: 'home-svc-agriculture' },
];

export default function HomeServices() {
  const tiles = POPULAR.flatMap(({ name, k }) =>
    SERVICE_CATEGORIES.filter((c) => c.name === name).map((c) => ({ c, k }))
  );
  return (
    <section className="home-sec">
      <div className="container">
        <div className="home-sec-head">
          <h2>
            <T k="home-popular-services">Popular services</T>
          </h2>
          <Link href="/services" className="home-more">
            <T k="home-all-services">All services</T>
            <i className="ph-bold ph-arrow-right" aria-hidden="true" />
          </Link>
        </div>
        <div className="home-svc">
          {tiles.map(({ c, k }) => (
            <Link href={'href' in c ? c.href : '/services'} className="home-card" key={c.name}>
              <i className={`ph-duotone ${c.icon}`} aria-hidden="true" />
              <T k={k}>{c.name}</T>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
