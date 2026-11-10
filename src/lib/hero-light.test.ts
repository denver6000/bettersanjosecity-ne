import test from 'node:test';
import assert from 'node:assert/strict';
import { lampOpacity, pokesAllowed, windSway } from './hero-light.ts';

test('pokesAllowed: celebrate and no occasion allow pokes, remember and reduced motion do not', () => {
  assert.equal(pokesAllowed('celebrate', false), true);
  assert.equal(pokesAllowed(null, false), true);
  assert.equal(pokesAllowed('remember', false), false);
  assert.equal(pokesAllowed('celebrate', true), false);
  assert.equal(pokesAllowed(null, true), false);
  assert.equal(pokesAllowed('remember', true), false);
});

test('lampOpacity follows the night factor and ignores the weather', () => {
  assert.equal(lampOpacity(0.2, 0), 0);
  assert.equal(lampOpacity(0, 0), 0);
  assert.equal(lampOpacity(1, 0), 1);
  assert.ok(Math.abs(lampOpacity(0.6, 0) - 0.5) < 1e-9);
  assert.equal(lampOpacity(0.6, 0.78), lampOpacity(0.6, 0));
});

test('windSway is bounded by the wind and larger in a gale than in calm air', () => {
  const peak = (wind: number) => {
    let m = 0;
    for (let t = 0; t < 20; t += 0.05) m = Math.max(m, Math.abs(windSway(wind, t, 0.7)));
    return m;
  };
  for (const wind of [0, 10, 40, 80]) {
    assert.ok(peak(wind) <= Math.min(14, 2 + 0.35 * wind) + 1e-9);
  }
  assert.ok(peak(40) > peak(0));
  assert.ok(peak(80) <= 14 + 1e-9);
});
