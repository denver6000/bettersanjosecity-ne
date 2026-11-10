# Barangay fly-in map Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A home-page section where visitors tap one of San Jose City's 38 barangays on a smooth, themed SVG map and the view flies into it.

**Architecture:** A build-time Node script decodes the shared-arc TopoJSON, smooths each shared border once (Chaikin, endpoints fixed), and writes a committed JSON of SVG paths. A client component animates the SVG `viewBox` between the city and a barangay.

**Tech Stack:** Next.js 16 static export, React 19, TypeScript, plain CSS in `src/styles/home.css`, Node 22+ built-in `node:test` for the script library. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-11-10-barangay-map-design.md`

## Global Constraints

- No new dependencies; no runtime fetch of tiles or third-party data.
- No gradients; colours only from theme tokens (`--color-navy`, `--color-gold`, `--color-line`, `--surface`, `--color-ink`, `--color-mute`). Any new token goes in both dark blocks of `src/styles/theme.css` (`check-theme` compares them).
- Every visible string goes through `T` / `t()` with matching `en` and `fil` keys in `src/i18n/translations.ts` (`check-i18n`).
- Smoothed points may move at most 40 m from the original border; the script fails otherwise.
- Exactly 38 barangays; San Jose City is PSGC `0304926000` (file suffix `304926000`). `…4919…` is Palayan City.
- Coordinates in the output are metres on an equirectangular plane, rounded to 1 decimal.
- Fly animation 600 ms, ease-out cubic; `prefers-reduced-motion` jumps instantly.
- Footer credit: "NAMRIA and PSA via OCHA COD-AB (CC BY-IGO)", plus "boundaries are indicative only".
- Do not deploy in this plan. Commit only on `frontend-wow-factor`.

## Review Focus

- A ring made of one closed arc (an enclave): the seam must not leave a visible corner or gap. Pinned in Task 1.
- A ring that uses a shared arc reversed (TopoJSON negative index): the path must stay continuous. Pinned in Task 1.
- Two neighbouring barangays given the same fill tone, which makes the border invisible. Pinned in Task 1.
- Keyboard-only visitor: Tab reaches every shape, Enter or Space selects, Escape returns, and the dropdown works without a mouse. Pinned in Task 4.
- Clicking a second barangay mid-flight, or leaving the page mid-flight: no jitter, no update after unmount. Pinned in Task 4.

---

### Task 1: Geometry library

**Files:**

- Create: `scripts/lib/barangay-map.mjs`
- Test: `scripts/lib/barangay-map.test.mjs`

**Interfaces:**

- Produces (all named exports, `Point = [number, number]` as `[lon, lat]` unless noted):
  - `decodeTopology(topo): { arcs: Point[][], objects: object }`: applies `topo.transform` (scale, translate) and delta-decodes each arc.
  - `chaikin(points: Point[], passes: number): Point[]`: open polyline keeps first and last point; a closed polyline (first equals last) is smoothed with wrap-around and stays closed.
  - `maxDriftMeters(original: Point[], smoothed: Point[]): number`: largest distance from a smoothed point to the original polyline, in metres.
  - `projector(lat0: number, lon0: number): (p: Point) => Point`: equirectangular, returns `[x, y]` in metres relative to `lon0` and `lat0`, with `y` flipped so north is up on screen.
  - `ringToPoints(ring: number[], arcs: Point[][]): Point[]`: joins the arcs of one ring in order; a negative index `i` means arc `~i` reversed; drops the duplicated joint point between consecutive arcs.
  - `pointsToPath(points: Point[]): string`: `M x y L x y … Z` with coordinates rounded to 1 decimal.
  - `assignTones(adjacency: Map<string, Set<string>>, maxTones: number): Map<string, number>`: greedy colouring, most neighbours first; throws if more than `maxTones` are needed.

- [ ] **Step 1: Write the failing tests** in `scripts/lib/barangay-map.test.mjs` using `node:test` and `node:assert/strict`:
  - `decodeTopology applies transform and deltas`: a 3-point arc with `scale [0.5, 0.5]`, `translate [10, 20]`, deltas `[[2,2],[2,0],[0,2]]` decodes to `[[11,21],[12,21],[12,22]]`.
  - `chaikin keeps both ends of an open arc`: result's first and last equal the input's; length is greater than input.
  - `chaikin on a 2-point arc returns the same straight line's end points`.
  - `chaikin closes a closed ring without a corner at the seam`: for the square `[[0,0],[10,0],[10,10],[0,10],[0,0]]`, the output's first equals its last, and no output point equals `[0,0]` (the corner is cut).
  - `maxDriftMeters is zero for identical lines and about 111 m for a 0.001 degree latitude offset`.
  - `ringToPoints reverses a negative arc index`: arcs A=`[[0,0],[1,0]]`, B=`[[1,1],[1,0]]`, ring `[0, ~1]` gives `[[0,0],[1,0],[1,1]]`.
  - `pointsToPath rounds to one decimal and closes with Z`.
  - `assignTones never gives neighbours the same tone` for a 4-node graph where each node touches the other three (needs 4 tones), and `assignTones throws when maxTones is too small` (same graph, `maxTones` 3).
- [ ] **Step 2: Run** `node --test scripts/lib/barangay-map.test.mjs`. Expected: FAIL, module or exports missing.
- [ ] **Step 3: Implement** the seven functions in `scripts/lib/barangay-map.mjs` per the Interfaces block. Chaikin: replace each segment with points at 25% and 75%; for open arcs keep the original first and last points; repeat `passes` times. Drift: point-to-segment distance after projecting both lines with `projector` at the arc's mean latitude.
- [ ] **Step 4: Run** the same command. Expected: all tests PASS.
- [ ] **Step 5: Commit**

```bash
git add scripts/lib
git commit -m "feat: geometry helpers for the barangay map build"
```

### Task 2: Build script and data

**Files:**

- Create: `scripts/source/bgysubmuns-municity-304926000.topo.0.01.json` (downloaded copy of `latest/topojson/municities/medres/bgysubmuns-municity-304926000.topo.0.01.json` from `faeldon/philippines-json-maps`)
- Create: `scripts/build-barangay-map.mjs`
- Create: `src/data/barangay-shapes.json` (generated)
- Modify: `package.json` (scripts `"map:build": "node scripts/build-barangay-map.mjs"` and `"test:scripts": "node --test scripts/lib"`; append `&& npm run test:scripts` to `check` before `npm run build`)

**Interfaces:**

- Consumes: Task 1 exports.
- Produces `src/data/barangay-shapes.json`:
  `{ attribution: string, city: { bbox: [minX, minY, maxX, maxY] }, barangays: Array<{ id: string, name: string, tone: number, path: string, bbox: [number, number, number, number], centroid: [number, number] }> }`, sorted by `name` using `localeCompare`; `id` is the source `adm4_psgc` as a string; `tone` is 0 to 4; all numbers in metres.

- [ ] **Step 1: Download the source file** to `scripts/source/` with `curl`, and confirm it parses and contains 38 geometries.
- [ ] **Step 2: Write `scripts/build-barangay-map.mjs`**: read the source, `decodeTopology`, smooth every arc once with `chaikin(arc, 2)`, check `maxDriftMeters` per arc ≤ 40 (print the worst value; exit 1 if exceeded), build rings with `ringToPoints`, project with `projector(meanLat, minLon)`, build adjacency from shared arc indices (compare `~i` for negatives), `assignTones(adj, 5)`, write the JSON with `attribution: "NAMRIA and PSA via OCHA COD-AB (CC BY-IGO)"`.
- [ ] **Step 3: Add the name assertions in the script**: the output must have exactly 38 barangays; the set of names must equal the expected list embedded in the script (the 38 names in the design doc's data check, with the one display fix `Abar Ist` to `Abar 1st`); every path non-empty; exit 1 with the difference otherwise.
- [ ] **Step 4: Run** `npm run map:build`. Expected: prints worst drift in metres (≤ 40), "38 barangays", writes the JSON. If drift exceeds 40 m, try 1 pass; if it still exceeds, stop and report the worst arc and value instead of raising the cap (the cap is the user's accuracy limit).
- [ ] **Step 5: Run** `npm run test:scripts` and `npx prettier --write package.json scripts src/data/barangay-shapes.json`. Expected: tests PASS.
- [ ] **Step 6: Commit**

```bash
git add scripts package.json src/data/barangay-shapes.json
git commit -m "feat: build smoothed barangay shapes from PSGC boundaries"
```

### Task 3: Map component, styles and strings

**Files:**

- Create: `src/components/BarangayMap.tsx`
- Modify: `src/styles/home.css` (append `.bm-*` rules), `src/i18n/translations.ts` (add keys to both `en` and `fil`)

**Interfaces:**

- Consumes: `src/data/barangay-shapes.json` (Task 2 shape); `useLanguage()` returning `{ t(key, fallback?) }`; `ComingSoon` from `@/components/ComingSoon`.
- Produces: `export default function BarangayMap(): JSX.Element` (client component, no props).
- New translation keys (add to both languages): `bm-find` ("Find a barangay" / "Maghanap ng barangay"), `bm-all` ("Whole city" / "Buong lungsod"), `bm-back` ("Back to city" / "Bumalik sa lungsod"), `bm-barangay` ("Barangay" / "Barangay"), `bm-pop` ("Population" / "Populasyon"), `bm-captain` ("Captain" / "Kapitan"), `bm-services` ("Services" / "Mga serbisyo"), `bm-map-label` ("Map of San Jose City barangays" / "Mapa ng mga barangay ng San Jose City"), `bm-note` ("Boundaries are indicative only. Source: NAMRIA and PSA via OCHA COD-AB (CC BY-IGO)." / Filipino equivalent).

- [ ] **Step 1: Implement `BarangayMap`.**
  - State: `selectedId: string | null`. A `viewBox` ref plus `requestAnimationFrame` loop interpolating the four numbers from current to target over 600 ms with `1 - (1 - k) ** 3`; a new selection cancels the running frame; the effect cleanup cancels on unmount; `matchMedia('(prefers-reduced-motion: reduce)')` sets the viewBox immediately.
  - Target viewBox for a bbox: centre on the bbox, widen to the SVG's aspect ratio (the city bbox's), pad 12%; city view uses `city.bbox` with the same padding.
  - Render one `<path>` per barangay inside `<svg role="group" aria-label={t('bm-map-label')}>` with `tabIndex={0}`, `role="button"`, `aria-pressed`, `aria-label` = name, `data-tone`, `vector-effect="non-scaling-stroke"`; click, Enter and Space select; Escape (on the svg) returns to the city.
  - Names: render `<text>` at each centroid only for the selected barangay and on hover/focus of others, so the city view stays uncluttered.
  - A `<select>` ("Find a barangay") with a first option "Whole city" plus the 38 names; selecting flies there.
  - Detail card: heading `Barangay {name}`, three tiles (population, captain, services) each containing `<ComingSoon />`, and a "Back to city" button, shown only when a barangay is selected.
  - Footer paragraph with `bm-note`.
- [ ] **Step 2: Add CSS** in `home.css`: `.bm-svg` (width 100%, aspect ratio matching the city bbox, `background: var(--surface)`), `.bm-shape` fills via `color-mix(in srgb, var(--color-navy) N%, var(--surface))` for `data-tone` 0 to 4 with N = 8, 14, 20, 26, 32; stroke `var(--surface)` 1.5px; hover darkens; selected uses `var(--color-gold)` fill; `:focus-visible` outline 2px `var(--color-navy)`; label text `var(--color-ink)`; tiles reuse the dashed style of the existing coming-soon tiles; mobile stacks the card under the map. No gradients.
- [ ] **Step 3: Add the translation keys** to both language blocks in `translations.ts`, 4-space key indent like the file's existing keys.
- [ ] **Step 4: Run** `node scripts/check-i18n.mjs && npm run typecheck && npm run format:check`. Expected: i18n OK with equal key counts, typecheck clean, format clean (run `npx prettier --write` on the touched files first if needed).
- [ ] **Step 5: Commit**

```bash
git add src/components/BarangayMap.tsx src/styles/home.css src/i18n/translations.ts
git commit -m "feat: barangay fly-in map component"
```

### Task 4: Home section, verification

**Files:**

- Create: `src/components/home/HomeBarangays.tsx`
- Modify: `src/app/page.tsx` (render `<HomeBarangays />` directly after `<HomeWeather />`), `src/i18n/translations.ts` (keys `home-barangays-title`: "Explore your barangay" / "Tuklasin ang iyong barangay", `home-barangays-sub`: "Tap an area to zoom in." / "Pindutin ang lugar para mag-zoom in.")

**Interfaces:**

- Consumes: `BarangayMap` (Task 3), the section pattern from `HomeWeather.tsx` (`section.home-sec > .container > .home-sec-head[data-reveal] > h2 > <T>`).
- Produces: `export default function HomeBarangays()`.

- [ ] **Step 1: Implement `HomeBarangays`** following `HomeWeather`'s section markup, with the title, one sub line, and `<div className="home-card" data-reveal><BarangayMap /></div>`. Wire it into `page.tsx`.
- [ ] **Step 2: Run** `npm run check`. Expected: every stage passes, ending with a successful `next build` (static export).
- [ ] **Step 3: Start the dev server** (use `.claude/launch.json` if it has an entry, otherwise `npm run dev`) and open the home page. Verify and record each:
  - City view shows 38 shapes with no visible gaps or overlaps, and no neighbouring pair shares a shade.
  - Click a barangay: smooth zoom (about 0.6 s), card appears with three "Coming soon" tiles. "Back to city", Escape and the dropdown all return or move the view.
  - Click a second barangay mid-flight: it redirects without a jump. Navigate away mid-flight: no console error.
  - Keyboard only: Tab reaches every shape in order, Enter or Space selects, focus ring visible, dropdown works.
  - Dark theme and Filipino: text legible, strings translated, shapes distinguishable.
  - 375 px width: map and card fit without horizontal scroll.
  - Reduced motion (emulate in devtools): view jumps with no animation.
- [ ] **Step 4: Fix anything the checks found**, rerun `npm run check`, and commit

```bash
git add src/components/home/HomeBarangays.tsx src/app/page.tsx src/i18n/translations.ts
git commit -m "feat: add barangay map section to the home page"
```
