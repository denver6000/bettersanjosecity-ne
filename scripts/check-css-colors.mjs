// Fails when one of our shared stylesheets hard-codes a colour. Colours live in tokens.css and
// theme.css only, so the dark theme can still switch them all.
import { existsSync, readFileSync } from 'node:fs';

const FILES = ['base', 'header', 'components', 'a11y', 'print'].map((f) => `src/styles/${f}.css`);
const LITERAL = /#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?)\(/;

let bad = 0;
for (const file of FILES.filter((f) => existsSync(f))) {
  readFileSync(file, 'utf8')
    .split('\n')
    .forEach((line, i) => {
      if (LITERAL.test(line.replace(/\/\*.*?\*\//g, ''))) {
        console.error(`check-css-colors: ${file}:${i + 1} has a literal colour`);
        bad++;
      }
    });
}
if (bad) process.exit(1);
