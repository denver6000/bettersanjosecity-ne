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

## 2026-11-06 08:21 — dce76a8 — Force light theme; remove hero credit and BetterSolano footer note

- By: Claude Code, requested by Kurt Vincent F. Fariñas
- Code: d03e7db → dce76a8 (pushed to main; Hostinger auto-builds on push)
- Migrations: none
- Backup: none
- Data changes: none
- Verified: `npm run check` passed (icons, i18n, theme, prettier, typecheck, build); live homepage no longer contains the Judgefloro photo credit or "Design based on BetterSolano.org", and `<html>` is `data-theme="light"`

## 2026-11-06 — 9f60c97 — Footer credits + frontend-kurt to main

- By: Claude Code, requested by Kurt Vincent F. Fariñas
- Code: cb693ae → 9f60c97 (pushed to main; Hostinger auto-builds on push)
- Migrations: none
- Backup: none
- Data changes: none
- Verified: not verified (skipped at user's request); also ships the frontend-kurt commits since cb693ae (dark mode, perf, a11y)
