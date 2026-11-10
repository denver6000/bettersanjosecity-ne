// Open-Meteo forecast: URL, parsing and types. Pure (no React, no app imports) so Node can test it.

/** Open-Meteo model data: the sky condition and hourly forecast the station can't give. */
export interface Forecast {
  temperature: number;
  humidity: number;
  windSpeed: number;
  code: number;
  precipitation: number;
  condition: string;
  icon: string;
  hourly: { time: string; icon: string; temperature: number }[];
}

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

export const mapCode = (code: number) =>
  CODES[code] ?? { condition: 'Partly cloudy', icon: 'ph-cloud-sun' };

export function buildForecastUrl(lat: number, lon: number): string {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current: 'temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,precipitation',
    hourly: 'temperature_2m,weather_code',
    timezone: 'Asia/Manila',
    forecast_days: '2',
  });
  return `https://api.open-meteo.com/v1/forecast?${params}`;
}

/** Turns an Open-Meteo response into a Forecast; hourly arrays are in Manila time. */
export function parseForecast(json: unknown, manilaHour: number): Forecast {
  const { current, hourly } = (json ?? {}) as {
    current?: Record<string, number>;
    hourly?: { time: string[]; weather_code: number[]; temperature_2m: number[] };
  };
  if (!current || !hourly || !Array.isArray(hourly.time)) throw new Error('Malformed forecast');

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
    code: current.weather_code,
    precipitation: current.precipitation ?? 0,
    ...mapCode(current.weather_code),
    hourly: next,
  };
}

/** True only for the current shape, so an old cache entry (no `code`) counts as a miss. */
export function isForecast(x: unknown): x is Forecast {
  const f = x as Partial<Forecast> | null;
  return (
    typeof f === 'object' &&
    f !== null &&
    Array.isArray(f.hourly) &&
    ['code', 'precipitation', 'windSpeed', 'temperature', 'humidity'].every(
      (k) => typeof f[k as keyof Forecast] === 'number'
    )
  );
}
