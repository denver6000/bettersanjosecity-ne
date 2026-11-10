// Renders the three base hero layers stacked with a labelled 100-unit grid and every named anchor
// (src/components/home/hero/occasions/anchors.json) as a cross, so anchors can be checked by eye.
// Usage: node scripts/hero-overlay.mjs [out.png]   (env: BROWSER_PATH)
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { findBrowser } from './lib/headless.mjs';

const ROOT = resolve(import.meta.dirname, '..');
const out = resolve(process.argv[2] ?? 'hero-overlay.png');
const anchors = JSON.parse(
  readFileSync(join(ROOT, 'src/components/home/hero/occasions/anchors.json'), 'utf8')
);
const layer = (n) => pathToFileURL(join(ROOT, 'public/assets/images/hero/scene', `${n}.webp`)).href;

const browser = findBrowser();
if (!browser) {
  console.error('hero-overlay: no Edge or Chrome found; set BROWSER_PATH');
  process.exit(1);
}

const html = `<!doctype html><body style="margin:0;background:#a9d8f0">
<div style="position:relative;width:1586px;height:992px">
<img src="${layer('hills')}" style="position:absolute;left:0;top:0">
<img src="${layer('paddies')}" style="position:absolute;left:0;top:0">
<img src="${layer('foreground')}" style="position:absolute;left:0;top:0">
<svg id="o" width="1586" height="992" style="position:absolute;left:0;top:0" font-family="sans-serif" font-size="18"></svg>
</div>
<script>
const anchors = ${JSON.stringify(anchors)};
let s = '';
for (let x = 0; x <= 1586; x += 100) s += '<line x1="'+x+'" y1="0" x2="'+x+'" y2="992" stroke="#ff00aa" opacity=".5"/><text x="'+(x+3)+'" y="16" fill="#c0006a">'+x+'</text>';
for (let y = 0; y <= 992; y += 100) s += '<line x1="0" y1="'+y+'" x2="1586" y2="'+y+'" stroke="#ff00aa" opacity=".5"/><text x="3" y="'+(y-3)+'" fill="#c0006a">'+y+'</text>';
for (const [name, [x, y]] of Object.entries(anchors))
  s += '<g><line x1="'+(x-14)+'" y1="'+y+'" x2="'+(x+14)+'" y2="'+y+'" stroke="#000" stroke-width="4"/><line x1="'+x+'" y1="'+(y-14)+'" x2="'+x+'" y2="'+(y+14)+'" stroke="#000" stroke-width="4"/><line x1="'+(x-14)+'" y1="'+y+'" x2="'+(x+14)+'" y2="'+y+'" stroke="#fff" stroke-width="2"/><line x1="'+x+'" y1="'+(y-14)+'" x2="'+x+'" y2="'+(y+14)+'" stroke="#fff" stroke-width="2"/><text x="'+(x+18)+'" y="'+(y-8)+'" fill="#fff" stroke="#000" stroke-width="3" paint-order="stroke">'+name+'</text></g>';
document.getElementById('o').innerHTML = s;
</script></body>`;

const dir = mkdtempSync(join(tmpdir(), 'hero-overlay-'));
const page = join(dir, 'overlay.html');
writeFileSync(page, html);
const run = spawnSync(
  browser,
  [
    '--headless=new',
    '--disable-gpu',
    '--allow-file-access-from-files',
    `--user-data-dir=${join(dir, 'profile')}`,
    `--screenshot=${out}`,
    '--window-size=1586,992',
    pathToFileURL(page).href,
  ],
  { stdio: 'ignore', timeout: 60000 }
);
rmSync(dir, { recursive: true, force: true });
if (run.status !== 0) {
  console.error('hero-overlay: the browser failed to render the overlay');
  process.exit(1);
}
console.log(`wrote ${out}`);
