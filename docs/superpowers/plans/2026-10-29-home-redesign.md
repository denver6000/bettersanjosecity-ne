# Home Page Redesign and Site Re-skin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Re-skin the whole site in the logo's colors with serif headings and Phosphor icons, and rebuild the home page to match the approved mockup v2.

**Architecture:**

- **Theme:** change the shared tokens on `:root` in `src/styles/style.css`, so every page picks up the new colors.
- **Icons:** replace Bootstrap Icons with the self-hosted `@phosphor-icons/web` icon-font classes, so icon names stored as strings in data keep working with a rename.
- **Home page:** split into focused components under `src/components/home/`, with one stylesheet, `src/styles/home.css`.
- **Top bars:** one new `TopStrip` replaces `HotlineBar` and `InfoBar` in the shared layout.

**Tech Stack:** Next.js 16.4.3 (static export), React 19, plain CSS, `@phosphor-icons/web@2.1.1`, `next/font/google` (Fraunces).

**Spec:** `docs/superpowers/specs/2026-10-29-home-redesign-design.md`. The visual reference is the mockup `.superpowers/brainstorm/7848-1793244778/content/page-v2.html`, which is local only and gitignored.

## Global Constraints

- **No gradients anywhere.** That rules out `linear-gradient`, `radial-gradient`, `conic-gradient`, and gradient fades or overlays on photos.
- **Color roles, fixed:**
  - navy `#0a2f86` (dark `#071f5c`, tint `#eef2fa`) is structure: headings, header, strip, footer, icons, the scholarship band.
  - gold `#f2b100` is action only: primary buttons, with navy text on them (8.1:1).
  - gold text `#b88200` is used only for the headline line "Made simpler.". Bright gold on cream is 1.8:1, which fails contrast; `#b88200` gives 3.15:1, passing for large text.
  - green `#16722b` is the Live status only.
  - cream `#faf7f0` is the page background. Cards are white with a `#e7e3d8` border.
  - ink `#141b2d` and mute `#636b7d` are for text.
- **Type:** headings use Fraunces 700, body uses Inter (already loaded).
- **Icons:** Phosphor only. Regular weight (`ph`) for UI chrome, duotone (`ph-duotone`) for feature icons (service tiles, stats, weather, list rows, empty states).
- **No filler text.** No eyebrow kickers, no subtitles under section headings. Each item appears once on the home page.
- **No invented numbers.** Missing data shows the `ComingSoon` pill.
- **Disclaimer:** "Independent civic site · not the official LGU website" shows on every page, once, in the top strip.
- **i18n:** every new string goes through `<T k="…">` with an EN and a FIL entry in `src/i18n/translations.ts`. FIL drafts are flagged in the PR for a native speaker.
- **Gate:** `npm run check` (format, typecheck, build) must be green. There is no unit test suite. This plan adds two script checks to `check`.
- **Responsive:** no horizontal scroll at 375px. Motion respects `prefers-reduced-motion`.
- **Next 16:** read the relevant guide in `node_modules/next/dist/docs/` before using `next/font` (AGENTS.md).
- **Branch:** work on `frontend-kurt`. Commit after each task. Do not push or deploy.

## Review Focus

1. **A misspelled Phosphor class renders an empty box with no error.** Every `ph-*` name used in `src/` must exist in the installed font. Pinned by `scripts/check-icons.mjs` (Task 2).
2. **Phone width (375px):** the bleeding hero photo and the curved clip must not cause horizontal scroll. Pinned by the `scrollWidth` check in Task 5.
3. **Switching to FIL:** a key missing in `fil` silently falls back to English. EN and FIL key sets must match. Pinned by `scripts/check-i18n.mjs` (Task 3).
4. **No news yet.** `src/data/news.json` is empty today, so the news section must show a designed empty state, not a blank grid. Pinned in Task 7.
5. **Weather station offline or loading:** no green "Live" dot unless the status is `live`. Pinned in Task 7.

---

### Task 1: Theme tokens, Fraunces and the Phosphor package

**Files:**

- Modify: `package.json` (add the dependency `@phosphor-icons/web` at exactly `2.1.1`)
- Modify: `src/app/layout.tsx` (load Fraunces with `next/font/google`, import the Phosphor weights, update `msapplication-TileColor`)
- Modify: `src/styles/style.css:2-27` (`:root` tokens)

**Interfaces:**

- **Produces CSS custom properties**, used by every later task:
  - Colors: `--color-navy`, `--color-navy-dark`, `--color-navy-tint`, `--color-gold`, `--color-gold-text` (`#b88200`), `--color-live`, `--color-cream`, `--color-line`, `--color-ink`, `--color-mute`
  - Font: `--font-display`, set by `next/font` on `<html>`
  - Existing tokens remapped:
    - `--color-primary` becomes navy, and `--color-primary-dark` becomes navy dark.
    - `--color-accent` becomes gold.
    - `--color-bg-alt` becomes cream.
    - `--color-text` becomes ink, and `--color-text-light` becomes mute.
- **Produces global icon classes:** `ph`, `ph-duotone`, `ph-bold` and `ph-fill` are available on every page.

- [ ] **Step 1:** Run `npm ci`, then `npm i -E @phosphor-icons/web@2.1.1`. Expected: `package.json` lists `"@phosphor-icons/web": "2.1.1"`.
- [ ] **Step 2:** Read the font guide in `node_modules/next/dist/docs/` (search for `next/font`). Confirm it works with `output: 'export'`.
- [ ] **Step 3:** Update `src/app/layout.tsx`:
  - Load Fraunces with `subsets: ['latin']`, `weight: ['600', '700']`, `variable: '--font-display'` and `display: 'swap'`, and put its `.variable` on `<html>`.
  - Import `@phosphor-icons/web/regular`, `/duotone`, `/bold` and `/fill`.
  - Leave the Bootstrap Icons `<link>` in place. Task 2 removes it.
- [ ] **Step 4:** Remap the `:root` tokens in `style.css` to the Global Constraints values.
  - Add `h1, h2, h3 { font-family: var(--font-display), Georgia, serif; }`, unless an existing heading rule already sets the font, in which case change that rule.
  - Set `body { background: var(--color-cream) }`.
- [ ] **Step 5:** Run `npm run check`. Expected: exit 0.
- [ ] **Step 6:** Run `npm run dev` and open `/` and `/business-taxes`. Expected: navy and gold instead of blue and orange, serif headings, no console errors.
- [ ] **Step 7:** Commit with `git commit -m "feat: logo color tokens, Fraunces headings, Phosphor package"`.

### Task 2: Replace every Bootstrap Icon with Phosphor

**Files:**

- Create: `scripts/check-icons.mjs`
- Modify: `package.json` (change the `check` script to run `node scripts/check-icons.mjs` before the build)
- Modify: every file that `grep -rl "bi-" src` lists (31 files, including data strings in `src/config/site.ts`), plus the CSS selectors `.bi` and `.bi-*` in `src/styles/footer.css:221-222`, `scholarship.css:177-226` and `taxes.css:118,882`
- Modify: `src/app/layout.tsx` (remove the Bootstrap Icons `<link>`)

**Interfaces:**

- **Consumes:** the classes from Task 1.
- **Produces:** icon strings stored in data (`SERVICE_CATEGORIES[].icon`, `SITE.hotlines[].icon`, the `DataPending` `icon` prop) become bare Phosphor names such as `'ph-storefront'`. Components add the weight class when they render, for example `className={\`ph-duotone ${c.icon}\`}`.
- **Produces `scripts/check-icons.mjs`:**
  - It scans `src/**/*.{ts,tsx,css}` for `ph-[a-z0-9-]+` names.
  - It ignores the weight classes `ph-duotone`, `ph-bold` and `ph-fill`.
  - It fails with exit 1, listing any name not defined in `node_modules/@phosphor-icons/web/src/regular/style.css`.
  - It also fails if any `bi-` or `bi ` icon class is left in `src`.

- [ ] **Step 1:** Write `scripts/check-icons.mjs` as described. Run `node scripts/check-icons.mjs`. Expected: FAIL, listing the remaining `bi-` usages.
- [ ] **Step 2:** Replace icons using this mapping. Weight rule: chrome gets `ph`, feature icons get `ph-duotone`. A Bootstrap `-fill` variant does not force `ph-fill`; use `ph-fill` only for small solid status marks (`check-circle`, `warning`).

| Bootstrap                                                      | Phosphor               | Bootstrap                 | Phosphor             |
| -------------------------------------------------------------- | ---------------------- | ------------------------- | -------------------- |
| arrow-return-right                                             | arrow-bend-down-right  | file-earmark-text(-fill)  | file-text            |
| arrow-right                                                    | arrow-right            | file-earmark-check-fill   | seal-check           |
| award-fill                                                     | medal                  | file-earmark-lock         | file-lock            |
| bank2                                                          | bank                   | file-earmark-ruled-fill   | file-text            |
| bar-chart-fill                                                 | chart-bar              | flower1                   | plant                |
| boxes                                                          | package                | geo-alt(-fill)            | map-pin              |
| brightness-high, sun(-fill)                                    | sun                    | github                    | github-logo          |
| broadcast                                                      | broadcast              | graph-up-arrow            | chart-line-up        |
| building-fill                                                  | buildings              | grid-fill                 | squares-four         |
| calculator                                                     | calculator             | heart-pulse-fill          | heartbeat            |
| calendar3                                                      | calendar-blank         | hourglass-split           | hourglass            |
| cash-coin                                                      | coins                  | info-circle               | info                 |
| cash-stack                                                     | money                  | journal-bookmark-fill     | bookmark-simple      |
| check-circle-fill                                              | check-circle           | journal-text              | notebook             |
| check-lg                                                       | check                  | list                      | list                 |
| clock                                                          | clock                  | mortarboard-fill          | graduation-cap       |
| cloud-drizzle(-fill), cloud-rain(-fill), cloud-rain-heavy-fill | cloud-rain             | newspaper                 | newspaper            |
| cloud-fog-fill                                                 | cloud-fog              | people-fill               | users-three          |
| cloud-lightning-rain-fill                                      | cloud-lightning        | person-badge-fill         | identification-badge |
| cloud-sun-fill                                                 | cloud-sun              | pie-chart-fill            | chart-pie            |
| clouds-fill                                                    | cloud                  | pin-map-fill              | map-pin-area         |
| cone-striped                                                   | traffic-cone           | question-circle-fill      | question             |
| currency-exchange                                              | currency-circle-dollar | rulers                    | ruler                |
| diagram-2-fill, diagram-3-fill                                 | tree-structure         | search                    | magnifying-glass     |
| download                                                       | download-simple        | shield-fill-check         | shield-check         |
| droplet                                                        | drop                   | shield-lock-fill          | lock                 |
| envelope-fill, envelope-heart                                  | envelope-simple        | shop                      | storefront           |
| exclamation-triangle-fill                                      | warning                | speedometer2              | gauge                |
| table                                                          | table                  | telephone-fill            | phone                |
| thermometer-half                                               | thermometer            | thermometer-sun           | thermometer-hot      |
| tree-fill                                                      | tree                   | universal-access(-circle) | wheelchair           |
| wallet2                                                        | wallet                 | wind                      | wind                 |
| x-lg                                                           | x                      |                           |                      |

If a name is missing from the font, the check in Step 4 says so. Pick the nearest glyph from the Phosphor catalog and record the substitution in the commit message.

- [ ] **Step 3:** Remove the Bootstrap Icons `<link>` from `layout.tsx`. Rename the `.bi` CSS selectors to `.ph`, or to the specific `.ph-*` class.
- [ ] **Step 4:** Run `node scripts/check-icons.mjs`. Expected: PASS (exit 0).
- [ ] **Step 5:** Run `npm run check`. Expected: exit 0.
- [ ] **Step 6:** Run `npm run dev`. Open `/`, `/services`, `/business-taxes`, `/business-taxes/estimator`, `/scholarship`, `/statistics` and `/contact`. Expected: every icon is visible and none is an empty square.
- [ ] **Step 7:** Commit with `git commit -m "feat: replace Bootstrap Icons with Phosphor site-wide"`.

### Task 3: Top strip, header and footer (shared layout)

**Files:**

- Create: `src/components/layout/TopStrip.tsx`
- Create: `scripts/check-i18n.mjs`, and add it to the `check` script
- Delete: `src/components/layout/HotlineBar.tsx`, `src/components/layout/InfoBar.tsx`, and their CSS rules in `src/styles/style.css` (the hotline and info bar selectors, about 26 lines)
- Modify: `src/app/layout.tsx` (render `<TopStrip />` above `<Header />`; remove `HotlineBar` and `InfoBar`)
- Modify: header and footer CSS in `src/styles/style.css` and `src/styles/footer.css`
- Modify: `src/i18n/translations.ts`

**Interfaces:**

- **Produces `TopStrip()`.** It is a server component with no props and renders `<div className="top-strip">` containing three items:
  - the location `SITE.lgu.name, SITE.lgu.province` with `ph-fill ph-map-pin`
  - each `SITE.hotlines` entry as a `tel:` link with `ph-fill ph-phone`
  - `<T k="topstrip-disclaimer">`
- **Produces translation key `topstrip-disclaimer`:**
  - EN: "Independent civic site · not the official LGU website"
  - FIL: "Independenteng civic site · hindi opisyal na website ng LGU"
- **Produces `scripts/check-i18n.mjs`:** it imports `translations` (or parses the file) and exits 1, listing the differences, if the key sets of `en` and `fil` differ.

- [ ] **Step 1:** Write `scripts/check-i18n.mjs`. Run it. Expected: PASS on the current file, which proves the check runs.
- [ ] **Step 2:** Build `TopStrip`. Style it on navy dark `#071f5c` with 12px text and gold icons.
  - Desktop: one row, with the disclaimer pushed right.
  - Below 768px: the location and hotline share the first line, and the disclaimer wraps to a second line. It is never hidden.
- [ ] **Step 3:** Swap it into `layout.tsx`. Delete the two old components and their CSS.
- [ ] **Step 4:** Restyle the header:
  - white background with a `--color-line` bottom border
  - navy wordmark (`BrandLockup` stays as it is)
  - nav in mute, with the active link in navy plus a 2px navy underline
  - the language toggle as a pill, with the active language on navy
- [ ] **Step 5:** Restyle the footer:
  - navy dark background, light text, and the logo on a white rounded tile
  - keep every existing link and column; colors only
- [ ] **Step 6:** Run `npm run check`. Then run `grep -L "not the official LGU website" $(find out -name index.html)`. Expected: check exits 0, and grep prints nothing, meaning every exported page has the disclaimer.
- [ ] **Step 7:** Commit with `git commit -m "feat: one site-wide top strip with disclaimer; restyle header and footer"`.

### Task 4: `ComingSoon` pill and home stylesheet scaffold

**Files:**

- Create: `src/components/ComingSoon.tsx`
- Create: `src/styles/home.css` (imported by `src/app/page.tsx`, replacing nothing yet)
- Modify: `src/i18n/translations.ts`

**Interfaces:**

- **Produces `ComingSoon()`.** It takes no props and renders `<span className="coming-soon"><T k="coming-soon">Coming soon</T></span>`.
  - Style: neutral pill with `#f0eee8` background, mute text, 11px, weight 600, `2px 9px` padding, 99px radius.
- **Produces shared home classes in `home.css`:**
  - `.home-sec` (64px top padding)
  - `.home-sec-head` (a flex row with an `h2` and a `.home-more` link)
  - `.home-more` (navy, 14px, weight 600, with a `ph-bold ph-arrow-right` icon)
  - `.home-card` (white, 1px `--color-line` border, 16px radius)
- **Produces translation key `coming-soon`:** EN "Coming soon", FIL "Malapit na".

- [ ] **Step 1:** Create the component, the classes and the key. Run `node scripts/check-i18n.mjs`. Expected: PASS.
- [ ] **Step 2:** Run `npm run check`. Expected: exit 0.
- [ ] **Step 3:** Commit with `git commit -m "feat: ComingSoon pill and home section styles"`.

### Task 5: Home hero

**Files:**

- Create: `public/assets/images/hero/san-jose-rice-fields.jpg`. Download Commons `File:FvfSanJoseCity0771 01.JPG`, resize to 1600px wide as a JPEG at quality 80, target under 350 KB.
- Create: `src/components/home/HomeHero.tsx`
- Modify: `src/styles/home.css`, `src/app/page.tsx`, `src/i18n/translations.ts`

**Interfaces:**

- **Consumes:** `ServiceSearch` (default export, no props), restyled inside `.home-hero`.
- **Produces `HomeHero()`.** It takes no props and renders `<section className="home-hero">` with these parts:
  - **Text column:**
    - `<h1>` made of three `<T>` lines: `hero-line-1`, `hero-line-2`, `hero-line-3`. The last line sits in `<span className="home-hero-accent">`.
    - One `<p>` with `hero-lede`.
    - `<ServiceSearch />`.
  - **Photo column:** `<img>` with a `clip-path` drawn by an inline SVG `<clipPath clipPathUnits="objectBoundingBox">` using the path `M0.16,0 H1 V1 H0.03 C0.14,0.78 0.02,0.42 0.16,0 Z`. Style: `object-fit: cover`, `object-position: 40% 50%`, `filter: saturate(.82)`.
  - **Overlay SVG** (`viewBox 0 0 100 100`, `preserveAspectRatio="none"`, `vector-effect: non-scaling-stroke`):
    - the gold edge line `M16,0 C2,42 14,78 3,100`
    - the navy swoosh `M52,100 C68,94 85,92 100,86 V100 Z`, with a gold 2px stroke along its top curve
  - **Background:** decorative rice-stalk SVG, `aria-hidden`, navy at opacity `.06`. Use the stalk art from the mockup.
  - **Credit pill:** `<T k="hero-photo-credit">`.
- **Translation keys:**

| key               | EN                                                                        | FIL draft                                                                                      |
| ----------------- | ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| hero-line-1       | Your city.                                                                | Ang iyong lungsod.                                                                             |
| hero-line-2       | Your services.                                                            | Ang iyong mga serbisyo.                                                                        |
| hero-line-3       | Made simpler.                                                             | Mas pinadali.                                                                                  |
| hero-lede         | City services, permits and public information for San Jose, in one place. | Mga serbisyo ng lungsod, permit at pampublikong impormasyon para sa San Jose, sa iisang lugar. |
| hero-photo-credit | Photo: Judgefloro (public domain)                                         | Larawan: Judgefloro (public domain)                                                            |

Remove the now-unused keys `hero-welcome`, `hero-subtitle`, `home-browse-services` and `home-contact-us` from both languages, once nothing references them.

- **Layout:**
  - Desktop: 46% / 54% grid, minimum height 500px, h1 64px.
  - Below 900px: one column, with the photo first at 260px tall, the clip path replaced by a 24px top-rounded rectangle, the overlay SVG hidden, and h1 at 40px.
  - The search uses a 1.5px navy outline and a gold button labeled "Search".

- [ ] **Step 1:** Add the photo asset and `HomeHero`, and replace the old hero `<section className="home-hero-v2">` in `page.tsx`.
- [ ] **Step 2:** Run `npm run check` and `node scripts/check-i18n.mjs`. Expected: both exit 0.
- [ ] **Step 3:** Run `npm run dev` at 1280×900. Expected: it matches the mockup hero.
  - The photo bleeds right with a curved edge and a gold line.
  - The headline is navy, with gold "Made simpler."
  - There's no weather badge and no extra links.
- [ ] **Step 4:** Set the viewport to 375×812. In the console, evaluate `document.documentElement.scrollWidth <= innerWidth`. Expected: `true`.
- [ ] **Step 5:** Commit with `git commit -m "feat: home hero with San Jose photo, curved frame and rice-stalk art"`.

### Task 6: Home services, scholarship band, numbers

**Files:**

- Create: `src/components/home/HomeServices.tsx`, `src/components/home/HomeScholar.tsx`, `src/components/home/HomeNumbers.tsx`
- Modify: `src/app/page.tsx`, `src/styles/home.css`, `src/styles/scholarship.css` (only rules scoped to `.home-scholar`), `src/i18n/translations.ts`

**Interfaces:**

- **Consumes:** `SERVICE_CATEGORIES`; `ScholarLookup({ heading?: boolean })`; `ComingSoon` (Task 4); `.home-sec`, `.home-sec-head`, `.home-more`, `.home-card` (Task 4).
- **Produces `HomeServices()`:**
  - Exactly these six, in this order, matched by `name`: Certificates, Business, Tax Estimator, Social Services, Health, Agriculture.
  - Each tile links to `c.href` or `/services` and shows only `ph-duotone ${c.icon}` (32px, navy) plus the name.
  - 6 columns, then 3 below 1100px, then 2 below 600px.
  - Head: `home-popular-services` with an `All services` link (`home-all-services`) to `/services`.
- **Produces `HomeScholar()`:**
  - A navy band with 24px radius.
  - Left: `home-scholar-title` plus one line, `home-scholar-lede`.
  - Right: `<ScholarLookup heading={false} />`, restyled under `.home-scholar` as a white input row with a gold Check button. Lookup results render white-on-navy, readable.
  - Plus `Program details` (`home-scholar-details`) linking to `/scholarship`.
- **Produces `HomeNumbers()`:**
  - Four `.home-card` tiles, linked as today: Population and Land area go to `/statistics`, Barangays to `/government`, Income class to `/budget`.
  - Icons: `users-three`, `map-trifold`, `chart-line-up`, `ruler`.
  - Each shows a light grey serif "—", the label, and `<ComingSoon />`.
  - Head: `home-numbers-title`, with a `Statistics` link (`home-statistics-link`).
- **Translation keys:**

| key                   | EN                                                              | FIL draft                                                                      |
| --------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| home-popular-services | Popular services                                                | Mga madalas na serbisyo                                                        |
| home-all-services     | All services                                                    | Lahat ng serbisyo                                                              |
| home-scholar-title    | Check your scholarship                                          | Tingnan ang iyong scholarship                                                  |
| home-scholar-lede     | City scholars: see your payout status and missing requirements. | Para sa city scholars: tingnan ang status ng payout at kulang na requirements. |
| home-scholar-details  | Program details                                                 | Detalye ng programa                                                            |
| home-numbers-title    | San Jose in numbers                                             | Ang San Jose sa mga numero                                                     |
| home-statistics-link  | Statistics                                                      | Estadistika                                                                    |

- [ ] **Step 1:** Build the three components and replace the matching old sections in `page.tsx`: Popular Services, Scholar lookup, and At a Glance.
- [ ] **Step 2:** Run `npm run check` and `node scripts/check-i18n.mjs`. Expected: both exit 0.
- [ ] **Step 3:** Run `npm run dev` and check at 1280px and 375px.
  - Six tiles appear in the stated order, with no description text.
  - Entering a non-existent Student ID in the band shows the lookup's existing not-found message, readable on navy.
  - Four tiles each show "Coming soon".
  - There is no horizontal scroll.
- [ ] **Step 4:** Commit with `git commit -m "feat: home services, scholarship band, numbers with coming-soon state"`.

### Task 7: Home weather, news, leadership and contact; remove old home CSS

**Files:**

- Create: `src/components/home/HomeWeather.tsx`, `src/components/home/HomeNews.tsx`, `src/components/home/HomeLeadershipContact.tsx`
- Modify: `src/app/page.tsx` (it becomes only `<HomeHero/>` through `<HomeLeadershipContact/>`), `src/components/WeatherWidget.tsx` (markup and classes only; data logic unchanged), `src/components/NewsList.tsx` (`HomeNews` markup only), `src/styles/home.css`, `src/i18n/translations.ts`
- Delete: the old home rules in `src/styles/style.css` and `src/styles/site.css`. That means the `home-hero-v2`, `home-services-grid`, `home-service-*`, `home-stats-v2*`, `home-stat-card*`, `home-leader*`, `home-contact-v2*`, `home-section-*` and `weather-map-*` selectors, about 100 rules. Delete only the ones that a grep shows are unused after this task.

**Interfaces:**

- **Consumes:** `WeatherWidget()`, `CityMap()` and `StationDetails()` (default exports, no props; their data hooks are unchanged); `HomeNews` from `NewsList.tsx`; `ComingSoon`; `SITE.lgu`.
- **Produces `HomeWeather()`:**
  - Head: `home-weather-title` "Weather right now", with no subtitle.
  - Grid of 1fr / 1.25fr: the restyled `WeatherWidget` card next to a `.home-card` holding `CityMap`, the station legend and `StationDetails` as a compact list.
  - Stacks below 900px.
  - **Live rule:** the widget shows the green `.live` dot and "Live" only when the station status is `live`. When offline, it shows a grey dot and the widget's existing offline wording. While loading, it shows no dot.
- **Produces `HomeNews` (restyled):**
  - Up to 3 `<article className="home-news-card">` in a grid of 1.4fr / 1fr / 1fr.
  - Each card: category tag, date, and a Fraunces title link. There's no image, because `NewsItem` has no image field (see the note in the hand-off).
  - Head: `home-news-title` "Latest news", with an `All news` link.
  - **Empty state** (the current data): one full-width `.home-card` with a `ph-duotone ph-newspaper` icon, "No updates yet", and the existing `EMPTY` sentence. It must not render an empty grid.
- **Produces `HomeLeadershipContact()`:** two `.home-card` panels side by side, stacking below 900px.
  - **Leadership** (`home-leadership-title`, with an `All officials` link to `/government`): rows "City Mayor" and "City Vice Mayor", each with `ph-duotone ph-user-circle` and `<ComingSoon />`.
  - **Contact** (`home-contact-title`, with a `Directory` link to `/contact`):
    - Phone row with `ph-duotone ph-phone` and `<ComingSoon />`. Drop the hours line; it's unverified.
    - Email row with `ph-duotone ph-envelope-simple` and `<ComingSoon />`.
    - Address row with `ph-duotone ph-buildings`, `SITE.lgu.seatOfGovernment`, and the value `${SITE.lgu.name}, ${SITE.lgu.province} ${SITE.lgu.postalCode}`.
- **Translation keys:**

| key                   | EN                | FIL draft                    |
| --------------------- | ----------------- | ---------------------------- |
| home-weather-title    | Weather right now | Lagay ng panahon ngayon      |
| home-news-title       | Latest news       | Pinakabagong balita          |
| home-leadership-title | City leadership   | Pamunuan ng lungsod          |
| home-contact-title    | Contact City Hall | Makipag-ugnayan sa City Hall |
| home-directory-link   | Directory         | Direktoryo                   |

The existing keys `home-view-all` and `home-view-all-officials` can be reused for "All news" and "All officials". Delete whichever keys end up unused.

- [ ] **Step 1:** Build the three components and the restyles, and finish `page.tsx`.
- [ ] **Step 2:** Delete the old home CSS selectors once `grep -rn "<selector>" src --include=*.tsx` returns nothing for each one.
- [ ] **Step 3:** Run `npm run check`. Expected: exit 0. It includes the icon and i18n checks.
- [ ] **Step 4:** Run `npm run dev` and check at 1280px and 375px.
  - With `news.json` empty, the news section shows the single empty-state card.
  - Temporarily add one item to `news.json`, confirm one card renders, then revert.
  - Block the station API request in DevTools (Network → block request URL). The weather card shows the grey offline dot, not the green Live dot.
  - No horizontal scroll at 375px.
  - In the built CSS, `grep -ri "gradient" src/styles` returns nothing that renders, such as a leftover in a deleted rule.
- [ ] **Step 5:** Switch the language to FIL. Expected: every home heading and pill changes language.
- [ ] **Step 6:** Commit with `git commit -m "feat: home weather, news, leadership and contact; drop old home styles"`.

---

## Hand-off notes for the reviewer

- **The spec says news cards have an "image"**, but `NewsItem` has no image field and no news exists yet. Cards are text-only. Adding images is a data-model change, out of scope.
- **The PR description** must list the FIL drafts for native-speaker review, and remind the owner to tell denver6000 before merging. The top strip and the header and footer restyle touch their code.
- **Manual gates for the reviewer:** the color roles are respected (gold only on actions and the one headline line, green only on Live); no filler subtitles; no repeated content on the home page; the contrast of mute text on cream is at least 4.5:1.
