import Link from 'next/link';
import type { ReactNode } from 'react';
import { T } from '@/i18n/LanguageContext';
import { SITE, CITY_HALL_ADDRESS } from '@/config/site';
import { toTel } from '@/lib/phone';
import SourceLine from '@/components/SourceLine';
import officials from '@/data/officials.json';

const OCM = SITE.hotlines.find((h) => h.id === 'ocm')!.numbers[0];

function Row({ icon, label, children }: { icon: string; label: ReactNode; children: ReactNode }) {
  return (
    <li>
      <i className={`ph-duotone ${icon}`} aria-hidden="true" />
      <b>{label}</b>
      <span className="home-list-val">{children}</span>
    </li>
  );
}

export default function HomeLeadershipContact() {
  return (
    <section className="home-sec home-sec-last">
      <div className="container">
        <div className="home-two" data-reveal-children>
          <div className="home-card home-panel">
            <div className="home-sec-head">
              <h2>
                <T k="home-leadership-title">City leadership</T>
              </h2>
              <Link href="/government" className="home-more">
                <T k="home-all-officials">All officials</T>
                <i className="ph-bold ph-arrow-right" aria-hidden="true" />
              </Link>
            </div>
            <ul className="home-list">
              <Row icon="ph-user-circle" label={<T k="home-city-mayor">City Mayor</T>}>
                {officials.mayor}
              </Row>
              <Row icon="ph-user-circle" label={<T k="home-city-vice-mayor">City Vice Mayor</T>}>
                {officials.viceMayor}
              </Row>
            </ul>
            <SourceLine source={officials.source} checked={officials.checked} />
          </div>

          <div className="home-card home-panel">
            <div className="home-sec-head">
              <h2>
                <T k="home-contact-title">Contact City Hall</T>
              </h2>
              <Link href="/contact" className="home-more">
                <T k="home-directory-link">Directory</T>
                <i className="ph-bold ph-arrow-right" aria-hidden="true" />
              </Link>
            </div>
            <ul className="home-list">
              <Row icon="ph-phone" label={<T k="contact-phone">Phone</T>}>
                <a href={`tel:${toTel(OCM)}`}>{OCM}</a>
              </Row>
              <Row icon="ph-envelope-simple" label={<T k="contact-email">Email</T>}>
                <a href={`mailto:${SITE.cityHall.email}`}>{SITE.cityHall.email}</a>
              </Row>
              <Row icon="ph-buildings" label={SITE.lgu.seatOfGovernment}>
                {CITY_HALL_ADDRESS}
              </Row>
            </ul>
            <SourceLine source={SITE.cityHall.source} checked={SITE.cityHall.checked} />
          </div>
        </div>
      </div>
    </section>
  );
}
