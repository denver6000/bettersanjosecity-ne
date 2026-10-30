// Fails when the `en` and `fil` dictionaries in src/i18n/translations.ts have different key sets.
// Parsed as text (TS can't be imported by Node); relies on prettier's 4-space key indent.
import { readFileSync } from 'node:fs';

const src = readFileSync('src/i18n/translations.ts', 'utf8').replaceAll('\r\n', '\n');

function keysOf(lang) {
  const m = src.match(new RegExp(String.raw`^  ${lang}: \{\n([\s\S]*?)^  \},`, 'm'));
  if (!m) {
    console.error(`check-i18n: could not find the "${lang}" block in src/i18n/translations.ts`);
    process.exit(1);
  }
  return new Set(
    [...m[1].matchAll(/^ {4}(?:'([^']+)'|"([^"]+)"|([A-Za-z_]\w*))\s*:/gm)].map(
      (k) => k[1] ?? k[2] ?? k[3]
    )
  );
}

const en = keysOf('en');
const fil = keysOf('fil');
const problems = [
  ...[...en].filter((k) => !fil.has(k)).map((k) => `missing in fil: ${k}`),
  ...[...fil].filter((k) => !en.has(k)).map((k) => `missing in en:  ${k}`),
];

if (problems.length) {
  console.error(`check-i18n: ${problems.length} problem(s)\n${problems.join('\n')}`);
  process.exit(1);
}
console.log(`check-i18n: OK (${en.size} keys in both en and fil)`);
