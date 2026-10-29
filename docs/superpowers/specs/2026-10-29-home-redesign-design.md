# Home page redesign and site re-skin

Date: 2026-10-29 · Owner: kosaki20 (frontend, branch `frontend-kurt`) · Status: draft for approval

## Intent

Make https://sanjose.betternuevaecija.org/ look premium and professional, and the home page interesting to scroll, without losing any real information it shows today. The site is new. Nobody yet knows what visitors come for most, so the home page serves search first and keeps every existing section.

The approved visual reference is the mockup `page-v2.html` (kept in `.superpowers/brainstorm/7848-1793244778/content/`, served by the brainstorm server). This document is the source of truth wherever the two differ.

## Goals

- Re-skin the whole site in the logo's own colors, with serif headings.
- Rebuild the home page to match mockup v2.
- Replace every Bootstrap Icon on the site with Phosphor icons.
- Show missing data (stats, leadership, contacts) as a designed "Coming soon" state, not as empty slots.

## Non-goals

- No new data, features or pages. Live data stays wired exactly as today: weather, the scholar lookup, the news feed and the map.
- No change to routing, the i18n system or deploy.
- No layout rebuild of the other pages. They pick up the new colors, fonts and icons only.

## Anti-goals (a failure even if it works)

- **No gradients anywhere**, including hero fades and gradient overlays on photos.
- **No clashing colors.** Each color keeps the one role defined below.
- **No filler text.** No eyebrow kickers, no explanatory subtitles under section headings.
- **No repeated content.** Each item appears once on the home page.
- **No invented numbers.** Unverified figures stay "Coming soon".
- **The disclaimer must not be lost.** "Not the official government website" stays visible on every page.

## Constraints

- Next.js 16.4.3 and React 19, using static export (`out/`, previewed with PHP). Read `node_modules/next/dist/docs/` before touching fonts or the layout (AGENTS.md).
- Plain CSS: `src/styles/*.css` (about 14k lines), with tokens on `:root` in `src/styles/style.css`. No Tailwind.
- Gate: `npm run check` (format check, typecheck, build). There is no test suite.
- The header and footer (`src/components/layout/`) belong to the co-maintainer, denver6000. Tell them before merging.
- Deploys go through git only, and each one is logged in `DEPLOYMENTS.md` (global rule).

## Design decisions

### Color roles (sampled from `public/assets/images/logo/`)

| Token | Hex | Role, and its only role |
|---|---|---|
| navy | `#0a2f86` (dark `#071f5c`, tint `#eef2fa`) | Structure: headings, header text, the top strip, the footer, the one dark band (scholarship), icons |
| gold | `#f2b100` | Action: primary buttons (Search, Check) and the single headline accent "Made simpler." |
| green | `#16722b` | Status: the "Live" indicator only |
| cream | `#faf7f0` | Page background; cards are white with a `#e7e3d8` border |
| ink / mute | `#141b2d` / `#636b7d` | Body text / secondary text |

The existing `--color-*` tokens are remapped to these values. Old orange accent uses become gold only where they mark an action; otherwise they become navy.

### Type

- Headings: Fraunces 700. Body: Inter, which the site already uses.

### Icons

- Phosphor, site-wide. Regular weight for UI chrome; duotone for feature icons (service tiles, stats, weather, lists). Duotone is a flat second layer, not a gradient.
- Every `bi-*` usage is mapped to the closest Phosphor glyph. That includes the icon strings stored in data (`src/config/site.ts` and `SERVICE_CATEGORIES`).
- Bootstrap Icons is removed once nothing uses it.

### Home page, top to bottom

1. **Top strip (navy), site-wide:**
   - Shows location, Emergency 911, and the short disclaimer "Independent civic site · not the official LGU website". This puts the disclaimer on every page, once.
   - Replaces both `HotlineBar` and `InfoBar` in the shared layout. The exchange rate, the clock and the bar temperature are dropped on purpose (your decision, 2026-10-29).
   - The 911 hotline stays, read from `SITE.hotlines`. Phone-width behavior is left to the builder.
   - You will tell denver6000 before merging.
2. **Header:** logo emblem with the "BetterLGU / San Jose City" wordmark, nav, and EN/FIL toggle. Active link gets a navy underline.
3. **Hero:**
   - Left: "Your city. / Your services. / Made simpler." (the last line in gold), one short line of text, and the service search (navy outline, gold button).
   - Right: photo `FvfSanJoseCity0771 01.JPG` (Wikimedia Commons, public domain, Judgefloro) at `saturate(.82)`. It bleeds off the right edge, with a curved hard left edge traced by a thin gold line, a small navy swoosh with a gold edge at bottom-right, and a credit pill.
   - Behind the text: faint navy rice-stalk line art at about 6% opacity.
   - Nothing else in the hero: no weather badge, no extra links, no floating card.
4. **Popular services:** 6 tiles (icon and name only), with an "All services →" link.
5. **Scholarship band (navy):** "Check your scholarship", one line of text, and the existing `ScholarLookup` restyled (Student ID input, gold Check button).
6. **San Jose in numbers:** 4 tiles (Population, Barangays, Income class, Land area). Each shows "—" and a neutral grey "Coming soon" badge until there is data.
7. **Weather right now:** the live weather card (green "Live" dot, temperature, 3 readings) next to the existing `CityMap`.
8. **Latest news:** the existing news feed as 3 cards (one large, two small), each with image, date and title.
9. **Leadership and contact:** side by side. Mayor and Vice Mayor rows; phone, email and City Hall rows. Missing values get the "Coming soon" badge.
10. **Footer (navy):** logo, tagline, and legal links.

### "Coming soon" state

- Value shown as "—" in a light grey serif, plus a small neutral pill reading "Coming soon".
- The tile keeps its normal card style and still links to its page.

### Photo hosting

- The hero image is downloaded once, resized for the web, and committed under `public/assets/images/`. The site does not hotlink Wikimedia.

### Settled during the builder check

These are my calls; check them when you read the doc.

- **Station details stay.** `StationDetails` (station name, status and so on) remains under the map in section 7, restyled as a compact list. Dropping it would lose real information.
- **The 6 service tiles:** Certificates, Business, Tax Estimator, Social Services, Health and Agriculture, in that order. A tile with no `href` in `SERVICE_CATEGORIES` links to `/services`, as it does today.
- **Contact rows:**
  - Address is real: `SITE.lgu.seatOfGovernment`, with name, province and postal code from `SITE.lgu`.
  - Phone and email get "Coming soon".
  - The "Mon–Fri 8:00 AM – 5:00 PM" hours line stays only if it can be verified; otherwise it is dropped.
- **Translations:** every new or changed string uses the existing `<T k=…>` pattern, with an EN and a FIL entry in `src/i18n/translations.ts`. FIL drafts are flagged for a native speaker to review.

## Approaches considered

- **A. Phosphor everywhere (chosen):** colors and fonts site-wide, home rebuilt, every icon swapped. One consistent look; touches about 33 files.
- **B. Phosphor on the home page only:** smaller, but the site would carry two icon styles.
- **C. Keep Bootstrap Icons:** smallest, but the home page wouldn't match the approved mockup.

You chose A for a consistent, premium look across the site.

## Left to the builder

- **Phosphor package:** the React components or the web-font classes. Font classes keep the icon strings stored in data working with a rename only. Self-host it either way, not from a CDN.
- **Fraunces:** how to load it (`next/font` or the existing `<link>` approach), following the Next 16 docs.
- **Code structure:** splitting the home page into components and CSS files, following existing patterns (`src/components/`, `src/styles/`).
- **Responsive layout:** at phone width, the hero stacks with the photo above or below the text and the curve becomes a gentle top edge. Grids collapse to 2 columns, then 1. No horizontal scroll at 375px.
- **Motion:** hover lifts on cards are fine. Anything more is optional and must respect `prefers-reduced-motion`.
- **Accessibility:** keep text contrast at AA on cream and navy. Gold text on cream is used only at headline size, and in the darker shade `#b88200` (3.15:1). Bright `#f2b100` is 1.8:1 on cream and would fail.
