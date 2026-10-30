'use client';

import { T, useLanguage } from '@/i18n/LanguageContext';
import ServiceSearch from '@/components/ServiceSearch';

export default function HomeHero() {
  const { t } = useLanguage();
  return (
    <section className="home-hero">
      <svg
        className="home-hero-grain"
        viewBox="0 0 1280 500"
        preserveAspectRatio="xMinYMid slice"
        aria-hidden="true"
      >
        <defs>
          <g id="hero-stalk" fill="none" stroke="#0a2f86" strokeWidth="1.6" strokeLinecap="round">
            <path d="M0 260 C 10 180, 40 110, 95 40" />
            <path d="M30 150 C 60 140, 90 150, 120 175" />
            <g fill="#0a2f86" stroke="none">
              <ellipse cx="88" cy="52" rx="4" ry="9" transform="rotate(35 88 52)" />
              <ellipse cx="78" cy="66" rx="4" ry="9" transform="rotate(30 78 66)" />
              <ellipse cx="68" cy="80" rx="4" ry="9" transform="rotate(28 68 80)" />
              <ellipse cx="59" cy="95" rx="4" ry="9" transform="rotate(24 59 95)" />
              <ellipse cx="51" cy="110" rx="4" ry="9" transform="rotate(20 51 110)" />
              <ellipse cx="100" cy="64" rx="4" ry="9" transform="rotate(60 100 64)" />
              <ellipse cx="90" cy="79" rx="4" ry="9" transform="rotate(58 90 79)" />
              <ellipse cx="80" cy="94" rx="4" ry="9" transform="rotate(55 80 94)" />
              <ellipse cx="71" cy="109" rx="4" ry="9" transform="rotate(50 71 109)" />
            </g>
          </g>
        </defs>
        <g opacity=".06">
          <use href="#hero-stalk" transform="translate(-20 290) scale(1.3)" />
          <use href="#hero-stalk" transform="translate(40 320) scale(1.1) rotate(-8)" />
          <use href="#hero-stalk" transform="translate(470 -40) scale(1.2) rotate(12)" />
          <use href="#hero-stalk" transform="translate(520 0) scale(.9) rotate(20)" />
        </g>
      </svg>

      <div className="home-hero-copy">
        <h1>
          <T k="hero-line-1">Your city.</T>
          <br />
          <T k="hero-line-2">Your services.</T>
          <br />
          <span className="home-hero-accent">
            <T k="hero-line-3">Made simpler.</T>
          </span>
        </h1>
        <p className="home-hero-lede">
          <T k="hero-lede">
            City services, permits and public information for San Jose, in one place.
          </T>
        </p>
        <ServiceSearch />
      </div>

      <div className="home-hero-pic">
        <svg width="0" height="0" focusable="false" aria-hidden="true" className="home-hero-defs">
          <clipPath id="hero-arc" clipPathUnits="objectBoundingBox">
            <path d="M0.16,0 H1 V1 H0.03 C0.14,0.78 0.02,0.42 0.16,0 Z" />
          </clipPath>
        </svg>
        <img
          src="/assets/images/hero/san-jose-rice-fields.jpg"
          alt={t('hero-photo-alt', 'Rice fields and hills in San Jose City')}
          width={1600}
          height={1200}
          fetchPriority="high"
        />
        <svg
          className="home-hero-edge"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M16,0 C2,42 14,78 3,100"
            fill="none"
            stroke="#f2b100"
            strokeWidth="3"
            vectorEffect="non-scaling-stroke"
          />
          <path d="M52,100 C68,94 85,92 100,86 V100 Z" fill="#0a2f86" />
          <path
            d="M52,100 C68,94 85,92 100,86"
            fill="none"
            stroke="#f2b100"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        <span className="home-hero-credit">
          <T k="hero-photo-credit">Photo: Judgefloro (public domain)</T>
        </span>
      </div>
    </section>
  );
}
