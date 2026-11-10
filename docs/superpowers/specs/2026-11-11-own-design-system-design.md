# Own design system: replace the BetterSolano CSS

Date: 2026-11-11 · Branch: `discard-bettersolano-theme` (from `main` at 107874c)

## Intent

The site's shared styling still comes from BetterSolano.org. The user wants the styling to be
San Jose's own, written by us, while the site keeps exactly the look it has today on
https://sanjose.betternuevaecija.org: the same colours (navy `#0a2f86`, gold `#f2b100`, green
`#16722b`, cream `#faf6ec`/`#faf7f0`), the same fonts (Fraunces headings, Inter body), the same
layouts, the same hero, and the same logo.

The user looked at new palettes and rejected all of them. This is not a redesign.

## Goals

- Delete the four upstream stylesheets: `src/styles/style.css` (994 lines),
  `responsive.css` (428), `footer.css` (241) and `accessibility.css` (179).
- Replace them with new stylesheets written from scratch: design tokens (colour, type, spacing,
  radius, shadow) plus the shared base, layout, header, footer, buttons, cards, forms,
  accessibility helpers and responsive rules that the pages use today.
- Every page looks the same as before at phone, tablet and desktop widths.
- Remove the "design system comes from BetterSolano" wording from `README.md` (lines 7 and 130),
  the import comment in `src/app/layout.tsx:11`, and the header comment in `src/styles/site.css`.

## Non-goals

- No new colours, fonts, layouts or components. No content changes.
- No change to `icons.css`. It is generated from the `@phosphor-icons/web` package by
  `scripts/build-icons.mjs` and was never BetterSolano's.
- No rewrite of the stylesheets that are already ours: `site.css`, `theme.css`, `home.css`,
  `motion.css`, `taxes.css`, `estimator.css`, `scholarship.css`. They change only where they
  depend on a token or rule that moves.
- No CSS Modules or move to per-component CSS. This was approach 3 and was turned down.
- `LICENSE` stays unchanged. The repository was forked from BetterSolano as a whole (first commit
  e6fe432 added everything at once), so code other than these four CSS files may still be
  theirs, and the MIT notice must stay while any of it remains.

## Anti-goals

- Any visible change a visitor would notice: a shifted header, a different button size, a
  broken mobile menu, lost focus outlines, a changed dark theme.
- A "rewrite" that is the old files with renamed selectors. The new rules must be written
  fresh from what the pages need, not translated line by line (that was approach 2, turned down).
- Losing accessibility behaviour a visitor can reach today: skip link, focus styles, reduced
  motion. (The `body.high-contrast`, `body.font-large` and `body.font-xlarge` rules in
  `accessibility.css` are unreachable: no code adds those classes. They are dropped; see calls.)
- Losing print behaviour: the `@media print` block in `responsive.css` (hides header, footer,
  menu toggle, language selector, skip link and buttons; flattens cards) is rewritten, not dropped.

## Constraints

- Next.js 16.4 static export. Read `node_modules/next/dist/docs/` before touching
  framework files (see `AGENTS.md`).
- Stylesheet import order in `src/app/layout.tsx` matters today. The new files replace the four
  upstream imports; `site.css` and `theme.css` keep loading after them.
- `theme.css` holds the dark tokens in two blocks that must stay identical
  (`scripts/check-theme.mjs`). A commit on `frontend-kurt` forced the light theme; keep whatever
  theming behaviour `main` has now.
- Flat colours only, no gradients (user preference).
- `npm run check` must pass (icons, i18n, theme checks, Prettier, typecheck, tests, build).
- No new dependencies.

## Approaches considered

1. **Fresh rewrite, checked against screenshots.** Chosen. Screenshot every page on the current
   build first, write new tokens and shared styles from scratch, delete the upstream files, then
   compare new screenshots with the old ones page by page. All the CSS becomes ours, and the
   screenshots catch regressions. About a day.
2. **Rewrite in place**, rule by rule inside the old files. Faster (about half a day), but it
   keeps BetterSolano's structure and naming, so it is ours only on paper. Rejected.
3. **CSS Modules per component.** Cleanest long-term, but touches every component, takes several
   days and makes before/after comparison harder. Rejected as a bigger restructure than asked.

## Decided

- Approach 1.
- Keep the colours, fonts and look of the live site exactly.
- Branch `discard-bettersolano-theme`.
- Dark mode stays ready to switch back on (light stays forced on the live site).

## Calls made by Claude (user can overrule)

- **Class names used in TSX stay as they are** (`.container`, `.btn`, header and footer classes,
  and so on), so components don't change. The declarations behind them are written fresh. A
  class name is a label, not design work; renaming them all would touch every component for no
  visible gain.
- **Unused upstream rules are dropped, not rewritten.** A rule counts as unused if no route renders
  an element it matches (check against the built `out/` HTML and the client components that add
  classes at runtime).
- **Screenshot comparison is the acceptance test.** Routes: every page under `src/app` (home,
  services, business-taxes, business-taxes/estimator, government, statistics, legislative,
  budget, news, contact, scholarship, faq, accessibility, privacy, terms, sitemap, 403, 500,
  not-found). Widths: 375, 768 and 1280 px. Light theme on every route; dark captures as listed
  under Theming below. Capture the baseline from a build of `main` before any CSS change.
  Freeze motion for capture (reduced-motion emulation and a fixed clock) so the living hero and
  weather don't cause false diffs. Interactive states to check by hand: mobile menu open, a
  focused link, the accessibility options panel if there is one.
- **High-contrast and text-size rules are dropped.** Nothing in `src` can turn them on, so they
  are dead code. If the user later wants those options, they come back as a new feature with a
  control that turns them on.
- **Print styles are kept and checked** with a print-emulation capture of home, services and
  business-taxes at 1280 px.
- **Theming:** `main` forces light (`layout.tsx:92` sets `data-theme="light"`), but `theme.css`
  keeps the dark tokens. The user decided dark mode stays ready to switch back on: every new rule
  reads colours through theme variables (no hard-coded colours in the new files), `theme.css`
  and `scripts/check-theme.mjs` stay, and the comparison adds dark captures of home, services and
  business-taxes at 375 and 1280 px, taken on both the baseline and new builds with the forced
  `data-theme="light"` removed for the capture only.
- **Allowed differences:** sub-pixel anti-aliasing only. Anything else is either fixed or listed
  for the user with a before/after pair.
- New files go in `src/styles/` with plain names, for example `tokens.css`, `base.css`,
  `layout.css`, `header.css`, `footer.css`, `a11y.css`. Exact split is the builder's call.

## Left to the builder

- How to take and diff the screenshots. `scripts/lib/headless.mjs` already drives headless
  Edge or Chrome; a small script there, with pixel comparison done in the browser on a canvas,
  avoids new dependencies. Put captures in a gitignored folder.
- The exact token names and file split.
- Whether shared rules currently in `site.css` move into the new files. Optional.
- Order of work, as long as the baseline is captured first.

## Done means

- The four upstream files are gone and nothing imports them.
- Screenshot comparison shows no differences beyond anti-aliasing on every route and width, or
  each remaining difference is listed with images for the user to accept.
- `npm run check` passes.
- README, `layout.tsx` and `site.css` no longer say the design system comes from BetterSolano.
- Nothing is deployed; deploying is a separate step the user asks for.
