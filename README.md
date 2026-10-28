# Better San Jose

Civic portal for **San Jose City, Nueva Ecija**, served at
[sanjose.betternuevaecija.org](https://sanjose.betternuevaecija.org).

Built with Next.js + React + TypeScript, exported as a static site. The design system
comes from [BetterSolano.org](https://github.com/BetterSolano/bettersolano) (MIT / CC BY 4.0).

## Highlights

### Live weather station

The homepage shows live readings from the city's own KloudTrack automatic weather station
(San Jose City AWS), not a regional forecast:

- Temperature, heat index (PAGASA levels), humidity, wind, rainfall and UV index (WHO levels)
- A map of the station with its 10 km coverage radius
- A small PHP proxy keeps the API key off the browser and caches readings for 60 seconds, so
  any number of visitors stay within KloudTrack's rate limit
- Falls back to the Open-Meteo forecast, with a note, when the station is offline

Details: [Live weather station](#live-weather-station-kloudtrack).

### Business tax codes and estimator

- **[`/business-taxes/`](https://sanjose.betternuevaecija.org/business-taxes/)**: all 28 codes
  from the City Treasurer's five schedules (business tax, mayor's permit, sanitary, garbage,
  fixed fees), searchable, with a row finder for graduated rates. Figures are copied exactly
  as printed.
- **[`/business-taxes/estimator/`](https://sanjose.betternuevaecija.org/business-taxes/estimator/)**:
  find your business in PSA's industry classification (PSIC Revision 5, 1,338 activities;
  everyday and Filipino words like _sari-sari_, _karinderya_ or _pisonet_ work), enter gross
  sales, floor area and employees, and get an itemized yearly estimate linked back to each
  tax code. It runs entirely in the browser.

Details: [Business taxes and fees](#business-taxes-and-fees-business-taxes) and
[Business tax estimator](#business-tax-estimator-business-taxesestimator).

## Quick start

Needs Node.js 22 (see `.nvmrc`), and PHP 8 for the live weather station.

```bash
npm ci
cp .env.example .env   # then fill in KCLOUD_API_KEY (ask a maintainer)
npm run dev            # http://localhost:3000
```

| Script              | What it does                                          |
| ------------------- | ----------------------------------------------------- |
| `npm run dev`       | Dev server with hot reload, plus PHP for `/api/*.php` |
| `npm run build`     | Static export to `out/` (this is what you deploy)     |
| `npm run preview`   | Serve `out/` with PHP to check the production build   |
| `npm run typecheck` | TypeScript check                                      |
| `npm run format`    | Format everything with Prettier                       |
| `npm run check`     | Format check + typecheck + build (what CI runs)       |

`npm run dev` and `npm run preview` need PHP on your PATH for the live weather station.
Without PHP, the site still runs and the weather card falls back to the Open-Meteo forecast.

## Live weather station (KloudTrack)

The homepage "Weather Station Data" section, and the info bar temperature, come from the
city's KloudTrack automatic weather station ("San Jose City AWS"). The map shows where the
station is, with a 10 km radius around it. The station's name, coordinates and radius are
in `SITE.weatherStation` (`src/config/site.ts`); the live feed's coordinates take over once
it loads.

```
browser -> /api/weather-station.php -> api.kloudtechsea.com (x-kloudtrack-key)
```

- `public/api/weather-station.php` is the only server-side code. It keeps
  `KCLOUD_API_KEY` out of the browser and caches KloudTrack's response for 60 seconds, so
  the shared 20 requests/minute limit is never hit however many people visit. If KloudTrack
  is down, it serves the last good reading marked `stale`.
- There is no cron job: KloudTrack is only called when someone has the site open. The
  browser refreshes the reading every 5 minutes, only while the tab is visible, and right
  away when the visitor returns to it (`REFRESH_MS` in `src/lib/station.ts`). A reading
  older than 30 minutes counts as the station being offline, and the card falls back to
  the Open-Meteo estimate with a note.
- The heat index uses PAGASA's levels (Caution, Extreme Caution, Danger, Extreme Danger).
  The UV index uses WHO's.

**API keys.** The PHP endpoints look for their keys in an environment variable first, then
in a `.env` file **two folders above** `public/api/`:

| Key                  | Used by                                               | Without it                                                               |
| -------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------ |
| `KCLOUD_API_KEY`     | `api/weather-station.php`                             | Weather card falls back to Open-Meteo                                    |
| `SIS_PORTAL_API_KEY` | `api/scholarship-stats.php`, `api/scholar-lookup.php` | `/scholarship` shows no figures and the Student ID lookup is unavailable |

`SIS_PORTAL_API_KEY` must equal `PORTAL_API_KEY` in the scholarship system's `.env`
(sanjose-scholarship.betternuevaecija.org). The figures are aggregate counts. The Student ID
lookup returns one scholar's program record (never address, phone or barangay) and is
limited per visitor by the SIS, so the proxy forwards the visitor's IP and caches nothing.

| Where       | Keys go in                                                          |
| ----------- | ------------------------------------------------------------------- |
| Development | `.env` in the project root (git-ignored)                            |
| Hostinger   | hPanel environment variables for the site's Node.js app (see below) |

## Deploying to Hostinger

Hostinger watches this repo: every push to **`main`** clones it, runs `npm run build` and
publishes the new version (under `~/domains/sanjose.betternuevaecija.org/hbuilds/`, with
`current` pointing at the live one). Don't upload files by hand.

1. Merge to `main` and push. The deploy log is in hPanel and in `hbuilds/logs/`.
2. Once only: in hPanel, add the keys above as environment variables for the site's
   Node.js app (stored in `hbuilds/config/.env`), then redeploy so they are loaded.
3. Check `https://sanjose.betternuevaecija.org/api/weather-station.php` returns JSON with
   `"stations"`, and `/api/scholarship-stats.php` returns JSON with `"semesters"`.

The PHP files under `public/api/` still run as PHP alongside the Node.js app.

Each page is exported as `page/index.html` (`trailingSlash: true`), which Apache serves as
a directory index. `/services` redirects to `/services/`.

## Structure

| Path                     | Purpose                                                                                                        |
| ------------------------ | -------------------------------------------------------------------------------------------------------------- |
| `src/app/`               | Routes: one folder per page (`page.tsx`), plus 403/500/not-found                                               |
| `src/components/layout/` | HotlineBar, Header, InfoBar, Footer, BrandLockup                                                               |
| `src/components/`        | PageShell, DataPending, WeatherWidget, CityMap (Leaflet), ServiceSearch, NewsList, PWAManager                  |
| `src/config/site.ts`     | LGU identity, coordinates, hotlines, nav, service categories                                                   |
| `src/i18n/`              | EN/FIL dictionary, `LanguageProvider`, and the `<T k="...">` helper                                            |
| `src/data/*.json`        | Content data, read at build time                                                                               |
| `src/styles/`            | Upstream BetterSolano CSS, plus `site.css` for San Jose additions                                              |
| `public/`                | Logo and icons, OG banner, manifest, service worker, offline page, `.htaccess`                                 |
| `src/lib/`               | Station feed, PSIC search, tax estimator logic, number formatting                                              |
| `public/api/`            | `weather-station.php`, the only server-side code                                                               |
| `scripts/`               | `dev.mjs` (Next + PHP together), `psic-to-json.py` (PSIC workbook to JSON)                                     |
| `sources/`               | Original documents (PSA workbook, Treasurer printouts). Git-ignored: kept locally, never committed or deployed |
| `design/`                | Previous logos (bluefied seal, SJC v1), not deployed                                                           |

## Logo files

`public/assets/images/logo/logo_v2.png` is the source logo (BetterLGU San Jose City).
The site uses files generated from it, with the white background removed:

| File                                    | Used for                                                  |
| --------------------------------------- | --------------------------------------------------------- |
| `logo-emblem.png/.webp`                 | Header (emblem + "BetterLGU / San Jose City" text)        |
| `logo-full.png/.webp`                   | Footer (on a white card), offline page                    |
| `icon-32/64/192/512.png`, `favicon.ico` | Favicons and PWA icons (emblem)                           |
| `icon-180.png`, `icon-maskable-512.png` | Apple touch icon and maskable PWA icon (white background) |

## Adding data

Source documents (PDF printouts, Excel workbooks) are never committed or deployed: git
ignores `sources/` and every `.pdf`, `.xlsx`, `.xls` and `.csv`. Commit only the data derived
from them, under `src/data/`.

Edit the JSON in `src/data/`, then rebuild and re-upload.

| Data              | File                       | Rendered by                      |
| ----------------- | -------------------------- | -------------------------------- |
| News / advisories | `news.json`                | `NewsList` (homepage + `/news/`) |
| Service directory | `services.json`            | `ServiceSearch` (hero search)    |
| Officials         | `officials.json`           | not yet wired                    |
| Demographics      | `demographics.json`        | not yet wired                    |
| Budget            | `fiscal_transparency.json` | not yet wired                    |
| Ordinances        | `ordinances.json`          | not yet wired                    |
| Resolutions       | `resolutions.json`         | not yet wired                    |

### Business taxes and fees (`/business-taxes/`)

All 28 codes from the five Treasurer's schedules
(business tax, mayor's permit, sanitary, garbage, fixed fees) live in `src/data/revenue.ts`,
the only place figures are stored. Figures are copied exactly as printed; irregular rows
keep a `notes` entry instead of being corrected. Each schedule's `source` records which
printout it came from.

To update a figure, edit `src/data/revenue.ts`, update its `source`, and update
`PRINTED_ON` if the schedule was reprinted. Components: `src/components/taxes/` (search, row finder,
code cards); styles: `src/styles/taxes.css`, scoped under `.tax-page`.

### Business tax estimator (`/business-taxes/estimator/`)

Visitors find their business in PSA's industry classification (PSIC), enter last year's
gross sales, floor area and employees, and get an itemized estimate built from
`src/data/revenue.ts`. Everything runs in the browser; nothing is sent anywhere.

- **PSIC list.** `src/data/psic.json` is generated from PSA's PSIC Revision 5 workbook
  (released 30 July 2026). Only the JSON is committed, so builds need neither Python, the
  workbook, nor PSA's API. When PSA issues a new workbook, download it into `sources/`
  (git-ignored) and run:

  ```bash
  pip install openpyxl
  python scripts/psic-to-json.py sources/<workbook>.xlsx
  ```

  The script keeps codes exactly as printed and lists any that sit under a class they
  don't start with (52331 to 52339 under 5231 in the current release).

- **Which code applies.** `RULES` in `src/lib/estimator.ts` maps PSIC sections, divisions
  and classes to the city's codes (manufacturing 582-01, wholesale 582-02, retail 582-07,
  construction and repair 582-08, finance 582-09, other services 582-10), plus the
  mayor's permit code and the suggested garbage group. The longest matching prefix wins.
- **How rows are read.** A rate printed on a row applies to the part above the row's
  start; retailers pay 2% on the first ₱400,000 and 1% on the rest; stores at ₱50,000 or
  less go to the barangay. Where the printout has no row (582-02 from ₱1M to ₱100M, 582-08
  from ₱300k to ₱400k and above ₱2M), the estimate says so instead of guessing. New
  businesses get no business tax estimate, since the printed codes are for renewals.
- **Search words.** Everyday and Filipino terms (piggery, botika, karinderya, pisonet)
  are mapped to PSA's wording in `PHRASES` and `SYNONYMS` in `src/lib/psic.ts`.

Search for `TODO(data)` to find every placeholder that needs official data: hotlines,
City Hall contacts, homepage stats, and leadership. Check the coordinates in
`src/config/site.ts` against an official source before launch.

## Translations

Wrap translatable text as `<T k="some-key">English fallback</T>` and add the key to
both `en` and `fil` in `src/i18n/translations.ts`. Missing keys show the English fallback.

## Service worker

`public/sw.js` registers only in production builds. Bump `CACHE_VERSION` when you change
the precached files.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for setup, the pull request checklist, and the rules for
changing official data. Report wrong figures with the "Data correction" issue template.

## License

MIT (code) and CC BY 4.0 (content), as in upstream. See `LICENSE`.
