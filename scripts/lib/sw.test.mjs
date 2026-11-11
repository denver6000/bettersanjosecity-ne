import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

// Load public/sw.js as the browser would, with just enough of a worker scope to run its top level.
const ctx = {
  self: {
    addEventListener() {},
    location: { origin: 'https://site.test' },
    skipWaiting() {},
    clients: { claim() {} },
  },
  caches: {},
  fetch() {},
  URL,
  Response: class {},
};
vm.runInNewContext(readFileSync('public/sw.js', 'utf8'), ctx);
const origin = 'https://site.test';
const req = (url, o = {}) => ({ url, method: 'GET', mode: 'no-cors', rsc: false, ...o });
const kind = (url, o) => ctx.classifyRequest(req(url, o), origin);

test('non-GET and non-http requests are left alone', () => {
  assert.equal(kind('https://site.test/', { method: 'POST' }), 'skip');
  assert.equal(kind('chrome-extension://x/a.js'), 'skip');
});

test('Next.js navigation payloads always go to the network', () => {
  assert.equal(kind('https://site.test/government/?_rsc=abc'), 'skip');
  assert.equal(kind('https://site.test/government/', { rsc: true }), 'skip');
});

test('page navigations', () => {
  assert.equal(kind('https://site.test/contact/', { mode: 'navigate' }), 'navigate');
});

test('static files', () => {
  assert.equal(kind('https://site.test/_next/static/chunks/a.js?v=1'), 'static');
  assert.equal(kind('https://site.test/assets/fonts/x.woff2'), 'static');
});

test('other sites and everything else', () => {
  assert.equal(kind('https://api.open-meteo.com/v1/forecast?x=1'), 'cross-origin');
  assert.equal(kind('https://site.test/api/weather-station.php'), 'other');
});
