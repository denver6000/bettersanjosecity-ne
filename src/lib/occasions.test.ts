import test from 'node:test';
import assert from 'node:assert/strict';
import {
  OCCASIONS,
  christmasMoment,
  easterSunday,
  flagProgress,
  newYearPhase,
  occasionOn,
  parseOccasionOverride,
  seasonOn,
  type DateParts,
} from './occasions.ts';
import { manilaNow } from './sky.ts';

const d = (year: number, month: number, day: number): DateParts => ({ year, month, day });
const id = (x: DateParts) => occasionOn(x)?.id ?? null;

test('easterSunday', () => {
  assert.deepEqual(easterSunday(2026), { month: 4, day: 5 });
  assert.deepEqual(easterSunday(2027), { month: 3, day: 28 });
  assert.deepEqual(easterSunday(2028), { month: 4, day: 16 });
  assert.deepEqual(easterSunday(2285), { month: 3, day: 22 });
  assert.deepEqual(easterSunday(1943), { month: 4, day: 25 });
});

test('occasionOn boundaries', () => {
  assert.equal(id(d(2026, 11, 30)), null);
  assert.equal(id(d(2026, 12, 1)), 'christmas');
  assert.equal(id(d(2027, 1, 6)), 'christmas');
  assert.equal(id(d(2027, 1, 7)), null);
  assert.equal(id(d(2026, 6, 9)), null);
  assert.equal(id(d(2026, 6, 10)), 'independence');
  assert.equal(id(d(2026, 6, 12)), 'independence');
  assert.equal(id(d(2026, 6, 13)), null);
  assert.equal(id(d(2026, 10, 31)), 'undas');
  assert.equal(id(d(2026, 11, 1)), 'undas');
  assert.equal(id(d(2026, 11, 2)), 'undas');
  assert.equal(id(d(2026, 11, 3)), null);
  assert.equal(id(d(2026, 3, 19)), 'st-joseph');
  assert.equal(id(d(2026, 5, 1)), 'labor-day');
  assert.equal(id(d(2026, 8, 10)), 'city-anniversary');
  assert.equal(id(d(2028, 2, 29)), null);
});

test('every occasion is reachable on some date', () => {
  const seen = new Set<string>();
  for (const year of [2026, 2036]) {
    for (let m = 1; m <= 12; m++)
      for (let day = 1; day <= 31; day++) {
        const o = occasionOn(d(year, m, day));
        if (o) seen.add(o.id);
      }
  }
  for (const o of OCCASIONS) assert.ok(seen.has(o.id), `${o.id} never wins`);
});

test('occasionOn precedence', () => {
  assert.equal(id(d(2026, 12, 31)), 'new-year');
  assert.equal(id(d(2027, 1, 1)), 'new-year');
  assert.equal(id(d(2026, 4, 9)), 'kagitingan');
  assert.equal(id(d(2036, 4, 9)), 'holy-week');
  assert.equal(id(d(2025, 4, 9)), 'kagitingan');
  assert.equal(id(d(2025, 4, 10)), 'pagibang-damara');
  assert.equal(id(d(2026, 3, 29)), 'holy-week');
  assert.equal(id(d(2026, 4, 4)), 'holy-week');
  assert.equal(id(d(2026, 4, 5)), null);
  assert.equal(occasionOn(d(2026, 12, 25))?.tone, 'celebrate');
  assert.equal(occasionOn(d(2026, 4, 9))?.tone, 'remember');
});

test('seasonOn', () => {
  const s = (m: number, day: number) => seasonOn(d(2026, m, day));
  assert.equal(s(11, 30), 'harvest');
  assert.equal(s(12, 1), 'planting');
  assert.equal(seasonOn(d(2027, 1, 31)), 'planting');
  assert.equal(s(2, 1), 'growing');
  assert.equal(s(2, 28), 'growing');
  assert.equal(s(3, 1), 'harvest');
  assert.equal(s(4, 30), 'harvest');
  assert.equal(s(5, 1), 'growing');
  assert.equal(s(6, 1), 'planting');
  assert.equal(s(7, 31), 'planting');
  assert.equal(s(8, 1), 'growing');
  assert.equal(s(10, 1), 'harvest');
});

test('flagProgress', () => {
  assert.equal(flagProgress(d(2026, 6, 11), 12), 1);
  assert.equal(flagProgress(d(2026, 6, 12), 7 + 59 / 60), 0);
  assert.ok(Math.abs(flagProgress(d(2026, 6, 12), 8 + 1 / 60) - 0.5) < 1e-9);
  assert.equal(flagProgress(d(2026, 6, 12), 8 + 2 / 60), 1);
  assert.equal(flagProgress(d(2026, 6, 12), 15), 1);
  assert.equal(flagProgress(d(2026, 6, 13), 12), 0);
  assert.equal(flagProgress(d(2026, 6, 9), 12), 0);
});

test('newYearPhase', () => {
  assert.equal(newYearPhase(d(2026, 12, 31), 19 + 59 / 60), 'day');
  assert.equal(newYearPhase(d(2026, 12, 31), 20), 'buildup');
  assert.equal(newYearPhase(d(2026, 12, 31), 23 + 59 / 60), 'buildup');
  assert.equal(newYearPhase(d(2027, 1, 1), 0), 'midnight');
  assert.equal(newYearPhase(d(2027, 1, 1), 11 / 60), 'day');
  assert.equal(newYearPhase(d(2027, 1, 1), 5.5), 'sunrise');
  assert.equal(newYearPhase(d(2027, 1, 1), 9 + 1 / 60), 'day');
  assert.equal(newYearPhase(d(2027, 1, 2), 0), 'day');
});

test('christmasMoment', () => {
  assert.equal(christmasMoment(d(2026, 12, 15), 5), 'season');
  assert.equal(christmasMoment(d(2026, 12, 16), 5), 'simbang-gabi');
  assert.equal(christmasMoment(d(2026, 12, 24), 5), 'simbang-gabi');
  assert.equal(christmasMoment(d(2026, 12, 24), 18), 'eve');
  assert.equal(christmasMoment(d(2026, 12, 25), 5), 'season');
});

test('parseOccasionOverride', () => {
  assert.deepEqual(parseOccasionOverride('?on=holy-week&season=harvest&date=2026-06-12'), {
    occasion: 'holy-week',
    season: 'harvest',
    date: { year: 2026, month: 6, day: 12 },
  });
  assert.deepEqual(parseOccasionOverride('?on=none'), { occasion: 'none' });
  assert.deepEqual(parseOccasionOverride('?on=bogus&season=x&date=2026-13-40'), {});
  assert.deepEqual(parseOccasionOverride(''), {});
});

test('occasionOn works on Manila date parts across the UTC midnight', () => {
  const m = manilaNow(new Date('2026-12-30T16:30:00Z'));
  assert.equal(id({ year: m.year, month: m.month, day: m.day }), 'new-year');
});
