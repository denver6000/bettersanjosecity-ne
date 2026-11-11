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
