# Content pages, real city data and site-wide search: design

Date: 2026-11-11. Status: draft for approval.

## Intent

The site should feel designed for San Jose City, not built from a template. Today, 10 of the 16 inner pages
are "data pending" placeholders under the same generic header: a big navy band, a pill badge, then a grid
of dashed cards. This is the first step of a larger goal: redesign the frontend so it is entirely our own,
then remove every mention of BetterSolano. That removal is a separate, later project.

This step does four things the user asked for:

1. Fill the Contact and Government pages with real, sourced city data.
2. Give every inner page a cleaner, shared layout.
3. Make search cover the whole site, not just services.
4. Move the phone menu button to the right edge of the header.

## Goals

- **Contact page.**
  - Shows City Hall's address, office hours, every verified hotline (tap to call on phones) and the email
    address.
- **Government page.**
  - Shows the mayor, the vice mayor, all 10 councilors and the 43 city offices.
  - Barangays stay "being prepared" (see Non-goals).
- **Inner page layout.**
  - Every inner page that uses `PageShell` gets a new, calmer layout.
  - Placeholders read as one honest note, not a grid of empty cards.
- **Site-wide search.**
  - One search box finds pages, officials, offices, hotlines and services, in English and Filipino.
  - It is available from the header on every page.
  - The home hero search box uses the same search.
- **Phone menu.** On phones and tablets, the header reads: logo on the left, the EN/FIL pills, then the
  menu button at the far right.

## Non-goals

- **Removing BetterSolano mentions** (LICENSE, README) is the next project, after the redesign.
- **The home page** keeps its current sections. It changes in three places only:
  - the header gets the new search button;
  - the hero search now searches the whole site;
  - the "City leadership" and "Contact City Hall" panels (`HomeLeadershipContact.tsx`) replace their
    "Coming soon" values with real data. Mayor: Hon. Josel F. Violago. Vice Mayor: Hon. Evangel Shalom
    S. Manugue. Phone: the Office of the City Mayor, (044) 940-1404, as a `tel:` link. Email:
    piosanjosecity@gmail.com, as a `mailto:` link. A source line is added. The values are read from the
    same data files as the Government and Contact pages.
- **Department heads.** They are not published on the official site. Offices are listed without names
  until the city provides them.
- **Barangay officials**, ex-officio council members (the ABC and SK presidents), photos of officials, and a
  map pin for City Hall. None of these has a verified source yet.
- **Statistics, Budget, Legislative, FAQ, Privacy, Terms and Accessibility** get the new layout, but no new
  content.
- **Error pages (403, 404, 500)** keep their own layout.
- **The top strip** still shows "National Emergency: 911". (My call: keeping the phone header as it is.)
  `TopStrip.tsx` shows every `SITE.hotlines` entry, so it is filtered to the 911 entry.

## Anti-goals (a failure even if it works)

- **Invented or guessed data.**
  - No names, numbers or street numbers that are not in the source.
  - Every page showing city data says where it came from and when it was checked.
- **Looking like the official LGU site.** The "Independent civic site" line stays.
- **Visual drift from the brand.**
  - No new colours and no gradients (the user dislikes gradients). Navy, gold and green on cream, Fraunces
    and Inter, as today.
  - All colours come from `tokens.css` or `theme.css`. `npm run check-css-colors` enforces this.
- **A search that misses Filipino.** It must match words typed in either language.
- **New dependencies** for search or layout.

## Constraints

- **Next.js 16.4 static export** (`output: 'export'`) on Hostinger. No server code and no API for search.
  Read the relevant guide in `node_modules/next/dist/docs/` before writing Next code (AGENTS.md).
- **Bilingual.**
  - Every new visible string has an English and a Filipino entry in `src/i18n/translations.ts`, and the
    project's i18n check passes.
  - Names of people and offices are not translated. Titles are (for example, Mayor and Punong Lungsod).
- **Dark mode stays ready.** New colours used in components go through tokens that `theme.css` overrides.
- **Accessibility.**
  - Touch targets of at least 44px.
  - Visible focus.
  - The search dialog traps focus, closes on Esc and returns focus to the button that opened it.
  - Results are announced politely, as `ServiceSearch` does today.
- **`npm run check` must pass** (Prettier, typecheck, theme, CSS colours, i18n, tests, build).
- **Branch** (my call): `content-pages-and-search`, cut from `discard-bettersolano-theme`, because it builds
  on the new stylesheets. Nothing is merged, pushed or deployed without the user's say-so.

## Approaches considered

### Inner page layout

- **A. One cleaner shared layout (chosen by the user).**
  - Rework `PageShell` once, and every page benefits.
  - Contact and Government add directory and contact blocks inside it.
- **B. A separate template per page type** (directory, contact, reading, data).
  - Each type would look more distinct.
  - It is about twice the work, and the data pages have no data to design for yet.

### Search

- **A. One search index built with the site (chosen by the user).**
  - Covers pages, officials, offices, hotlines and services, in both languages.
  - No server needed.
- **B. Pagefind.**
  - Reads the built HTML, which is English only, because Filipino is switched in the browser. Filipino
    searches would miss.
  - Adds a dependency and a post-build step.
- **C. Extend the services search with a hand-kept page list.**
  - Cheapest, but stays partial.

## Real data (source: https://www.sjc.gov.ph, checked 2026-11-11)

**City Hall**

- Address. Shown as "Cardenas St., San Jose City, 3121 Nueva Ecija". The official site gives both
  "15 Cardenas St." and "115 Cardenas St", so the number is left out until confirmed. (My call.)
- Office hours: Monday to Friday, 8:00 AM to 5:00 PM.
- Email: piosanjosecity@gmail.com (Public Information Office).

**Hotlines** (label, then number as printed on the source)

- MDRRMO Rescue Hotline: 0915-168-9878
- Office of the City Mayor (OCM): (044) 940-1404
- Public Information Office (PIO): (044) 331-0667
- PNP San Jose: (044) 604-7954 / 0998-598-5421
- Fire Station (BFP): (044) 940-5258 / 0925-453-0777
- Ospital ng Lungsod: (044) 456-6671
- SAJELCO: (044) 940-5818
- National Emergency: 911 (kept from today's config)

**Elected officials** (names exactly as published; "Hon." is shown as written)

- City Mayor: Hon. Josel F. Violago
- City Vice Mayor: Hon. Evangel Shalom S. Manugue
- City Councilors, in the source's order:
  1. Hon. Glenda F. Macadangdang
  2. Hon. Mary Eleanor B. Villena
  3. Hon. Atty. Ronald Lee Hortizuela
  4. Hon. Edward John A. Divina
  5. Hon. Andrei Benedict T. Ignacio
  6. Hon. Dr. Arturo Vittorio P. Donayre III
  7. Hon. Jennifer O. Salvador
  8. Hon. Manuel G. Chua Jr.
  9. Hon. Banjo Z. Munar
  10. Hon. Carina Clarizze M. Dela Cruz

**City offices (43)**

These are the names exactly as listed on https://www.sjc.gov.ph/public/departments:

- Business Permit and License Office
- City Accounting Office
- City Administrator's Office
- City Agriculture and Biosystem Engineering Office
- City Agriculture Office
- City Architect Office
- City Assessor's Office
- City Budget Office
- City Cooperative Development Office
- City Disaster Risk Reduction and Management Office
- City Engineering Office
- City Environment and Natural Resources Office
- City Franchising and Regulatory Office
- City General Services Office
- City Health Office
- City Housing and Homesite Regulations Office
- City Human Resource Management Office
- City Legal Office
- City Library and Information Center
- City Local Civil Registry Office
- City Nutrition Office
- City Planning and Development Office
- City Population Office
- City Slaughterhouse Office
- City Tourism Office
- City Treasurer's Office
- City Veterinary Office
- Community Affairs Office
- Management Information Systems Office
- Office of the City Mayor
- Office of the City Vice Mayor
- Office Senior Citizens Affairs Office
- Ospital ng Lungsod ng San Jose
- Person with Disability Affairs Office
- Public Employment Service Office
- Public Information Office
- Public Market Office
- Public Order and Safety Office
- Sangguniang Panlungsod Office
- Social Welfare and Development Office
- Solo Parent Office
- Sports Development Office
- Transportation, Communication and Public Utilities Service office

Where it lives (my calls):

- Officials go in the existing `src/data/officials.json`, replacing the pending stub.
- Offices go in a new `src/data/offices.json`.
- Hotlines, address, hours and email go in `SITE` in `src/config/site.ts`, which already has a `hotlines`
  array.
- Each data file records `source` and `checked` (ISO date). The pages read them for the source line.

## The design, as decided

### Inner page layout (`PageShell`)

- **Remove the navy band and the pill badge.**
  - The header becomes breadcrumbs, then the H1 (Fraunces), then a one- or two-sentence intro, all on the
    cream page background.
  - The title is left-aligned with the content.
- **Content is a column of sections**, each with an H2.
- **"On this page" list.**
  - On wide screens (1024px and up), pages with three or more sections show a sticky list of section
    links beside the content.
  - Narrower screens don't show it.
- **Placeholders.**
  - `DataPending` cards become one small note per page: "We're still gathering this information," with a
    short list of what is coming.
  - The dashed card grid (`pending-grid`) goes away.
- **The `PageShell` API** may drop `badge` and `badgeIcon`.
  - The breadcrumb label then comes from the title key.
  - Every page that passes them is updated in the same change.
- **Business Taxes, the estimator and Scholarship** keep their content and pick up the new header.

### Contact page

- **A "Visit City Hall" block:** address, hours and email (as a `mailto:` link).
- **A hotlines list.**
  - Each number is a `tel:` link, with the label in the current language and the number as printed.
  - Emergency lines (MDRRMO Rescue, 911, PNP, BFP) come first.
- **Source line:** "Source: sjc.gov.ph · checked 11 Nov 2026" (localised).

### Government page

- **Sections:** Elected officials, City offices, Barangays (still a placeholder note).
- **Officials.**
  - The mayor and vice mayor appear first, more prominently.
  - The councilors follow in a simple grid of name-and-title cards.
  - No photos and no placeholder avatars.
- **City offices.**
  - An alphabetical list with a filter box above it.
  - A note says office heads aren't published yet and gives the OCM number for enquiries.
- **Source line**, as on the Contact page.

### Site-wide search

- **Index.**
  - Built in the bundle from data the site already has (my call: no separate build script).
  - Sources: page titles and intros from translations (both languages), officials, offices, hotlines, and
    services from `services.json` (currently empty).
  - Each entry: type, English text, Filipino text, URL, and for hotlines, a `tel:` value.
- **Matching.**
  - Case- and accent-insensitive (so "munoz" finds "Muñoz").
  - Every typed word must match, against both languages.
  - Title matches rank above body matches.
  - Results are shown in the current language.
- **Header search.**
  - A magnifier button sits in the header on every screen size.
  - It opens a search dialog with results grouped by type (Pages, Officials, Offices, Hotlines, Services),
    up to 5 per group.
  - Hotline results show the number as a tap-to-call link.
- **Home hero box.** It keeps its look and inline results list, but searches the same index instead of
  `services.json` alone. Its placeholder text stays the same.
- **Filipino and plain-word keywords** (my call). The offices and hotlines are also found by everyday
  words, not just their official names.
  - Each office and hotline entry gets an optional `keywords` field, holding English and Filipino terms.
    Examples: City Health Office has "health, kalusugan, clinic"; the fire hotline has "fire, sunog,
    bumbero"; City Local Civil Registry Office has "birth certificate, marriage certificate, sertipiko ng
    kapanganakan"; Business Permit and License Office has "business permit, permiso".
  - This also makes the hero placeholder's own examples ("birth certificate", "business permit") return
    results.
  - The Filipino keywords and titles are the builder's best wording. They are flagged in the report as
    not yet read by a native speaker, as earlier Filipino work was.

### Phone menu

- **Below the desktop breakpoint, the header order is:** logo, then the EN/FIL pills, then the search
  button, then the menu button at the far right.
- **Fix:** the `order: 2; margin: 0 auto` on `.mobile-menu-toggle` in `header.css` centres the button.

## Left to the builder

- The exact spacing, type sizes and card styling inside the brand's existing tokens.
- How the search dialog animates, if at all (respect reduced motion).
- Whether the offices filter reuses the search matcher. Reuse is preferred.
- Test layout, following the project's existing test setup (`scripts/lib/*.test.mjs` and `npm run check`).
  The search matcher gets unit tests: accent-insensitive matching, all-words matching, a Filipino-only
  term and ranking.
- The screenshot harness (`npm run shots:*`) can show what changed. Changes are expected on every inner
  page and in the header, so it reports differences rather than gating.
