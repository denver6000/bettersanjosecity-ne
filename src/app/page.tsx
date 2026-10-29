import Link from 'next/link';
import { T } from '@/i18n/LanguageContext';
import { SITE } from '@/config/site';
import HomeHero from '@/components/home/HomeHero';
import HomeServices from '@/components/home/HomeServices';
import HomeScholar from '@/components/home/HomeScholar';
import HomeNumbers from '@/components/home/HomeNumbers';
import WeatherWidget from '@/components/WeatherWidget';
import CityMap from '@/components/CityMap';
import StationDetails from '@/components/StationDetails';
import { HomeNews } from '@/components/NewsList';
import '@/styles/scholarship.css';
import '@/styles/home.css';

function SectionLink({ href, k, children }: { href: string; k: string; children: string }) {
  return (
    <Link href={href} className="home-section-link">
      <i className="ph ph-arrow-right" /> <T k={k}>{children}</T>
    </Link>
  );
}

export default function HomePage() {
  return (
    <>
      <HomeHero />

      <HomeServices />
      <HomeScholar />
      <HomeNumbers />

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
                      <i className="ph ph-broadcast" />
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
                <i className="ph ph-phone" />
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
                <i className="ph ph-envelope-simple" />
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
                <i className="ph ph-map-pin" />
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
