// Converts one occasion's art (scripts/source/hero/occasions/<id>/*.png) to WebP in
// public/assets/images/hero/occasions/<id>/, writes a sprite manifest for sheet*.png, and checks
// size, alpha, weight and (for paddies-*.png variants) alignment with the base paddies layer.
// Usage: node scripts/build-occasion-assets.mjs <id>   (env: BROWSER_PATH, HERO_WEBP_QUALITY=0.82)
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { runPage, webpInfo } from './lib/headless.mjs';
import { findSprites, maskIoU, maskOverlap } from './lib/sprites.mjs';

const ROOT = resolve(import.meta.dirname, '..');
const W = 1586;
const H = 992;
const QUALITY = Number(process.env.HERO_WEBP_QUALITY ?? 0.82);
const REGION = { x: 1150, y: 60, w: 436, h: 600 }; // hut and palms
const id = process.argv[2];

function fail(msg) {
  console.error(`build-occasion-assets: ${msg}`);
  process.exit(1);
}
if (!id || !/^[\w-]+$/.test(id)) fail('usage: node scripts/build-occasion-assets.mjs <id>');

const SRC = join(ROOT, 'scripts/source/hero/occasions', id);
const OUT = join(ROOT, 'public/assets/images/hero/occasions', id);
if (!existsSync(SRC)) fail(`no folder ${SRC}`);
const names = readdirSync(SRC)
  .filter((f) => f.endsWith('.png'))
  .map((f) => f.slice(0, -4));
if (!names.length) fail('no PNG files found');

const files = {};
for (const n of names) {
  const png = readFileSync(join(SRC, `${n}.png`));
  if (png.readUInt32BE(16) !== W || png.readUInt32BE(20) !== H) fail(`${n}.png is not ${W} x ${H}`);
  files[`${n}.png`] = png;
}
const needsBase = names.some((n) => n.startsWith('paddies-'));
if (needsBase)
  files['__base-paddies.png'] = readFileSync(join(ROOT, 'scripts/source/hero/paddies.png'));

const html = `<!doctype html><meta charset="utf-8"><script>
(async () => {
  for (const name of ${JSON.stringify(Object.keys(files))}) {
    const img = new Image();
    img.src = '/file/' + encodeURIComponent(name);
    await img.decode();
    const c = document.createElement('canvas');
    c.width = img.naturalWidth; c.height = img.naturalHeight;
    const ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const px = ctx.getImageData(0, 0, c.width, c.height).data;
    const alpha = new Uint8Array(c.width * c.height);
    for (let i = 0; i < alpha.length; i++) alpha[i] = px[i * 4 + 3];
    await fetch('/post/alpha:' + encodeURIComponent(name), { method: 'POST', body: alpha });
    if (!name.startsWith('__')) {
      const blob = await new Promise((r) => c.toBlob(r, 'image/webp', ${QUALITY}));
      await fetch('/post/webp:' + encodeURIComponent(name), { method: 'POST', body: blob });
    }
  }
  await fetch('/done', { method: 'POST' });
})();
</script>`;

const webp = {};
const alpha = {};
const onPost = {};
for (const name of Object.keys(files)) {
  onPost[`webp:${name}`] = (b) => (webp[name] = b);
  onPost[`alpha:${name}`] = (b) => (alpha[name] = new Uint8Array(b));
}

try {
  await runPage({ html, files, onPost });
} catch (e) {
  fail(e.message);
}

mkdirSync(OUT, { recursive: true });
let total = 0;
const sheets = [];
for (const n of names) {
  const buf = webp[`${n}.png`];
  if (!buf) fail(`no output for ${n}`);
  const info = webpInfo(buf);
  if (!info || info.w !== W || info.h !== H) fail(`${n}.webp is not a ${W} x ${H} WebP`);
  if (!info.alpha) fail(`${n}.webp has no transparency`);
  writeFileSync(join(OUT, `${n}.webp`), buf);
  const variantCap = n.startsWith('paddies-') ? 140 : n.startsWith('foreground-') ? 160 : 0;
  if (variantCap) {
    if (buf.length > variantCap * 1024)
      fail(
        `${n}.webp is ${(buf.length / 1024).toFixed(0)} KB, over its ${variantCap} KB budget; lower HERO_WEBP_QUALITY in steps of 0.05`
      );
  } else {
    total += buf.length;
  }
  console.log(`${n}.webp  ${(buf.length / 1024).toFixed(0)} KB`);

  if (n.startsWith('sheet')) {
    const sprites = findSprites(alpha[`${n}.png`], W, H);
    if (sprites.length < 2)
      fail(`${n} has ${sprites.length} sprite(s); expected at least 2 isolated objects`);
    sheets.push({
      file: `${n}.webp`,
      sprites: sprites.map((s, i) => ({ name: `s${i + 1}`, x: s.x, y: s.y, w: s.w, h: s.h })),
    });
    console.log(`  ${sprites.length} sprites`);
  }
  if (n.startsWith('paddies-')) {
    const base = alpha['__base-paddies.png'];
    const iou = maskIoU(alpha[`${n}.png`], base, REGION, W);
    const fit = maskOverlap(alpha[`${n}.png`], base, REGION, W, 3);
    console.log(
      `  alignment ${fit.toFixed(3)} within 3 px (plain IoU ${iou.toFixed(3)}), hut and palm region`
    );
    if (fit < 0.99)
      fail(
        `${n} drifts from the base paddies layer (overlap within 3 px is ${fit.toFixed(3)}, need 0.99)`
      );
  }
}
if (sheets.length) writeFileSync(join(OUT, 'manifest.json'), JSON.stringify({ sheets }));

const budget = 150 * 1024;
if (total > 0) console.log(`total ${(total / 1024).toFixed(0)} KB (budget ${budget / 1024} KB)`);
if (total > budget) fail('over budget; lower HERO_WEBP_QUALITY in steps of 0.05 and rerun');
