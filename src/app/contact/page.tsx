import type { Metadata } from 'next';
import PageShell from '@/components/PageShell';
import SourceLine from '@/components/SourceLine';
import { T } from '@/i18n/LanguageContext';
import { SITE, CITY_HALL_ADDRESS } from '@/config/site';
import { toTel } from '@/lib/phone';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Contact information and emergency hotlines for San Jose City, Nueva Ecija.',
  alternates: { canonical: '/contact/' },
};

function Hotlines({ emergency }: { emergency: boolean }) {
  return (
    <ul className="hotline-list">
      {SITE.hotlines
        .filter((h) => h.emergency === emergency)
        .map((h) => (
          <li key={h.id} className="hotline">
            <span className="hotline-label">
              <T k={`hotline-${h.id}`}>{h.label}</T>
            </span>
            <span className="hotline-numbers">
              {h.numbers.map((n) => (
                <a key={n} href={`tel:${toTel(n)}`} className="hotline-number">
                  <i className="ph ph-phone" aria-hidden="true" />
                  {n}
                </a>
              ))}
            </span>
          </li>
        ))}
    </ul>
  );
}

export default function ContactPage() {
  return (
    <PageShell
      k="contact"
      badge="Contact"
      title="Contact & hotlines"
      subtitle="Reach the City Government of San Jose and its emergency services"
    >
      <section id="visit" className="page-section">
        <h2>
          <T k="contact-visit">Visit City Hall</T>
        </h2>
        <dl className="contact-facts">
          <div>
            <dt>
              <i className="ph-duotone ph-map-pin" aria-hidden="true" />
              <T k="contact-address">Address</T>
            </dt>
            <dd>{CITY_HALL_ADDRESS}</dd>
          </div>
          <div>
            <dt>
              <i className="ph-duotone ph-clock" aria-hidden="true" />
              <T k="contact-hours">Office hours</T>
            </dt>
            <dd>
              <T k="city-hall-hours">Monday to Friday, 8:00 AM to 5:00 PM</T>
            </dd>
          </div>
          <div>
            <dt>
              <i className="ph-duotone ph-envelope-simple" aria-hidden="true" />
              <T k="contact-email">Email</T>
            </dt>
            <dd>
              <a href={`mailto:${SITE.cityHall.email}`}>{SITE.cityHall.email}</a>
            </dd>
          </div>
        </dl>
      </section>

      <section id="hotlines" className="page-section">
        <h2>
          <T k="contact-hotlines">Hotlines</T>
        </h2>
        <h3 className="hotline-group">
          <T k="contact-hotlines-emergency">Emergency</T>
        </h3>
        <Hotlines emergency />
        <h3 className="hotline-group">
          <T k="contact-hotlines-offices">City offices and services</T>
        </h3>
        <Hotlines emergency={false} />
      </section>

      <SourceLine source={SITE.cityHall.source} checked={SITE.cityHall.checked} />
    </PageShell>
  );
}
