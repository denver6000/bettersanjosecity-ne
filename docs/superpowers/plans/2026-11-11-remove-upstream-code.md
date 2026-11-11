# Rewrite Inherited Files and Relicense: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or
> superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for
> tracking.

**Goal:** Rewrite the last files and string inherited from the original template from a description of
their behaviour. Reword the history records. Then replace `LICENSE` with one in the team's names.

**Architecture:**

- The look and behaviour stay the same. The screenshot harness proves it, compared against a baseline
  captured on `main` first.
- Two pure helpers get unit tests: the active-nav matcher, and the service worker's request classifier.
  The classifier is loaded from `public/sw.js` in a Node `vm` context.
- Offline behaviour is checked by hand on a production build.
- A scratch-only overlap check against the original repository gates the licence change. Nothing about
  the original project enters the repo.

**Tech Stack:** Next.js 16.4 static export, React 19, plain service worker JS, and Node's test runner
(`npm run test:lib` for `src/lib/*.test.ts`, `npm run test:scripts` for `scripts/lib/*.test.mjs`).

**Spec:** `docs/superpowers/specs/2026-11-11-remove-upstream-code-design.md`

## Global Constraints

**Rewriting**

- Write each file fresh from the spec's "Behaviour to rebuild". Do not copy lines from the current file,
  and keep class names and translation keys as they are.
- No new dependencies.

**Visual change**

- The harness must show no visible change, except:
  - the footer disclaimer line on every page;
  - weather data on the home page.

**Naming and scratch**

- No tracked file may contain the original project's name or its author's name. The clone and the overlap
  script stay in the session scratch directory:
  `C:\Users\Kurtong\AppData\Local\Temp\claude\045c1d604d083a28\4b05343c-454a-439e-985b-dde2eea48aae\scratchpad`
  (`upstream/` and `overlap.mjs`, which already exist).

**Language**

- Every new visible string has `en` and `fil` keys. The Filipino wording is flagged as not yet read by a
  native speaker.

**Branch and gate**

- Branch `own-code-relicense`, cut from `main`. No push, merge or deploy without the user's say-so.
- Gate: `npm run check`. If Prettier trips on the untracked `.impeccable/hook.cache.json`, run the same
  steps with Prettier limited to git files (as in the last plan), and note that in the ledger.

## Review Focus

1. **Visitors whose phone runs the old worker.**
   - After the deploy, the new worker installs.
   - The old `bettersanjose-*-v4` caches are deleted once the new one activates.
   - Pages are never left stale.
   - Manual gate in Task 3: install the old build, then the new one, in the same browser profile.
2. **Fast double tap on the menu button.** It must never leave the page unable to scroll. Manual gate in
   Task 1.
3. **Offline.**
   - An unvisited page shows `offline.html`, and a visited page loads from the cache.
   - Next.js navigation payloads are never cached.
   - Pinned by the classifier test for `_rsc` and the `RSC` header (Task 3), plus a manual gate.
4. **The update notice in Filipino.**
   - The text is translated.
   - Dismiss hides it.
   - Update reloads once to the new version.
   - Manual gate in Task 3.
5. **Closing the menu.**
   - It closes on route change, Esc and an outside click.
   - Esc returns focus to the menu button.
   - Manual gate in Task 1, plus the harness `menu-open` capture.

---

### Task 1: Header rewrite and active-link helper

**Files:**

- Create: `src/lib/nav.ts`
- Test: `src/lib/nav.test.ts`
- Rewrite: `src/components/layout/Header.tsx`

**Interfaces:**

- **Produces `isActivePath(pathname: string, href: string): boolean`** in `src/lib/nav.ts`.
  - `'/'` matches only `'/'`.
  - Any other href matches its exact path or anything under it. Trailing slashes are ignored on both sides.
- **Header keeps:**
  - its markup: `site-header`, `header-inner`, `logo-container`, `main-nav` (plus `active`),
    `header-actions`, `lang-selector`, `lang-btn` and `mobile-menu-toggle`;
  - the `body.mobile-menu-open` class with its `top` offset;
  - its translation keys;
  - `<SiteSearch />` inside `.header-actions`.

- [ ] **Step 1: Set up the branch and capture the baseline**

```bash
git checkout -b own-code-relicense main
npm run build && npm run shots:capture -- before-relicense
```

- [ ] **Step 2: Write the failing test `src/lib/nav.test.ts`**

  - `home only matches home`:
    - `isActivePath('/', '/')` is true.
    - `isActivePath('/services', '/')` is false.
  - `exact and nested paths match`:
    - `('/government', '/government')` is true.
    - `('/government/', '/government')` is true.
    - `('/business-taxes/estimator', '/business-taxes')` is true.
  - `prefix without a slash does not match`: `('/business-taxesx', '/business-taxes')` is false.

- [ ] **Step 3: Run it.** `node --experimental-strip-types --test src/lib/nav.test.ts` → FAIL (module not
      found).

- [ ] **Step 4: Implement `isActivePath`, then rewrite `Header.tsx`** to the spec's header behaviour, using
      `isActivePath`.
  - Keep the 320ms guard only if a fast double tap otherwise leaves the scroll lock on. Say which in the
    ledger.

- [ ] **Step 5: Run the test (PASS), then the gate.**

- [ ] **Step 6: Manual gate in the browser pane at 375px.**
  - The menu opens and closes, the page can't scroll while it's open, and the scroll position returns on
    close.
  - Esc closes it and focuses the button.
  - An outside click closes it.
  - Following a nav link closes it.
  - Widening to 1280px closes it.
  - A fast double tap leaves the page scrollable.
  - `aria-current="page"` is on the current link.

- [ ] **Step 7: Run the harness and commit.**
  - `npm run build && npm run shots:capture -- t1 && npm run shots:compare -- before-relicense t1`
  - Expected: no differences outside home-page weather.
  - Commit with the message `refactor: rewrite the site header`.

---

### Task 2: Footer rewrite and new disclaimer

**Files:**

- Rewrite: `src/components/layout/Footer.tsx`
- Modify: `src/i18n/translations.ts` (`foot-disclaimer`, both languages)

**Interfaces:**

- **The footer keeps** the same content, order, classes and keys as the spec lists.
- **`foot-disclaimer` text:**
  - EN: "Information on this site comes from official government sources."
  - FIL: "Ang impormasyon sa site na ito ay mula sa mga opisyal na pinagmulan ng pamahalaan."

- [ ] **Step 1: Rewrite `Footer.tsx` and change the two strings**

- [ ] **Step 2: Run the gate**

- [ ] **Step 3: Run the harness, then commit.**
  - `npm run shots:capture -- t2`, then `npm run shots:compare -- before-relicense t2`.
  - Expected: differences only in the footer's bottom line (open one diff image to confirm), plus
    home-page weather.
  - Commit with the message `refactor: rewrite the site footer with new disclaimer wording`.

---

### Task 3: Offline support, update notice, offline page and manifest

**Files:**

- Rewrite: `public/sw.js`
- Test: `scripts/lib/sw.test.mjs`
- Rewrite: `src/components/PWAManager.tsx`
- Rewrite: `public/offline.html`
- Rewrite: `public/manifest.webmanifest`
- Modify: `src/i18n/translations.ts`

**Interfaces:**

- **Produces, in `public/sw.js`, a top-level function**
  `classifyRequest(req: { url: string; method: string; mode: string; rsc: boolean }, origin: string)`.
  - It returns `'skip' | 'navigate' | 'static' | 'cross-origin' | 'other'`.
  - It is declared with `function` at top level, so a `vm` context can read it.
  - The `fetch` listener uses it to choose the strategy the spec describes.
- **Cache names:** `sanjose-static-<ver>` and `sanjose-runtime-<ver>`, with a new version value.
  - `activate` deletes every other cache name, including `bettersanjose-*-v4`.
- **No `skipWaiting()` in `install`.** Only the `{ type: 'SKIP_WAITING' }` message triggers it.
- **New translation keys:**
  - `sw-update-text`: EN "A new version is available." / FIL "May bagong bersyon na."
  - `sw-update-btn`: EN "Update" / FIL "I-update"
  - `sw-update-dismiss`: EN "Dismiss update notice" / FIL "Isara ang abiso ng update"

- [ ] **Step 1: Write the failing test `scripts/lib/sw.test.mjs`**

  - The test loads `public/sw.js` with `vm.runInNewContext`. The stub context provides:
    - `self` (with `addEventListener() {}`, `location: { origin: 'https://site.test' }`, `skipWaiting()`
      and `clients`);
    - `caches`, `fetch`, `URL` and `Response`.
  - Then it reads `ctx.classifyRequest`. Expected results, with origin `https://site.test`:

    | Request                                          | Result           |
    | ------------------------------------------------ | ---------------- |
    | POST to `/`                                      | `'skip'`         |
    | `chrome-extension://x/a.js`                      | `'skip'`         |
    | `https://site.test/government/?_rsc=abc`         | `'skip'`         |
    | any URL with `rsc: true`                         | `'skip'`         |
    | mode `navigate` to `https://site.test/contact/`  | `'navigate'`     |
    | `https://site.test/_next/static/chunks/a.js?v=1` | `'static'`       |
    | `https://site.test/assets/fonts/x.woff2`         | `'static'`       |
    | `https://api.open-meteo.com/v1/forecast?x=1`     | `'cross-origin'` |
    | `https://site.test/api/weather-station.php`      | `'other'`        |

- [ ] **Step 2: Run it.** `node --test scripts/lib/sw.test.mjs` → FAIL (`classifyRequest` is not a
      function).

- [ ] **Step 3: Rewrite `sw.js`** to the spec's service-worker behaviour, using `classifyRequest`.

- [ ] **Step 4: Run the test (PASS)**

- [ ] **Step 5: Rewrite the rest to the spec**
  - `PWAManager.tsx`, with the translated keys above and the existing `sw-update-*` CSS classes.
  - `offline.html`, self-contained, in the brand's colours.
  - `manifest.webmanifest`, with the same values.

- [ ] **Step 6: Run the gate**

- [ ] **Step 7: Manual production gate in the browser pane.**

  Serve `out/` with a small static server on a spare port:
  `npx --no-install serve` is not installed, so use `node -e` with `http`, or `python -m http.server -d out`.

  Test sequence:
  1. **Old worker first.** Build and serve `main`'s `out/` (with today's v4 worker) and load `/`. Then build
     this branch and serve it on the same origin, and reload.
     - The new worker installs.
     - The page updates.
     - `caches.keys()` lists only `sanjose-*` names.
  2. **Going offline.** Visit `/contact/`, then block the network (DevTools offline emulation through
     `javascript_tool` is not available, so stop the server instead).
     - Reloading `/contact/` loads it from the cache.
     - Opening `/terms/` shows `offline.html`.
  3. **Update notice.** Restart the server with a rebuild that changes one file, and trigger
     `reg.update()`.
     - The notice shows and the worker waits (`reg.waiting` is set).
     - Update reloads the page once, and `reg.waiting` is then null.
     - In FIL, the notice text is Filipino.
     - Dismiss hides it.

  Record the results in the ledger.

- [ ] **Step 8: Run the harness, then commit.**
  - Expected: the same differences as Task 2.
  - Commit with the message `refactor: rewrite offline support, update notice, offline page and manifest`.

---

### Task 4: robots.txt, README licence line, history records

**Files:**

- Rewrite: `public/robots.txt`
- Modify: `README.md:231`
- Modify: `DEPLOYMENTS.md`
- Modify: every file under `docs/superpowers/` that `git grep -il` finds for the original name or author.

**Interfaces:** none.

- [ ] **Step 1: Rewrite `robots.txt`**
  - `User-agent: *`, then `Allow: /`, then
    `Sitemap: https://sanjose.betternuevaecija.org/sitemap.xml`.
  - One comment line naming the site, and no author.

- [ ] **Step 2: Change the README licence line**
  - It becomes "MIT (code) and CC BY 4.0 (content). See `LICENSE`."

- [ ] **Step 3: Reword the history records** following the spec's "History records" section.
  - Use neutral wording ("the original template", "the inherited CSS", "the earlier stylesheet branch").
  - Facts, dates and commits stay.
  - Words that only appear inside a branch name become "the earlier stylesheet branch".

- [ ] **Step 4: Check that nothing is left.**
  - Run a case-insensitive `git grep` for the original template's name and its author's name, excluding `LICENSE` (the pattern is kept in scratch, not here).
  - Expected: no output. `LICENSE` is handled in Task 5.

- [ ] **Step 5: Run the gate, then commit** with the message
      `docs: reword history records and robots without the template's name`

---

### Task 5: Overlap check and new licence

**Files:**

- Rewrite: `LICENSE`

- [ ] **Step 1: Run the overlap check.**
  - Command:
    `node <scratch>/overlap.mjs <scratch>/upstream > <scratch>/overlap-final.txt`
  - Then print the matching lines for the seven rewritten files with `<scratch>/show.mjs` (same arguments
    plus the file paths).
  - Every remaining line must fall in the spec's allowed list: a URL or path, a number, a JSON field and
    value, a web-platform name, or an existing class name or translation key.
  - Any other line means going back to that file's task to rewrite it.
  - Record the final match list, with a reason per line, in the ledger.

- [ ] **Step 2: Write the new `LICENSE`.**
  - Section 1: the MIT licence text, "Copyright (c) 2026 Kurt Vincent F. Fariñas and Denver M. Ballesteros".
  - Section 2: the CC BY 4.0 notice for non-code content, with the same copyright line.

- [ ] **Step 3: Check that nothing is left.**
  - Run the same case-insensitive `git grep` for the template's name and author across all files.
  - Expected: no output.

- [ ] **Step 4: Run the gate, then commit** with the message
      `chore: relicense under the team's names (MIT code, CC BY 4.0 content)`

---

### Final check

- Run the full harness against `before-relicense`.
  - Expected: footer bottom line and home-page weather only.
- The whole-branch reviewer gets these inputs:
  - the spec;
  - the diff;
  - the overlap match list from the ledger, to confirm before merge;
  - the Review Focus above.
- The report names:
  - the offline manual results;
  - that the Filipino wording is unreviewed;
  - that nothing is pushed or deployed.
