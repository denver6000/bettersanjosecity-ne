import test from 'node:test';
import assert from 'node:assert/strict';
import { search, groupByType, shownCount, type SearchEntry } from './search.ts';

const e = (type: SearchEntry['type'], en: string, extra = '', fil = en): SearchEntry => ({
  type,
  en,
  fil,
  extra,
  href: '/',
});

const health = e('office', 'City Health Office', 'health kalusugan');
const fire = e('hotline', 'Fire Station', 'sunog bumbero', 'Istasyon ng Bumbero');
const trip = e('page', 'Muñoz trip');
const mentions = e('page', 'Programs', 'free health checkups');
const fixture = [mentions, trip, fire, health];

test('accent-insensitive', () => {
  assert.deepEqual(search(fixture, 'munoz'), [trip]);
});

test('all words must match', () => {
  assert.deepEqual(search(fixture, 'city health'), [health]);
  assert.deepEqual(search(fixture, 'city xyz'), []);
});

test('Filipino-only term', () => {
  assert.deepEqual(search(fixture, 'bumbero'), [fire]);
});

test('title matches rank first', () => {
  assert.deepEqual(search(fixture, 'health'), [health, mentions]);
});

test('short or blank query', () => {
  for (const q of ['', '   ', 'a', '!', '- -', '. .', 'a b'])
    assert.deepEqual(search(fixture, q), []);
});

test('groupByType caps groups and keeps type order', () => {
  const offices = Array.from({ length: 6 }, (_, i) => e('office', `Office ${i}`));
  const groups = groupByType([...offices, fire, trip]);
  assert.deepEqual(
    groups.map(([t]) => t),
    ['page', 'office', 'hotline']
  );
  assert.equal(groups[1][1].length, 5);
});

test('shownCount counts only what the groups show', () => {
  const offices = Array.from({ length: 6 }, (_, i) => e('office', `Office ${i}`));
  assert.equal(shownCount([...offices, fire]), 6);
});
