import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { routes, matrix, countDiff } from './shots.mjs';

test('routes lists index pages and 404, skipping build folders', () => {
  const dir = mkdtempSync(join(tmpdir(), 'shots-'));
  try {
    for (const p of ['', 'services', '_next/x']) {
      mkdirSync(join(dir, p), { recursive: true });
      writeFileSync(join(dir, p, 'index.html'), '');
    }
    writeFileSync(join(dir, '404.html'), '');
    assert.deepEqual(routes(dir), ['/', '/404.html', '/services/']);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('matrix covers widths, dark, print, Filipino and interactive states', () => {
  const m = matrix(['/', '/services/', '/business-taxes/', '/faq/']);
  const base = m.filter(
    (c) => c.scheme === 'light' && c.lang === 'en' && c.media === 'screen' && c.state === 'none'
  );
  assert.equal(base.length, 12);
  const dark = m.filter((c) => c.scheme === 'dark');
  assert.equal(dark.length, 6);
  assert.ok(dark.every((c) => c.width !== 768));
  assert.equal(m.filter((c) => c.media === 'print').length, 3);
  assert.equal(m.filter((c) => c.lang === 'fil').length, 4);
  assert.equal(m.filter((c) => c.state === 'menu-open').length, 1);
  assert.equal(m.filter((c) => c.state === 'focus').length, 1);
  assert.equal(new Set(m.map((c) => c.id)).size, m.length);
});

test('countDiff ignores small channel noise and counts real changes', () => {
  const a = new Uint8ClampedArray([10, 10, 10, 255, 50, 50, 50, 255]);
  assert.equal(countDiff(a, a.slice()), 0);
  const near = a.slice();
  near[0] = 20;
  assert.equal(countDiff(a, near), 0);
  const far = a.slice();
  far[4] = 80;
  assert.equal(countDiff(a, far), 1);
});
