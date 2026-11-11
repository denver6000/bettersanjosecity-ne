/*
 * Offline support for the San Jose City civic site, served as /sw.js.
 * Pages: fresh from the network, the stored copy when offline, else the offline page.
 * Static files: stored copy at once, refreshed in the background.
 * A new version waits until the visitor presses Update (or closes every tab of the site).
 */

const VERSION = '2026-11-11';
const STATIC = `sanjose-static-${VERSION}`;
const RUNTIME = `sanjose-runtime-${VERSION}`;
const OFFLINE_PAGE = '/offline.html';

/** Stored at install so the first offline visit still has a home page, logo and icons. */
const SHELL = [
  '/',
  OFFLINE_PAGE,
  '/assets/images/logo/logo-emblem.png',
  '/assets/images/logo/icon-192.png',
  '/assets/images/logo/icon-512.png',
  '/assets/images/logo/favicon.ico',
  '/manifest.webmanifest',
];

const RUNTIME_MAX_ENTRIES = 80;
const RUNTIME_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const STATIC_FILE = /\.(?:css|js|svg|ico|png|jpe?g|webp|woff2?|ttf|json)$/i;

/**
 * Which strategy a request gets: 'skip' (leave it to the browser), 'navigate', 'static',
 * 'cross-origin' or 'other'. `req.rsc` is true when the request carries the RSC header.
 */
function classifyRequest(req, origin) {
  const url = new URL(req.url);
  if (req.method !== 'GET' || (url.protocol !== 'http:' && url.protocol !== 'https:'))
    return 'skip';
  // Next.js page payloads must never come from a cache, or visitors see pre-deploy content.
  if (req.rsc || url.searchParams.has('_rsc')) return 'skip';
  if (req.mode === 'navigate') return 'navigate';
  if (STATIC_FILE.test(url.pathname)) return 'static';
  if (url.origin !== origin) return 'cross-origin';
  return 'other';
}

async function keep(cacheName, request, response, maxEntries) {
  if (!response.ok) return;
  const cache = await caches.open(cacheName);
  await cache.put(request, response);
  if (!maxEntries) return;
  const keys = await cache.keys();
  for (const old of keys.slice(0, Math.max(0, keys.length - maxEntries))) await cache.delete(old);
}

const stored = async (request) => (await caches.match(request)) ?? Response.error();

const strategies = {
  async navigate(request) {
    try {
      const response = await fetch(request);
      keep(RUNTIME, request, response.clone());
      return response;
    } catch {
      return (
        (await caches.match(request)) ?? (await caches.match(OFFLINE_PAGE)) ?? Response.error()
      );
    }
  },

  async static(request) {
    const cached = await caches.match(request);
    const refresh = fetch(request).then(
      (response) => (keep(STATIC, request, response.clone()), response),
      () => cached ?? Response.error()
    );
    return cached ?? refresh;
  },

  async 'cross-origin'(request) {
    try {
      const response = await fetch(request);
      keep(RUNTIME, request, response.clone(), RUNTIME_MAX_ENTRIES);
      return response;
    } catch {
      return stored(request);
    }
  },

  async other(request) {
    const cached = await caches.match(request);
    const date = cached?.headers.get('date');
    if (cached && (!date || Date.now() - Date.parse(date) < RUNTIME_MAX_AGE_MS)) return cached;
    try {
      const response = await fetch(request);
      keep(RUNTIME, request, response.clone(), RUNTIME_MAX_ENTRIES);
      return response;
    } catch {
      return cached ?? Response.error();
    }
  },
};

self.addEventListener('install', (event) => {
  // No skipWaiting here: a first install activates on its own, and an update waits for the visitor.
  event.waitUntil(caches.open(STATIC).then((cache) => cache.addAll(SHELL)));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      for (const name of await caches.keys()) {
        if (name !== STATIC && name !== RUNTIME) await caches.delete(name);
      }
      await self.clients.claim();
    })()
  );
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const kind = classifyRequest(
    {
      url: request.url,
      method: request.method,
      mode: request.mode,
      rsc: request.headers.get('RSC') === '1',
    },
    self.location.origin
  );
  if (kind !== 'skip') event.respondWith(strategies[kind](request));
});
