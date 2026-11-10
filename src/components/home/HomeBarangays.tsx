import { T } from '@/i18n/LanguageContext';
import BarangayMap from '@/components/BarangayMap';

export default function HomeBarangays() {
  return (
    <section className="home-sec">
      <div className="container">
        <div className="home-sec-head" data-reveal>
          <h2>
            <T k="home-barangays-title">Explore your barangay</T>
          </h2>
          <p>
            <T k="home-barangays-sub">Tap an area to zoom in.</T>
          </p>
        </div>
        <div className="home-card" data-reveal>
          <BarangayMap />
        </div>
      </div>
    </section>
  );
}
