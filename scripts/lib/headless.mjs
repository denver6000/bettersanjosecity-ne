// Runs a page in a headless Edge or Chrome and talks to it through a tiny local server.
// Shared by the hero art tools. No dependencies.
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { extname, join } from 'node:path';

const TYPES = { '.png': 'image/png', '.webp': 'image/webp', '.json': 'application/json' };

export function findBrowser() {
  return [
    process.env.BROWSER_PATH,
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  ].find((p) => p && existsSync(p));
}

/**
 * Serves `html` at `/`, each Buffer in `files` at `/file/<name>`, passes POST bodies to
 * `onPost[<name>](buffer)` at `/post/<name>`, and resolves when the page POSTs `/done`.
 * Throws on timeout or when no browser is found.
 */
export async function runPage({ html, files = {}, onPost = {}, timeoutMs = 90000 }) {
  const browser = findBrowser();
  if (!browser) throw new Error('no Edge or Chrome found; set BROWSER_PATH to its executable');

  let finish;
  const done = new Promise((r) => (finish = r));
  const server = createServer((req, res) => {
    if (req.method === 'GET' && req.url === '/') {
      res.writeHead(200, { 'content-type': 'text/html' });
      return res.end(html);
    }
    const file = /^\/file\/(.+)$/.exec(req.url ?? '');
    if (req.method === 'GET' && file && files[decodeURIComponent(file[1])]) {
      const name = decodeURIComponent(file[1]);
      res.writeHead(200, { 'content-type': TYPES[extname(name)] ?? 'application/octet-stream' });
      return res.end(files[name]);
    }
    const post = /^\/post\/(.+)$/.exec(req.url ?? '');
    if (req.method === 'POST' && post) {
      const chunks = [];
      req.on('data', (c) => chunks.push(c));
      req.on('end', () => {
        onPost[decodeURIComponent(post[1])]?.(Buffer.concat(chunks));
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

  const profile = mkdtempSync(join(tmpdir(), 'hero-tool-'));
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
  child.on('error', () => finish());
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    finish();
  }, timeoutMs);

  await done;
  clearTimeout(timer);
  if (process.platform === 'win32') spawnSync('taskkill', ['/pid', String(child.pid), '/T', '/F']);
  else child.kill();
  server.close();
  try {
    rmSync(profile, { recursive: true, force: true });
  } catch {
    // The browser may still hold files for a moment; the temp folder is harmless.
  }
  if (timedOut) throw new Error('timed out waiting for the browser page');
}

/** Reads size and alpha flag from a WebP header (VP8X or VP8L). */
export function webpInfo(b) {
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
