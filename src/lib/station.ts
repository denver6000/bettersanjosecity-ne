'use client';

/**
 * Live weather station (KloudTrack) readings via public/api/weather-station.php.
 * Every component using `useStation()` shares one request and one refresh timer.
 *
 * Polling is driven by visitors, not a server cron: an open, visible tab asks every
 * REFRESH_MS (and right away when the visitor returns to it), and the PHP proxy caches
 * KloudTrack for 60s, so the upstream API sees at most one call a minute in total.
 */
import { useEffect, useState } from 'react';

export const STATION_ENDPOINT = '/api/weather-station.php';
export const REFRESH_MS = 5 * 60 * 1000;
const TICK_MS = 30 * 1000;
/** A reading older than this is treated as the station being offline. */
export const OFFLINE_AFTER_MS = 30 * 60 * 1000;

export interface StationReading {
  id: string | null;
  recorded_at: string;
  temperature_c: number | null;
  humidity_pct: number | null;
  heat_index_c: number | null;
  pressure_hpa: number | null;
  wind_speed_ms: number | null;
  /** Where the wind blows from, degrees clockwise from north. */
  wind_direction_deg: number | null;
  precipitation_mm: number | null;
  hourly_precipitation_mm: number | null;
  uv_index: number | null;
  light_lux: number | null;
  /** Range-sensor distance (e.g. water level); null on stations without one. */
  distance: number | null;
}

export interface Station {
  id: string;
  name: string;
  type: string;
  lat: number;
  lon: number;
  address: string;
  city: string;
  province: string;
  country: string;
  elevation_m: number | null;
  operator: string;
  active_since: string | null;
  active: boolean;
  reading: StationReading | null;
}

export interface StationState {
  station: Station | null;
  status: 'loading' | 'live' | 'offline' | 'unavailable';
}

type Listener = (s: StationState) => void;

let state: StationState = { station: null, status: 'loading' };
const listeners = new Set<Listener>();
let timer: ReturnType<typeof setInterval> | null = null;
let lastFetch = 0;

function isFresh(station: Station | null) {
  const at = station?.reading ? Date.parse(station.reading.recorded_at) : NaN;
  return Number.isFinite(at) && Date.now() - at < OFFLINE_AFTER_MS;
}

/** Fetch if due and the page is being looked at; background tabs don't poll. */
function tick() {
  if (document.visibilityState === 'visible' && Date.now() - lastFetch >= REFRESH_MS) refresh();
}

async function refresh() {
  lastFetch = Date.now();
  try {
    const res = await fetch(STATION_ENDPOINT, { cache: 'no-store' });
    const body = await res.json();
    const station: Station | null =
      body?.stations?.find((s: Station) => s.active && s.reading) ?? null;
    state = station
      ? { station, status: isFresh(station) ? 'live' : 'offline' }
      : { station: null, status: 'unavailable' };
  } catch {
    // Keep showing the last good reading if we had one.
    state = state.station
      ? { ...state, status: isFresh(state.station) ? 'live' : 'offline' }
      : { station: null, status: 'unavailable' };
  }
  listeners.forEach((l) => l(state));
}

export function useStation(): StationState {
  const [s, setS] = useState(state);

  useEffect(() => {
    listeners.add(setS);
    if (listeners.size === 1) {
      if (state.status === 'loading') refresh();
      timer = setInterval(tick, TICK_MS);
      document.addEventListener('visibilitychange', tick);
    }
    setS(state);
    return () => {
      listeners.delete(setS);
      if (listeners.size === 0 && timer) {
        clearInterval(timer);
        timer = null;
        document.removeEventListener('visibilitychange', tick);
      }
    };
  }, []);

  return s;
}

// ---- display helpers ----

const COMPASS = [
  'N',
  'NNE',
  'NE',
  'ENE',
  'E',
  'ESE',
  'SE',
  'SSE',
  'S',
  'SSW',
  'SW',
  'WSW',
  'W',
  'WNW',
  'NW',
  'NNW',
];
export const compass = (deg: number) =>
  COMPASS[Math.round((((deg % 360) + 360) % 360) / 22.5) % 16];

export const msToKmh = (ms: number) => Math.round(ms * 3.6);

/** PAGASA heat index classification. */
export function heatIndexLevel(c: number): {
  label: string;
  tone: 'ok' | 'caution' | 'warn' | 'danger';
} {
  if (c >= 52) return { label: 'Extreme Danger', tone: 'danger' };
  if (c >= 42) return { label: 'Danger', tone: 'danger' };
  if (c >= 33) return { label: 'Extreme Caution', tone: 'warn' };
  if (c >= 27) return { label: 'Caution', tone: 'caution' };
  return { label: 'Not hazardous', tone: 'ok' };
}

/** WHO UV index categories. */
export function uvLevel(uv: number): { label: string; tone: 'ok' | 'caution' | 'warn' | 'danger' } {
  if (uv >= 11) return { label: 'Extreme', tone: 'danger' };
  if (uv >= 8) return { label: 'Very High', tone: 'danger' };
  if (uv >= 6) return { label: 'High', tone: 'warn' };
  if (uv >= 3) return { label: 'Moderate', tone: 'caution' };
  return { label: 'Low', tone: 'ok' };
}

export function timeAgo(iso: string, now = Date.now()) {
  const mins = Math.max(0, Math.round((now - Date.parse(iso)) / 60000));
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const h = Math.floor(mins / 60);
  return h < 24 ? `${h} hr ago` : `${Math.floor(h / 24)} day${h >= 48 ? 's' : ''} ago`;
}

export function manilaDate(iso: string) {
  return new Intl.DateTimeFormat('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Manila',
  }).format(new Date(iso));
}

export function manilaTime(iso: string) {
  return new Intl.DateTimeFormat('en-PH', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'Asia/Manila',
  }).format(new Date(iso));
}
