import test from 'node:test';
import assert from 'node:assert/strict';
import { buildForecastUrl, isForecast, mapCode, parseForecast } from './forecast.ts';

const codes = Array.from({ length: 48 }, () => 0);
codes[18] = 0;
codes[19] = 3;
codes[20] = 61;
codes[21] = 95;
const body = (current: Record<string, unknown>) => ({
  current,
  hourly: {
    time: Array.from({ length: 48 }, (_, i) => `2026-11-10T${String(i % 24).padStart(2, '0')}:00`),
    weather_code: codes,
    temperature_2m: Array.from({ length: 48 }, (_, i) => 20 + i + 0.4),
  },
});
const current = {
  temperature_2m: 29.6,
  relative_humidity_2m: 70,
  weather_code: 3,
  wind_speed_10m: 17.3,
  precipitation: 0.4,
};

test('buildForecastUrl asks for wind and precipitation', () => {
  const url = buildForecastUrl(15.7933, 120.9917);
  assert.ok(url.startsWith('https://api.open-meteo.com/v1/forecast?'));
  assert.ok(url.includes('precipitation'));
  assert.ok(url.includes('wind_speed_10m'));
  assert.ok(url.includes('timezone=Asia%2FManila'));
  assert.ok(url.includes('latitude=15.7933'));
});

test('parseForecast reads the current block and the next four hours', () => {
  const f = parseForecast(body(current), 17);
  assert.equal(f.temperature, 30);
  assert.equal(f.humidity, 70);
  assert.equal(f.windSpeed, 17);
  assert.equal(f.code, 3);
  assert.equal(f.precipitation, 0.4);
  assert.equal(f.condition, 'Overcast');
  assert.equal(f.icon, 'ph-cloud');
  assert.deepEqual(
    f.hourly.map((h) => [h.time, h.icon]),
    [
      ['6 PM', 'ph-sun'],
      ['7 PM', 'ph-cloud'],
      ['8 PM', 'ph-cloud-rain'],
      ['9 PM', 'ph-cloud-lightning'],
    ]
  );
});

test('parseForecast defaults missing precipitation to 0', () => {
  const { precipitation: _p, ...noRain } = current;
  assert.equal(parseForecast(body(noRain), 17).precipitation, 0);
});

test('parseForecast throws on a body with no current block', () => {
  assert.throws(() => parseForecast({ hourly: {} }, 5));
  assert.throws(() => parseForecast(null, 5));
});

test('isForecast rejects the old cache shape', () => {
  const full = parseForecast(body(current), 17);
  assert.equal(isForecast(full), true);
  const { code: _c, precipitation: _p, ...old } = full;
  assert.equal(isForecast(old), false);
  assert.equal(isForecast(null), false);
  assert.equal(isForecast(42), false);
});

test("mapCode keeps the widget's table", () => {
  assert.deepEqual(mapCode(0), { condition: 'Clear sky', icon: 'ph-sun' });
  assert.deepEqual(mapCode(95), { condition: 'Thunderstorm', icon: 'ph-cloud-lightning' });
  assert.deepEqual(mapCode(1234), { condition: 'Partly cloudy', icon: 'ph-cloud-sun' });
});
