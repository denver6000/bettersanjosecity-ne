# Living hero: engine Implementation Plan (plan 1 of 2)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the home hero photo with an illustrated rice-field scene that follows San Jose's real time and weather, moves on its own, and reacts to the cursor, with no occasions yet.

**Architecture:** Pure, unit-tested modules (`sky.ts`, `forecast.ts`, `hero-motion.ts`) hold all the maths. A client component `HeroScene` draws an SVG (code sky over three WebP art layers tinted by a flat colour matrix) and runs one animation loop. Occasions are plan 2 and plug into the scene later; nothing here depends on them.

**Tech Stack:** Next.js 16 static export, React 19, TypeScript, CSS in `src/styles/home.css`, Node 24 `node:test` (types are stripped natively). No new dependencies.

**Spec:** `docs/superpowers/specs/2026-11-10-living-hero-design.md` (revision 2). This plan covers its "Delivery in two plans, 1: Engine". Reference prototype: `docs/superpowers/spikes/2026-11-10-living-hero-live.html` (added in Task 3); port its numbers, not its structure.

## Global Constraints

- No new dependencies. No gradients: sky, glows and tints are flat fills.
- The scene's viewBox is `0 0 1586 992`; the three art layers are exactly 1586 × 992 and must never be moved against each other.
- The scene always shows San Jose time (`Asia/Manila`) and the real weather; there are no visitor controls for the sky on the live site.
- Weather mapping: Open-Meteo code 0 and 1 clear; 2, 3, 45, 48 cloudy; 51 to 67 and 80 to 82 rain; 95 to 99 storm; anything else or missing is clear.
- Every visible string goes through the translation system with matching `en` and `fil` keys (`check-i18n`). Any new token goes in both dark blocks of `src/styles/theme.css`.
- Layers total at most 350 KB as WebP; no layout shift (the panel keeps a fixed aspect ratio and the SVG has an explicit viewBox).
- The headline panel, search box and their contrast are unchanged in light and dark themes.
- `prefers-reduced-motion`: no sway, drift, falling rain, birds, firefly motion or pokes.
- Touch input never leans the rice or leaves it stuck.
- Do not deploy. Commit only on `frontend-wow-factor`.

## Review Focus

- The hour wraps: 23:59 to 0:00 must not jump, and Manila's date at 23:30 UTC is already the next day. Pinned in Task 1.
- Unknown weather (no code, failed fetch, odd code) must draw a clear sky and never crash. Pinned in Tasks 1 and 2.
- A weather cache written by the old widget (no `code`, no precipitation) must not crash the hero or be treated as valid. Pinned in Task 2.
- First paint: reloading at night must show a night scene, not morning that then switches. Pinned in Task 7.
- Reduced motion and a hidden tab or off-screen hero: the animation loop must not run. Pinned in Task 7.

---

### Task 1: Sky maths, with tests

**Files:**

- Create: `src/lib/sky.ts`
- Test: `src/lib/sky.test.ts`
- Modify: `tsconfig.json` (add `"allowImportingTsExtensions": true` to `compilerOptions`), `package.json` (script `"test:lib": "node --test src/lib/*.test.ts"`; append `&& npm run test:lib` to `check` before `npm run build`)

**Interfaces:**

- Produces from `src/lib/sky.ts` (self-contained: no imports, so Node can run it directly):
  - `type Weather = 'clear' | 'cloudy' | 'rain' | 'storm'`
  - `skyAt(hour: number): { night: number; top: string; band: string; tint: string }`: hour wraps modulo 24; `night` 0 to 1; colours are `#rrggbb`, linearly interpolated between these keyframes (hour, night, top, band, tint): 0 → 1, `#0f1d3d`, `#1b2c58`, `#4a5a9a`; 5 → same as 0; 6.5 → 0.3, `#f0b99b`, `#f7dcae`, `#ffc9a0`; 8 → 0, `#f7efd9`, `#fbe6bf`, `#fff3df`; 12 → 0, `#a9d8f0`, `#dcf0f8`, `#ffffff`; 16 → 0, `#b4dcef`, `#f5ead0`, `#fff6e6`; 18 → 0.3, `#e58a5a`, `#f5c26b`, `#f5a070`; 19.5 → 1, `#1b2550`, `#2a3563`, `#4f5f9f`; 24 → same as 0.
  - `weatherKind(code: number | null | undefined): Weather`
  - `weatherLook(w: Weather): { greyMix: number; saturation: number; brightness: number }`: clear 0, 1, 1; cloudy 0.4, 0.88, 0.95; rain 0.6, 0.7, 0.86; storm 0.78, 0.55, 0.72.
  - `bodies(hour: number): { sun: { x: number; y: number; t: number } | null; moon: { x: number; y: number } | null }`: the sun is shown for hours 5.5 to 19, with `t = (hour − 5.5) / 13.5`, `x = 260 + 1080·t`, `y = 560 − 430·sin(π·t)`; otherwise the moon, with `m = ((hour − 19 + 24) % 24) / 10.5` clamped to 1, `x = 260 + 1080·m`, `y = 560 − 400·sin(π·m)`.
  - `mix(a: string, b: string, t: number): string` (hex colour blend) and `hexToRgb(h: string): [number, number, number]`.
  - `manilaNow(now?: Date): { hour: number; year: number; month: number; day: number }`: `hour` includes the fraction (minutes and seconds) and uses `Asia/Manila`.
  - `parseSkyOverride(search: string): { hour?: number; weather?: Weather }`: reads `?sky=21:00,storm` (time `H` or `H:MM` in 0 to 24, and/or one of the four weather words, any order, comma separated); malformed parts are ignored.

- [ ] **Step 1: Write the failing tests** in `src/lib/sky.test.ts` (`node:test`, `node:assert/strict`, imports from `./sky.ts`):
  - `skyAt matches the keyframes`: `skyAt(8)` equals `{ night: 0, top: '#f7efd9', band: '#fbe6bf', tint: '#fff3df' }`; `skyAt(12).tint === '#ffffff'`; `skyAt(0).night === 1`; `skyAt(6.5).night === 0.3`.
  - `skyAt wraps the hour` (Review Focus): `skyAt(24)` deep-equals `skyAt(0)`; `skyAt(-0.5)` deep-equals `skyAt(23.5)`; and `skyAt(23.99).top` is within one colour step of `skyAt(0).top` (compare with `hexToRgb`, each channel differs by at most 2).
  - `weatherKind maps Open-Meteo codes`: 0 and 1 give clear; 2, 3, 45, 48 cloudy; 51, 61, 67, 80, 82 rain; 95 and 99 storm; `null`, `undefined`, `NaN`, 4, 1234 give clear (Review Focus).
  - `weatherLook returns the pinned multipliers` for all four weathers.
  - `bodies shows one body`: at 12.25 the sun is `{ x: 800, y: 130, t: 0.5 }` and the moon is `null`; at 22 the sun is `null` and the moon is set; at 5.5 the sun is at `x: 260, y: 560`; at 19.5 the sun is `null`.
  - `mix and hexToRgb`: `mix('#000000', '#ffffff', 0.5)` is `'#808080'`; `hexToRgb('#f2b100')` is `[242, 177, 0]`.
  - `manilaNow uses Asia/Manila` (Review Focus): `manilaNow(new Date('2026-12-31T16:30:00Z'))` is `{ hour: 0.5, year: 2027, month: 1, day: 1 }`; `manilaNow(new Date('2026-11-10T04:00:00Z')).hour` is `12`.
  - `parseSkyOverride`: `'?sky=21:00,storm'` gives `{ hour: 21, weather: 'storm' }`; `'?sky=storm,8'` gives `{ hour: 8, weather: 'storm' }`; `'?sky=25:00,hail'` gives `{}`; `''` gives `{}`.
- [ ] **Step 2: Run** `node --test src/lib/sky.test.ts`. Expected: FAIL, module or exports missing.
- [ ] **Step 3: Implement** every export above in `src/lib/sky.ts` per the Interfaces block. Use `Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Manila', hour12: false, ... }).formatToParts` for `manilaNow` (take `hour % 24`).
- [ ] **Step 4: Wire the test script**: add the `tsconfig.json` flag and the `package.json` scripts, then run `npm run test:lib && npm run typecheck`. Expected: all tests PASS and typecheck clean.
- [ ] **Step 5: Commit**

```bash
git add src/lib/sky.ts src/lib/sky.test.ts tsconfig.json package.json
git commit -m "feat: sky maths for the living hero"
```

### Task 2: Shared forecast

**Files:**

- Create: `src/lib/forecast.ts` (pure, no imports from `@/`), `src/lib/use-forecast.ts` (client hook)
- Test: `src/lib/forecast.test.ts`
- Modify: `src/components/WeatherWidget.tsx` (use the shared hook and types; remove its own fetch, cache and `CODES` table)

**Interfaces:**

- Produces from `forecast.ts`:
  - `interface Forecast { temperature: number; humidity: number; windSpeed: number; code: number; precipitation: number; condition: string; icon: string; hourly: { time: string; icon: string; temperature: number }[] }`
  - `mapCode(code: number): { condition: string; icon: string }`: the widget's current `CODES` table and its `'Partly cloudy'` / `ph-cloud-sun` fallback, moved unchanged.
  - `buildForecastUrl(lat: number, lon: number): string`: Open-Meteo forecast URL with `current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,precipitation`, `hourly=temperature_2m,weather_code`, `timezone=Asia/Manila`, `forecast_days=2`.
  - `parseForecast(json: unknown, manilaHour: number): Forecast`: the widget's present parsing (next four hours, `windSpeed` rounded), plus `code: current.weather_code` and `precipitation: current.precipitation ?? 0`; throws on a malformed body.
  - `isForecast(x: unknown): x is Forecast`: true only if `hourly` is an array and `code`, `precipitation`, `windSpeed`, `temperature`, `humidity` are numbers.
- Produces from `use-forecast.ts` (client): `useForecast(): { forecast: Forecast | null; failed: boolean; retry: () => void }`. One shared module-level request and one cache: concurrent callers share one in-flight fetch. Cache key `lgu_weather_cache_v3` (the shape changed), 30-minute TTL, entries failing `isForecast` are misses. `retry` forces a fetch.

- [ ] **Step 1: Write the failing tests** in `src/lib/forecast.test.ts`:
  - `buildForecastUrl asks for wind and precipitation` (contains `precipitation`, `wind_speed_10m`, `timezone=Asia%2FManila`).
  - `parseForecast reads the current block and the next four hours` from a small fixture (48 hourly entries; `manilaHour` 17): `code`, `precipitation`, rounded `windSpeed`, four `hourly` items starting at 6 PM with the right icons.
  - `parseForecast defaults missing precipitation to 0` and `parseForecast throws on a body with no current block`.
  - `isForecast rejects the old cache shape` (Review Focus): an object without `code` and `precipitation` is false; a complete object is true; `null` and `42` are false.
  - `mapCode keeps the widget's table`: 0 gives `Clear sky` / `ph-sun`; 95 gives `Thunderstorm` / `ph-cloud-lightning`; an unlisted code gives `Partly cloudy`.
- [ ] **Step 2: Run** `node --test src/lib/forecast.test.ts`. Expected: FAIL, module missing.
- [ ] **Step 3: Implement** `forecast.ts` (move the table and parsing out of `WeatherWidget.tsx` with the additions above) and `use-forecast.ts` (hook with shared in-flight promise and the v3 cache).
- [ ] **Step 4: Switch `WeatherWidget.tsx`** to `useForecast` and the shared `Forecast` and `mapCode`; its markup and behaviour stay identical.
- [ ] **Step 5: Run** `npm run test:lib && npm run typecheck && npm run format:check`. Expected: PASS. Then start the dev server and confirm in the browser that the weather section still renders temperature, humidity, wind and the four-hour strip, and that the network panel shows a single Open-Meteo request on first load.
- [ ] **Step 6: Commit**

```bash
git add src/lib/forecast.ts src/lib/use-forecast.ts src/lib/forecast.test.ts src/components/WeatherWidget.tsx
git commit -m "refactor: share one forecast request between the weather widget and the hero"
```

### Task 3: Art assets

**Files:**

- Create: `scripts/source/hero/hills.png`, `scripts/source/hero/paddies.png`, `scripts/source/hero/foreground.png` (copied from the verified layers), `scripts/build-hero-assets.mjs`, `docs/superpowers/spikes/2026-11-10-living-hero-live.html` (copy of the prototype)
- Create (generated): `public/assets/images/hero/scene/hills.webp`, `paddies.webp`, `foreground.webp`
- Modify: `package.json` (script `"hero:assets": "node scripts/build-hero-assets.mjs"`), `.prettierignore` (add `scripts/source` is already ignored; nothing needed unless the spike HTML fails the format check, in which case add `docs/superpowers/spikes`)

**Interfaces:**

- Produces: three WebP files, each 1586 × 992 with an alpha channel, whose total size is at most 350 KB. Consumed by Task 4 at `/assets/images/hero/scene/{hills,paddies,foreground}.webp`.

The three PNGs are in the scratch folder `C:\Users\Kurtong\AppData\Local\Temp\claude\c38593200fda165d\a8c620ef-14e3-4d2b-8b43-52c309aaef5f\scratchpad\hero-spike\` as `hills.png`, `paddies.png`, `foreground.png`, and the prototype as `live.html` in the same folder. If they are gone, the same files are in `C:\Users\Kurtong\Downloads\` as `sj-hero-layer-hills.png`, `sj-hero-layer-paddies.png`, `sj-hero-layer-foreground.png`.

- [ ] **Step 1: Copy the sources and the prototype** into the repo paths above and confirm each PNG is 1586 × 992 (read the IHDR bytes with a short node check).
- [ ] **Step 2: Implement `scripts/build-hero-assets.mjs`**: no dependencies. It finds Edge or Chrome (env `BROWSER_PATH`, then the usual Windows install paths, else exits with a clear message), starts a tiny local HTTP server that serves a conversion page and the PNGs, launches the browser headless with that page, and the page draws each PNG on a canvas and posts back `canvas.toBlob('image/webp', 0.82)`; the server writes the files, then the script stops the browser it started (by pid) and the server. It prints each output size and exits non-zero if any is not 1586 × 992 or the total exceeds 350 KB.
- [ ] **Step 3: Run** `npm run hero:assets`. Expected: three files written, total at most 350 KB. If the total is over, lower the quality in steps of 0.05 and rerun; report the final value.
- [ ] **Step 4: Verify alpha survived**: open one output (for example with the same headless page or by a short script that reads the WebP header for the alpha flag) and confirm transparent pixels remain; confirm in the preview browser that `paddies.webp` shows the sky area as transparent.
- [ ] **Step 5: Commit** (the generated WebP files are committed; the source PNGs are about 1.8 MB, committed once)

```bash
git add scripts/build-hero-assets.mjs scripts/source/hero public/assets/images/hero/scene docs/superpowers/spikes package.json .prettierignore
git commit -m "feat: hero art layers as WebP, with the build script and prototype"
```

### Task 4: The scene, live sky and weather (no motion yet)

**Files:**

- Create: `src/components/home/hero/HeroScene.tsx`
- Modify: `src/components/home/HomeHero.tsx` (replace the photo block with `<HeroScene />` inside the existing curved panel), `src/styles/home.css` (scene panel rules; remove nothing else yet), `src/i18n/translations.ts` (add `hero-scene-alt` to both languages)

**Interfaces:**

- Consumes: `skyAt`, `weatherKind`, `weatherLook`, `bodies`, `mix`, `hexToRgb`, `manilaNow`, `parseSkyOverride` (Task 1); `useForecast` (Task 2); the three WebP files (Task 3).
- Produces: `export default function HeroScene(): JSX.Element` (client component, no props). The root `<svg>` carries `data-sky-hour` (the hour used, to one decimal) and `data-weather` (`clear|cloudy|rain|storm`) so tests and reviewers can read what it is drawing.
- New translation key: `hero-scene-alt`: "Illustrated rice fields of San Jose City that follow the real time and weather" and "Guhit ng mga palayan ng San Jose City na sumusunod sa tunay na oras at panahon".

- [ ] **Step 1: Implement `HeroScene`.** `<svg viewBox="0 0 1586 992" preserveAspectRatio="xMaxYMid slice" role="img" aria-label={t('hero-scene-alt')}>` with, back to front: three flat sky rects (full, `y=300 h=400`, `y=430 h=300`) filled from `skyAt` (`top`, mix of top and band, `band`) after mixing toward a grey by `weatherLook.greyMix` (grey is `mix('#9aa4ae', '#1c2438', night)`); 46 stars (opacity from night and weather); the sun (`r=74` circle, 12 flat rays, colour from `mix('#f9c92a', '#f26b3a', (1 − sin(π·t))^1.6)`) and moon (crescent path, `#f4f1d8`) at `bodies(hour)`; clouds (2 clear, 5 cloudy, 6 rain or storm; the four-ellipse cloud shape of the prototype, fill from the night and weather mix); `<image>` for `hills.webp`, `paddies.webp`, then `foreground.webp`, each wrapped in `<g filter="url(#hero-tint)">` where the filter is one `feColorMatrix` saturate (`weatherLook.saturation`) followed by a diagonal `feColorMatrix` equal to the tint colour ÷ 255 × `weatherLook.brightness`; the hut window glow (`cx=1340 cy=556 r=16`, `#ffd25a`, opacity from night); falling-rain lines (static in this task; count 40 for rain, 130 for storm). Hour comes from `manilaNow()` re-read every 30 seconds, or from `parseSkyOverride(location.search)` when present; weather from `weatherKind(forecast?.code)` or the override.
- [ ] **Step 2: Swap the photo.** In `HomeHero.tsx` keep the `home-hero-pic` panel, its curved gold edge SVG and navy swoosh, and the `#hero-arc` clip; put `HeroScene` where the `<img>` was. In `home.css` give the scene `position: absolute; inset: 0; width: 100%; height: 100%` and apply `clip-path: url(#hero-arc)` to it (the same clip the photo had); keep the mobile rule (`height: 260px`, rounded clip). Leave the old photo files and the old `img` CSS for Task 7.
- [ ] **Step 3: Run** `node scripts/check-i18n.mjs && npm run typecheck && npm run format:check`. Expected: PASS.
- [ ] **Step 4: Verify in the browser** (dev server): the scene shows in the curved panel at 1280 px and 375 px wide with no layout shift; `/?sky=8:00,clear` shows a golden morning, `/?sky=21:00,storm` a dark rainy night with lit hut window, `/?sky=18:00,cloudy` a warm dusk with grey clouds, `/?sky=12:00,rain` a grey day; with no override it shows the real San Jose time and weather (compare `data-sky-hour` and `data-weather` with the weather section); the headline and search look unchanged; the console has no errors (the PHP weather-station 500 in dev is expected and unrelated).
- [ ] **Step 5: Commit**

```bash
git add src/components/home/hero src/components/home/HomeHero.tsx src/styles/home.css src/i18n/translations.ts
git commit -m "feat: living hero scene with the real San Jose sky"
```

### Task 5: Ambient motion

**Files:**

- Create: `src/lib/hero-motion.ts` (pure), `src/components/home/hero/useHeroLoop.ts`
- Test: `src/lib/hero-motion.test.ts`
- Modify: `src/components/home/hero/HeroScene.tsx`, `src/styles/home.css`

**Interfaces:**

- Produces from `hero-motion.ts` (self-contained, no imports):
  - `cloudX(x: number, dtSec: number, windKmh: number, k: number): number`: `x + (6 + 1.6·windKmh) · dtSec · (0.6 + 0.12·k)`, wrapping to `-320` once past `1850`.
  - `birdPose(tSec: number, bird: { index: number; y: number; speed: number; offset: number; phase: number }, scatter: number): { x: number; y: number }`: `x = ((tSec·speed + offset) % 1900) − 150 + scatter·(160 + 40·index)`, `y = baseY + sin(1.2·tSec + phase)·14 − scatter·(240 + 30·index)`, where `index` is `bird.index` and `y` in the bird object is the base height; `scatter` is 0 to 1.
  - `rippleRate(weather: 'clear' | 'cloudy' | 'rain' | 'storm', precipitationMm: number, showerActive: boolean): number`: ripples per second: clear and cloudy 0; rain `4 + min(1, precipitationMm / 4) · 8`; storm 14; plus 7 when a shower is active.
  - `fireflyTarget(base: { x: number; y: number }, tSec: number, phase: number): { x: number; y: number }`: `base.x + sin(0.7·tSec + phase)·40`, `base.y + cos(0.9·tSec + phase·1.7)·24`.
- Produces from `useHeroLoop.ts`: `useHeroLoop(onFrame: (nowMs: number, dtSec: number) => void, enabled: boolean): void`: one `requestAnimationFrame` loop that runs only when `enabled`, the tab is visible (`document.visibilityState`), and the hero is on screen (`IntersectionObserver`), caps `dtSec` at 0.05, and cancels on unmount.

- [ ] **Step 1: Write the failing tests** in `src/lib/hero-motion.test.ts`: `cloudX advances faster in wind` (wind 30 moves further than wind 0 over the same dt); `cloudX wraps past 1850 to -320`; `birdPose is unscattered at scatter 0 and moves up and right at 1` (y smaller, x larger); `rippleRate` for each weather, including that clear gives 0, that a shower adds 7, and that rain at 4 mm is `12`; `fireflyTarget stays near its base` (within 40 and 24 units).
- [ ] **Step 2: Run** `node --test src/lib/hero-motion.test.ts`. Expected: FAIL, module missing.
- [ ] **Step 3: Implement** the four functions and `useHeroLoop`.
- [ ] **Step 4: Add the motion to `HeroScene`**, all driven by one `useHeroLoop` callback (enabled only when `prefers-reduced-motion` is not set): sun rays turning slowly (CSS) and the sun breathing; star twinkle (CSS); clouds drifting via `cloudX` with the real `windSpeed`; five birds by day (via `birdPose`, a CSS wing flap), faded out by night factor; ten fireflies at night (via `fireflyTarget`, opacity pulsing); rain lines animated falling, count scaled by the real precipitation for rain; ripples on the paddy area (x 300 to 1550, y 640 to 890) at `rippleRate` per second, each a short-lived expanding ellipse; lightning flashes in a storm (CSS). Keep the code-drawn elements inside the same tint filter group where they sit in front of art.
- [ ] **Step 5: Run** `npm run test:lib && npm run typecheck && npm run format:check`. Expected: PASS.
- [ ] **Step 6: Verify in the browser**: clouds drift (the transform values change over a few seconds); at `/?sky=12:00,rain` ripples appear and lines fall; at `/?sky=22:00,clear` fireflies drift and the moon and stars show; at `/?sky=12:00,clear` birds cross; the loop does not run in a background tab (`requestAnimationFrame` count stops, checked by reading a frame counter exposed as `data-frames` on the root while developing, which is removed before commit); no console errors.
- [ ] **Step 7: Commit**

```bash
git add src/lib/hero-motion.ts src/lib/hero-motion.test.ts src/components/home/hero src/styles/home.css
git commit -m "feat: ambient motion for the living hero"
```

### Task 6: Interactions

**Files:**

- Modify: `src/lib/hero-motion.ts`, `src/lib/hero-motion.test.ts`, `src/components/home/hero/HeroScene.tsx`, `src/styles/home.css`

**Interfaces:**

- Adds to `hero-motion.ts`:
  - `stalkTarget(stalkX: number, cursorX: number | null, cursorY: number | null, moving: boolean, tSec: number, phase: number): number`: degrees; idle sway `sin(1.3·tSec + phase)·2.4`; when a cursor is present and `cursorY > 380`, add `sign(stalkX − cursorX or 1) · 30 · exp(−((stalkX − cursorX)/280)²) · (moving ? 1.25 : 0.8)` (stalks lean away from the cursor).
  - `timelapseHour(realHour: number, elapsedMs: number, durationMs: number): number`: eased (`k < 0.5 ? 2k² : 1 − (−2k + 2)²/2`) progress through 24 hours from `realHour`, modulo 24; returns `realHour` once `elapsedMs ≥ durationMs`.

- [ ] **Step 1: Write the failing tests** (add to `hero-motion.test.ts`): `stalkTarget leans away from the cursor` (a stalk left of the cursor gives a negative angle, one right of it a positive angle); `stalkTarget is idle far from the cursor` (`|angle| ≤ 2.4` when 1000 units away) and idle when the cursor is `null` (touch); `stalkTarget ignores a cursor above the grass` (`cursorY` 300 gives idle); `timelapseHour returns to the real hour` (`timelapseHour(12, 14000, 14000) === 12`; at 0 ms it is 12; at half time it is `0`); `timelapseHour is monotone through the day` (sample ten points: the unwrapped hour never decreases).
- [ ] **Step 2: Run** `node --test src/lib/hero-motion.test.ts`. Expected: the new tests FAIL.
- [ ] **Step 3: Implement** `stalkTarget` and `timelapseHour`.
- [ ] **Step 4: Add to `HeroScene`**: about 66 code-drawn rice stalks (a leaf-green blade path and four gold grain ellipses, alternating two greens) along the bottom, in front of `foreground.webp` inside the tint group, each rotating about its base by a smoothed angle toward `stalkTarget`; density and height are tunable constants so the artwork still shows (start from the prototype's 24-unit spacing and 130 to 240 height and reduce if they cover the picture). Pointer events: track the cursor in SVG coordinates (`getScreenCTM().inverse()`), ignore `pointerType === 'touch'`, clear on `pointerleave`. Pokes (the sun group, each cloud, and each bird get `cursor: pointer` and a small hover scale): clicking the sun starts a 14-second time-lapse using `timelapseHour` (ignored while one runs; the sky colours, sun and moon follow the virtual hour, the weather stays real); clicking a cloud starts a 6-second shower from that cloud (16 falling lines, the cloud darkens, ripples speed up); clicking a bird sets `scatter` to 1, decaying at 0.35 per second; at night the fireflies gather around the cursor when it is within 520 units and burst apart on click. Pokes and cursor wind are disabled when `prefers-reduced-motion` is set.
- [ ] **Step 5: Run** `npm run test:lib && npm run typecheck && npm run format:check`. Expected: PASS.
- [ ] **Step 6: Verify in the browser**: with the mouse over the grass the nearby stalks part and lean away and settle back when it leaves; a simulated touch (`pointerType: 'touch'`) never leans the rice (Review Focus on touch); clicking the sun runs the day through in about 14 seconds and lands on the real hour (`data-sky-hour` returns to its starting value within 0.1); a cloud click makes a shower for about 6 seconds then stops; a bird click scatters and returns; the picture is still clearly visible behind the code stalks; no console errors.
- [ ] **Step 7: Commit**

```bash
git add src/lib/hero-motion.ts src/lib/hero-motion.test.ts src/components/home/hero src/styles/home.css
git commit -m "feat: cursor wind and pokes for the living hero"
```

### Task 7: First paint, reduced motion, cleanup

**Files:**

- Modify: `src/app/layout.tsx` (add a `HERO_GATE` inline script beside `LANG_GATE`), `src/components/home/hero/HeroScene.tsx`, `src/components/home/HomeHero.tsx` (preload links), `src/styles/home.css`, `src/i18n/translations.ts` (remove `hero-photo-alt` from both languages)
- Delete: `public/assets/images/hero/san-jose-rice-fields.jpg`, `san-jose-rice-fields-640.jpg`, `san-jose-rice-fields-960.jpg`

**Interfaces:**

- Consumes: Task 4 and 5 scene; the forecast cache key `lgu_weather_cache_v3` with `data.code` (Task 2).
- Produces: `HERO_GATE`, a short inline script that, before first paint, sets `data-sky-hour` (Manila hour, one decimal) and `data-weather` (from the cached forecast's `code`, mapped with the same rules as `weatherKind`, else `clear`) on `<html>`; `HeroScene` reads these as its initial state so the server-rendered scene already matches.

- [ ] **Step 1: Add `HERO_GATE`** next to `LANG_GATE` in `layout.tsx` (a one-line `try{...}catch(e){}` script that computes the Manila hour with `Intl.DateTimeFormat` and reads the cache) and make `HeroScene` take its first render values from the attributes, falling back to the live computation, so a reload at night shows a night scene with no morning flash.
- [ ] **Step 2: Add preloads** for `hills.webp` and `paddies.webp` (`<link rel="preload" as="image" type="image/webp">`) in `HomeHero`.
- [ ] **Step 3: Remove the photo**: delete the three JPEGs, the `.home-hero-pic img` rules and the mobile `img` clip rule from `home.css`, the unused `hero-photo-alt` keys in both languages, and the `<img>` remnants in `HomeHero.tsx`.
- [ ] **Step 4: Run** `npm run check`. Expected: every stage passes, including the build.
- [ ] **Step 5: Verify in the browser**: (a) first paint: load `/?sky=22:00,storm` hard-refreshed with the cache primed and confirm via a screenshot taken immediately that the first frame is night, not morning (Review Focus); (b) reduced motion: emulate `prefers-reduced-motion: reduce` and confirm no frame loop runs, no clouds drift, pokes and cursor wind do nothing, and the scene still shows the right time and weather (Review Focus); (c) hidden tab and off-screen: scroll the hero out of view and confirm the loop stops; (d) light and dark site theme, Filipino, 375 px and 1280 px, no horizontal scroll, headline and search unchanged; (e) compare page transfer size before and after (the photo set was about 550 KB; the scene should be at most about 350 KB).
- [ ] **Step 7: Commit**

```bash
git add -A src public docs
git commit -m "feat: first-paint gate, reduced motion and photo removal for the living hero"
```
