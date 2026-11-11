# Content Pages, Real City Data and Site-wide Search: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or
> superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for
> tracking.

**Goal:** Show the real officials, offices and hotlines from sjc.gov.ph. Give every inner page a calmer
shared layout. Make one search cover the whole site in English and Filipino. Move the phone menu button to
the right.

**Architecture:**

- **Data.**
  - The city data lives in JSON files and in `SITE`.
  - Each source records `source` and `checked`.
  - Pages, the home panels and the search index all read from those same places.
- **Search.**
  - A pure, unit-tested matcher (`src/lib/search.ts`) runs over an index that is assembled in the bundle
    (`src/lib/search-index.ts`).
  - Both the header search dialog and the hero box use it.
- **Layout.**
  - `PageShell` loses the navy band and gains an optional "On this page" list.
  - `DataPending` card grids become one `PendingNote`.

**Tech Stack:** Next.js 16.4 static export, React 19, plain CSS with tokens, and Node's built-in test
runner (`npm run test:lib` runs `src/lib/*.test.ts` with `--experimental-strip-types`).

**Spec:** `docs/superpowers/specs/2026-11-11-content-pages-and-search-design.md`

## Global Constraints

**Platform**

- Static export only: no server code and no API routes.
- Read the relevant guide in `node_modules/next/dist/docs/` before writing Next code (AGENTS.md).
- No new dependencies.

**Language**

- Every new visible string has an `en` and a `fil` key in `src/i18n/translations.ts`. `check-i18n`
  enforces this.
- Names of people and offices are never translated. Titles and labels are.
- Filipino wording is the builder's best wording. The final report says it has not been read by a native
  speaker.

**Styling**

- Use colours only via the tokens in `src/styles/tokens.css` or `theme.css`. `check-css-colors` enforces
  this.
- No gradients and no new colours: navy, gold and green on cream, Fraunces and Inter.
- Dark mode stays ready: new component colours go through tokens that `theme.css` overrides.
- New Phosphor icons need `npm run icons` to regenerate the subset (`check-icons` fails otherwise).

**Accessibility and data**

- Touch targets are at least 44px, with visible focus.
- Results are announced politely, as `ServiceSearch` does today.
- No invented data. Every page that shows city data shows "Source: sjc.gov.ph · checked 11 Nov 2026",
  localised.
- The City Hall address is "Cardenas St., San Jose City, 3121 Nueva Ecija", with no street number.
- The "Independent civic site" line stays.

**Branch and gate**

- Branch `content-pages-and-search`, cut from the earlier stylesheet branch.
- No merge, push or deploy without the user's say-so.
- Gate for every task: `npm run check` is green before the task's commit, unless a step names a narrower
  command.

## Review Focus

1. **Hotlines with two numbers** (PNP, BFP). Each number must be its own tap-to-call link, never one `tel:`
   holding both. Pinned by `toTel` tests (Task 1) and by rendering each number separately (Tasks 4 and 5).
2. **Queries of whitespace, one character or symbols only** should return no results and not crash. Pinned
   by the "short or blank query" test in Task 2.
3. **The search dialog.**
   - Esc, the close button and a backdrop click all close it.
   - Focus returns to the search button.
   - The page behind doesn't scroll.
   - This is a manual gate in Task 5.
4. **Filipino active.**
   - Page and title results show their Filipino text, and office names stay English.
   - A Filipino keyword such as "bumbero" finds the BFP hotline.
   - Pinned by the "Filipino-only term" test (Task 2), plus a manual gate in Task 5.
5. **Dark mode and the 1200–1439px header.**
   - New blocks stay readable with `data-theme="dark"`.
   - The added search button doesn't wrap the desktop nav.
   - Manual gates in Tasks 3 and 5.

---

### Task 1: City data and phone links

**Files:**

- Modify: `src/data/officials.json` (replace the pending stub)
- Create: `src/data/offices.json`
- Modify: `src/config/site.ts`
  - `hotlines` change shape.
  - Add `cityHall`.
  - Remove the "TODO(data)" line for contact details only.
- Create: `src/lib/phone.ts`
- Create: `src/lib/city-data.test.ts`
- Modify: `src/components/layout/TopStrip.tsx` (show only the `emergency` hotline)
- Modify: `src/i18n/translations.ts` (hotline labels, official titles, office-hours text, source line)

**Interfaces:**

- **Produces `officials.json`:**
  `{ "source": "https://www.sjc.gov.ph/public/about", "checked": "2026-11-11", "mayor": string, "viceMayor": string, "councilors": string[] }`
  - Names exactly as in the spec, in the source's order, including the "Hon." prefixes.
- **Produces `offices.json`:**
  `{ "source": "https://www.sjc.gov.ph/public/departments", "checked": "2026-11-11", "offices": { "name": string, "keywords"?: string[] }[] }`
  - 43 entries, names exactly as in the spec, in alphabetical order. Keep "Office Senior Citizens Affairs
    Office" and the lower-case "office" in the last name as published.
  - `keywords` hold English and Filipino everyday words. At minimum:
    - City Health Office: health, kalusugan, clinic, klinika
    - City Local Civil Registry Office: birth certificate, marriage certificate, death certificate,
      sertipiko ng kapanganakan, PSA
    - Business Permit and License Office: business permit, permiso, negosyo, mayor's permit
    - City Treasurer's Office: tax, buwis, bayad, cedula
    - City Disaster Risk Reduction and Management Office: rescue, sakuna, baha, flood
    - Social Welfare and Development Office: ayuda, social welfare, DSWD
    - Public Employment Service Office: trabaho, job, PESO
    - Ospital ng Lungsod ng San Jose: hospital, ospital
- **Produces `SITE.cityHall`:**
  `{ street: 'Cardenas St.', email: 'piosanjosecity@gmail.com', source: 'https://www.sjc.gov.ph', checked: '2026-11-11' }`
  - The hours text comes from the translation key `city-hall-hours`. EN: "Monday to Friday, 8:00 AM to 5:00
    PM". FIL: "Lunes hanggang Biyernes, 8:00 AM hanggang 5:00 PM".
- **Produces `SITE.hotlines`:**
  `{ id: string; label: string; numbers: string[]; emergency: boolean; keywords: string[] }[]`
  - Ordered emergency first. `label` is the English fallback, and the translation key is
    `hotline-<id>`. The ids, numbers and emergency flags:

    | id          | numbers                              | emergency |
    | ----------- | ------------------------------------ | --------- |
    | `rescue`    | `['0915-168-9878']`                  | true      |
    | `emergency` | `['911']`                            | true      |
    | `pnp`       | `['(044) 604-7954','0998-598-5421']` | true      |
    | `bfp`       | `['(044) 940-5258','0925-453-0777']` | true      |
    | `hospital`  | `['(044) 456-6671']`                 | false     |
    | `ocm`       | `['(044) 940-1404']`                 | false     |
    | `pio`       | `['(044) 331-0667']`                 | false     |
    | `sajelco`   | `['(044) 940-5818']`                 | false     |

  - The English labels are exactly as in the spec ("MDRRMO Rescue Hotline", "National Emergency",
    "PNP San Jose", "Fire Station (BFP)", "Ospital ng Lungsod", "Office of the City Mayor (OCM)",
    "Public Information Office (PIO)", "SAJELCO").
  - Keywords include "police, pulis" for `pnp`, "fire, sunog, bumbero" for `bfp`, and "rescue, sagip,
    emergency" for `rescue`.
- **Produces `toTel(display: string): string`** in `src/lib/phone.ts`.
  - Keep only the digits.
  - A leading `0` becomes `+63`.
  - Three-digit service numbers stay as they are.
- **Produces translation keys:**
  - `official-mayor` (City Mayor / Punong Lungsod)
  - `official-vice-mayor` (City Vice Mayor / Pangalawang Punong Lungsod)
  - `official-councilor` (City Councilor / Konsehal ng Lungsod)
  - `source-line` (EN "Source: {src} · checked {date}" / FIL "Pinagmulan: {src} · sinuri noong {date}")

- [ ] **Step 1: Create the branch and commit the spec and plan**

```bash
git checkout -b content-pages-and-search <earlier stylesheet branch>
git add docs/superpowers/specs/2026-11-11-content-pages-and-search-design.md docs/superpowers/plans/2026-11-11-content-pages-and-search.md
git commit -m "docs: spec and plan for content pages, city data and site search"
```

- [ ] **Step 2: Write the failing tests in `src/lib/city-data.test.ts`**

These read the JSON with `readFileSync`, and import `../lib/phone.ts` and `../config/site.ts` (no `@/`
aliases):

- `toTel`:
  - `'(044) 940-1404'` gives `'+63449401404'`.
  - `'0915-168-9878'` gives `'+639151689878'`.
  - `'911'` gives `'911'`.
- officials:
  - `mayor === 'Hon. Josel F. Violago'`.
  - `viceMayor === 'Hon. Evangel Shalom S. Manugue'`.
  - `councilors.length === 10`, and `councilors[0] === 'Hon. Glenda F. Macadangdang'`.
  - `checked === '2026-11-11'`.
- offices:
  - `offices.length === 43`.
  - The names are unique and sorted case-insensitively.
  - The list includes `'City Health Office'`, and that entry's keywords include `'kalusugan'`.
- hotlines:
  - The ids are exactly the 8 above, in order.
  - Every emergency entry comes before every non-emergency one.
  - `pnp.numbers.length === 2`.
  - Every number's `toTel` matches `/^(\+63\d{9,10}|\d{3})$/`.

- [ ] **Step 3: Run it to watch it fail**

Run: `node --experimental-strip-types --test src/lib/city-data.test.ts`

Expected: FAIL. Either `phone.ts` is not found or the officials stub has `mayor: null`.

- [ ] **Step 4: Fill in the data, `toTel`, `SITE.cityHall` and `SITE.hotlines`, and the translation keys**

Filter `TopStrip` to the `emergency` entry, rendered as today (label then number, with `href={`tel:${toTel(n)}`}`).

- [ ] **Step 5: Run the test, then the full gate**

Run: `node --experimental-strip-types --test src/lib/city-data.test.ts`, then `npm run check`.

Expected: PASS, then the check is green.

- [ ] **Step 6: Commit** with the message `feat: real city officials, offices and hotlines from sjc.gov.ph`

---

### Task 2: Search matcher

**Files:**

- Create: `src/lib/search.ts`
- Test: `src/lib/search.test.ts`

**Interfaces:**

- **Produces `type EntryType = 'page' | 'official' | 'office' | 'hotline' | 'service'`.**
- **Produces `interface SearchEntry`:**
  `{ type: EntryType; en: string; fil: string; extra: string; href: string; tel?: string[] }`
  - `en` and `fil` are the titles.
  - `extra` holds the body text and keywords in both languages.
- **Produces `normalize(s: string): string`:** lower case, with diacritics removed (NFD form, combining
  marks stripped).
- **Produces `search(entries: SearchEntry[], query: string): SearchEntry[]`.**
  - The query is split into words after `normalize`. Fewer than 2 non-space characters returns `[]`.
  - An entry matches when every word appears in `en`, `fil` or `extra`.
  - Entries whose title (`en` or `fil`) contains every word rank first. Ties keep their input order.
- **Produces `groupByType(results: SearchEntry[], perType = 5): [EntryType, SearchEntry[]][]`.**
  - Group order: page, official, office, hotline, service.
  - Empty groups are dropped.

- [ ] **Step 1: Write the failing tests**

Use a small fixture with these entries:

- City Health Office (`extra` "health kalusugan")
- Fire Station (`extra` "sunog bumbero")
- the page "Muñoz trip"
- a page whose `extra` alone mentions "health"

Tests:

- `accent-insensitive`: `search(f,'munoz')` returns the "Muñoz trip" entry.
- `all words must match`:
  - `'city health'` returns City Health Office.
  - `'city xyz'` returns `[]`.
- `Filipino-only term`: `'bumbero'` returns Fire Station.
- `title matches rank first`: in the results for `'health'`, City Health Office comes before the page whose
  `extra` alone matched.
- `short or blank query`: `''`, `'   '`, `'a'` and `'!'` each return `[]`.
- `groupByType`:
  - Six office results are capped at 5.
  - Group order follows the type order.

- [ ] **Step 2: Run it to watch it fail**

Run: `node --experimental-strip-types --test src/lib/search.test.ts`

Expected: FAIL, `search.ts` not found.

- [ ] **Step 3: Implement `normalize`, `search` and `groupByType`**

- [ ] **Step 4: Run the test**

Expected: PASS. Then run `npm run test:lib` and expect it green.

- [ ] **Step 5: Commit** with the message `feat: accent-insensitive bilingual search matcher`

---

### Task 3: Calmer inner-page layout

**Files:**

- Modify: `src/components/PageShell.tsx`
  - Drop the badge and band.
  - Add the `sections` prop.
  - Replace `DataPending` with `PendingNote`.
- Modify: every page that imports `DataPending` (accessibility, budget, contact, faq, government,
  legislative, privacy, services, statistics, terms).
- Modify: every page that passes `badgeIcon` (the 15 `PageShell` callers).
- Modify: `src/app/scholarship/page.tsx`. Its own header exists only to avoid the navy band (see its
  comment at line 18). Move it onto `PageShell` if it can keep its content as is. Otherwise restyle its
  header to match.
- Modify: `src/styles/components.css` (replace the `.page-header*` rules) and `src/styles/site.css` (remove
  `.data-pending*` and `.pending-grid`, add the new rules).
- Modify: `src/i18n/translations.ts` (new keys `pending-note` and `on-this-page`)

**Interfaces:**

- **Produces `PageShell` props:**
  `{ k?: string; badge: string; title: string; subtitle: string; parents?; sections?: { id: string; k: string; label: string }[]; children }`
  - `badge` now only labels the breadcrumb (key `pg-<k>-badge`, unchanged).
  - `badgeIcon` is removed.
  - With `sections.length >= 3`, a sticky "On this page" list (`on-this-page`: "On this page" / "Sa pahinang
    ito") shows beside the content at 1024px and up. Each item links to `#id`.
- **Produces `PendingNote({ items }: { items: { k: string; label: string }[] })`.**
  - One note with the text `pending-note`: EN "We're still gathering this information. Coming to this page:" /
    FIL "Inaayos pa namin ang impormasyong ito. Darating sa pahinang ito:".
  - Below it, a list of the item labels, using each existing `<k>-t` key.
- **Produces CSS classes:**
  - `.page-intro` (breadcrumb, H1 and lead, on the cream background, left-aligned)
  - `.page-intro-lead`
  - `.page-body` (a grid, with the toc column at 1024px and up)
  - `.page-toc`
  - `.page-section` (with an H2)
  - `.pending-note`
- **Consumed by:** Tasks 4 and 5.

- [ ] **Step 1: Build `PendingNote`, rework `PageShell`, and update every caller**

Each pending page becomes a single `PendingNote` that lists the items its card grid showed.

- [ ] **Step 2: Write the CSS** with tokens only, then run `npm run icons` if any icon class changed

- [ ] **Step 3: Run the gate** `npm run check`

Expected: green. `check-i18n` reports the key counts matching.

- [ ] **Step 4: Manual gate in the browser pane (dev server `dev`, port 3000)**

On `/government/`, `/privacy/` and `/business-taxes/`, at 375, 768 and 1280px:

- No navy band and no badge.
- The title is left-aligned.
- `/government/` shows the pending note with three items.
- The same pages with `document.documentElement.dataset.theme='dark'` are readable.

Take a screenshot of each width for the report.

- [ ] **Step 5: Commit** with the message `style: calmer shared layout for inner pages`

---

### Task 4: Contact, Government and the home panels

**Files:**

- Create: `src/components/SourceLine.tsx`
- Create: `src/components/OfficeList.tsx` (client component: filter box and list)
- Modify:
  - `src/app/contact/page.tsx`
  - `src/app/government/page.tsx`
  - `src/components/home/HomeLeadershipContact.tsx`
  - `src/styles/site.css`
  - `src/i18n/translations.ts`

**Interfaces:**

- **Consumes:** Task 1's data, `toTel` and keys. Task 3's `PageShell` `sections` and `PendingNote`. Task
  2's `normalize` and `search`.
- **Produces `SourceLine({ source, checked }: { source: string; checked: string })`.**
  - Renders `source-line`.
  - `{src}` is a link showing the host (`sjc.gov.ph`).
  - `{date}` is formatted with `Intl.DateTimeFormat`: en-PH or fil-PH, with day, short month and year.
- **The Contact page** has sections `visit` (Visit City Hall) and `hotlines`, then a `SourceLine`.
  - **Visit City Hall:** the address "Cardenas St., San Jose City, 3121 Nueva Ecija", the hours from
    `city-hall-hours`, and the email as `mailto:`.
  - **Hotlines:** every `SITE.hotlines` entry with its translated label. Each number is its own
    `tel:${toTel(n)}` link of at least 44px. Emergency entries are visually grouped first.
  - The office directory placeholder is removed: the offices live on the Government page.
- **The Government page** has sections `officials`, `offices` and `barangays`. With three sections, the
  "On this page" list appears.
  - **Officials:** the mayor and vice mayor as larger name-and-title cards, then a grid of 10 councilor
    cards. No photos and no avatars.
  - **Offices:** `OfficeList` filters with `search` over entries built from `offices.json`. Above the list
    sits the note key `offices-heads-note`. EN: "Office heads are not published yet. For enquiries, call the
    Office of the City Mayor at (044) 940-1404." FIL: "Hindi pa nailalathala ang mga pinuno ng tanggapan.
    Para sa katanungan, tumawag sa Tanggapan ng Punong Lungsod sa (044) 940-1404." The number is a `tel:`
    link.
  - **Barangays:** a `PendingNote` with one item (the existing `government-barangays-t`).
  - Then a `SourceLine`.
- **The home panels.**
  - Mayor and Vice Mayor show the names from `officials.json`.
  - Phone shows the `ocm` number as `tel:`.
  - Email shows `SITE.cityHall.email` as `mailto:`.
  - The City Hall row shows "Cardenas St., San Jose City, 3121 Nueva Ecija".
  - Each panel ends with a `SourceLine`.
  - Remove the `ComingSoon` import if nothing else in the file uses it.

- [ ] **Step 1: Build `SourceLine` and `OfficeList`, then the two pages and the home panels**

- [ ] **Step 2: Run the gate** `npm run check`. Expected: green.

- [ ] **Step 3: Manual gate in the browser pane**

1. `/contact/` at 375px:
   - Tapping PNP shows two separate links: inspect them, expecting `tel:+63446047954` and
     `tel:+639985985421`.
2. `/government/`:
   - Typing "kalusugan" in the office filter leaves City Health Office.
   - Clearing the filter restores all 43.
3. Home page:
   - The panels show both names, (044) 940-1404 and the email. "Coming soon" no longer appears in them.
4. Switch to FIL:
   - The titles read Punong Lungsod and Konsehal ng Lungsod.
   - The names and office names are unchanged.
   - The source line is in Filipino.

- [ ] **Step 4: Commit** with the message `feat: real contact, officials and offices pages and home panels`

---

### Task 5: Site-wide search and phone header

**Files:**

- Create: `src/lib/search-index.ts`
- Create: `src/components/SiteSearch.tsx` (header button and dialog)
- Create: `src/components/SearchResults.tsx`
- Modify:
  - `src/components/ServiceSearch.tsx` (search the site index; keep its look, placeholder and status
    announcement)
  - `src/components/layout/Header.tsx`
  - `src/styles/header.css`
  - `src/styles/components.css`
  - `src/i18n/translations.ts`

**Interfaces:**

- **Consumes:** Task 2's `search`, `groupByType` and `SearchEntry`. Task 1's data and `toTel`.
- **Produces `buildSiteIndex(): SearchEntry[]`**, built once at module level as `SITE_INDEX`. It contains:
  - **Pages:** one entry per inner page that passes `k` to `PageShell`, plus `/scholarship/`, `/news/`,
    `/sitemap/` and `/`.
    - `en` and `fil` come from `pg-<k>-title`.
    - `extra` comes from `pg-<k>-sub` in both languages.
    - `href` is the page's route, with its trailing slash.
  - **Officials:** `en` is the name. `fil` is the same name. `extra` holds both languages' title keys.
    `href` is `/government/#officials`.
  - **Offices:** `en` and `fil` are the name. `extra` is the keywords. `href` is `/government/#offices`.
  - **Hotlines:** `en` and `fil` come from `hotline-<id>`. `extra` is the keywords plus the numbers.
    `href` is `/contact/#hotlines`. `tel` holds each `toTel(number)`.
  - **Services:** one per `services.json` item (currently none).
- **Produces `SearchResults({ results, query })`.**
  - Group headings use keys `search-group-page`, `search-group-official`, `search-group-office`,
    `search-group-hotline` and `search-group-service`. EN: Pages, Officials, City offices, Hotlines,
    Services. FIL: Mga pahina, Mga opisyal, Mga tanggapan ng lungsod, Mga hotline, Mga serbisyo.
  - Titles show in the current language.
  - Hotline items show each number as its own `tel:` link next to the entry link.
  - An empty result shows `search-results-none` with the text updated to "No results" / "Walang resulta".
- **Produces `SiteSearch`.**
  - A magnifier button (`ph-magnifying-glass`, `aria-label` key `search-open` "Search the site" / "Hanapin sa
    site") inside `.header-actions`, after the language pills.
  - It opens a native `<dialog>` with `showModal()`. The dialog contains the input (autofocused), a close
    button (`search-close` "Close search" / "Isara ang paghahanap") and `SearchResults`.
  - It closes on Esc, the close button, a backdrop click and following a result.
  - Focus returns to the opener.
  - `body` scroll is locked while open.
- **The header order below the desktop breakpoint:**
  - logo (order 1), `.header-actions` with the pills and search (order 2, `margin-left: auto`), then
    `.mobile-menu-toggle` (order 3, `margin: 0`).
  - The `order: 2; margin: 0 auto` rule on `.mobile-menu-toggle` in `header.css` is replaced.

- [ ] **Step 1: Build `search-index.ts`, `SearchResults` and `SiteSearch`, then point `ServiceSearch` at
      `SITE_INDEX`**

- [ ] **Step 2: Fix the header order in `header.css`**

- [ ] **Step 3: Run the gate** `npm run icons` if needed, then `npm run check`. Expected: green.

- [ ] **Step 4: Manual gate in the browser pane**

1. **375px:**
   - The header reads logo, EN/FIL, search, then the menu at the far right edge.
   - The menu still opens and closes.
2. **1280px and 1366px:** the nav doesn't wrap, and the search button is visible.
3. **Dialog:**
   - Open it.
   - Type "health": the City Health Office is in "City offices".
   - Type "bumbero": the BFP hotline shows two tap-to-call numbers.
   - Type "violago": the mayor is under "Officials".
   - Type "a": no list appears.
   - Press Esc: the dialog closes, and focus is back on the search button.
   - Backdrop click: the dialog closes.
4. **Hero box:**
   - "birth certificate" shows City Local Civil Registry Office.
   - "business permit" shows Business Taxes and the Business Permit and License Office.
5. **FIL:** "pamahalaan" finds the Government page, titled in Filipino.
6. **Dark theme:** the dialog is readable.

Take screenshots of the phone header and the open dialog.

- [ ] **Step 5: Commit** with the message `feat: site-wide bilingual search and right-aligned phone menu`

---

### Final check (after Task 5)

- Run `npm run build`, `npm run shots:capture -- after-content`, then
  `npm run shots:compare -- baseline after-content`.
  - Expected: differences on inner pages, in the header and in the home panels only. Note any other route
    that changed.
  - If `.shots/baseline` is stale or missing, capture one from the earlier stylesheet branch first.
- Write the report.
  - Name the screenshots.
  - Say the Filipino wording is unreviewed by a native speaker, and that nothing is pushed or deployed.
