# Living hero: occasions Implementation Plan (plan 2 of 2)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the hero's occasion system: ten occasions and the three farming seasons, each built into the scene with intent (anchored, layered, lit by the scene's light, moved by the real wind), on top of the shipped engine.

**Architecture:** Pure, tested calendar and light maths in `src/lib/`. A small runtime in `src/components/home/hero/occasions/` picks the active occasion and renders its pieces into four named depth slots of the existing `HeroScene`; each occasion's art (made in ChatGPT, checked by a script) loads only when active. Season changes the paddies layer.

**Tech Stack:** Next.js 16 static export, React 19, TypeScript, Node 24 `node:test`, headless Edge/Chrome for asset tools, ChatGPT (the user's signed-in session, driven through Claude in Chrome) for the art. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-11-10-living-hero-design.md` (revision 2, "Occasion system"). Engine: `docs/superpowers/plans/2026-11-10-living-hero-engine.md` (done). Reference prototype for props and fireworks: `docs/superpowers/spikes/2026-11-10-living-hero-live.html`.

## Global Constraints

- No new dependencies. Flat colours only (no gradients, no blur glows): lamp and candle glow are flat shapes.
- Scene coordinates are the engine's `0 0 1586 992`; every art file is exactly 1586 × 992 (or a sprite sheet with a manifest) so positions never need scaling.
- Remember-tone days (Holy Week, Araw ng Kagitingan, Undas) allow no pokes: no cloud showers, no bird scatter, no firefly burst, no time-lapse, no fireworks, no swinging props. Reduced motion also switches all pokes and prop motion off.
- The Philippine flag appears only correctly drawn (blue over red, white triangle with eight-rayed sun and three stars) on a pole; never as bunting, a banner, a pattern or inside fireworks. Bunting uses plain blue, red and white pennants. The user checks this against the Flag and Heraldic Code (RA 8491) before launch.
- Only one occasion is drawn at a time; its assets load only when it is active. Each occasion's assets total at most 150 KB as WebP; a season variant of `paddies` is at most 140 KB.
- One light, one wind: props take the scene's tint filter (`#hero-tint`), light up with the night factor and stay lit in rain, and cloth props move with the real wind speed.
- Every visible string goes through the translation system with matching `en` and `fil` keys. There is no label on the picture; the occasion is named only in the scene's screen-reader description.
- Dates come from one editable table; those not confirmed with the city are marked `confirmed: false`.
- Do not deploy. Commit only on `frontend-wow-factor`. A rejected occasion is redone; an unreviewed one is not shipped.

## Review Focus

- Date edges: 31 Dec versus Christmas, 6 and 7 Jan, 29 Feb, Manila's date versus UTC around midnight, Holy Week across years, and Easter at its earliest (22 Mar) and latest (25 Apr). Pinned in Task 1.
- A Remember day must never allow a poke, a scatter, a burst, a time-lapse or a swing, even through a code path other than the click handlers. Pinned in Task 3.
- A missing or slow occasion asset (404, offline) must leave the plain scene intact and never leave it hidden. Pinned in Task 3.
- A season or occasion art variant that drifts from the base (hut, palms or ridge moved) shows as a jump when the layers are stacked. Pinned in Tasks 2 and 4.
- Combinations: Christmas at noon in a storm, Undas in rain at dusk, a harvest paddy under a night tint: props and paddies must be lit, tinted and layered correctly. Pinned in Task 11.

## Art production recipe (used by Tasks 4 to 10)

Each art piece is produced in ChatGPT through Claude in Chrome (the user's signed-in session; new tab on chatgpt.com, Chat mode). Prompts contain only the art brief, no personal details.

1. Attach nothing; describe the base scene in words and state: "Same canvas 1586 × 992, same flat vector style as the scene I generated earlier in this chat" (continue the existing chat titled "Generate Hero Illustration" when it is still there so the style carries over; otherwise first send the base image description).
2. Ask for the piece on real transparency (not a drawn checkerboard), as separate files, at 1586 × 992, with objects positioned where the brief says. For sprite sheets ask for "a neat grid of separate objects, each fully isolated with at least 40 px of transparent space around it, all at the same scale as they would appear in the scene".
3. Download the files through the chat's per-image share menu (one by one; Chrome needs "Allow multiple downloads" accepted by the user once), copy them to `scripts/source/hero/occasions/<id>/`, and run Task 2's tooling on them.
4. A piece fails if: wrong size, no real alpha, objects not isolated (sprites merge), style clashes with the base, or (for variants) the alignment check fails. A failed piece is regenerated with a sharper brief, not patched, up to three tries; after that stop and report which piece and why.
5. Record each accepted piece's prompt in `scripts/source/hero/occasions/<id>/BRIEF.md` so it can be remade.

## Anchors (starting estimates in scene units, verified by the overlay in Task 2)

`hutRoofPeak (1290, 487)`, `hutEaveLeft (1197, 566)`, `hutEaveRight (1475, 566)`, `hutWindow (1340, 556)`, `hutSteps (1310, 640)`, `palmBigCrown (1450, 180)`, `palmSmallCrown (1295, 330)`, `palmBigBase (1530, 540)`, `dikeFlagpole (1100, 640)`, `ridgeCross (1180, 372)`, `paddyMidLeft (560, 700)`, `dikeLine (300 to 1100, 700)`, `foregroundEdge (y 840 to 992)`.

---

### Task 1: Calendar, seasons and time scripts, with tests

**Files:**

- Create: `src/lib/occasions.ts`
- Test: `src/lib/occasions.test.ts`

**Interfaces:**

- Produces (self-contained, no imports):
  - `type Tone = 'celebrate' | 'remember'`; `type OccasionId = 'christmas' | 'new-year' | 'independence' | 'city-anniversary' | 'st-joseph' | 'pagibang-damara' | 'labor-day' | 'kagitingan' | 'holy-week' | 'undas'`; `type Season = 'planting' | 'growing' | 'harvest'`; `type DateParts = { year: number; month: number; day: number }`.
  - `OCCASIONS`: the editable table, `{ id, tone, confirmed, ranges }[]` with fixed-date `ranges` as `[month, day, month, day]` (a range may wrap the year end) or the marker `'holy-week'`. Entries: christmas celebrate confirmed `[12,1,1,6]`; new-year celebrate confirmed `[12,31,1,1]`; independence celebrate confirmed `[6,10,6,12]`; city-anniversary celebrate **unconfirmed** `[8,10,8,10]` (candidate alternative: 4 Aug); st-joseph celebrate confirmed `[3,19,3,19]`; pagibang-damara celebrate **unconfirmed** `[4,8,4,21]`; labor-day celebrate confirmed `[5,1,5,1]`; kagitingan remember confirmed `[4,9,4,9]`; holy-week remember confirmed `'holy-week'`; undas remember confirmed `[10,31,11,2]`.
  - `easterSunday(year: number): { month: number; day: number }` (Meeus/Jones/Butcher).
  - `occasionOn(date: DateParts): { id: OccasionId; tone: Tone } | null`: every occasion whose range contains the date; Remember beats Celebrate; among the same tone the one with the fewer days in its range wins; a tie goes to the earlier table entry. Holy Week is the 7 days before Easter Sunday (Palm Sunday to Holy Saturday); Easter Sunday itself is not themed.
  - `seasonOn(date: DateParts): Season`: planting 1 Dec to 31 Jan and 1 Jun to 31 Jul; harvest 1 Mar to 30 Apr and 1 Oct to 30 Nov; otherwise growing.
  - `flagProgress(date: DateParts, hour: number): number`: 1 on 10 and 11 Jun; on 12 Jun 0 before 8:00, rising linearly to 1 over the two minutes from 8:00, then 1; 0 on any other date.
  - `newYearPhase(date: DateParts, hour: number): 'buildup' | 'midnight' | 'sunrise' | 'day'`: 31 Dec from 20:00 is `buildup`; 1 Jan from 0:00 to 0:10 is `midnight`; 1 Jan from 5:30 to 9:00 is `sunrise`; otherwise `day`.
  - `christmasMoment(date: DateParts, hour: number): 'simbang-gabi' | 'eve' | 'season'`: 16 to 24 Dec between 4:00 and 6:00 is `simbang-gabi`; 24 Dec from 18:00 is `eve`; otherwise `season`.
  - `parseOccasionOverride(search: string): { occasion?: OccasionId | 'none'; season?: Season; date?: DateParts }`: reads `?on=christmas` (or `none`), `season=harvest`, `date=2026-06-12`; anything malformed or unknown is ignored.

- [ ] **Step 1: Write the failing tests** in `src/lib/occasions.test.ts` (`node:test`, imports from `./occasions.ts`):
  - `easterSunday`: 2026 gives 4 Apr, 2027 gives 28 Mar, 2028 gives 16 Apr, and the extremes 2285 gives 22 Mar and 1943 gives 25 Apr (Review Focus).
  - `occasionOn boundaries`: 30 Nov none; 1 Dec christmas; 6 Jan christmas; 7 Jan none; 9 Jun none; 10 and 12 Jun independence; 13 Jun none; 31 Oct, 1 Nov, 2 Nov undas; 3 Nov none; 19 Mar st-joseph; 1 May labor-day; 10 Aug city-anniversary; 29 Feb 2028 none; every id is reachable on some date.
  - `occasionOn precedence`: 31 Dec and 1 Jan give new-year (narrower than christmas); 9 Apr 2026 gives kagitingan (Easter 2026 is 5 Apr, so Holy Week was 29 Mar to 4 Apr); 9 Apr 2036 gives holy-week (Easter 2036 is 13 Apr, Holy Week 6 to 12 Apr includes 9 Apr, and Remember-versus-Remember goes to Holy Week); 9 Apr 2025 gives kagitingan and 10 Apr 2025 gives pagibang-damara (Remember beats Celebrate, and Holy Week 2025 is 13 to 19 Apr); Holy Week 2026 is 29 Mar to 4 Apr and Easter Sunday 5 Apr 2026 gives none.
  - `seasonOn`: 30 Nov harvest; 1 Dec planting; 31 Jan planting; 1 Feb growing; 28 Feb growing; 1 Mar harvest; 30 Apr harvest; 1 May growing; 1 Jun planting; 31 Jul planting; 1 Aug growing; 1 Oct harvest.
  - `flagProgress`: 11 Jun 1; 12 Jun 7:59 is 0; 8:01 is 0.5; 8:02 and 15:00 are 1; 13 Jun and 9 Jun are 0.
  - `newYearPhase`: 31 Dec 19:59 `day`, 20:00 `buildup`, 23:59 `buildup`; 1 Jan 0:00 `midnight`, 0:11 `day`, 5:30 `sunrise`, 9:01 `day`; 2 Jan `day`.
  - `christmasMoment`: 15 Dec 5:00 `season`; 16 Dec 5:00 `simbang-gabi`; 24 Dec 5:00 `simbang-gabi`; 24 Dec 18:00 `eve`; 25 Dec 5:00 `season`.
  - `parseOccasionOverride`: `'?on=holy-week&season=harvest&date=2026-06-12'` returns all three; `'?on=none'` gives `{ occasion: 'none' }`; `'?on=bogus&season=x&date=2026-13-40'` gives `{}`.
  - `manilaNow` date handoff (Review Focus): with `manilaNow` from `src/lib/sky.ts`, `occasionOn` called on its parts for `new Date('2026-12-30T16:30:00Z')` (already 31 Dec 00:30 in Manila) gives new-year.
- [ ] **Step 2: Run** `node --experimental-strip-types --test src/lib/occasions.test.ts`. Expected: FAIL, module missing.
- [ ] **Step 3: Implement** everything above in `src/lib/occasions.ts`. Compare dates as `month * 100 + day`; handle a year-wrapping range by testing either half; count a range's days (using a non-leap year) for the narrower-wins rule.
- [ ] **Step 4: Wire the tests**: the existing `test:lib` glob already runs `src/lib/*.test.ts`; run `npm run test:lib && npm run typecheck`. Expected: all PASS.
- [ ] **Step 5: Commit**

```bash
git add src/lib/occasions.ts src/lib/occasions.test.ts
git commit -m "feat: calendar, seasons and time scripts for hero occasions"
```

### Task 2: Art tooling (sprite finder, alignment gate, overlay)

**Files:**

- Create: `scripts/lib/sprites.mjs`, `scripts/build-occasion-assets.mjs`, `scripts/hero-overlay.mjs`
- Test: `scripts/lib/sprites.test.mjs`
- Modify: `package.json` (scripts `"hero:occasion": "node scripts/build-occasion-assets.mjs"` and `"hero:overlay": "node scripts/hero-overlay.mjs"`); `scripts/lib` tests already run via `test:scripts`

**Interfaces:**

- Produces from `scripts/lib/sprites.mjs` (pure, no imports):
  - `findSprites(alpha: Uint8Array, width: number, height: number, opts?: { threshold?: number; minArea?: number; gap?: number }): { x: number; y: number; w: number; h: number; area: number }[]`: connected components of pixels with alpha above `threshold` (default 16), ignoring components smaller than `minArea` (default 400), merging boxes closer than `gap` px (default 8) so a parol and its tail stay one sprite; sorted top-to-bottom then left-to-right.
  - `maskIoU(a: Uint8Array, b: Uint8Array, region?: { x: number; y: number; w: number; h: number }, width?: number): number`: intersection over union of the opaque pixels (alpha above 16) of two same-size alpha arrays, optionally inside a region.
- Produces from `scripts/build-occasion-assets.mjs`: `node scripts/build-occasion-assets.mjs <id>` reads PNGs from `scripts/source/hero/occasions/<id>/`, converts each to WebP (same headless-browser method as `build-hero-assets.mjs`) into `public/assets/images/hero/occasions/<id>/`, and, for files named `sheet*.png`, writes `manifest.json` (`{ sheets: [{ file, sprites: [{ name, x, y, w, h }] }] }` with names `s1, s2, …` in `findSprites` order); for files named `paddies-*.png` it runs the alignment gate against `scripts/source/hero/paddies.png`; it exits non-zero when any file is not 1586 × 992, has no alpha, a sheet has fewer than 2 sprites, an occasion's total exceeds 150 KB (a `paddies-*` variant 140 KB), or a variant's `maskIoU` over the hut and palm region `{ x: 1150, y: 60, w: 436, h: 600 }` is below 0.97.
- Produces from `scripts/hero-overlay.mjs`: `node scripts/hero-overlay.mjs [out.png]` renders the three base layers stacked with a labelled 100-unit grid and every named anchor from the Anchors section as a cross, via headless Edge or Chrome, so anchors can be checked and corrected by eye.

- [ ] **Step 1: Write the failing tests** in `scripts/lib/sprites.test.mjs`: build alpha arrays in the test (no image files): `findSprites finds separate blobs in reading order` (three 30×30 squares), `findSprites ignores specks below minArea`, `findSprites merges blobs closer than the gap` (two squares 5 px apart become one box; 20 px apart stay two), `findSprites returns no sprites for an empty image`, `maskIoU is 1 for identical masks, 0 for disjoint ones, and respects the region` (two masks equal inside the region but different outside give 1 with the region and less than 1 without).
- [ ] **Step 2: Run** `node --test scripts/lib/sprites.test.mjs`. Expected: FAIL, module missing.
- [ ] **Step 3: Implement** `sprites.mjs` (iterative flood fill, no recursion) and the two scripts. Reuse the browser discovery, local server and temp profile cleanup pattern from `scripts/build-hero-assets.mjs`; decode PNG alpha in the page with a canvas `getImageData` and post the alpha plane back for `findSprites`/`maskIoU` (Node does not decode images here).
- [ ] **Step 4: Verify the tooling**: run `npm run test:scripts`; run `npm run hero:overlay` and open the output, confirm the grid is labelled and the crosses sit on the hut roof peak, window, palm crowns, dike and ridge, and correct the Anchors numbers in this plan's section and in `src/components/home/hero/occasions/anchors.ts` (created in Task 3) if any is off by more than 25 units. Run `node scripts/build-occasion-assets.mjs` with a fixture id whose folder holds a copy of `paddies.png` renamed `paddies-test.png` and expect `maskIoU` 1 and a pass, then delete the fixture folder and output.
- [ ] **Step 5: Commit**

```bash
git add scripts package.json
git commit -m "feat: sprite finder, alignment gate and overlay for hero occasion art"
```

### Task 3: Occasion runtime, depth slots, tones and light

**Files:**

- Create: `src/lib/hero-light.ts` (pure), `src/lib/hero-light.test.ts`, `src/components/home/hero/occasions/types.ts`, `src/components/home/hero/occasions/anchors.ts`, `src/components/home/hero/occasions/index.ts` (the registry), `src/components/home/hero/occasions/OccasionLayer.tsx`
- Modify: `src/components/home/hero/HeroScene.tsx`, `src/i18n/translations.ts`, `src/styles/home.css`

**Interfaces:**

- Produces from `hero-light.ts` (self-contained):
  - `pokesAllowed(tone: 'celebrate' | 'remember' | null, reducedMotion: boolean): boolean`: false for `remember` and for reduced motion; true otherwise (including no occasion).
  - `lampOpacity(night: number, weatherGrey: number): number`: `clamp((night − 0.2) / 0.8, 0, 1)`; rain and storm do not dim it (the weather grey is accepted and ignored on purpose, so lamps stay lit in rain).
  - `windSway(windKmh: number, tSec: number, phase: number): number`: degrees, `sin(1.1·tSec + phase) · min(14, 2 + 0.35·windKmh)`.
- Produces from `occasions/types.ts`:
  - `interface OccasionContext { night: number; windKmh: number; hour: number; date: DateParts; tSec: number; reduced: boolean; weatherGrey: number }`
  - `type Slot = 'behindHills' | 'betweenHillsAndPaddies' | 'betweenPaddiesAndForeground' | 'frontOfForeground'`
  - `interface OccasionModule { id: OccasionId; tone: Tone; assets: string[]; render(slot: Slot, ctx: OccasionContext, assetsReady: boolean): JSX.Element | null; pokes?: Partial<Record<'sky' | 'prop', (e: MouseEvent) => void>> }` (a module returns `null` for slots it does not use).
- Produces from `occasions/anchors.ts`: `export const ANCHORS` with the names in the Anchors section above.
- Produces from `occasions/index.ts`: `loadOccasion(id: OccasionId): Promise<OccasionModule>` (dynamic `import()` per occasion, so unused occasions are never downloaded) and `OCCASION_ALT_KEYS: Record<OccasionId, string>`.
- Produces from `OccasionLayer.tsx`: `<OccasionLayer slot={Slot} occasion={OccasionId | null} ctx={OccasionContext} />`, which loads the module and preloads its assets (images and `manifest.json`); until the module and assets are ready, or if any load fails, it renders nothing for that occasion (the plain scene stays).
- New translation keys (both languages): `hero-scene-alt-christmas`, `-new-year`, `-independence`, `-city-anniversary`, `-st-joseph`, `-pagibang-damara`, `-labor-day`, `-kagitingan`, `-holy-week`, `-undas`, each the base description plus the occasion (for example "Illustrated rice fields of San Jose City, decorated for Christmas" and "Guhit ng mga palayan ng San Jose City, may palamuti para sa Pasko"), plus a season variant is not needed.

- [ ] **Step 1: Write the failing tests** in `src/lib/hero-light.test.ts`: `pokesAllowed` is true for celebrate and for `null`, false for remember, and false for any tone with reduced motion; `lampOpacity` is 0 at night 0.2 or less, 1 at night 1, 0.5 at night 0.6 and identical for weatherGrey 0 and 0.78 (lamps stay lit in rain); `windSway` is bounded by 2 + 0.35·wind up to a cap of 14 and larger in wind 40 than in wind 0 at the same time and phase.
- [ ] **Step 2: Run** `node --experimental-strip-types --test src/lib/hero-light.test.ts`. Expected: FAIL, module missing.
- [ ] **Step 3: Implement** `hero-light.ts`, `types.ts`, `anchors.ts`, the registry and `OccasionLayer` (a `useEffect` that dynamically imports the module and `Image`-preloads `assets`, with `catch` leaving it not ready; never throws into the scene; reveals nothing partially).
- [ ] **Step 4: Wire into `HeroScene.tsx`**: decide the active occasion with `occasionOn` on Manila's date parts (or `parseOccasionOverride`'s `occasion` and `date`; `none` forces no occasion), render four `<OccasionLayer>` slots at these places in the existing order: `behindHills` before the hills image group (after clouds and birds); `betweenHillsAndPaddies` between the hills and paddies groups; `betweenPaddiesAndForeground` between the paddies group and the foreground group (before ripples); `frontOfForeground` after the code stalks. Wrap slot content in `<g filter="url(#hero-tint)">` where the module asks for scene light. Compute `pokesAllowed` once and use it everywhere the engine allows a poke or motion (the time-lapse, shower, bird scatter, firefly burst, cursor wind stays allowed on celebrate days and is slowed on remember days by scaling `stalkTarget`'s idle sway to 0.5 and its lean to 0.6). Put `data-occasion` on the scene root and use `t(OCCASION_ALT_KEYS[id])` for the label when an occasion is active.
- [ ] **Step 5: Add a fixture occasion** `src/components/home/hero/occasions/test-pin.tsx`, registered only in development (guard with `process.env.NODE_ENV !== 'production'`), that draws one marker in each of the four slots and exposes one sky poke, so slot order, tint, lamps and tone gating can be checked before any real art exists. Remove it in Task 11.
- [ ] **Step 6: Run** `node scripts/check-i18n.mjs && npm run test:lib && npm run typecheck && npm run format:check`. Expected: PASS.
- [ ] **Step 7: Verify in the browser** with `/?on=test-pin` (add `test-pin` as a development-only override id): markers appear in the four slots in the right depth order (the foreground rice covers the lowest marker); the marker is tinted at dusk and night; at `/?on=holy-week` (stub `holy-week` as remember with no art yet) clicking the sun, a cloud and a bird does nothing, and `data-occasion="holy-week"`; with the occasion's asset URL blocked (rename the file temporarily) the plain scene stays and the pending attribute still clears (Review Focus); the scene label is translated in both languages.
- [ ] **Step 8: Commit**

```bash
git add src scripts package.json
git commit -m "feat: occasion runtime with depth slots, tones and light"
```

### Task 4: Seasons (planting and harvest paddies)

**Files:**

- Create: `scripts/source/hero/occasions/season-planting/paddies-planting.png`, `scripts/source/hero/occasions/season-harvest/paddies-harvest.png` (art, with `BRIEF.md` each), generated `public/assets/images/hero/occasions/season-planting/paddies-planting.webp` and `season-harvest/paddies-harvest.webp`
- Modify: `src/components/home/hero/HeroScene.tsx`

**Interfaces:**

- Consumes: `seasonOn`, `parseOccasionOverride` (Task 1); the art recipe, `build-occasion-assets` and its alignment gate (Task 2).
- Produces: the scene's paddies layer chooses `paddies.webp` (growing), `paddies-planting.webp` or `paddies-harvest.webp` by `seasonOn` on Manila's date (or `?season=`); the root carries `data-season`.

Hue-shifting the existing layer does not work (tested: the hut turns pink and the golden patches turn red), so both variants are new art.

- [ ] **Step 1: Make the art** with the recipe. Planting brief: "the same paddies layer as before, same hut, same palms, same terrace shapes and positions, but the paddies are freshly flooded and planted: shallow sky-blue water mirroring the sky between neat rows of tiny bright-green seedlings, no golden patches". Harvest brief: "the same paddies layer, same hut, palms and terraces, but every paddy is ripe golden rice with a few harvested stubble patches in pale tan, and two or three small stacked sheaves on a dike". Both: transparent everywhere that the base layer is transparent.
- [ ] **Step 2: Run** `node scripts/build-occasion-assets.mjs season-planting` and `season-harvest`. Expected: each passes the size, alpha, weight (at most 140 KB) and `maskIoU` (at least 0.97) checks. If the gate fails, regenerate per the recipe.
- [ ] **Step 3: Wire the season into `HeroScene`** (swap the `<image href>` of the paddies group; no layout change; the hut window glow position stays). The variant loads only in its season; `growing` uses the shipped `paddies.webp` and needs no new file.
- [ ] **Step 4: Verify in the browser** with `/?season=planting`, `/?season=harvest`, `/?season=growing` at noon, dusk and night in rain: no jump of the hut, palms or ridge compared with the base (toggle between the three and compare by eye), tint and weather apply, and the page weight for the active season is at most the base plus 140 KB.
- [ ] **Step 5: Commit** (art sources, generated WebP, scene change)

```bash
git add scripts/source/hero/occasions public/assets/images/hero/occasions src/components/home/hero
git commit -m "feat: planting and harvest paddies for the hero seasons"
```

### Task 5: Christmas

**Files:**

- Create: `scripts/source/hero/occasions/christmas/{sheet-parols.png,set-lights.png,BRIEF.md}`, `src/components/home/hero/occasions/christmas.tsx`; generated `public/assets/images/hero/occasions/christmas/*`
- Modify: `src/components/home/hero/occasions/index.ts`

**Interfaces:** consumes the Task 3 types, `christmasMoment`, `lampOpacity`, `windSway`, `ANCHORS`, the sprite manifest. Produces the `christmas` module: `assets` are `sheet-parols.webp`, `set-lights.webp`, `manifest.json`.

- [ ] **Step 1: Make the art.** Sheet: eight parols (five-point star lanterns with tails) of three sizes in red, gold and green, each isolated. Set dressing (full canvas, transparent elsewhere): string lights along the hut roofline and swagged from the hut's right eave to the small palm's trunk, drawn small and flat.
- [ ] **Step 2: Build and check** with `node scripts/build-occasion-assets.mjs christmas` (at most 150 KB; at least 8 sprites).
- [ ] **Step 3: Implement `christmas.tsx`**: `set-lights` in `betweenPaddiesAndForeground`; parols as sprites hung by their top points from `hutEaveLeft`, `hutEaveRight`, `hutRoofPeak` and the two palm crowns, swaying with `windSway` (calm air still, gusts swing) in `betweenPaddiesAndForeground` and `behindHills` is unused; a flat lamp circle (colour `#ffe27a`) at each parol and along the lights, opacity `lampOpacity(night)`; `simbang-gabi` (16 to 24 Dec, 4:00 to 6:00): lamps and the hut window forced on; `eve` (24 Dec from 18:00): one large flat Christmas star above `ridgeCross` in `behindHills`. Poke: clicking a parol swings it hard once and flashes its lamp; allowed only when `pokesAllowed`.
- [ ] **Step 4: Verify** with `/?on=christmas` at noon, dusk, night and in rain, plus `/?on=christmas&date=2026-12-20&sky=5:00` (Simbang Gabi) and `/?on=christmas&date=2026-12-24&sky=20:00` (the star): parols hang from the hut and palms (not floating), the foreground rice covers nothing it should not, lamps glow at night and in rain, the tint matches the scene, props sway with the wind speed, and the page weight for the occasion is at most 150 KB.
- [ ] **Step 5: Commit**

```bash
git add scripts/source/hero/occasions/christmas public/assets/images/hero/occasions/christmas src/components/home/hero/occasions
git commit -m "feat: Christmas in the living hero"
```

### Task 6: New Year

**Files:**

- Create: `src/components/home/hero/occasions/new-year.tsx` (no art: code only)
- Modify: `src/components/home/hero/occasions/index.ts`

**Interfaces:** consumes `newYearPhase`, the engine's particle idea (see the prototype's `burst`), `ANCHORS`. Produces the `new-year` module with no assets (`assets: []`).

- [ ] **Step 1: Implement** the module: `buildup` (31 Dec from 20:00): a few quiet distant bursts behind the hills every 20 to 30 s; `midnight` (1 Jan 0:00 to 0:10): a continuous finale of bursts (colours from the scene palette: gold `#f2b100`, white, soft blue) rising from behind the ridge in `behindHills`; `sunrise` (1 Jan 5:30 to 9:00): a slightly brighter, cleaner morning (a small flat gold flare at the horizon in `behindHills`); fireworks never use the flag. Poke: clicking the sky bursts one firework; allowed only when `pokesAllowed`. Cap live particles at 150 and remove them when done.
- [ ] **Step 2: Verify** with `/?on=new-year&date=2026-12-31&sky=22:00`, `…&sky=23:59`, `/?on=new-year&date=2027-01-01&sky=0:05` and `…&sky=6:00`: bursts sit behind the hills (the ridge covers their base), stop when the phase ends, never exceed the particle cap, and do nothing under reduced motion.
- [ ] **Step 3: Commit**

```bash
git add src/components/home/hero/occasions
git commit -m "feat: New Year in the living hero"
```

### Task 7: Independence Day

**Files:**

- Create: `scripts/source/hero/occasions/independence/{sheet-flag.png,BRIEF.md}`, `src/components/home/hero/occasions/independence.tsx`; generated assets
- Modify: `src/components/home/hero/occasions/index.ts`

**Interfaces:** consumes `flagProgress`, `windSway`, `ANCHORS`, the sprite manifest. Produces the `independence` module.

- [ ] **Step 1: Make the art.** Sheet: one correctly drawn Philippine flag at a size that fits a tall bamboo flagpole (blue over red, white triangle at the hoist, eight-rayed gold sun and three gold stars), isolated; and the bamboo pole with a small finial, isolated. Brief states the exact design rules.
- [ ] **Step 2: Build and check** (`node scripts/build-occasion-assets.mjs independence`) and have the user confirm the flag drawing against RA 8491 (stop and ask the user to look at the two sprites before continuing; this is the one place the flag appears).
- [ ] **Step 3: Implement**: the pole stands on `dikeFlagpole` in `betweenPaddiesAndForeground`; the flag's height follows `flagProgress` (down at the pole's foot, up to the top; hidden when progress is 0), waving with `windSway` (calm hangs, gust flies); plain pennant bunting (code, blue `#0038a8`, red `#ce1126`, white; never the flag) strung from `hutEaveRight` to the small palm's trunk, swaying with the wind; the flag is lit by the scene tint at dusk and is lowered out of sight after dark on 12 Jun only if that is the custom (leave it up: the spec does not lower it). Pokes: sky bursts fireworks in gold, blue, red and white pieces (never a flag shape).
- [ ] **Step 4: Verify** with `/?on=independence&date=2026-06-12&sky=7:59`, `…&sky=8:01`, `…&sky=8:03`, `/?on=independence&date=2026-06-11&sky=12:00`, and a windy and a calm sky: the flag is raised once at 8:00 and stays up, hangs in calm and flies in wind, the pole and bunting are anchored (not floating) and covered by the foreground rice where they should be, no flag appears anywhere else.
- [ ] **Step 5: Commit**

```bash
git add scripts/source/hero/occasions/independence public/assets/images/hero/occasions/independence src/components/home/hero/occasions
git commit -m "feat: Independence Day in the living hero"
```

### Task 8: The three Remember days (Araw ng Kagitingan, Holy Week, Undas)

**Files:**

- Create: `scripts/source/hero/occasions/remembrance/{sheet-remembrance.png,BRIEF.md}` (one shared sheet), `src/components/home/hero/occasions/{kagitingan,holy-week,undas}.tsx`; generated assets in `public/assets/images/hero/occasions/remembrance/`
- Modify: `src/components/home/hero/occasions/index.ts`

**Interfaces:** consumes the shared sheet and manifest, the flag sprite from Task 7, `lampOpacity`, `windSway`, `ANCHORS`. All three are `tone: 'remember'`; `assets` are the shared sheet and manifest.

- [ ] **Step 1: Make the art.** One sheet: a plain wooden Calvary cross, a woven palm-leaf `palaspas` bundle, a lit votive candle in three heights (glass jar style, no flame needed: the flame is drawn in code), and a bunch of white and yellow chrysanthemums.
- [ ] **Step 2: Build and check** (`node scripts/build-occasion-assets.mjs remembrance`).
- [ ] **Step 3: Implement the three modules** (no pokes, calmer motion, nothing playful):
  - `kagitingan`: a single flag on the dike pole at `dikeFlagpole` (reusing Task 7's pole and flag sprites, raised, waving gently), nothing else.
  - `holy-week`: a muted flat tint rectangle (`#4a3a5c`, opacity 0.26; 0.34 on Good Friday, 3 Apr 2026 pattern: the Friday before Easter Sunday) in front of the whole scene, the cross at `ridgeCross` in `betweenHillsAndPaddies`, a `palaspas` tied at `hutEaveLeft`, sway at half speed, no birds scatter, no fireflies burst.
  - `undas`: candles (code flames, flat gold ellipses, gentle flicker) on `hutSteps` and along `dikeLine` with the chrysanthemums, lit from dusk with `lampOpacity` and still burning in rain (they sit under the dike edge in the art so the flames are not drawn in front of rain: render flames in `betweenPaddiesAndForeground`).
- [ ] **Step 4: Verify** each at morning, dusk, night and rain via `/?on=kagitingan`, `/?on=holy-week&date=2026-04-03`, `/?on=undas`: click the sun, a cloud, a bird and the sky: nothing responds (Review Focus); the time-lapse never starts; the stalk lean is slower than on an ordinary day; the cross is covered at its base by the paddies layer; the tint reads muted, not dark.
- [ ] **Step 5: Commit**

```bash
git add scripts/source/hero/occasions/remembrance public/assets/images/hero/occasions/remembrance src/components/home/hero/occasions
git commit -m "feat: Kagitingan, Holy Week and Undas in the living hero"
```

### Task 9: Araw ng San Jose City and the Fiesta of St. Joseph

**Files:**

- Create: `scripts/source/hero/occasions/fiesta/{sheet-banderitas.png,BRIEF.md}`, `src/components/home/hero/occasions/{city-anniversary,st-joseph}.tsx`; generated assets
- Modify: `src/components/home/hero/occasions/index.ts`

**Interfaces:** consumes the shared fiesta sheet and manifest, `windSway`, `ANCHORS`. Both `tone: 'celebrate'`.

- [ ] **Step 1: Make the art.** One sheet: strands of paper banderitas (small triangular flags on a string) in navy, gold and green only; strands in many colours; a bamboo banner post with a blank cloth banner (no text, no logo); white lilies in bunches (St. Joseph's flower).
- [ ] **Step 2: Build and check** (`node scripts/build-occasion-assets.mjs fiesta`).
- [ ] **Step 3: Implement**: `city-anniversary` strings the navy, gold and green banderitas from `hutEaveRight` to the small palm and across the paddies, with the blank banner post on `dikeLine`; `st-joseph` strings the many-colour banderitas the same way with lily bunches at `hutSteps` and along the dike; banderitas flutter with `windSway` (more in gusts) in `betweenPaddiesAndForeground`; poke: banderitas flutter hard (allowed only when `pokesAllowed`).
- [ ] **Step 4: Verify** via `/?on=city-anniversary` and `/?on=st-joseph` at noon, dusk, night and in a gust; the strands attach to real anchors and sag naturally; the dates in `OCCASIONS` for the city anniversary and the festival are marked unconfirmed.
- [ ] **Step 5: Commit**

```bash
git add scripts/source/hero/occasions/fiesta public/assets/images/hero/occasions/fiesta src/components/home/hero/occasions
git commit -m "feat: city anniversary and St. Joseph fiesta in the living hero"
```

### Task 10: Pagibang Damara and Labor Day

**Files:**

- Create: `scripts/source/hero/occasions/work/{sheet-harvest.png,sheet-labor.png,BRIEF.md}`, `src/components/home/hero/occasions/{pagibang-damara,labor-day}.tsx`; generated assets
- Modify: `src/components/home/hero/occasions/index.ts`

**Interfaces:** consumes the sheets and manifests, `windSway`, `ANCHORS`. Both `tone: 'celebrate'`.

- [ ] **Step 1: Make the art.** `sheet-harvest`: stacked rice sheaves, a carabao pulling a small wooden cart loaded with sacks, woven harvest baskets. `sheet-labor`: a farmer in a salakot ploughing behind a carabao, drawn small and in profile, and the carabao alone with its head raised.
- [ ] **Step 2: Build and check** (`node scripts/build-occasion-assets.mjs work`).
- [ ] **Step 3: Implement**: `pagibang-damara`: sheaves on the dike and baskets at `foregroundEdge` (behind the foreground rice), the carabao cart on the golden paddy at `paddyMidLeft` moving very slowly along the dike; it expects the harvest season art but works on any paddy; `labor-day`: the farmer and carabao ploughing a paddy at `paddyMidLeft` (the farmer drawn small, mid-ground, so it reads as part of the land), plodding slowly; poke: the carabao lifts its head and the farmer pauses (swap to the raised-head sprite for 2 s); allowed only when `pokesAllowed`.
- [ ] **Step 4: Verify** via `/?on=pagibang-damara&season=harvest`, `/?on=labor-day`: the figures stand on the paddies (feet on the surface, covered by the dike or rice where they should be), their scale fits the perspective, and the tint matches the scene.
- [ ] **Step 5: Commit**

```bash
git add scripts/source/hero/occasions/work public/assets/images/hero/occasions/work src/components/home/hero/occasions
git commit -m "feat: Pagibang Damara and Labor Day in the living hero"
```

### Task 11: Combinations, accessibility, cleanup

**Files:**

- Modify: `src/components/home/hero/occasions/index.ts`, `src/components/home/hero/HeroScene.tsx`, `docs/superpowers/specs/2026-11-10-living-hero-design.md` (note the harvest-recolour finding and the final dates)
- Delete: `src/components/home/hero/occasions/test-pin.tsx` and its development override

**Interfaces:** consumes everything above. Produces nothing new.

- [ ] **Step 1: Remove the fixture** `test-pin` and any `?on=test-pin` handling.
- [ ] **Step 2: Screenshot matrix**: for each of the ten occasions and each of the three seasons capture the hero at 8:00, 12:00, 18:00 and 21:00 clear, plus 12:00 rain and 21:00 storm for Christmas, Undas and Holy Week, using the override URLs; collect them in the scratch folder and send them to the user (a contact sheet per occasion) for review. Check each against the eight rules of intent in the spec and the Review Focus combinations (Christmas at noon in a storm, Undas in rain at dusk, harvest paddy at night): props lit, tinted and layered correctly, nothing floats.
- [ ] **Step 3: Accessibility and i18n**: confirm the scene label names the occasion in both languages for every id, that no new visible text exists on the picture, that reduced motion still shows the occasion's static props and nothing moves or responds, and that Remember days respond to no click.
- [ ] **Step 4: Weight and regression**: confirm each occasion loads only its own assets (network panel on `?on=` pages), the plain scene on an ordinary day loads none, and an occasion asset blocked in the network panel leaves the plain scene intact (Review Focus). Update the spec with the harvest-recolour finding and the confirmed-or-not status of each date.
- [ ] **Step 5: Run** `npm run check`. Expected: every stage passes.
- [ ] **Step 6: Commit**

```bash
git add -A src docs
git commit -m "feat: finish the living hero occasions"
```
