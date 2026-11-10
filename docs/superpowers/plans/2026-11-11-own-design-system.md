# Own design system Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the four BetterSolano stylesheets with stylesheets written fresh by us, with no visible change on any page.

**Architecture:** First build a screenshot harness and capture a baseline of every route. Then
take the site apart one area at a time. Each task cuts that area's rules out of the upstream
files, writes new rules for it in our own file, and must show zero screenshot differences before
it commits. Once every area is done, the upstream files are empty and get deleted.

**Tech Stack:** Next.js 16.4 static export (`out/`, `trailingSlash: true`), plain global CSS, Node 22 scripts with no dependencies, headless Edge or Chrome through the DevTools protocol (Node 22's global `WebSocket`).

**Spec:** `docs/superpowers/specs/2026-11-11-own-design-system-design.md`

## Global Constraints

- Branch `discard-bettersolano-theme`. Don't merge, push or deploy.
- No new dependencies. Flat colours only, no gradients.
- Keep every class name used in TSX. Write declarations fresh from what the page needs; never translate upstream rules line by line.
- Keep every custom property name that our own files read (`--color-navy`, `--color-gold`, `--color-live`, `--color-cream`, `--font-main`, `--spacing-*`, …). Run `grep -rhoE "var\(--[a-z0-9-]+" src/styles | sort -u` to get the list.
- Outside `tokens.css` and `theme.css`, new files contain no literal colours (no `#hex`, `rgb(`, `rgba(`, `hsl(`); they read `var(--…)` only, so dark mode keeps working.
- `src/styles/icons.css` is generated; don't touch it. Our own sheets (`site.css`, `theme.css`, `home.css`, `motion.css`, `taxes.css`, `estimator.css`, `scholarship.css`) change only where a moved token or rule forces it.
- `LICENSE` is unchanged.
- Drop the unreachable `body.high-contrast`, `body.font-large` and `body.font-xlarge` rules. Keep the print styles, rewritten.
- Acceptance: zero differing pixels after anti-aliasing tolerance, on every capture in the matrix (Task 1), or each remaining difference is listed with before/after images for the user.
- `npm run check` passes at the end of every task.

## Review Focus

1. **Runtime states the capture never renders:** the open mobile menu (`mobile-menu-open`), `is-in` reveal, `motion-ok`, hover and `:focus-visible`. Expect them to look exactly as before. Pinned by the `menu-open` and `focus` captures in Task 1's matrix.
2. **Loaded widget states:** capture blocks the network, so weather, news and map tiles show only their empty or error state. Expect the loaded states unchanged. Task 6 adds one unblocked, by-eye check of home.
3. **Filipino copy:** longer strings wrap differently in the nav and buttons. Expect no overflow. Pinned by the `fil` capture of home and services in the matrix.
4. **Dark mode on rules moved out of upstream:** a literal colour that slips in shows only in dark. Pinned by the dark captures and by `scripts/check-css-colors.mjs` (Task 2).
5. **Cascade order:** a rule moved to a file that loads at a different point can win or lose against `site.css` or page sheets. Expect identical computed styles. Caught by the full matrix compare at the end of every task.

---

### Task 1: Screenshot harness and baseline

**Files:**

- Create: `scripts/shots.mjs` (CLI), `scripts/lib/shots.mjs` (helpers), `scripts/lib/shots.test.mjs`
- Modify: `.gitignore` (add `.shots/`), `package.json` (scripts `shots:capture`, `shots:compare`)

**Interfaces:**

- Produces: `npm run shots:capture -- <name>` builds nothing; it serves the existing `out/` on 127.0.0.1 and writes `.shots/<name>/<id>.png` for every capture in the matrix. `npm run shots:compare -- baseline <name>` prints one line per differing capture, `<id> <pixels>`, then `DIFF 0` or `DIFF <n captures>`, writes `.shots/diff/<id>.png` highlighting changed pixels, and exits 1 when n > 0.
- `scripts/lib/shots.mjs` exports:
  - `routes(outDir: string): string[]`: every `index.html` under `out/` as a URL path (`/`, `/services/`, …), plus `/404.html`. Skips `_next`, `api`, `assets`.
  - `matrix(routes: string[]): Capture[]` where `Capture = { id: string, path: string, width: number, scheme: 'light'|'dark', media: 'screen'|'print', lang: 'en'|'fil', state: 'none'|'menu-open'|'focus' }`. Contents: every route at 375, 768 and 1280 px, light, en. Plus dark at 375 and 1280 for `/`, `/services/`, `/business-taxes/`. Plus print at 1280 for the same three. Plus `fil` at 375 and 1280 for `/` and `/services/`. Plus `menu-open` at 375 for `/`. Plus `focus` at 1280 for `/` (Tab pressed twice). `id` is a filesystem-safe join of the fields, unique.
  - `countDiff(a: Uint8ClampedArray, b: Uint8ClampedArray, tolerance = 24): number`: RGBA arrays of equal length; counts pixels where any channel differs by more than `tolerance`. Images of different sizes count as fully different, handled by the caller.

- [ ] **Step 1: Write the failing tests** in `scripts/lib/shots.test.mjs` (`node:test`):
  - `routes` on a temp dir with `index.html`, `services/index.html`, `_next/x/index.html`, `404.html` returns `['/', '/404.html', '/services/']` sorted.
  - `matrix(['/', '/services/', '/business-taxes/', '/faq/'])` has 12 light-en-screen-none captures; 6 dark captures, none at 768; 3 print captures; 4 `fil` captures; exactly one `menu-open` capture and one `focus` capture; all ids are unique.
  - `countDiff` of identical arrays is 0; a pixel off by 10 on one channel is 0; a pixel off by 30 is 1.
- [ ] **Step 2: Run** `node --test scripts/lib/shots.test.mjs`. Expected: FAIL (module not found).
- [ ] **Step 3: Implement the helpers** in `scripts/lib/shots.mjs`.
- [ ] **Step 4: Run** the test again. Expected: PASS.
- [ ] **Step 5: Implement the CLI** in `scripts/shots.mjs`. Reuse `findBrowser()` from `scripts/lib/headless.mjs`. Launch with `--headless=new --remote-debugging-port=0 --user-data-dir=<.shots/profile>` and read the port from `DevToolsActivePort`. Serve `out/` with `node:http`. For each capture:
  - Block every request not to 127.0.0.1 with the `Fetch` domain.
  - Emulate `prefers-reduced-motion: reduce`, the colour scheme and the print/screen media.
  - Freeze `Date` to 2026-11-11T09:00:00+08:00 with `Page.addScriptToEvaluateOnNewDocument`. Set `localStorage.selectedLang` for `fil`.
  - For dark: remove `data-theme` from `<html>` after load.
  - For `menu-open`: click the menu toggle. For `focus`: press Tab twice with `Input.dispatchKeyEvent`.
  - Wait for `document.fonts.ready` plus 3.5 s (past the 3 s `HERO_GATE` and `LANG_GATE` fallbacks in `layout.tsx`), then take a full-page `Page.captureScreenshot` with `captureBeyondViewport: true`.

  `compare` decodes both PNGs in the same headless browser (load them as images on a canvas, read `getImageData`), runs `countDiff`, and paints differing pixels red for `.shots/diff/`. Clean up the browser by pid and the server on exit.

- [ ] **Step 6: Capture the baseline.** Run `npm run build`, then `npm run shots:capture -- baseline`. Expected: one PNG per matrix entry. Look at five of them (home light 1280, home dark 375, services print, home menu-open, home fil 375): each must show a real, styled page.
- [ ] **Step 7: Check that the harness can go green and red.**
  - Run `npm run shots:capture -- check` then `npm run shots:compare -- baseline check`. Expected: `DIFF 0`. If it isn't 0, the capture is not deterministic; fix that before going on.
  - Then temporarily change `--color-navy` in `style.css` to `#0a2f87`, rebuild, capture `check`, and compare. Expected: non-zero. Revert, rebuild.
- [ ] **Step 8: Commit** with message `test: screenshot harness for the CSS rewrite` (with the Co-Authored-By line).

### Task 2: Tokens and base styles

**Files:**

- Create: `src/styles/tokens.css`, `src/styles/base.css`, `scripts/check-css-colors.mjs`
- Modify: `src/styles/style.css` (cut rules), `src/app/layout.tsx:11-18` (imports), `package.json` (`check` runs `check-css-colors.mjs`)

**Interfaces:**

- Produces: `tokens.css` holds the light `:root` custom properties now at the top of `style.css`, under the same names. `base.css` holds the reset, `html`/`body`, headings, paragraphs, links, images, `.container`, `.skip-link`, `.sr-only` and other utility classes.
- Import order in `layout.tsx` from this task on: `icons.css`, `tokens.css`, `base.css`, `header.css`, `components.css`, (what's left of) `style.css`, `responsive.css`, `accessibility.css`, `footer.css`, `site.css`, `theme.css`. Create `header.css` and `components.css` as empty files in this task so the import list is fixed from here on.
- `scripts/check-css-colors.mjs`: fails with `check-css-colors: <file>:<line> has a literal colour` for any `#hex`, `rgb(`, `rgba(`, `hsl(` in `base.css`, `header.css`, `components.css`, `footer.css`, `a11y.css`, `print.css`. Missing files are skipped.

- [ ] **Step 1: Write the check script first**, then add a literal colour to `base.css` and run `node scripts/check-css-colors.mjs`. Expected: FAIL naming the file and line. Remove the colour.
- [ ] **Step 2: Write `tokens.css` and `base.css` fresh.** Cut the matching rules out of `style.css`. To find which upstream rules are unused, grep the class in `src/` and `out/`; drop it if neither has it.
- [ ] **Step 3: Rebuild, capture `t2` and compare** with `npm run build && npm run shots:capture -- t2 && npm run shots:compare -- baseline t2`. Expected: `DIFF 0`.
- [ ] **Step 4: Run** `npm run check`. Expected: exit 0.
- [ ] **Step 5: Commit** with message `style: own tokens and base styles`.

### Task 3: Header, top strip and navigation

**Files:**

- Create content in: `src/styles/header.css`
- Modify: `src/styles/style.css`, `src/styles/responsive.css` (cut the header, top strip, nav, language switcher and mobile-menu rules, including their media-query parts)

Steps:

- [ ] **Step 1:** Write `header.css` fresh, with its breakpoints inside the file, and cut the old rules.
- [ ] **Step 2:** Rebuild, capture `t3` and compare. Expected: `DIFF 0`. The `menu-open`, `focus` and `fil` captures must be among the passes.
- [ ] **Step 3:** Run `npm run check`. Expected: exit 0.
- [ ] **Step 4:** Commit with message `style: own header and navigation styles`.

### Task 4: Shared components

**Files:**

- Create content in: `src/styles/components.css`
- Modify: `src/styles/style.css`, `src/styles/responsive.css` (cut buttons, cards, grids, sections, page headers, breadcrumbs, forms, tables, badges, alerts and their media-query parts)

Steps:

- [ ] **Step 1:** Write `components.css` fresh and cut the old rules. Expected afterwards: `style.css` is empty apart from comments. Run `grep -c "{" src/styles/style.css` and expect `0`. Any rule still left belongs in `base.css` or `components.css`.
- [ ] **Step 2:** Rebuild, capture `t4` and compare. Expected: `DIFF 0`.
- [ ] **Step 3:** Run `npm run check`. Expected: exit 0.
- [ ] **Step 4:** Commit with message `style: own component styles`.

### Task 5: Footer, accessibility and print

**Files:**

- Rewrite from scratch: `src/styles/footer.css` (delete all old content first)
- Create: `src/styles/a11y.css`, `src/styles/print.css`
- Delete: `src/styles/accessibility.css`, `src/styles/responsive.css`, `src/styles/style.css`
- Modify: `src/app/layout.tsx` imports. Final order: `icons`, `tokens`, `base`, `header`, `components`, `footer`, `a11y`, `print`, `site`, `theme`.

Steps:

- [ ] **Step 1:** Write `footer.css`, `a11y.css` (focus, reduced motion, `prefers-contrast: high`) and `print.css` (the `@media print` behaviour: hide header, footer, menu toggle, language selector, skip link and buttons; flatten cards). Drop `body.high-contrast`, `body.font-large` and `body.font-xlarge`.
- [ ] **Step 2:** Delete the three upstream files. Run `grep -rn "style.css\|responsive.css\|accessibility.css" src`. Expected: no matches.
- [ ] **Step 3:** Rebuild, capture `t5` and compare. Expected: `DIFF 0`, including the print captures.
- [ ] **Step 4:** Run `npm run check`. Expected: exit 0.
- [ ] **Step 5:** Commit with message `style: own footer, accessibility and print styles; remove BetterSolano CSS`.

### Task 6: Credits and final check

**Files:**

- Modify: `README.md:7` (drop the BetterSolano design-system sentence), `README.md:130` (describe `src/styles/` as our own stylesheets), `src/app/layout.tsx:11` comment, `src/styles/site.css:1-4` header comment

Steps:

- [ ] **Step 1:** Edit the four places. Then run `grep -rn -i "bettersolano" README.md src`. Expected: no matches.
- [ ] **Step 2:** Run the full capture `final` and compare with the baseline. Expected: `DIFF 0`. Otherwise list every differing id with `.shots/baseline/<id>.png`, `.shots/final/<id>.png` and `.shots/diff/<id>.png` for the user.
- [ ] **Step 3:** By-eye check with the network on. Run `npm run dev`, open home and business-taxes at 1280 and 375. Weather, news, map and estimator must look like the live site.
- [ ] **Step 4:** Run `npm run check`. Expected: exit 0.
- [ ] **Step 5:** Commit with message `docs: drop the BetterSolano design-system credit`.
