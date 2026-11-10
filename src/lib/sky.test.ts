import test from 'node:test';
import assert from 'node:assert/strict';
import {
  bodies,
  hexToRgb,
  manilaNow,
  mix,
  parseSkyOverride,
  skyAt,
  weatherKind,
  weatherLook,
} from './sky.ts';

test('skyAt matches the keyframes', () => {
  assert.deepEqual(skyAt(8), { night: 0, top: '#f7efd9', band: '#fbe6bf', tint: '#fff3df' });
  assert.equal(skyAt(12).tint, '#ffffff');
  assert.equal(skyAt(0).night, 1);
  assert.equal(skyAt(6.5).night, 0.3);
});

test('skyAt wraps the hour without a jump at midnight', () => {
  assert.deepEqual(skyAt(24), skyAt(0));
  assert.deepEqual(skyAt(-0.5), skyAt(23.5));
  const a = hexToRgb(skyAt(23.99).top);
  const b = hexToRgb(skyAt(0).top);
  for (let i = 0; i < 3; i++) assert.ok(Math.abs(a[i] - b[i]) <= 2);
});

test('weatherKind maps Open-Meteo codes and treats unknown as clear', () => {
  for (const c of [0, 1]) assert.equal(weatherKind(c), 'clear');
  for (const c of [2, 3, 45, 48]) assert.equal(weatherKind(c), 'cloudy');
  for (const c of [51, 61, 67, 80, 82]) assert.equal(weatherKind(c), 'rain');
  for (const c of [95, 99]) assert.equal(weatherKind(c), 'storm');
  for (const c of [null, undefined, NaN, 4, 1234]) assert.equal(weatherKind(c), 'clear');
});

test('weatherLook returns the pinned multipliers', () => {
  assert.deepEqual(weatherLook('clear'), { greyMix: 0, saturation: 1, brightness: 1 });
  assert.deepEqual(weatherLook('cloudy'), { greyMix: 0.4, saturation: 0.88, brightness: 0.95 });
  assert.deepEqual(weatherLook('rain'), { greyMix: 0.6, saturation: 0.7, brightness: 0.86 });
  assert.deepEqual(weatherLook('storm'), { greyMix: 0.78, saturation: 0.55, brightness: 0.72 });
});

test('bodies shows one body at a time', () => {
  const noon = bodies(12.25);
  assert.deepEqual(noon.sun, { x: 800, y: 130, t: 0.5 });
  assert.equal(noon.moon, null);
  const night = bodies(22);
  assert.equal(night.sun, null);
  assert.ok(night.moon);
  assert.deepEqual(bodies(5.5).sun, { x: 260, y: 560, t: 0 });
  assert.equal(bodies(19.5).sun, null);
});

test('mix and hexToRgb', () => {
  assert.equal(mix('#000000', '#ffffff', 0.5), '#808080');
  assert.deepEqual(hexToRgb('#f2b100'), [242, 177, 0]);
});

test('manilaNow uses Asia/Manila', () => {
  assert.deepEqual(manilaNow(new Date('2026-12-31T16:30:00Z')), {
    hour: 0.5,
    year: 2027,
    month: 1,
    day: 1,
  });
  assert.equal(manilaNow(new Date('2026-11-10T04:00:00Z')).hour, 12);
});

test('parseSkyOverride reads time and weather and ignores junk', () => {
  assert.deepEqual(parseSkyOverride('?sky=21:00,storm'), { hour: 21, weather: 'storm' });
  assert.deepEqual(parseSkyOverride('?sky=storm,8'), { hour: 8, weather: 'storm' });
  assert.deepEqual(parseSkyOverride('?sky=25:00,hail'), {});
  assert.deepEqual(parseSkyOverride(''), {});
});
