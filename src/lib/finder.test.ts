import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { INTENTS, destination, resolveIntent } from './finder.ts';

const SHARED_KEYS = ['finder-label', 'finder-lead', 'finder-go', 'finder-contact', 'finder-soon'];

const src = readFileSync('src/i18n/translations.ts', 'utf8').replaceAll('\r\n', '\n');
function block(lang: string): string {
  const m = src.match(new RegExp(String.raw`^  ${lang}: \{\n([\s\S]*?)^  \},`, 'm'));
  assert.ok(m, `no ${lang} block`);
  return m[1];
}

test('INTENTS has 12 entries with unique ids', () => {
  assert.equal(INTENTS.length, 12);
  assert.equal(new Set(INTENTS.map((i) => i.id)).size, 12);
});

test('every href is an existing app page', () => {
  for (const i of INTENTS) {
    if (i.href) assert.ok(existsSync(`src/app${i.href}/page.tsx`), `${i.id}: ${i.href}`);
  }
});

test('soon intents have no href and go to /contact; others go to their href', () => {
  for (const i of INTENTS) {
    if (i.soon) {
      assert.equal(i.href, undefined);
      assert.equal(destination(i), '/contact');
    } else {
      assert.ok(i.href, `${i.id} needs an href`);
      assert.equal(destination(i), i.href);
    }
  }
});

test('soon intents are exactly certificate, welfare, farming', () => {
  assert.deepEqual(
    INTENTS.filter((i) => i.soon).map((i) => i.id),
    ['certificate', 'welfare', 'farming']
  );
});

test('every icon is a written-out Phosphor class', () => {
  for (const i of INTENTS) assert.match(i.icon, /^ph-[a-z0-9-]+$/);
});

test('every key and titleKey is defined in both en and fil', () => {
  const keys = [...SHARED_KEYS, ...INTENTS.flatMap((i) => [i.key, i.titleKey])];
  for (const lang of ['en', 'fil']) {
    const b = block(lang);
    for (const k of keys) assert.ok(b.includes(`'${k}':`), `${lang} missing ${k}`);
  }
});

test('resolveIntent finds by id and returns undefined for unknown ids', () => {
  assert.equal(resolveIntent('news')?.id, 'news');
  assert.equal(resolveIntent('nope'), undefined);
});
