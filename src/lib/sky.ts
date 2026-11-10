// Pure sky maths for the living hero. No imports, so Node can run the tests on this file directly.

export type Weather = 'clear' | 'cloudy' | 'rain' | 'storm';

export function hexToRgb(h: string): [number, number, number] {
  return [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)) as [number, number, number];
}

export function mix(a: string, b: string, t: number): string {
  const A = hexToRgb(a);
  const B = hexToRgb(b);
  return (
    '#' +
    A.map((v, i) =>
      Math.round(v + (B[i] - v) * t)
        .toString(16)
        .padStart(2, '0')
    ).join('')
  );
}

// hour, night factor, sky top, sky band, multiply tint
const KEYS: [number, number, string, string, string][] = [
  [0, 1, '#0f1d3d', '#1b2c58', '#4a5a9a'],
  [5, 1, '#0f1d3d', '#1b2c58', '#4a5a9a'],
  [6.5, 0.3, '#f0b99b', '#f7dcae', '#ffc9a0'],
  [8, 0, '#f7efd9', '#fbe6bf', '#fff3df'],
  [12, 0, '#a9d8f0', '#dcf0f8', '#ffffff'],
  [16, 0, '#b4dcef', '#f5ead0', '#fff6e6'],
  [18, 0.3, '#e58a5a', '#f5c26b', '#f5a070'],
  [19.5, 1, '#1b2550', '#2a3563', '#4f5f9f'],
  [24, 1, '#0f1d3d', '#1b2c58', '#4a5a9a'],
];

export function skyAt(hour: number): { night: number; top: string; band: string; tint: string } {
  const h = ((hour % 24) + 24) % 24;
  let i = 0;
  while (KEYS[i + 1][0] <= h) i++;
  const a = KEYS[i];
  const b = KEYS[i + 1];
  const t = (h - a[0]) / (b[0] - a[0]);
  return {
    night: a[1] + (b[1] - a[1]) * t,
    top: mix(a[2], b[2], t),
    band: mix(a[3], b[3], t),
    tint: mix(a[4], b[4], t),
  };
}

export function weatherKind(code: number | null | undefined): Weather {
  if (typeof code !== 'number' || Number.isNaN(code)) return 'clear';
  if (code >= 95 && code <= 99) return 'storm';
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return 'rain';
  if (code === 2 || code === 3 || code === 45 || code === 48) return 'cloudy';
  return 'clear';
}

const LOOK: Record<Weather, { greyMix: number; saturation: number; brightness: number }> = {
  clear: { greyMix: 0, saturation: 1, brightness: 1 },
  cloudy: { greyMix: 0.4, saturation: 0.88, brightness: 0.95 },
  rain: { greyMix: 0.6, saturation: 0.7, brightness: 0.86 },
  storm: { greyMix: 0.78, saturation: 0.55, brightness: 0.72 },
};

export function weatherLook(w: Weather) {
  return { ...LOOK[w] };
}

/** Sun by day (5:30 to 19:00), moon otherwise, in the scene's 1586 x 992 coordinates. */
export function bodies(hour: number): {
  sun: { x: number; y: number; t: number } | null;
  moon: { x: number; y: number } | null;
} {
  const h = ((hour % 24) + 24) % 24;
  if (h >= 5.5 && h <= 19) {
    const t = (h - 5.5) / 13.5;
    return { sun: { x: 260 + 1080 * t, y: 560 - 430 * Math.sin(Math.PI * t), t }, moon: null };
  }
  const m = Math.min(((h - 19 + 24) % 24) / 10.5, 1);
  return { sun: null, moon: { x: 260 + 1080 * m, y: 560 - 400 * Math.sin(Math.PI * m) } };
}

/** San Jose's clock: hour includes the fraction; date parts are Manila's. */
export function manilaNow(now: Date = new Date()) {
  const parts: Record<string, number> = {};
  for (const p of new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Manila',
    hour12: false,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
  }).formatToParts(now)) {
    if (p.type !== 'literal') parts[p.type] = Number(p.value);
  }
  return {
    hour: (parts.hour % 24) + parts.minute / 60 + parts.second / 3600,
    year: parts.year,
    month: parts.month,
    day: parts.day,
  };
}

const WEATHERS: Weather[] = ['clear', 'cloudy', 'rain', 'storm'];

/** Reads `?sky=21:00,storm` (a time, a weather word, or both); anything malformed is ignored. */
export function parseSkyOverride(search: string): { hour?: number; weather?: Weather } {
  const out: { hour?: number; weather?: Weather } = {};
  const value = new URLSearchParams(search).get('sky');
  if (!value) return out;
  for (const raw of value.split(',')) {
    const part = raw.trim().toLowerCase();
    if ((WEATHERS as string[]).includes(part)) {
      out.weather = part as Weather;
      continue;
    }
    const m = /^(\d{1,2})(?::(\d{2}))?$/.exec(part);
    if (m) {
      const hour = Number(m[1]) + Number(m[2] ?? 0) / 60;
      if (Number(m[2] ?? 0) < 60 && hour <= 24) out.hour = hour;
    }
  }
  return out;
}
