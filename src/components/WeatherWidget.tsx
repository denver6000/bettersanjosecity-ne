'use client';

import { useEffect, useState } from 'react';
import { LGU_LABEL, SITE } from '@/config/site';
import { useLanguage } from '@/i18n/LanguageContext';
import type { Forecast } from '@/lib/forecast';
import { useForecast } from '@/lib/use-forecast';
import {
  compass,
  heatIndexLevel,
  manilaTime,
  msToKmh,
  useStation,
  uvLevel,
  type StationReading,
} from '@/lib/station';

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-');

type Tr = (key: string, fallback?: string) => string;

/** "5 min ago" in the visitor's language. */
function ago(iso: string, now: number, t: Tr) {
  const mins = Math.floor((now - new Date(iso).getTime()) / 60000);
  if (mins < 1) return t('wx-ago-now', 'just now');
  if (mins < 60) return t('wx-ago-min', '{n} min ago').replace('{n}', String(mins));
  const h = Math.floor(mins / 60);
  if (h < 24) return t('wx-ago-hr', '{n} hr ago').replace('{n}', String(h));
  const d = Math.floor(h / 24);
  return d === 1
    ? t('wx-ago-day', '{n} day ago').replace('{n}', '1')
    : t('wx-ago-days', '{n} days ago').replace('{n}', String(d));
}

/** Re-render every 30s so "updated N min ago" stays current between refreshes. */
function useNow() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30 * 1000);
    return () => clearInterval(t);
  }, []);
  return now;
}

function Tile({
  icon,
  label,
  value,
  note,
  tone,
}: {
  icon: string;
  label: string;
  value: string;
  note?: string;
  tone?: string;
}) {
  return (
    <div className="station-tile" role="listitem">
      <span className="station-tile-label">
        <i className={`ph-duotone ${icon}`} aria-hidden="true" /> {label}
      </span>
      <span className="station-tile-value">{value}</span>
      {note && <span className={`station-tile-note${tone ? ` tone-${tone}` : ''}`}>{note}</span>}
    </div>
  );
}

function StationTiles({ r }: { r: StationReading }) {
  const { t } = useLanguage();
  const uv = r.uv_index != null ? uvLevel(r.uv_index) : null;
  return (
    <div className="station-tiles" role="list" aria-label={t('wx-readings', 'Station readings')}>
      {r.humidity_pct != null && (
        <Tile
          icon="ph-drop"
          label={t('wx-humidity', 'Humidity')}
          value={`${Math.round(r.humidity_pct)}%`}
        />
      )}
      {r.wind_speed_ms != null && (
        <Tile
          icon="ph-wind"
          label={t('wx-wind', 'Wind')}
          value={`${msToKmh(r.wind_speed_ms)} km/h`}
          note={
            r.wind_direction_deg != null
              ? `${t('wx-from', 'From')} ${compass(r.wind_direction_deg)} (${Math.round(r.wind_direction_deg)}°)`
              : undefined
          }
        />
      )}
      {r.precipitation_mm != null && (
        <Tile
          icon="ph-cloud-rain"
          label={t('wx-rain-now', 'Rain now')}
          value={`${r.precipitation_mm.toFixed(1)} mm`}
          note={t('wx-latest-reading', 'Latest reading')}
        />
      )}
      {r.hourly_precipitation_mm != null && (
        <Tile
          icon="ph-cloud-rain"
          label={t('wx-rain', 'Rain')}
          value={`${r.hourly_precipitation_mm.toFixed(1)} mm`}
          note={t('wx-past-hour', 'Past hour')}
        />
      )}
      {uv && r.uv_index != null && (
        <Tile
          icon="ph-sun"
          label={t('wx-uv-index', 'UV index')}
          value={String(Math.round(r.uv_index))}
          note={t(`wx-level-${slug(uv.label)}`, uv.label)}
          tone={uv.tone}
        />
      )}
      {r.pressure_hpa != null && (
        <Tile
          icon="ph-gauge"
          label={t('wx-pressure', 'Pressure')}
          value={`${Math.round(r.pressure_hpa)} hPa`}
        />
      )}
      {r.distance != null && (
        <Tile
          icon="ph-ruler"
          label={t('wx-sensor-distance', 'Sensor distance')}
          value={String(r.distance)}
        />
      )}
    </div>
  );
}

function Hourly({ forecast }: { forecast: Forecast }) {
  const { t } = useLanguage();
  if (!forecast.hourly.length) return null;
  return (
    <>
      <div className="station-forecast-label">{t('wx-forecast', 'Forecast')}</div>
      <div className="weather-hourly" role="list" aria-label={t('wx-hourly', 'Hourly forecast')}>
        {forecast.hourly.map((h) => (
          <div className="weather-hour" role="listitem" key={h.time}>
            <span className="weather-hour-time">{h.time}</span>
            <i className={`ph-duotone ${h.icon}`} aria-hidden="true" />
            <span className="weather-hour-temp">{h.temperature}°</span>
          </div>
        ))}
      </div>
    </>
  );
}

export default function WeatherWidget() {
  const { station, status } = useStation();
  const { forecast, failed, retry } = useForecast();
  const now = useNow();
  const { t } = useLanguage();
  const r = station?.reading;
  const sky = (c: string) => t(`wx-${slug(c)}`, c);

  // Live station: real measurements, with the model's sky condition and forecast alongside.
  if (status === 'live' && station && r && r.temperature_c != null) {
    const hi = r.heat_index_c != null ? heatIndexLevel(r.heat_index_c) : null;
    return (
      <div
        className="weather-widget station-widget"
        role="region"
        aria-label={t('wx-live-region', 'Live weather from {name}').replace('{name}', station.name)}
      >
        <div className="station-header">
          <span className="station-live">
            <span className="station-live-dot" aria-hidden="true" /> {t('wx-live', 'Live')}
          </span>
          <span className="station-name" title={station.address}>
            {station.name}
          </span>
        </div>

        <div className="weather-current">
          <div className="weather-current-icon" aria-hidden="true">
            <i className={`ph-duotone ${forecast?.icon ?? 'ph-thermometer'}`} />
          </div>
          <div className="weather-current-info">
            <div className="weather-current-temp">{r.temperature_c.toFixed(1)}°C</div>
            {forecast && <div className="weather-current-condition">{sky(forecast.condition)}</div>}
            <div className="weather-current-location">
              <i className="ph ph-map-pin" aria-hidden="true" /> {LGU_LABEL}
            </div>
          </div>
        </div>

        {hi && r.heat_index_c != null && (
          <div className={`station-heat tone-${hi.tone}`}>
            <span>
              <i className="ph-duotone ph-thermometer-hot" aria-hidden="true" />{' '}
              {t('wx-heat-index', 'Heat index')} <strong>{Math.round(r.heat_index_c)}°C</strong>
            </span>
            <span className="station-heat-level">{t(`wx-level-${slug(hi.label)}`, hi.label)}</span>
          </div>
        )}

        <StationTiles r={r} />

        {forecast && <Hourly forecast={forecast} />}

        <p className="station-updated">
          {t('wx-updated', 'Updated {ago} ({time}) · KloudTrack weather station')
            .replace('{ago}', ago(r.recorded_at, now, t))
            .replace('{time}', manilaTime(r.recorded_at))}
        </p>
      </div>
    );
  }

  if (status === 'loading' && !forecast) {
    return (
      <div
        className="weather-loading"
        aria-busy="true"
        aria-label={t('wx-loading', 'Loading weather data')}
      >
        <div className="weather-current">
          <div className="skeleton-circle" />
          <div className="weather-current-info">
            <div className="skeleton-text skeleton-lg" />
            <div className="skeleton-text skeleton-md" style={{ marginTop: 8 }} />
          </div>
        </div>
      </div>
    );
  }

  // No live station: fall back to the Open-Meteo model.
  if (!forecast) {
    return (
      <div
        className="weather-widget"
        role="region"
        aria-label={t('wx-unavailable-region', 'Weather unavailable')}
      >
        <p>{t('wx-unavailable-text', 'Weather data is unavailable right now.')}</p>
        {failed && (
          <button
            type="button"
            className="btn btn-sm btn-primary weather-retry-btn"
            onClick={retry}
          >
            {t('wx-retry', 'Try again')}
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className="weather-widget"
      role="region"
      aria-label={t('wx-current-in', 'Current weather in {name}').replace('{name}', SITE.lgu.name)}
    >
      <div className="weather-current">
        <div className="weather-current-icon" aria-hidden="true">
          <i className={`ph-duotone ${forecast.icon}`} />
        </div>
        <div className="weather-current-info">
          <div className="weather-current-temp">{forecast.temperature}°C</div>
          <div className="weather-current-condition">{sky(forecast.condition)}</div>
          <div className="weather-current-location">
            <i className="ph ph-map-pin" aria-hidden="true" /> {LGU_LABEL}
          </div>
        </div>
      </div>
      <div className="weather-stats" role="list" aria-label={t('wx-details', 'Weather details')}>
        <div
          className="weather-stat"
          role="listitem"
          aria-label={t('wx-humidity-aria', 'Humidity {n} percent').replace(
            '{n}',
            String(forecast.humidity)
          )}
        >
          <i className="ph-duotone ph-drop" aria-hidden="true" />
          <span>{forecast.humidity}%</span>
        </div>
        <div
          className="weather-stat"
          role="listitem"
          aria-label={t('wx-wind-aria', 'Wind speed {n} km/h').replace(
            '{n}',
            String(forecast.windSpeed)
          )}
        >
          <i className="ph-duotone ph-wind" aria-hidden="true" />
          <span>{forecast.windSpeed} km/h</span>
        </div>
      </div>
      <Hourly forecast={forecast} />
      {status !== 'loading' && (
        <p className="station-updated">
          <span className="station-live-dot is-off" aria-hidden="true" />
          {status === 'offline' && r
            ? t(
                'wx-offline',
                'Weather station offline since {ago}; showing model estimate (Open-Meteo).'
              ).replace('{ago}', ago(r.recorded_at, now, t))
            : t('wx-model', 'Model estimate (Open-Meteo).')}
        </p>
      )}
    </div>
  );
}
