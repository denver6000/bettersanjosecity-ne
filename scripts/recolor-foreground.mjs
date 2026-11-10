// Makes the planting-season foreground from the base foreground layer: every golden grain head
// becomes leaf green, and nothing else changes, so the grass keeps its exact pixels and positions.
// Usage: node scripts/recolor-foreground.mjs   (env: BROWSER_PATH)
// Writes scripts/source/hero/occasions/season-planting/foreground-planting.png
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { runPage } from './lib/headless.mjs';

const ROOT = resolve(import.meta.dirname, '..');
const OUT = join(ROOT, 'scripts/source/hero/occasions/season-planting/foreground-planting.png');

const html = `<!doctype html><meta charset="utf-8"><script>
(async () => {
  const img = new Image();
  img.src = '/file/foreground.png';
  await img.decode();
  const c = document.createElement('canvas');
  c.width = img.naturalWidth; c.height = img.naturalHeight;
  const ctx = c.getContext('2d');
  ctx.drawImage(img, 0, 0);
  const data = ctx.getImageData(0, 0, c.width, c.height);
  const p = data.data;
  const hsl2rgb = (h, s, l) => {
    const k = (n) => (n + h / 30) % 12, a = s * Math.min(l, 1 - l);
    const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return [f(0) * 255, f(8) * 255, f(4) * 255];
  };
  for (let i = 0; i < p.length; i += 4) {
    if (p[i + 3] < 8) continue;
    const r = p[i] / 255, g = p[i + 1] / 255, b = p[i + 2] / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
    const l = (max + min) / 2;
    if (d < 0.05) continue;
    const s = d / (1 - Math.abs(2 * l - 1));
    let h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
    h = (h * 60 + 360) % 360;
    if (h >= 25 && h <= 68 && s > 0.35) {
      const [nr, ng, nb] = hsl2rgb(108, Math.min(1, s * 0.85), Math.max(0.2, l * 0.78));
      p[i] = nr; p[i + 1] = ng; p[i + 2] = nb;
    }
  }
  ctx.putImageData(data, 0, 0);
  const blob = await new Promise((r) => c.toBlob(r, 'image/png'));
  await fetch('/post/out', { method: 'POST', body: blob });
  await fetch('/done', { method: 'POST' });
})();
</script>`;

let out;
await runPage({
  html,
  files: { 'foreground.png': readFileSync(join(ROOT, 'scripts/source/hero/foreground.png')) },
  onPost: { out: (b) => (out = b) },
});
if (!out) {
  console.error('recolor-foreground: no output');
  process.exit(1);
}
mkdirSync(resolve(OUT, '..'), { recursive: true });
writeFileSync(OUT, out);
console.log(`wrote ${OUT} (${(out.length / 1024).toFixed(0)} KB)`);
