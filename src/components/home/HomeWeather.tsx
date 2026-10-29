import { T } from '@/i18n/LanguageContext';
import { SITE } from '@/config/site';
import WeatherWidget from '@/components/WeatherWidget';
import CityMap from '@/components/CityMap';
import StationDetails from '@/components/StationDetails';

export default function HomeWeather() {
  return (
    <section className="home-sec">
      <div className="container">
        <div className="home-sec-head">
          <h2>
            <T k="home-weather-title">Weather right now</T>
          </h2>
        </div>
        <div className="home-weather">
          <div id="weather-container" aria-live="polite">
            <WeatherWidget />
          </div>
          <div className="home-card home-map-card">
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
    </section>
  );
}
