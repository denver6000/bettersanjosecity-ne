// Fails when the two dark token blocks in src/styles/theme.css (data-theme and prefers-color-scheme) differ.
import { readFileSync } from 'node:fs';

const css = readFileSync('src/styles/theme.css', 'utf8').replaceAll('\r\n', '\n');
const grab = (sel) =>
  css.match(
    new RegExp(String.raw`^\s*${sel} \{\n\s*color-scheme: dark;\n([\s\S]*?)\n\s*\}`, 'm')
  )?.[1];
const a = grab(String.raw`:root\[data-theme='dark'\]`);
const b = grab(String.raw`:root:not\(\[data-theme='light'\]\)`);
const norm = (s) =>
  s
    .split('\n')
    .map((l) => l.trim())
    .join('\n');
if (!a || !b) {
  console.error('check-theme: could not find both dark token blocks in src/styles/theme.css');
  process.exit(1);
}
if (norm(a) !== norm(b)) {
  console.error('check-theme: the two dark token blocks in src/styles/theme.css differ');
  process.exit(1);
}
