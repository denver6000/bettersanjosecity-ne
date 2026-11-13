## 2026-11-13 09:44 — 0ea08a5 — Weather toggle polish

- By: Claude Code, requested by Kurt Vincent F. Fariñas
- Code: d831427 → 0ea08a5 (branch weather-polish fast-forwarded onto main; Hostinger auto-builds on push)
  - The 12px gap above the opened station list now applies on the home card.
  - On phones the "More station details" toggle is at least 44px tall.
  - The list inside the toggle has its own accessible name.
- Migrations: none
- Backup: none (static site)
- Data changes: none (undo by reverting to d831427)
- Verified:
  - i18n, color and theme checks, typecheck, script tests (17/17), lib tests (61/61) and the build passed.
  - Live home page about 60s after the push: opened list has 12px top padding and its label, and the
    phone 44px rule is in the served stylesheet. The phone height itself was not measured on a phone-size window.

## 2026-11-13 09:42 — 4a81f67 — Tidier weather card: station details behind a toggle

- By: Claude Code, requested by Kurt Vincent F. Fariñas
- Code: 071e9aa → 4a81f67 (branch weather-cleanup fast-forwarded onto main; Hostinger auto-builds on push)
  - The Light tile is gone, so the 6 remaining tiles fill the grid evenly.
  - The station panel shows station, status, address, latest reading and refresh rate. Type,
    operator, station ID, coordinates, elevation and active-since sit under a closed "More station
    details" toggle (Filipino: "Iba pang detalye ng istasyon").
  - The latest reading no longer shows the internal reading number.
  - The toggle's keyboard focus ring stays inside the map card.
- Migrations: none
- Backup: none (static site)
- Data changes: none (undo by reverting to 071e9aa)
- Verified:
  - i18n check, typecheck, script tests (17/17), lib tests (61/61) and the build passed.
  - Local preview: toggle closed by default, opens with the keyboard, Filipino label shows.
  - Live home page about 60s after the push: 6 tiles in two rows of 3, 5 visible station rows, the
    other 5 under the closed toggle, station online.

## 2026-11-13 17:25 — 236240d — Filipino footer, station labels and top-strip hotline

- By: Claude Code, requested by Kurt Vincent F. Fariñas
- Code: 7360484 → 236240d (branch fil-polish fast-forwarded onto main; Hostinger auto-builds on push)
  - Footer heading "Mga sanggunian" is now "Mga kaugnay na site". It clashed with "Sanggunian" (the
    council) in the menu.
  - Station details say "Huling sukat", matching the weather card, and "Dalas ng update" instead of
    "Pag-update".
  - The top-strip emergency hotline label switches language (Filipino: "National Emergency Hotline").
- Migrations: none
- Backup: none (static site)
- Data changes: none (undo by reverting to 7360484)
- Verified:
  - i18n check, typecheck and build passed. Prettier ran on the changed files.
  - Live home page in Filipino, about 40s after the push: all four labels show and the old wording is gone.

## 2026-11-13 17:18 — 3698f19 — Natural Filipino, capitalized labels, scroll reveal on every page

- By: Claude Code, requested by Kurt Vincent F. Fariñas
- Code: 6ff6f89 → 3698f19 (branch copy-and-motion fast-forwarded onto main; Hostinger auto-builds on push)
  - About 130 Filipino strings rewritten in everyday Filipino instead of word-for-word English. A
    mistranslation ("isinalin" for copied) and a broken phrase ("Hindi tinatayang") fixed. Mayor titles
    are consistent (Alkalde / Bise Alkalde ng Lungsod).
  - Weather notes ("Latest reading", "Past hour", "From N"), the scholar "Missing" badge and program
    names start with a capital letter.
  - Scroll reveal runs on every page from the root layout: inner-page blocks fade up as they come into
    view, service cards stagger, and page titles ease in on load. Reduced motion and no-JS show
    everything plainly.
- Migrations: none
- Backup: none (static site)
- Data changes: none (undo by reverting to 6ff6f89)
- Verified:
  - Typecheck, script and lib tests, i18n, icon, theme and color checks, and the build passed. Prettier ran
    on git files only.
  - The live sitemap shows the new text about 60s after the push.
  - Live government page: all three sections are marked for reveal and fade in when scrolled to.
  - Live home page: the capitalized weather labels show, with no console errors.
  - The Filipino text was checked in a local preview, not on the live site. It has not been reviewed by a
    native editor.

## 2026-11-11 10:47 — 338e4d5 — Faster hero

- By: Claude Code, requested by Kurt Vincent F. Fariñas
- Code: 05184df → 338e4d5 (branch faster-hero fast-forwarded onto main; Hostinger auto-builds on push)
  - The hero scene shows once San Jose's time and date are applied, instead of waiting for the weather
    forecast. The weather eases in when it arrives.
  - The fade-in is 0.25s.
  - The season's paddies start downloading while the page parses.
- Migrations: none
- Backup: none (static site)
- Data changes: none (undo by reverting to 05184df)
- Verified:
  - `npm run check` steps passed. Prettier ran on git files only.
  - No console errors on a production build.
  - The live home page has the new code.
  - Live first visit in Chrome, with caches cleared: the hero shows at 0.80s, while the forecast arrived at
    1.75s (before: about 2.2s).
  - Repeat visit: 1.12s.
  - Not checked on a slow phone connection.

## 2026-11-11 10:36 — 81ffd92 — Last inherited code rewritten, relicensed under the team's names

- By: Claude Code, requested by Kurt Vincent F. Fariñas
- Code: 535826b → 81ffd92 (branch own-code-relicense fast-forwarded onto main; Hostinger auto-builds on push)
  - Rewritten as the team's own code: offline worker, update notice, header, footer, offline page, app
    manifest and robots.txt.
  - LICENSE now names Kurt Vincent F. Fariñas and Denver M. Ballesteros (MIT code, CC BY 4.0 content).
  - History records reworded to "the original template".
  - The update notice waits for the visitor's tap and is translated.
  - Live `/api/` data is fetched network first.
  - Phone-menu links open pages at the top, and the menu no longer moves the page 16px.
  - New footer disclaimer wording.
- Migrations: none
- Backup: none (static site)
- Data changes: none (undo by reverting to 535826b)
- Verified:
  - `npm run check` steps passed. Prettier ran on git files only, because untracked local plugin files fail
    `prettier --check .`.
  - The screenshot harness shows only the footer disclaimer and weather data changed.
  - Offline update, offline fallback and the Filipino notice were tested by hand in Chrome on a local
    production build.
  - The live site took about 1 minute.
  - `/`, `/government/`, `/contact/`, `/offline.html`, `/manifest.webmanifest`, `/robots.txt` and
    `/sw.js` return 200.
  - The live `sw.js` has the new rules, `robots.txt` has no author line, and the manifest has the new
    description.
  - The offline page has 6 tap-to-call links, and the home page has the new disclaimer.
  - Not yet checked on a phone that had the old version cached.
  - Filipino wording not yet read by a native speaker.

## 2026-11-11 09:22 — 5043fd3 — Own stylesheets, real city data, calmer inner pages, site search

- By: Claude Code, requested by Kurt Vincent F. Fariñas
- Code: 7bbade6 → 5043fd3 (the earlier stylesheet branch and content-pages-and-search, rebased onto main and fast-forwarded; Hostinger auto-builds on push)
  - Inherited CSS replaced by our own stylesheets, with no visual change
  - Contact and Government pages and the home leadership/contact panels show officials, 43 offices and 8 hotlines copied from sjc.gov.ph (checked 2026-11-11)
  - Inner pages use a new layout without the navy band
  - Site-wide bilingual search in the header and the home search box
  - Phone menu button moved to the right
  - Barangay map section removed from the home page
- Migrations: none
- Backup: none (static site)
- Data changes: none (the city data ships in the code; undo by reverting to 7bbade6)
- Verified:
  - `npm run check` steps passed on 5043fd3. Prettier ran on git files only: an untracked local plugin cache fails `prettier --check .`.
  - The live site went up about 1 minute after the push.
  - `/`, `/government/`, `/contact/`, `/privacy/`, `/business-taxes/` and `/scholarship/` all return 200.
  - The live home page has the search button and the mayor's name, and no barangay map.
  - `/contact/` has the separate PNP `tel:` link.
  - The live CSS has the new page layout and note styles.
  - Not checked visually on the live site.
  - Filipino wording not yet read by a native speaker.
  - City Hall street number and department heads still unconfirmed.

## 2026-11-11 — 39c23d4 — Filipino dates on station details, clearer scholarship line

- By: Claude Code, requested by Kurt Vincent F. Fariñas
- Code: 107874c → 39c23d4 (pushed to main; Hostinger auto-builds on push); station details dates use the Filipino format in Filipino mode, scholarship line reworded
- Migrations: none
- Backup: none
- Data changes: none
- Verified: live site in Filipino mode shows "Disyembre 18, 2025" and the new scholarship line; `npm run check` could not run in full (another session's unformatted plan file), so typecheck, i18n check, lib tests and Prettier on src were run instead and passed

## 2026-11-11 — 367381e — Remove the install app pop-up

- By: Claude Code, requested by Kurt Vincent F. Fariñas
- Code: 179c9c7 → 367381e (pushed to main; Hostinger auto-builds on push); removed the "Install Better San Jose" banner and its styles, regenerated the icon font subset
- Migrations: none
- Backup: none
- Data changes: none
- Verified: `npm run check` passed; live site CSS no longer contains the install banner styles; not checked visually on the live site

## 2026-11-11 — 90384ba — Wow-factor set: barangay map, living hero, I need to finder, copy review

- By: Claude Code, requested by Kurt Vincent F. Fariñas
- Code: 57be8e8 → 90384ba (pushed to main as a fast-forward of frontend-wow-factor, PR #3; Hostinger auto-builds on push); barangay fly-in map, living hero with occasions and seasons, "I need to" finder replacing the popular services tiles, smaller finder and map, sentence-case headings, Tagalog wording fixes
- Migrations: none
- Backup: none (static site, no data changes)
- Data changes: none
- Verified: `npm run check` passed on 90384ba; live home page contains the finder, barangay and hero markup; /, /contact/, /business-taxes/estimator/ and /statistics/ return 200; a hero scene image returns 200; not checked visually on the live site; Filipino wording not yet read by a native speaker; flag and local dates still to be confirmed with the city

## 2026-11-06 — 0317597 — Breadcrumb label and language pill fixes

- By: Claude Code, requested by Kurt Vincent F. Fariñas
- Code: cbbb0dd → 0317597 (pushed to main; Hostinger auto-builds on push); translated breadcrumb screen-reader label, EN/FIL pill no longer slides on load
- Migrations: none
- Backup: none
- Data changes: none
- Verified: `npm run check` passed; live bundle contains the new breadcrumb string; not re-checked visually on the live site after this deploy

## 2026-11-06 — 28380fb — Filipino translations for all pages and tab titles

- By: Claude Code, requested by Kurt Vincent F. Fariñas
- Code: 17eed88 → 28380fb (pushed to main; Hostinger auto-builds on push); inner pages, error pages, tab titles, Business Taxes and estimator, Scholarship
- Migrations: none
- Backup: none
- Data changes: none
- Verified: `npm run check` passed; live JS bundle contains the new Filipino scholarship strings; Filipino wording not yet reviewed by a Filipino speaker; live pages not checked visually

## 2026-11-06 — 7074e35 — No flash of English for Filipino visitors

- By: Claude Code, requested by Kurt Vincent F. Fariñas
- Code: b542904 → 7074e35 (pushed to main; Hostinger auto-builds on push)
- Migrations: none
- Backup: none
- Data changes: none
- Verified: `npm run check` passed; live homepage HTML contains the language-gate script; first paint not checked on the live site

## 2026-11-06 — 86cc0eb — Filipino hero text and home leftovers

- By: Claude Code, requested by Kurt Vincent F. Fariñas
- Code: 92434d1 → 86cc0eb (pushed to main; Hostinger auto-builds on push); includes 297e3a6 (shorter Filipino hero text)
- Migrations: none
- Backup: none
- Data changes: none
- Verified: `npm run check` passed; live JS bundle contains the new Filipino weather strings ("Maaliwalas"); not re-checked visually on the live site

## 2026-11-06 — c1fc3c3 — Filipino layout spacing fixes

- By: Claude Code, requested by Kurt Vincent F. Fariñas
- Code: 638bd24 → c1fc3c3 (pushed to main; Hostinger auto-builds on push)
- Migrations: none
- Backup: none
- Data changes: none
- Verified: `npm run check` passed; live CSS contains the new `:lang(fil)` nav rules (header no longer squashes at 1440px+ in Filipino); not re-checked visually on the live site

## 2026-11-06 08:21 — dce76a8 — Force light theme; remove hero credit and inherited footer note

- By: Claude Code, requested by Kurt Vincent F. Fariñas
- Code: d03e7db → dce76a8 (pushed to main; Hostinger auto-builds on push)
- Migrations: none
- Backup: none
- Data changes: none
- Verified: `npm run check` passed (icons, i18n, theme, prettier, typecheck, build); live homepage no longer contains the Judgefloro photo credit or the "Design based on …" note crediting the original template, and `<html>` is `data-theme="light"`

## 2026-11-06 — 9f60c97 — Footer credits + frontend-kurt to main

- By: Claude Code, requested by Kurt Vincent F. Fariñas
- Code: cb693ae → 9f60c97 (pushed to main; Hostinger auto-builds on push)
- Migrations: none
- Backup: none
- Data changes: none
- Verified: not verified (skipped at user's request); also ships the frontend-kurt commits since cb693ae (dark mode, perf, a11y)
