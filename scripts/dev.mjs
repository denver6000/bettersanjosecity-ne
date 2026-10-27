// `npm run dev`: PHP's built-in server for public/api/*.php alongside `next dev`.
// next.config.mjs forwards /api/*.php to it. Without PHP the site still runs; the
// live weather station just falls back to the Open-Meteo forecast.
import { spawn, spawnSync } from 'node:child_process';
import { PHP_DEV_PORT } from '../next.config.mjs';

const children = [];

function run(cmd, args, name) {
  const child = spawn(cmd, args, { stdio: 'inherit', shell: process.platform === 'win32' });
  child.on('exit', (code) => {
    if (name === 'next') shutdown(code ?? 0);
  });
  children.push(child);
}

function shutdown(code) {
  for (const child of children) if (!child.killed) child.kill();
  process.exit(code);
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

if (spawnSync('php', ['-v'], { shell: process.platform === 'win32' }).status === 0) {
  console.log(`[dev] PHP API on http://127.0.0.1:${PHP_DEV_PORT} (public/api/*.php)`);
  run('php', ['-S', `127.0.0.1:${PHP_DEV_PORT}`, '-t', 'public', '-q'], 'php');
} else {
  console.warn('[dev] PHP not found; /api/weather-station.php will be unavailable in development.');
}

run('npx', ['next', 'dev', ...process.argv.slice(2)], 'next');
