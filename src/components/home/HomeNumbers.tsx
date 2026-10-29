import Link from 'next/link';
import { T } from '@/i18n/LanguageContext';
import ComingSoon from '@/components/ComingSoon';

// TODO(data): fill from src/data/demographics.json once official figures arrive.
const NUMBERS = [
  { href: '/statistics', icon: 'ph-users-three', k: 'home-num-population', label: 'Population' },
  { href: '/government', icon: 'ph-map-trifold', k: 'home-num-barangays', label: 'Barangays' },
  { href: '/budget', icon: 'ph-chart-line-up', k: 'home-num-income-class', label: 'Income class' },
  { href: '/statistics', icon: 'ph-ruler', k: 'home-num-land-area', label: 'Land area' },
];

export default function HomeNumbers() {
  return (
    <section className="home-sec">
      <div className="container">
        <div className="home-sec-head">
          <h2>
            <T k="home-numbers-title">San Jose in numbers</T>
          </h2>
          <Link href="/statistics" className="home-more">
            <T k="home-statistics-link">Statistics</T>
            <i className="ph-bold ph-arrow-right" aria-hidden="true" />
          </Link>
        </div>
        <div className="home-numbers">
          {NUMBERS.map((n) => (
            <Link href={n.href} className="home-card" key={n.label}>
              <i className={`ph-duotone ${n.icon}`} aria-hidden="true" />
              <span className="home-number-value" aria-hidden="true">
                &mdash;
              </span>
              <b>
                <T k={n.k}>{n.label}</T>
              </b>
              <ComingSoon />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
