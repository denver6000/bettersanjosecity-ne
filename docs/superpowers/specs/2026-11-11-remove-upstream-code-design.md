# Rewrite the remaining inherited files and relicense: design

Date: 2026-11-11. Status: draft for approval.

## Intent

The site began as a port of an earlier civic site whose code is MIT-licensed and whose content is CC BY 4.0.
Both licences let us reuse that work only while the original copyright notice stays with it. The user wants
the site to be entirely their team's own, with no mention of the original project anywhere in the shipped
site or the current files. The notice can only be removed honestly once none of the original code or text
is left. So this step rewrites what remains, then replaces the licence with one in the team's own names.

## What is still inherited

Found by comparing every tracked file with the original project's public repository, counting only
distinctive lines (not bare CSS declarations or generic React lines):

| File                               | What it does                                           | Inherited |
| ---------------------------------- | ------------------------------------------------------ | --------- |
| `public/sw.js`                     | Offline support and caching (service worker)           | 84%       |
| `public/robots.txt`                | Search-engine rules; also names the original author    | 87%       |
| `src/components/layout/Header.tsx` | Header markup and phone-menu behaviour                 | 68%       |
| `src/components/PWAManager.tsx`    | Registers the service worker, "new version" banner     | 57%       |
| `public/manifest.webmanifest`      | App name, icons and shortcuts for "add to home screen" | 41%       |
| `src/components/layout/Footer.tsx` | Site footer                                            | 37%       |
| `public/offline.html`              | Page shown when offline and the page isn't cached      | about 30% |
| `src/i18n/translations.ts`         | The footer disclaimer sentence (EN and FIL) only       | 1 string  |
| `LICENSE`                          | Byte-identical copy, names the original author         | 100%      |
| `README.md:231`                    | "…, as in upstream."                                   | 1 line    |

Everything else is already the team's own: stylesheets (rewritten earlier), taxes and estimator, revenue
data, weather station, scholarship, hero, search, city data and pages.

**Not inherited, and kept:**

- The BetterGov.ph footer logo (`bettergov-footer.svg`) belongs to BetterGov.ph, the wider movement.
- `.prettierrc` holds only formatter settings, which nobody owns.
- Shared class names such as `.home-search-box`: names are not creative work, and renaming them would
  churn every stylesheet for nothing.

## Goals

- Rewrite the seven files and the one string above from a written description of what each does, as new
  code and text.
- **No visible change.** The screenshot harness (`npm run shots:*`, 78 captures) matches the current `main`.
  The only allowed differences are live weather data and anything named under "Intended changes".
- Offline support keeps working (the user chose to keep it):
  - visited pages and the shell load without internet;
  - a "new version" notice appears after a deploy;
  - visitors whose phones already cached the old service worker get the new one and lose the old caches.
- `LICENSE` names the team: MIT for code, CC BY 4.0 for content, "Copyright (c) 2026 Kurt Vincent F.
  Fariñas and Denver M. Ballesteros". The names are from the footer credits.
- After the change, no tracked file mentions the original project or its author, history records
  included.
- A final overlap check against the original public repository finds no distinctive inherited lines in the
  rewritten files.

## Non-goals

- Changing how the header, footer or offline support behave or look, except as listed under "Intended
  changes".
- Renaming CSS classes, or touching any file not listed above.
- Rewriting git history. Past commits keep what they had; the shipped site and the current files are what
  count.
- Adding a library for offline support (the user picked a hand-written rewrite).

## Anti-goals

- **Removing the notice while inherited code remains.** The overlap check gates the licence change.
- **Breaking offline support for existing visitors.** For example, the old service worker must not stay in
  control serving stale pages.
- **Any new dependency.**
- **Putting the original project's name, URL or code into the repo** as part of checking for it. The
  comparison script and the clone of their repo live in scratch space only.

## Approaches considered

- **Rewrite from a description of behaviour (chosen by the user).** Fresh code to the behaviour below,
  proved by the screenshot harness and the overlap check. No new dependencies.
- **A ready-made offline library (Serwist) plus rewrites.** Less hand-written code, but it adds a dependency
  and a build step and changes caching behaviour. Not chosen.

## Behaviour to rebuild

### Service worker (`public/sw.js`)

- **Cache names** carry a version. Bump it to a new value, so `activate` deletes every cache that isn't
  current, including the old `bettersanjose-static-v4` and `bettersanjose-runtime-v4`.
- **Install** precaches `/`, `/offline.html`, the logo emblem, the 192 and 512 icons, `favicon.ico` and
  `/manifest.webmanifest`.
  - **First install** (nothing controls the page yet): it activates immediately.
  - **A newer worker** (an older one is in control): it waits until the visitor presses Update, or until
    every tab of the site is closed. (My call; see "Intended changes".)
- **Activate** removes old caches and takes control of open pages.
- **Messages.** A `{ type: 'SKIP_WAITING' }` message makes a waiting worker activate.
- **Fetch handling** applies to GET requests over http(s) only.
  - Next.js navigation payloads (`_rsc` query parameter, or `RSC: 1` header) always go to the network,
    never the cache.
  - Page navigations go network first. A successful response is stored. Offline, use the stored page, or
    else `/offline.html`.
  - Static files (css, js, svg, ico, png, jpg, jpeg, webp, woff, woff2, ttf, json) are served from the
    cache if present, while a fresh copy is fetched and stored in the background.
  - Cross-origin requests (weather APIs and similar) go network first, falling back to the stored copy.
    The stored copies are capped at 80 entries, oldest dropped first.
  - The site's own live data under `/api/` (weather station, scholarship figures) is handled the same
    network-first way. (Added after the final review: under the "anything else" rule, a reading could be
    served from a copy up to 7 days old.)
  - Anything else is cache first if the stored copy is under 7 days old, otherwise network, with a
    fallback to the stored copy.
- **Dropped:** the empty background-sync handler and the unused push-notification handlers. Nothing sends
  them.

### Registration and update notice (`PWAManager.tsx`)

- Register `/sw.js` in production builds only, never under `next dev`.
- Check for an update every 30 minutes.
- When a new worker has installed while an old one controls the page, show the update notice.
  - It says "A new version is available." with an Update button, which sends `SKIP_WAITING`, and a dismiss
    (×) button.
  - The page reloads once when the new worker takes control, but only if a worker controlled the page
    before. A first visit never reloads.
- The browser's own install mini-bar stays suppressed (`beforeinstallprompt` is prevented).

### Header (`Header.tsx`)

The markup and class names stay the same, so the existing CSS keeps working. The behaviour:

- **The menu button** toggles the nav panel below 1200px. Its label switches between "Open menu" and "Close
  menu" (existing keys), and it sets `aria-expanded`.
- **While open:**
  - The page behind doesn't scroll, and returns to the same scroll position on close (the existing
    `mobile-menu-open` body class plus `top` offset).
  - It closes on a click outside the nav and button, on Esc (focus returns to the button), on navigating
    to another page, and when the window widens past 1199px.
  - Navigating to another page opens it at the top, not at the old page's scroll position. (A bug found
    in the final review; the old code had it too.)
- The active nav link gets `aria-current="page"`, matched on the exact path, or the path prefix for
  non-home links.
- The language pills and the search button work as today.

### Footer (`Footer.tsx`)

Same content and order, written fresh:

- brand lockup and tagline;
- Quick links;
- Resources;
- the "Cost to the People of San Jose = ₱0" note;
- the BetterGov.ph logo link;
- the bottom line: copyright, licence, credits, disclaimer and version.

### Other files

- **`public/offline.html`:** a self-contained page (inline styles in the brand tokens' values, since it
  can't load the site CSS). It shows the logo, "You're offline", a short line in English and Filipino, and
  a "Try again" button that reloads. It looks the same as today, give or take the wording.
- **`public/manifest.webmanifest`:** the same fields, values, icons and four shortcuts, written fresh.
- **`public/robots.txt`:** allow everything, point to `https://sanjose.betternuevaecija.org/sitemap.xml`,
  with no author line. The per-bot blocks and `Crawl-delay` are dropped: they repeat the `*` rule.

## Intended changes (allowed in the screenshot diff)

- **The footer disclaimer** gets new wording. EN: "Information on this site comes from official government
  sources." FIL: "Ang impormasyon sa site na ito ay mula sa mga opisyal na pinagmulan ng pamahalaan."
  (Builder's wording, flagged for a native speaker.)
- **The update notice** becomes translated: new keys `sw-update-text`, `sw-update-btn` and
  `sw-update-dismiss`. It is not visible in screenshots.
- **The update notice actually waits for the visitor** (my call).
  - Today the worker activates as soon as it installs, so after a deploy the page reloads by itself, even
    mid-read, and the notice only flashes.
  - Now a newer worker waits for the Update click, or for all tabs to close.
  - The same holds for the first update after this change. The old page code's Update button also sends
    `SKIP_WAITING`, so visitors on the old worker see its notice and update with one tap. (Corrected
    after testing: the draft said the first update would take over straight away.)
- **The README licence line** reads "MIT (code) and CC BY 4.0 (content). See `LICENSE`."

## Verification

- `npm run check` is green.
- The screenshot harness compares a baseline captured on `main` before the work with the result. Expected
  differences: the footer disclaimer line on every page, plus home-page weather data.
- **Offline, checked by hand in the browser on a production build** (`npm run build`, then serve `out/`):
  - The worker registers.
  - With the network blocked, a visited page reloads from the cache, and an unvisited page shows
    `offline.html`.
  - Rebuilding with a changed file shows the update notice. Update reloads to the new version.
  - Old `-v4` caches are gone after activation.
- **The overlap check** (a scratch script with the original repository cloned in scratch) gates the licence
  change (my call on what passes).
  - Every line it still reports for the rewritten files must be forced by the behaviour above. Allowed:
    - a URL or path;
    - a number;
    - a manifest or JSON field with its fixed value;
    - a web-platform name (`skipWaiting`, `SKIP_WAITING`, `beforeinstallprompt` and the like);
    - an existing class name or translation key.
  - Any other reported line fails the check and gets rewritten.
  - The report lists every remaining match with its reason. The final reviewer confirms the list.
- **Deploying is a separate step** (my call). The plan ends with the work committed on a branch. It goes
  live only when the user says so, using the usual push, `DEPLOYMENTS.md` entry and live checks, including
  a phone that had the old site cached.
- `git grep -i` for the original project's name and author finds nothing in any tracked file.

## Left to the builder

- Code structure inside each file, names of helpers, and the exact new cache version string.
- Whether the header's 320ms double-tap guard is needed. Keep it only if removing it lets a fast double tap
  leave the scroll lock on.
- Test layout: pure helpers (for example, the active-link matcher, or the service worker's request
  classifier if split into a module) get unit tests in the existing `src/lib/*.test.ts` or
  `scripts/lib/*.test.mjs` style.

## History records (user decided: reword them)

- **What gets reworded.**
  - In `DEPLOYMENTS.md` and every file under `docs/superpowers/`, each mention of the original project or
    its author becomes neutral wording: "the original template", "the inherited CSS", "the inherited
    footer note" and the like.
  - The meaning of each record stays the same.
  - Deploy entries keep their commits, dates and facts.
- **The old branch name.** It contains the original project's name, and the records mention it. In the
  text it becomes "the earlier stylesheet branch".
  - The local branch itself is fully contained in `main`. Delete it only on the user's say-so.
- **Git history** keeps the old text. Rewriting history is out of scope.
