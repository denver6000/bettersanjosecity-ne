'use client';

import { useEffect, useState } from 'react';
import { LGU_LABEL, SITE } from '@/config/site';
import {
  compass,
  heatIndexLevel,
  manilaTime,
  msToKmh,
  timeAgo,
  useStation,
  uvLevel,
  type StationReading,
} from '@/lib/station';

const CACHE_KEY = 'lgu_weather_cache';
const CACHE_TTL = 30 * 60 * 1000;

const CODES: Record<number, { condition: string; icon: string }> = {
  0: { condition: 'Clear sky', icon: 'ph-sun' },
  1: { condition: 'Mainly clear', icon: 'ph-cloud-sun' },
  2: { condition: 'Partly cloudy', icon: 'ph-cloud-sun' },
  3: { condition: 'Overcast', icon: 'ph-cloud' },
  45: { condition: 'Foggy', icon: 'ph-cloud-fog' },
  48: { condition: 'Depositing rime fog', icon: 'ph-cloud-fog' },
  51: { condition: 'Light drizzle', icon: 'ph-cloud-rain' },
  53: { condition: 'Moderate drizzle', icon: 'ph-cloud-rain' },
  55: { condition: 'Dense drizzle', icon: 'ph-cloud-rain' },
  61: { condition: 'Slight rain', icon: 'ph-cloud-rain' },
  63: { condition: 'Moderate rain', icon: 'ph-cloud-rain' },
  65: { condition: 'Heavy rain', icon: 'ph-cloud-rain' },
  80: { condition: 'Rain showers', icon: 'ph-cloud-rain' },
  95: { condition: 'Thunderstorm', icon: 'ph-cloud-lightning' },
};
const mapCode = (code: number) =>
  CODES[code] ?? { condition: 'Partly cloudy', icon: 'ph-cloud-sun' };

/** Open-Meteo model data: the sky condition and hourly forecast the station can't give. */
interface Forecast {
  temperature: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  icon: string;
  hourly: { time: string; icon: string; temperature: number }[];
}

function readCache(): Forecast | null {
  try {
    const entry = JSON.parse(localStorage.getItem(CACHE_KEY) ?? 'null');
    return entry && Date.now() < entry.expiresAt && entry.data?.hourly ? entry.data : null;
  } catch {
    return null;
  }
}

function writeCache(data: Forecast) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data, expiresAt: Date.now() + CACHE_TTL }));
  } catch {
    // Storage unavailable; we'll just refetch next time.
  }
}

async function fetchForecast(): Promise<Forecast> {
  const params = new URLSearchParams({
    latitude: String(SITE.coordinates.lat),
    longitude: String(SITE.coordinates.lon),
    current: 'temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m',
    hourly: 'temperature_2m,weather_code',
    timezone: 'Asia/Manila',
    forecast_days: '2',
  });
  const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
  if (!res.ok) throw new Error(`Weather API ${res.status}`);
  const { current, hourly } = await res.json();

  // Hourly arrays are in Manila time (timezone param); start from the next full hour.
  const manilaHour =
    Number(
      new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        hour12: false,
        timeZone: 'Asia/Manila',
      }).format(new Date())
    ) % 24;
  const next: Forecast['hourly'] = [];
  for (let i = 1; i <= 4 && manilaHour + i < hourly.time.length; i++) {
    const idx = manilaHour + i;
    const hour = idx % 24;
    next.push({
      time: `${hour % 12 || 12} ${hour >= 12 ? 'PM' : 'AM'}`,
      icon: mapCode(hourly.weather_code[idx]).icon,
      temperature: Math.round(hourly.temperature_2m[idx]),
    });
  }

  return {
    temperature: Math.round(current.temperature_2m),
    humidity: current.relative_humidity_2m,
    windSpeed: Math.round(current.wind_speed_10m),
    ...mapCode(current.weather_code),
    hourly: next,
  };
}

function useForecast() {
  const [forecast, setForecast] = useState<Forecast | null>(null);
  const [failed, setFailed] = useState(false);

  const load = () => {
    setFailed(false);
    fetchForecast()
      .then((data) => {
        writeCache(data);
        setForecast(data);
      })
      .catch(() => setFailed(true));
  };

  useEffect(() => {
    const cached = readCache();
    if (cached) setForecast(cached);
    else load();
  }, []);

  return { forecast, failed, retry: load };
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
  const uv = r.uv_index != null ? uvLevel(r.uv_index) : null;
  return (
    <div className="station-tiles" role="list" aria-label="Station readings">
      {r.humidity_pct != null && (
        <Tile icon="ph-drop" label="Humidity" value={`${Math.round(r.humidity_pct)}%`} />
      )}
      {r.wind_speed_ms != null && (
        <Tile
          icon="ph-wind"
          label="Wind"
          value={`${msToKmh(r.wind_speed_ms)} km/h`}
          note={
            r.wind_direction_deg != null
              ? `from ${compass(r.wind_direction_deg)} (${Math.round(r.wind_direction_deg)}°)`
              : undefined
          }
        />
      )}
      {r.precipitation_mm != null && (
        <Tile
          icon="ph-cloud-rain"
          label="Rain now"
          value={`${r.precipitation_mm.toFixed(1)} mm`}
          note="latest reading"
        />
      )}
      {r.hourly_precipitation_mm != null && (
        <Tile
          icon="ph-cloud-rain"
          label="Rain"
          value={`${r.hourly_precipitation_mm.toFixed(1)} mm`}
          note="past hour"
        />
      )}
      {uv && r.uv_index != null && (
        <Tile
          icon="ph-sun"
          label="UV index"
          value={String(Math.round(r.uv_index))}
          note={uv.label}
          tone={uv.tone}
        />
      )}
      {r.pressure_hpa != null && (
        <Tile icon="ph-gauge" label="Pressure" value={`${Math.round(r.pressure_hpa)} hPa`} />
      )}
      {r.light_lux != null && (
        <Tile icon="ph-sun" label="Light" value={`${Math.round(r.light_lux / 1000)}k lux`} />
      )}
      {r.distance != null && (
        <Tile icon="ph-ruler" label="Sensor distance" value={String(r.distance)} />
      )}
    </div>
  );
}

function Hourly({ forecast }: { forecast: Forecast }) {
  if (!forecast.hourly.length) return null;
  return (
    <>
      <div className="station-forecast-label">Forecast</div>
      <div className="weather-hourly" role="list" aria-label="Hourly forecast">
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
  const r = station?.reading;

  // Live station: real measurements, with the model's sky condition and forecast alongside.
  if (status === 'live' && station && r && r.temperature_c != null) {
    const hi = r.heat_index_c != null ? heatIndexLevel(r.heat_index_c) : null;
    return (
      <div
        className="weather-widget station-widget"
        role="region"
        aria-label={`Live weather from ${station.name}`}
      >
        <div className="station-header">
          <span className="station-live">
            <span className="station-live-dot" aria-hidden="true" /> Live
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
            {forecast && <div className="weather-current-condition">{forecast.condition}</div>}
            <div className="weather-current-location">
              <i className="ph ph-map-pin" aria-hidden="true" /> {LGU_LABEL}
            </div>
          </div>
        </div>

        {hi && r.heat_index_c != null && (
          <div className={`station-heat tone-${hi.tone}`}>
            <span>
              <i className="ph-duotone ph-thermometer-hot" aria-hidden="true" /> Heat index{' '}
              <strong>{Math.round(r.heat_index_c)}°C</strong>
            </span>
            <span className="station-heat-level">{hi.label}</span>
          </div>
        )}

        <StationTiles r={r} />

        {forecast && <Hourly forecast={forecast} />}

        <p className="station-updated">
          Updated {timeAgo(r.recorded_at, now)} ({manilaTime(r.recorded_at)}) &middot; KloudTrack
          weather station
        </p>
      </div>
    );
  }

  if (status === 'loading' && !forecast) {
    return (
      <div className="weather-loading" aria-busy="true" aria-label="Loading weather data">
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
      <div className="weather-widget" role="region" aria-label="Weather unavailable">
        <p>Weather data is unavailable right now.</p>
        {failed && (
          <button
            type="button"
            className="btn btn-sm btn-primary weather-retry-btn"
            onClick={retry}
          >
            Try again
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className="weather-widget"
      role="region"
      aria-label={`Current weather in ${SITE.lgu.name}`}
    >
      <div className="weather-current">
        <div className="weather-current-icon" aria-hidden="true">
          <i className={`ph-duotone ${forecast.icon}`} />
        </div>
        <div className="weather-current-info">
          <div className="weather-current-temp">{forecast.temperature}°C</div>
          <div className="weather-current-condition">{forecast.condition}</div>
          <div className="weather-current-location">
            <i className="ph ph-map-pin" aria-hidden="true" /> {LGU_LABEL}
          </div>
        </div>
      </div>
      <div className="weather-stats" role="list" aria-label="Weather details">
        <div
          className="weather-stat"
          role="listitem"
          aria-label={`Humidity ${forecast.humidity} percent`}
        >
          <i className="ph-duotone ph-drop" aria-hidden="true" />
          <span>{forecast.humidity}%</span>
        </div>
        <div
          className="weather-stat"
          role="listitem"
          aria-label={`Wind speed ${forecast.windSpeed} km/h`}
        >
          <i className="ph-duotone ph-wind" aria-hidden="true" />
          <span>{forecast.windSpeed} km/h</span>
        </div>
      </div>
      <Hourly forecast={forecast} />
      {status !== 'loading' && (
        <p className="station-updated">
          {status === 'offline' && r
            ? `Weather station offline since ${timeAgo(r.recorded_at, now)}; showing model estimate (Open-Meteo).`
            : 'Model estimate (Open-Meteo).'}
        </p>
      )}
    </div>
  );
}
