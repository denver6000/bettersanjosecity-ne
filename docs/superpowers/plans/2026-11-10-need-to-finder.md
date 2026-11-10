# "I need to…" Finder Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the "Popular services" tiles with a finish-the-sentence "I need to…" finder that routes visitors to existing pages.

**Architecture:** A pure data module `src/lib/finder.ts` (intents, destination rule) tested with `node:test`; a small client component `HomeFinder.tsx` renders the sentence, choice pills and result card; styles go in `home.css`. Copy lives in `translations.ts` (en + fil).

**Tech Stack:** Next.js 16 static export, React 19, TypeScript, plain CSS, Phosphor icon font (subset built by `npm run icons`), Node 24 `node:test`.

**Spec:** `docs/superpowers/specs/2026-11-10-need-to-finder-design.md`

## Global Constraints

- Flat solid colours only, no gradients. Use existing tokens (`--color-navy`, `--color-gold`, `--color-line`, `--surface`, `--color-navy-tint`, `--color-bg`, `--font-display`); both themes must work (dark mode redefines `--color-navy` to a light blue).
- Real Phosphor icons written in full (`ph-storefront`, never built from fragments); after adding icons run `npm run icons`.
- Minimal sub-text; no content repeated elsewhere on the home page.
- Every `finder-*` key exists in both `en` and `fil` (`scripts/check-i18n.mjs`).
- Motion: transform and opacity only, inside `prefers-reduced-motion: no-preference`.
- Tests import with the `.ts` extension (`./finder.ts`), as `src/lib/occasions.test.ts` does.
- `npm run check` must pass at the end.

## Review Focus

- A `soon` intent must never link to a missing page: destination is `/contact`.
- Keyboard user picks a choice with Enter/Space: focus lands on the result button; mouse clicks do not steal focus.
- Language switch while a choice is selected: the sentence and card re-render in the new language.
- Phone width (375px): 12 pills wrap without horizontal scroll; sentence stays legible.
- Reduced motion on: no slide or fade, card swaps instantly.

---

### Task 1: Intent data, copy and tests

**Files:**
- Create: `src/lib/finder.ts`, `src/lib/finder.test.ts`
- Modify: `src/i18n/translations.ts` (en block and fil block)

**Interfaces:**
- Produces: `interface Intent { id: string; icon: string; key: string; titleKey: string; href?: string; soon?: boolean }`, `const INTENTS: Intent[]` (12 entries, order below), `resolveIntent(id: string): Intent | undefined`, `destination(intent: Intent): string` (returns `href`, or `'/contact'` when the intent has none).
- Also produces translation keys: `finder-label` (group aria-label), `finder-lead` ("I need to"), `finder-go` ("Go"), `finder-contact` ("Contact City Hall"), `finder-soon` ("Not online yet. City Hall can help."), and per intent `finder-<id>` (choice, lowercase phrase that finishes the sentence) and `finder-<id>-t` (card headline).

Intents, in order (id, icon, destination): `business-tax` ph-storefront /business-taxes; `tax-estimate` ph-calculator /business-taxes/estimator; `scholarship` ph-graduation-cap /scholarship; `news` ph-newspaper /news; `budget` ph-coins /budget; `numbers` ph-chart-bar /statistics; `ordinances` ph-scroll /legislative; `officials` ph-buildings /government; `certificate` ph-file-text soon; `welfare` ph-hand-heart soon; `farming` ph-plant soon; `city-hall` ph-phone /contact.

- [ ] **Step 1: Write the failing tests** in `src/lib/finder.test.ts`:
  - `INTENTS has 12 entries with unique ids`
  - `every href is an existing app page` — `existsSync('src/app' + href + '/page.tsx')` for each intent with an href
  - `soon intents have no href and go to /contact` — `destination(i) === '/contact'` for each `soon` intent; `destination` equals `href` otherwise
  - `non-soon intents have an href` and `soon intents are exactly certificate, welfare, farming`
  - `every icon is a written-out Phosphor class` — `/^ph-[a-z0-9-]+$/`
  - `every key and titleKey is defined in both en and fil` — read `src/i18n/translations.ts` (replace `\r\n`), slice the `en` and `fil` blocks as `scripts/check-i18n.mjs` does, assert each `'<key>':` appears in both, plus the five shared keys above
  - `resolveIntent finds by id and returns undefined for unknown ids`
- [ ] **Step 2: Run** `node --experimental-strip-types --test src/lib/finder.test.ts`. Expected: FAIL (module not found).
- [ ] **Step 3: Implement** `src/lib/finder.ts` with the interface and exports above, no imports. Add the en and fil strings to `translations.ts`: English as in the spec's table (choice e.g. "pay my business tax", headline e.g. "Pay your business tax"); Filipino written naturally in the same register as the neighbouring keys.
- [ ] **Step 4: Run** the same command. Expected: all PASS. Then run `npm run test:lib` and `node scripts/check-i18n.mjs`. Expected: all tests pass; `check-i18n: OK`.
- [ ] **Step 5: Commit** `git add src/lib/finder.ts src/lib/finder.test.ts src/i18n/translations.ts && git commit -m "feat: intent data and copy for the I need to finder"`

### Task 2: Finder component, styles, home page swap

**Files:**
- Create: `src/components/home/HomeFinder.tsx`
- Modify: `src/styles/home.css` (add finder styles; remove `.home-svc` rules and their responsive overrides), `src/styles/motion.css` (drop `.home-svc` selectors), `src/app/page.tsx` (render `<HomeFinder />` in place of `<HomeServices />`), `src/i18n/translations.ts` (remove now-unused `home-popular-services` and the six `home-svc-*` keys in both languages)
- Delete: `src/components/home/HomeServices.tsx`
- Regenerate: `src/styles/icons.css` via `npm run icons`

**Interfaces:**
- Consumes: `INTENTS`, `destination`, `Intent` from `@/lib/finder`; `useLanguage` / `T` from `@/i18n/LanguageContext`; `data-reveal` for the section header like sibling sections.
- Produces: default export `HomeFinder()` client component (`'use client'`).

- [ ] **Step 1: Implement `HomeFinder`.** Section `home-sec home-finder` with `aria-labelledby` on an `h2` that reads as one sentence: `finder-lead` then the blank holding the selected choice text (empty until chosen, drawn as a gold underline of fixed minimum width). Below: a `div role="group"` (aria-label `finder-label`) of pill `<button type="button" aria-pressed>` per intent (icon + `finder-<id>` text). Below that, a `div aria-live="polite"` result area: when an intent is selected render a `home-card` with `key={intent.id}` (so it re-animates): icon in a round `--color-navy-tint` chip, headline `finder-<id>-t`, and one `Link` styled `btn btn-primary` — "Go" with `ph-arrow-right` to `destination(intent)`, or for `soon` intents the `finder-soon` line plus the `finder-contact` button to `/contact`. Footer link "All services" (`home-all-services`) to `/services`, styled `home-more`. No intent selected on load; result area empty. When selection comes from keyboard (`event.detail === 0` on click) focus the result button after render (ref + effect, `focus({ preventScroll: true })`); mouse clicks never move focus.
- [ ] **Step 2: Style it** in `home.css`: sentence in `--font-display`, 56px desktop and 34px under 900px; pills `border-radius: 999px`, 1px `--color-line` border, selected pill `background: var(--color-navy); color: var(--color-bg)`; choices wrap with 10px gap; card entrance `translate 0 12px` + opacity over 250ms ease-out inside `@media (prefers-reduced-motion: no-preference)`; focus rings via `:focus-visible` like `.home-more`. Remove the old `.home-svc` rules (home.css ~267–289, ~364, ~390, ~858–862) and the `.home-svc` selectors in `motion.css` (keep `.home-numbers` ones).
- [ ] **Step 3: Swap and clean up** — edit `page.tsx`, delete `HomeServices.tsx`, remove the unused translation keys, run `npm run icons`.
- [ ] **Step 4: Run** `npm run typecheck && node scripts/check-icons.mjs && node scripts/check-i18n.mjs && npx prettier --check src docs`. Expected: all pass (run `npx prettier --write` on touched files if the format check fails).
- [ ] **Step 5: Commit** `git add -A src docs && git commit -m "feat: I need to finder replaces the popular services tiles"` (exclude `.claude/`).

### Task 3: Verify in the browser and finish

**Files:** fixes only, in the files above.

- [ ] **Step 1: Start the dev server** with `preview_start` and open `/`. Expected: finder sits under the hero, no console errors.
- [ ] **Step 2: Check each Review Focus line** — click a normal choice, click a `soon` choice, tab to a choice and press Enter (focus lands on the result button), switch language to FIL (sentence and card change), resize to 375px wide (no horizontal scroll), toggle dark theme, emulate reduced motion (instant swap). Fix anything that fails; take screenshots of desktop light, desktop dark and mobile.
- [ ] **Step 3: Run** `npm run check`. Expected: exits 0 (icons, i18n, theme, prettier, typecheck, scripts tests, lib tests, build all pass).
- [ ] **Step 4: Commit** any fixes: `git commit -am "fix: finder polish from the browser check"` (skip if nothing changed).
