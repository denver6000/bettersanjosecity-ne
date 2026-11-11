import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { toTel } from './phone.ts';
import { SITE } from '../config/site.ts';

const json = (p: string) => JSON.parse(readFileSync(p, 'utf8'));
const officials = json('src/data/officials.json');
const { offices } = json('src/data/offices.json');

test('toTel turns printed numbers into dialable ones', () => {
  assert.equal(toTel('(044) 940-1404'), '+63449401404');
  assert.equal(toTel('0915-168-9878'), '+639151689878');
  assert.equal(toTel('911'), '911');
});

test('officials match sjc.gov.ph', () => {
  assert.equal(officials.mayor, 'Hon. Josel F. Violago');
  assert.equal(officials.viceMayor, 'Hon. Evangel Shalom S. Manugue');
  assert.equal(officials.councilors.length, 10);
  assert.equal(officials.councilors[0], 'Hon. Glenda F. Macadangdang');
  assert.equal(officials.checked, '2026-11-11');
});

test('43 unique offices, sorted, with keywords', () => {
  const names: string[] = offices.map((o: { name: string }) => o.name);
  assert.equal(names.length, 43);
  assert.equal(new Set(names).size, 43);
  const sorted = [...names].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
  assert.deepEqual(names, sorted);
  const health = offices.find((o: { name: string }) => o.name === 'City Health Office');
  assert.ok(health?.keywords.includes('kalusugan'));
});

test('hotlines: ids, emergency first, dialable numbers', () => {
  const ids = SITE.hotlines.map((h) => h.id);
  assert.deepEqual(ids, ['rescue', 'emergency', 'pnp', 'bfp', 'hospital', 'ocm', 'pio', 'sajelco']);
  const firstNon = SITE.hotlines.findIndex((h) => !h.emergency);
  assert.ok(SITE.hotlines.slice(firstNon).every((h) => !h.emergency));
  assert.equal(SITE.hotlines.find((h) => h.id === 'pnp')?.numbers.length, 2);
  for (const h of SITE.hotlines)
    for (const n of h.numbers) assert.match(toTel(n), /^(\+63\d{9,10}|\d{3})$/);
});
