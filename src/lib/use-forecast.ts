'use client';

import { useEffect, useState } from 'react';
import { SITE } from '@/config/site';
import { buildForecastUrl, isForecast, parseForecast, type Forecast } from './forecast';

const CACHE_KEY = 'lgu_weather_cache_v3';
const CACHE_TTL = 30 * 60 * 1000;

function readCache(): Forecast | null {
  try {
    const entry = JSON.parse(localStorage.getItem(CACHE_KEY) ?? 'null');
    return entry && Date.now() < entry.expiresAt && isForecast(entry.data) ? entry.data : null;
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

// Every component that asks at the same time shares this one request.
let inflight: Promise<Forecast> | null = null;

function fetchShared(): Promise<Forecast> {
  if (!inflight) {
    inflight = fetch(buildForecastUrl(SITE.coordinates.lat, SITE.coordinates.lon))
      .then((res) => {
        if (!res.ok) throw new Error(`Weather API ${res.status}`);
        return res.json();
      })
      .then((json) => {
        const manilaHour =
          Number(
            new Intl.DateTimeFormat('en-US', {
              hour: 'numeric',
              hour12: false,
              timeZone: 'Asia/Manila',
            }).format(new Date())
          ) % 24;
        const data = parseForecast(json, manilaHour);
        writeCache(data);
        return data;
      })
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}

/** Open-Meteo forecast shared by the weather section and the hero; `retry` forces a refetch. */
export function useForecast() {
  const [forecast, setForecast] = useState<Forecast | null>(null);
  const [failed, setFailed] = useState(false);

  const load = () => {
    setFailed(false);
    fetchShared()
      .then(setForecast)
      .catch(() => setFailed(true));
  };

  useEffect(() => {
    const cached = readCache();
    if (cached) setForecast(cached);
    else load();
  }, []);

  return { forecast, failed, retry: load };
}
