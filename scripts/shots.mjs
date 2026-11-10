// Screenshot harness for the CSS rewrite (docs/superpowers/plans/2026-11-11-own-design-system.md).
//   npm run shots:capture -- <name>         serve out/ and write .shots/<name>/<id>.png
//   npm run shots:compare -- <base> <name>  diff two captures; exits 1 when any differ
// Captures block all off-site requests, freeze the clock and reduce motion so runs repeat exactly.
import { spawn, spawnSync } from 'node:child_process';
import { createServer } from 'node:http';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';
import { findBrowser } from './lib/headless.mjs';
import { routes, matrix, countDiff } from './lib/shots.mjs';

const ROOT = resolve('.');
const OUT = join(ROOT, 'out');
const SHOTS = join(ROOT, '.shots');
const NOW = '2026-11-11T09:00:00+08:00';
const SETTLE_MS = 3500; // past the 3 s HERO_GATE / LANG_GATE fallbacks in layout.tsx
const POOL = 4;
const NOISE_PX = 10; // the living hero still moves a few pixels between runs; exact colour match otherwise
const TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.txt': 'text/plain',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.webmanifest': 'application/manifest+json',
};

function serve() {
  const server = createServer((req, res) => {
    const url = decodeURIComponent((req.url ?? '/').split('?')[0]);
    const base = url.startsWith('/__shots/') ? SHOTS : OUT;
    let file = join(base, url.replace(/^\/__shots\//, '/'));
    if (url.endsWith('/')) file = join(file, 'index.html');
    if (!file.startsWith(base) || !existsSync(file)) {
      res.writeHead(404);
      return res.end();
    }
    res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' });
    res.end(readFileSync(file));
  });
  return new Promise((r) => server.listen(0, '127.0.0.1', () => r(server)));
}

async function launch() {
  const exe = findBrowser();
  if (!exe) throw new Error('no Edge or Chrome found; set BROWSER_PATH');
  const profile = join(SHOTS, `profile-${process.pid}`);
  rmSync(profile, { recursive: true, force: true });
  mkdirSync(profile, { recursive: true });
  const child = spawn(
    exe,
    [
      '--headless=new',
      '--disable-gpu',
      '--no-first-run',
      '--hide-scrollbars',
      '--disable-background-timer-throttling',
      '--disable-renderer-backgrounding',
      '--disable-backgrounding-occluded-windows',
      '--font-render-hinting=none',
      '--remote-debugging-port=0',
      `--user-data-dir=${profile}`,
      'about:blank',
    ],
    { stdio: 'ignore' }
  );
  const portFile = join(profile, 'DevToolsActivePort');
  for (let i = 0; i < 100 && !existsSync(portFile); i++)
    await new Promise((r) => setTimeout(r, 100));
  const [port, path] = readFileSync(portFile, 'utf8').split('\n');
  const ws = new WebSocket(`ws://127.0.0.1:${port}${path}`);
  await new Promise((r, j) => ((ws.onopen = r), (ws.onerror = j)));
  let seq = 0;
  const pending = new Map();
  const listeners = new Set();
  ws.onmessage = (m) => {
    const msg = JSON.parse(m.data);
    if (msg.id && pending.has(msg.id)) {
      const { ok, fail } = pending.get(msg.id);
      pending.delete(msg.id);
      msg.error ? fail(new Error(`${msg.error.message}`)) : ok(msg.result);
    } else for (const l of listeners) l(msg);
  };
  const send = (method, params = {}, sessionId) =>
    new Promise((ok, fail) => {
      const id = ++seq;
      pending.set(id, { ok, fail });
      ws.send(JSON.stringify({ id, method, params, sessionId }));
    });
  const close = () => {
    ws.close();
    if (process.platform === 'win32')
      spawnSync('taskkill', ['/pid', String(child.pid), '/T', '/F']);
    else child.kill();
    try {
      rmSync(profile, { recursive: true, force: true });
    } catch {
      // The browser may still hold files for a moment; .shots/ is gitignored.
    }
  };
  return { send, listeners, close };
}

async function openTab(cdp, origin) {
  const { targetId } = await cdp.send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await cdp.send('Target.attachToTarget', { targetId, flatten: true });
  const s = (method, params) => cdp.send(method, params, sessionId);
  const onMsg = (msg) => {
    if (msg.sessionId !== sessionId || msg.method !== 'Fetch.requestPaused') return;
    const { requestId, request } = msg.params;
    if (request.url.startsWith(origin)) s('Fetch.continueRequest', { requestId }).catch(() => {});
    else s('Fetch.failRequest', { requestId, errorReason: 'BlockedByClient' }).catch(() => {});
  };
  cdp.listeners.add(onMsg);
  await s('Page.enable');
  await s('Fetch.enable', { patterns: [{ urlPattern: '*' }] });
  return {
    s,
    close: async () => {
      cdp.listeners.delete(onMsg);
      await cdp.send('Target.closeTarget', { targetId });
    },
  };
}

const evaluate = async (s, expression) =>
  (await s('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })).result
    .value;

async function shoot(cdp, origin, c, dir) {
  const tab = await openTab(cdp, origin);
  const { s } = tab;
  try {
    await s('Emulation.setDeviceMetricsOverride', {
      width: c.width,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await s('Emulation.setTimezoneOverride', { timezoneId: 'Asia/Manila' });
    await s('Emulation.setEmulatedMedia', {
      media: c.media === 'print' ? 'print' : '',
      features: [
        { name: 'prefers-color-scheme', value: c.scheme },
        { name: 'prefers-reduced-motion', value: 'reduce' },
      ],
    });
    await s('Page.addScriptToEvaluateOnNewDocument', {
      source: `(()=>{const T=Date.parse(${JSON.stringify(NOW)}),D=Date;class F extends D{constructor(...a){super(...(a.length?a:[T]))}static now(){return T}}globalThis.Date=F;const L=${JSON.stringify(c.lang)},g=Storage.prototype.getItem;Storage.prototype.getItem=function(k){return k==='selectedLang'?L:g.call(this,k)};document.addEventListener('DOMContentLoaded',()=>document.head.insertAdjacentHTML('beforeend','<style>*,*::before,*::after{transition:none!important;animation:none!important;caret-color:transparent!important}</style>'))})()`,
    });
    await s('Page.navigate', { url: origin + c.path });
    for (let i = 0; i < 200; i++) {
      if ((await evaluate(s, 'document.readyState')) === 'complete') break;
      await new Promise((r) => setTimeout(r, 50));
    }
    await evaluate(s, 'document.fonts.ready.then(() => true)');
    // The saved language is applied after hydration; once in a while it lands late. Wait for it.
    for (let i = 0; i < 100; i++) {
      if ((await evaluate(s, 'document.documentElement.lang')) === c.lang) break;
      await new Promise((r) => setTimeout(r, 100));
    }
    // Lazy images load at random points in a tall capture and shift the layout: load them all now.
    await evaluate(
      s,
      `Promise.all([...document.images].map((i) => { i.loading = 'eager'; return i.decode().catch(() => {}); })).then(() => true)`
    );
    if (c.scheme === 'dark')
      await evaluate(s, "document.documentElement.removeAttribute('data-theme')");
    await new Promise((r) => setTimeout(r, SETTLE_MS));
    // The living hero art (ours, untouched by the rewrite) never sits still; hide its layers, keep its frame.
    await evaluate(
      s,
      `document.head.insertAdjacentHTML('beforeend', '<style>.hero-scene > *, .home-hero-grain { visibility: hidden !important; }</style>')`
    );
    if (c.state === 'menu-open')
      await evaluate(s, "document.querySelector('.mobile-menu-toggle').click()");
    if (c.state === 'focus')
      for (let i = 0; i < 2; i++)
        for (const type of ['keyDown', 'keyUp'])
          await s('Input.dispatchKeyEvent', {
            type,
            key: 'Tab',
            code: 'Tab',
            windowsVirtualKeyCode: 9,
          });
    await new Promise((r) => setTimeout(r, 300));
    // Late hydration or translation can still repaint; shoot until two frames in a row match.
    let data;
    for (let tries = 0; tries < 8; tries++) {
      const { cssContentSize: size } = await s('Page.getLayoutMetrics');
      const shot = await s('Page.captureScreenshot', {
        format: 'png',
        captureBeyondViewport: true,
        clip: { x: 0, y: 0, width: c.width, height: Math.ceil(size.height), scale: 1 },
      });
      if (shot.data === data) break;
      data = shot.data;
      await new Promise((r) => setTimeout(r, 700));
    }
    writeFileSync(join(dir, `${c.id}.png`), Buffer.from(data, 'base64'));
  } finally {
    await tab.close();
  }
}

async function pool(items, n, fn) {
  let i = 0;
  await Promise.all(
    Array.from({ length: n }, async () => {
      while (i < items.length) await fn(items[i++]);
    })
  );
}

// Runs in the page: decodes two PNGs, counts differing pixels, returns a red-marked diff image.
const PAGE_DIFF = `async (a, b) => {
  const load = (u) => new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = u; });
  const [x, y] = await Promise.all([load(a), load(b)]);
  const w = Math.max(x.width, y.width), h = Math.max(x.height, y.height);
  const px = (img) => { const c = new OffscreenCanvas(w, h); const g = c.getContext('2d'); g.drawImage(img, 0, 0); return g.getImageData(0, 0, w, h); };
  const A = px(x), B = px(y);
  const countDiff = ${countDiff.toString()};
  const n = x.width !== y.width || x.height !== y.height ? Math.max(1e9, countDiff(A.data, B.data, 0)) : countDiff(A.data, B.data, 0);
  if (!n) return { n, sizes: [x.width, x.height, y.width, y.height] };
  const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d');
  g.globalAlpha = 0.25; g.drawImage(y, 0, 0); g.globalAlpha = 1; g.fillStyle = '#ff0000';
  for (let i = 0; i < A.data.length; i += 4) if (countDiff(A.data.subarray(i, i + 4), B.data.subarray(i, i + 4), 0)) g.fillRect((i / 4) % w, Math.floor(i / 4 / w), 1, 1);
  return { n, sizes: [x.width, x.height, y.width, y.height], png: c.toDataURL('image/png') };
}`;

async function main() {
  const [cmd, a, b] = process.argv.slice(2);
  if (!['capture', 'compare'].includes(cmd) || !a || (cmd === 'compare' && !b)) {
    console.error('usage: node scripts/shots.mjs capture <name> | compare <base> <name>');
    process.exit(2);
  }
  if (cmd === 'capture' && !existsSync(join(OUT, 'index.html'))) {
    console.error('shots: out/ is missing; run npm run build first');
    process.exit(2);
  }
  const server = await serve();
  const origin = `http://127.0.0.1:${server.address().port}`;
  const cdp = await launch();
  let failed = 0;
  try {
    if (cmd === 'capture') {
      const dir = join(SHOTS, a);
      rmSync(dir, { recursive: true, force: true });
      mkdirSync(dir, { recursive: true });
      const list = matrix(routes(OUT));
      await pool(list, POOL, (c) => shoot(cdp, origin, c, dir));
      console.log(`CAPTURED ${list.length} into .shots/${a}`);
    } else {
      const diffDir = join(SHOTS, 'diff');
      rmSync(diffDir, { recursive: true, force: true });
      mkdirSync(diffDir, { recursive: true });
      const ids = readdirSync(join(SHOTS, a)).filter((f) => f.endsWith('.png'));
      const tab = await openTab(cdp, origin);
      await tab.s('Page.navigate', { url: `${origin}/404.html` });
      await new Promise((r) => setTimeout(r, 1000));
      for (const f of ids) {
        if (!existsSync(join(SHOTS, b, f))) {
          console.log(`${f.slice(0, -4)} missing`);
          failed++;
          continue;
        }
        const r = await evaluate(
          tab.s,
          `(${PAGE_DIFF})('/__shots/${a}/${f}', '/__shots/${b}/${f}')`
        );
        if (r.n > NOISE_PX) {
          failed++;
          console.log(
            `${f.slice(0, -4)} ${r.n}${r.sizes[1] !== r.sizes[3] ? ` (height ${r.sizes[1]} -> ${r.sizes[3]})` : ''}`
          );
          writeFileSync(join(diffDir, f), Buffer.from(r.png.split(',')[1], 'base64'));
        }
      }
      await tab.close();
      console.log(`DIFF ${failed}`);
    }
  } finally {
    cdp.close();
    server.close();
  }
  process.exit(failed ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(2);
});
