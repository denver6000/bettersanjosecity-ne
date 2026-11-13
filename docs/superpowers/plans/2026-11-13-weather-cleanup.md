# Weather Card Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Drop the Light tile and the reading number, and move technical station rows under a closed
"More station details" toggle.

**Architecture:** Two client components on the home page change: `WeatherWidget.tsx` (tiles) and
`StationDetails.tsx` (the `<dl>` under the map). The toggle is a native `<details>` holding a second
`<dl>`, so it works without JS.

**Tech Stack:** Next.js 16 static export, React 19, plain CSS in `src/styles/`.

**Spec:** `docs/superpowers/specs/2026-11-13-weather-cleanup-design.md`

## Global Constraints

- Every field shown today stays reachable; nothing is deleted except the Light tile and the `(#id)`.
- Every new translation key exists in both `en` and `fil` (`scripts/check-i18n.mjs` enforces it).
- Toggle label: en "More station details", fil "Iba pang detalye ng istasyon". Closed by default.
- Flat solid colors only; reuse existing tokens (`--blue`, `--surface`, `--spacing-md`).
- No change to forecast, map, fetching or refresh timing.

## Review Focus

1. Station data not loaded yet (`station` null): the toggle must still render only rows that exist —
   Coordinates comes from the fallback, so the toggle is never empty.
2. Phone width (<576px): both `<dl>`s go single-column and the summary does not overflow.
3. Keyboard: Tab reaches the summary, Enter/Space opens it, focus ring visible.
4. Filipino: the summary label switches with the language toggle.
5. Home card padding: the summary lines up with the 20px row padding from `.home-map-card .station-details`.

No component test harness exists (no jsdom); these are checked in the browser in Task 2.

---

### Task 1: Tiles, station panel and toggle

**Files:**
- Modify: `src/components/WeatherWidget.tsx:125-131` (remove Light tile)
- Modify: `src/components/StationDetails.tsx` (split rows, drop `#id`, render toggle)
- Modify: `src/i18n/translations.ts` (remove `wx-light` in en and fil; add `sd-more`)
- Modify: `src/styles/site.css` (after `.station-details` rules, ~line 389)
- Modify: `src/styles/home.css` (next to `.home-map-card .station-details`, ~line 714)

**Interfaces:**
- Produces: CSS classes `station-panel` (wrapper `div`), `station-more` (`details`).
  `StationDetails` keeps its default export and no props.

- [ ] **Step 1:** In `WeatherWidget.tsx` delete the `r.light_lux` tile block.
- [ ] **Step 2:** In `StationDetails.tsx` build two arrays: `rows` = Station, Status, Address/Location,
  Latest reading, Refreshes (in that order); `more` = Type, Operated by, Station ID, Coordinates,
  Elevation, Active since (same conditions as today). Latest reading value drops the
  `` ` (#${r.id})` `` part.
- [ ] **Step 3:** Render
  `<div className="station-panel"><dl className="station-details" aria-label=…>{rows}</dl><details className="station-more"><summary>{t('sd-more','More station details')}</summary><dl className="station-details">{more}</dl></details></div>`.
  Extract the row-mapping into a small local `list(rows)` helper used by both.
- [ ] **Step 4:** Translations: remove `'wx-light'` from en and fil; add `'sd-more'` after `'sd-aria'`
  in both (values from Global Constraints).
- [ ] **Step 5:** CSS in `site.css`:
  `.station-more { background: var(--surface); }`
  `.station-more summary { cursor: pointer; font-weight: 600; color: var(--blue); padding: 0 var(--spacing-md) 14px; font-size: 0.8125rem; width: fit-content; }`
  `.station-more > .station-details { padding-top: 12px; }`.
  In `home.css`: `.home-map-card .station-more summary { padding-inline: 20px; }`.
- [ ] **Step 6:** Run `node scripts/check-i18n.mjs && npm run typecheck && npx prettier --write <changed files>`.
  Expected: no output from check-i18n, tsc exits 0.
- [ ] **Step 7:** Commit on branch `weather-cleanup`:
  `git commit -m "ui: tidy weather card — drop light tile, station details behind a toggle"`

### Task 2: Verify, deploy, log

- [ ] **Step 1:** `npm run check` — expect exit 0 (includes build).
- [ ] **Step 2:** Local preview (`npm run dev`): home weather card shows 6 tiles in full rows; panel
  shows 5 rows; toggle closed, opens with click and keyboard; FIL shows "Iba pang detalye ng istasyon";
  ~390px width single-column. Screenshot.
- [ ] **Step 3:** Fast-forward `main`, push (Hostinger auto-builds). After ~60s, check the live home
  page for the same points.
- [ ] **Step 4:** Add a `DEPLOYMENTS.md` entry (newest first, Asia/Manila time) and commit + push it.
