// Helpers for scripts/shots.mjs: which pages to capture, in which variants, and how to diff them.
import { readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const SKIP = new Set(['_next', 'api', 'assets']);

/** Every exported page under `outDir` as a URL path, plus /404.html, sorted. */
export function routes(outDir) {
  const found = [];
  const walk = (dir, url) => {
    if (existsSync(join(dir, 'index.html'))) found.push(url);
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      if (e.isDirectory() && !SKIP.has(e.name)) walk(join(dir, e.name), `${url}${e.name}/`);
    }
  };
  walk(outDir, '/');
  if (existsSync(join(outDir, '404.html'))) found.push('/404.html');
  return found.sort();
}

const FEATURED = ['/', '/services/', '/business-taxes/'];

/** The capture list: every route at three widths, plus dark, print, Filipino and UI states. */
export function matrix(paths) {
  const out = [];
  const add = (path, width, o = {}) => {
    const c = { path, width, scheme: 'light', media: 'screen', lang: 'en', state: 'none', ...o };
    const slug = path === '/' ? 'home' : path.replace(/^\/|\/$/g, '').replace(/[/.]/g, '_');
    c.id = [slug, width, c.scheme, c.media, c.lang, c.state].join('-');
    out.push(c);
  };
  for (const p of paths) for (const w of [375, 768, 1280]) add(p, w);
  for (const p of FEATURED.filter((f) => paths.includes(f))) {
    add(p, 375, { scheme: 'dark' });
    add(p, 1280, { scheme: 'dark' });
    add(p, 1280, { media: 'print' });
  }
  for (const p of ['/', '/services/'].filter((f) => paths.includes(f))) {
    add(p, 375, { lang: 'fil' });
    add(p, 1280, { lang: 'fil' });
  }
  if (paths.includes('/')) {
    add('/', 375, { state: 'menu-open' });
    add('/', 1280, { state: 'focus' });
  }
  return out;
}

/** Pixels (RGBA quads) where any channel differs by more than `tolerance`. */
export function countDiff(a, b, tolerance = 24) {
  let n = 0;
  for (let i = 0; i < a.length; i += 4) {
    if (
      Math.abs(a[i] - b[i]) > tolerance ||
      Math.abs(a[i + 1] - b[i + 1]) > tolerance ||
      Math.abs(a[i + 2] - b[i + 2]) > tolerance ||
      Math.abs(a[i + 3] - b[i + 3]) > tolerance
    )
      n++;
  }
  return n;
}
