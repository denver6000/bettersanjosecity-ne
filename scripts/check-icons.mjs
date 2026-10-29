// Fails when src still uses Bootstrap Icons or names a Phosphor glyph the font does not define.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const WEIGHTS = new Set(['ph-duotone', 'ph-bold', 'ph-fill', 'ph-light', 'ph-thin']);
const defined = new Set(
  readFileSync('node_modules/@phosphor-icons/web/src/regular/style.css', 'utf8').match(
    /(?<=\.)ph-[a-z0-9-]+(?=:before)/g
  )
);

const files = readdirSync('src', { recursive: true })
  .filter((f) => /\.(ts|tsx|css)$/.test(f))
  .map((f) => join('src', f));

const problems = [];
for (const file of files) {
  readFileSync(file, 'utf8')
    .split('\n')
    .forEach((line, i) => {
      const at = `${file}:${i + 1}`;
      for (const [name] of line.matchAll(/(?<![\w-])ph-[a-z0-9-]+/g)) {
        if (!WEIGHTS.has(name) && !defined.has(name))
          problems.push(`${at}  unknown Phosphor icon ${name}`);
      }
      if (/(?<![\w-])bi-[a-z0-9]/.test(line))
        problems.push(`${at}  Bootstrap icon: ${line.trim()}`);
      // standalone `bi` class token: className strings, template literals, `.bi` selectors
      if (
        /(?:class(?:Name)?=["'{`][^"'`]*|\$\{[^}]*|["'`]\s*)(?<![\w-])bi(?![\w-])|(?<![\w-])\.bi(?![\w-])|["'`]bi\s/.test(
          line
        )
      )
        problems.push(`${at}  Bootstrap "bi" class: ${line.trim()}`);
    });
}

if (problems.length) {
  console.error(`check-icons: ${problems.length} problem(s)\n${problems.join('\n')}`);
  process.exit(1);
}
console.log(`check-icons: OK (${files.length} files, ${defined.size} Phosphor icons known)`);
