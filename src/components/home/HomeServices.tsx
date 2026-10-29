import Link from 'next/link';
import { T } from '@/i18n/LanguageContext';
import { SERVICE_CATEGORIES } from '@/config/site';

const POPULAR = [
  'Certificates',
  'Business',
  'Tax Estimator',
  'Social Services',
  'Health',
  'Agriculture',
];

export default function HomeServices() {
  const tiles = POPULAR.flatMap((name) => SERVICE_CATEGORIES.filter((c) => c.name === name));
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
          {tiles.map((c) => (
            <Link href={'href' in c ? c.href : '/services'} className="home-card" key={c.name}>
              <i className={`ph-duotone ${c.icon}`} aria-hidden="true" />
              {c.name}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
