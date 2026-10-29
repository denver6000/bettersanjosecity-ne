import Link from 'next/link';
import { T } from '@/i18n/LanguageContext';
import ComingSoon from '@/components/ComingSoon';

// TODO(data): fill from src/data/demographics.json once official figures arrive.
const NUMBERS = [
  { href: '/statistics', icon: 'ph-users-three', label: 'Population' },
  { href: '/government', icon: 'ph-map-trifold', label: 'Barangays' },
  { href: '/budget', icon: 'ph-chart-line-up', label: 'Income class' },
  { href: '/statistics', icon: 'ph-ruler', label: 'Land area' },
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
              <span className="home-number-value">&mdash;</span>
              <b>{n.label}</b>
              <ComingSoon />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
