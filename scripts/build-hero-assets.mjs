// Converts the three hero art layers (scripts/source/hero/*.png) to WebP in
// public/assets/images/hero/scene/. No dependencies: a headless Edge or Chrome does the
// conversion with canvas.toBlob and posts the bytes back to a tiny local server.
// Usage: node scripts/build-hero-assets.mjs   (env: BROWSER_PATH, HERO_WEBP_QUALITY=0.82)
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const SRC = join(ROOT, 'scripts/source/hero');
const OUT = join(ROOT, 'public/assets/images/hero/scene');
const LAYERS = ['hills', 'paddies', 'foreground'];
const W = 1586;
const H = 992;
const BUDGET = 350 * 1024;
const QUALITY = Number(process.env.HERO_WEBP_QUALITY ?? 0.82);

function fail(msg) {
  console.error(`build-hero-assets: ${msg}`);
  process.exit(1);
}

const browser = [
  process.env.BROWSER_PATH,
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
].find((p) => p && existsSync(p));
if (!browser) fail('no Edge or Chrome found; set BROWSER_PATH to its executable');

for (const name of LAYERS) {
  const png = readFileSync(join(SRC, `${name}.png`));
  if (png.readUInt32BE(16) !== W || png.readUInt32BE(20) !== H)
    fail(`${name}.png is not ${W} x ${H}`);
}

const PAGE = `<!doctype html><meta charset="utf-8"><script>
(async () => {
  for (const name of ${JSON.stringify(LAYERS)}) {
    const img = new Image();
    img.src = '/src/' + name + '.png';
    await img.decode();
    const c = document.createElement('canvas');
    c.width = img.naturalWidth; c.height = img.naturalHeight;
    c.getContext('2d').drawImage(img, 0, 0);
    const blob = await new Promise((r) => c.toBlob(r, 'image/webp', ${QUALITY}));
    await fetch('/out/' + name, { method: 'POST', body: blob });
  }
  await fetch('/done', { method: 'POST' });
})();
</script>`;

const results = {};
let finish;
const done = new Promise((r) => (finish = r));

const server = createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, { 'content-type': 'text/html' });
    return res.end(PAGE);
  }
  const png = /^\/src\/(\w+)\.png$/.exec(req.url);
  if (req.method === 'GET' && png && LAYERS.includes(png[1])) {
    res.writeHead(200, { 'content-type': 'image/png' });
    return res.end(readFileSync(join(SRC, `${png[1]}.png`)));
  }
  const out = /^\/out\/(\w+)$/.exec(req.url);
  if (req.method === 'POST' && out) {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      results[out[1]] = Buffer.concat(chunks);
      res.end('ok');
    });
    return;
  }
  if (req.method === 'POST' && req.url === '/done') {
    res.end('ok');
    return finish();
  }
  res.writeHead(404);
  res.end();
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const { port } = server.address();

const profile = mkdtempSync(join(tmpdir(), 'hero-assets-'));
const child = spawn(
  browser,
  [
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    `--user-data-dir=${profile}`,
    `http://127.0.0.1:${port}/`,
  ],
  { stdio: 'ignore' }
);
const timer = setTimeout(() => {
  stop();
  fail('timed out waiting for the browser');
}, 90000);

function stop() {
  clearTimeout(timer);
  if (process.platform === 'win32') spawnSync('taskkill', ['/pid', String(child.pid), '/T', '/F']);
  else child.kill();
  server.close();
  try {
    rmSync(profile, { recursive: true, force: true });
  } catch {
    // The browser may still hold files for a moment; the temp folder is harmless.
  }
}

await done;
stop();

/** Reads size and alpha flag from a WebP header (VP8X or VP8L). */
function webpInfo(b) {
  if (b.toString('ascii', 0, 4) !== 'RIFF' || b.toString('ascii', 8, 12) !== 'WEBP') return null;
  const kind = b.toString('ascii', 12, 16);
  if (kind === 'VP8X')
    return { w: 1 + b.readUIntLE(24, 3), h: 1 + b.readUIntLE(27, 3), alpha: !!(b[20] & 0x10) };
  if (kind === 'VP8L') {
    const bits = b.readUInt32LE(21);
    return { w: 1 + (bits & 0x3fff), h: 1 + ((bits >> 14) & 0x3fff), alpha: !!((bits >> 28) & 1) };
  }
  return { w: 0, h: 0, alpha: false };
}

mkdirSync(OUT, { recursive: true });
let total = 0;
for (const name of LAYERS) {
  const buf = results[name];
  if (!buf) fail(`no output for ${name}`);
  const info = webpInfo(buf);
  if (!info || info.w !== W || info.h !== H) fail(`${name}.webp is not a ${W} x ${H} WebP`);
  if (!info.alpha) fail(`${name}.webp lost its transparency`);
  writeFileSync(join(OUT, `${name}.webp`), buf);
  total += buf.length;
  console.log(`${name}.webp  ${(buf.length / 1024).toFixed(0)} KB  ${info.w}x${info.h}  alpha`);
}
console.log(
  `total ${(total / 1024).toFixed(0)} KB (budget ${BUDGET / 1024} KB, quality ${QUALITY})`
);
if (total > BUDGET) fail('over budget; lower HERO_WEBP_QUALITY in steps of 0.05 and rerun');
