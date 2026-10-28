import Link from 'next/link';
import { T } from '@/i18n/LanguageContext';
import { SERVICE_CATEGORIES, SITE } from '@/config/site';
import ServiceSearch from '@/components/ServiceSearch';
import WeatherWidget from '@/components/WeatherWidget';
import CityMap from '@/components/CityMap';
import StationDetails from '@/components/StationDetails';
import { HomeNews } from '@/components/NewsList';
import ScholarLookup from '@/components/ScholarLookup';
import '@/styles/scholarship.css';

// TODO(data): fill from src/data/demographics.json once official figures arrive.
const STATS = [
  { href: '/statistics', icon: 'bi-people-fill', label: 'Population', source: 'PSA Census' },
  {
    href: '/government',
    icon: 'bi-geo-alt-fill',
    label: 'Barangays',
    source: 'Administrative Units',
  },
  { href: '/budget', icon: 'bi-award-fill', label: 'Income Class', source: 'Component City' },
  { href: '/statistics', icon: 'bi-rulers', label: 'Land Area', source: 'Total City Area' },
];

function SectionLink({ href, k, children }: { href: string; k: string; children: string }) {
  return (
    <Link href={href} className="home-section-link">
      <i className="bi bi-arrow-right" /> <T k={k}>{children}</T>
    </Link>
  );
}

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="home-hero-v2">
        <div className="container">
          <div className="home-hero-v2-inner">
            <div className="home-hero-v2-text">
              <h1>
                <T k="hero-welcome">Welcome to Better San Jose</T>
              </h1>
              <p>
                <T k="hero-subtitle">
                  Access government services, information, and resources for the people of San Jose
                  City, Nueva Ecija.
                </T>
              </p>
              <div className="home-hero-v2-actions">
                <Link href="/services" className="btn btn-primary">
                  <i className="bi bi-arrow-right" />{' '}
                  <T k="home-browse-services">Browse Services</T>
                </Link>
                <Link href="/contact" className="btn btn-outline">
                  <T k="home-contact-us">Contact Us</T>
                </Link>
              </div>
            </div>
            <div className="home-hero-v2-search">
              <ServiceSearch />
            </div>
          </div>
        </div>
      </section>

      {/* Quick Access Services */}
      <section className="section">
        <div className="container">
          <div className="home-section-header">
            <h2>
              <T k="section-popular">Popular Services</T>
            </h2>
            <p>Quick access to frequently requested city services</p>
          </div>
          <div className="home-services-grid">
            {SERVICE_CATEGORIES.slice(0, 5).map((c) => (
              <Link
                href={'href' in c ? c.href : '/services'}
                className="home-service-card"
                key={c.name}
              >
                <div className="home-service-icon">
                  <i className={`bi ${c.icon}`} />
                </div>
                <div className="home-service-content">
                  <h3>{c.name}</h3>
                  <p>{c.desc}</p>
                </div>
                <i className="bi bi-arrow-right home-service-arrow" />
              </Link>
            ))}
            <Link href="/services" className="home-service-card home-service-card--all">
              <div className="home-service-icon">
                <i className="bi bi-grid-fill" />
              </div>
              <div className="home-service-content">
                <h3>
                  <T k="btn-view-all-services">View All Services</T>
                </h3>
                <p>Browse complete directory</p>
              </div>
              <i className="bi bi-arrow-right home-service-arrow" />
            </Link>
          </div>
        </div>
      </section>

      {/* At a Glance */}
      <section className="home-stats-v2">
        <div className="container">
          <div className="home-stats-v2-header">
            <h2>{SITE.lgu.shortName} at a Glance</h2>
            <SectionLink href="/statistics" k="home-view-statistics">
              View Statistics
            </SectionLink>
          </div>
          <div className="home-stats-v2-grid">
            {STATS.map((s) => (
              <Link href={s.href} className="home-stat-card" key={s.label}>
                <div className="home-stat-card-icon">
                  <i className={`bi ${s.icon}`} />
                </div>
                <div className="home-stat-card-content">
                  <span className="home-stat-card-value stat-pending">&mdash;</span>
                  <span className="home-stat-card-label">{s.label}</span>
                  <span className="home-stat-card-source">{s.source}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Weather station */}
      <section className="section weather-map-section">
        <div className="container">
          <div className="home-stats-v2-header station-section-header">
            <div>
              <h2>Weather Station Data</h2>
              <p>
                Live readings from the {SITE.weatherStation.name} weather station, and where it is
                located.
              </p>
            </div>
          </div>
          <div className="weather-map-grid">
            <div className="weather-column">
              <div id="weather-container" aria-live="polite">
                <WeatherWidget />
              </div>
            </div>
            <div className="map-column">
              <div className="map-card">
                <CityMap />
                <p className="map-attribution station-map-legend">
                  <span>
                    <span className="legend-pin" aria-hidden="true">
                      <i className="bi bi-broadcast" />
                    </span>
                    Weather station
                  </span>
                  <span>
                    <span className="legend-radius" aria-hidden="true" />
                    {SITE.weatherStation.radiusKm} km radius around the station
                  </span>
                </p>
                <StationDetails />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Scholar lookup */}
      <section className="section home-scholar-section">
        <div className="container">
          <div className="home-stats-v2-header station-section-header">
            <div>
              <h2>City Scholarship Program</h2>
              <p>
                Scholars: enter your Student ID to check your payout status and which requirements
                are still missing.
              </p>
            </div>
            <Link href="/scholarship" className="home-section-link">
              <i className="bi bi-arrow-right" /> Program details
            </Link>
          </div>
          <div className="scholar-page">
            <ScholarLookup heading={false} />
          </div>
        </div>
      </section>

      {/* Latest Updates */}
      <section className="section">
        <div className="container">
          <div className="home-section-header">
            <h2>
              <T k="section-updates">Latest Updates</T>
            </h2>
            <SectionLink href="/news" k="home-view-all">
              View All
            </SectionLink>
          </div>
          <div className="home-news-grid" id="home-news-grid">
            <HomeNews />
          </div>
        </div>
      </section>

      {/* City Leadership — TODO(data): fill from src/data/officials.json */}
      <section className="section home-leadership-section">
        <div className="container">
          <div className="home-section-header">
            <h2>City Leadership</h2>
            <SectionLink href="/government" k="home-view-all-officials">
              View All Officials
            </SectionLink>
          </div>
          <div className="home-leadership-grid">
            {['City Mayor', 'City Vice Mayor'].map((title) => (
              <div className="home-leader-card" key={title}>
                <div className="home-leader-badge">{title}</div>
                <h3 className="stat-pending">To be announced</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact — TODO(data): verified City Hall contacts */}
      <section className="section">
        <div className="container">
          <div className="home-section-header">
            <h2>
              <T k="section-contact">Contact Information</T>
            </h2>
            <SectionLink href="/contact" k="home-view-all">
              View All
            </SectionLink>
          </div>
          <div className="home-contact-v2-grid">
            <div className="home-contact-v2-card">
              <div className="home-contact-v2-icon">
                <i className="bi bi-telephone-fill" />
              </div>
              <div className="home-contact-v2-content">
                <h3>
                  <T k="contact-phone">Phone</T>
                </h3>
                <p className="home-contact-v2-value stat-pending">Coming soon</p>
                <span className="home-contact-v2-note">Mon-Fri: 8:00 AM - 5:00 PM</span>
              </div>
            </div>
            <div className="home-contact-v2-card">
              <div className="home-contact-v2-icon">
                <i className="bi bi-envelope-fill" />
              </div>
              <div className="home-contact-v2-content">
                <h3>
                  <T k="contact-email">Email</T>
                </h3>
                <p className="home-contact-v2-value stat-pending">Coming soon</p>
              </div>
            </div>
            <div className="home-contact-v2-card">
              <div className="home-contact-v2-icon">
                <i className="bi bi-geo-alt-fill" />
              </div>
              <div className="home-contact-v2-content">
                <h3>
                  <T k="contact-address">Address</T>
                </h3>
                <p className="home-contact-v2-value">{SITE.lgu.seatOfGovernment}</p>
                <span className="home-contact-v2-note">
                  {SITE.lgu.name}, {SITE.lgu.province} {SITE.lgu.postalCode}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
