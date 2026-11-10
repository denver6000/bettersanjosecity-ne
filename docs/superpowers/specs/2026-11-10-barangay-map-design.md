# Barangay fly-in map — design

Branch: `frontend-wow-factor`. Part 3 of 4 in the "wow factor" set (living hero, finder, map, scroll story). This doc covers the map only.

## Intent

Visitors tap a barangay on a stylised San Jose City map and the view flies smoothly into it, showing that barangay's details. The map must look like the rest of the site (flat green/gold/navy on cream, no gradients) and use real boundaries, not drawn shapes.

## Goals

- All 38 barangays of San Jose City, from real boundary data.
- Smooth: eased fly-in and fly-out, and smooth-looking edges when zoomed in.
- Works in light and dark theme, in English and Filipino, on phones.
- Static export friendly: no runtime fetch of tiles or third-party data.

## Non-goals

- No streets, satellite or tile layers (the existing `CityMap` weather-station map stays as is).
- No invented figures. Population, captain and services show the existing "Coming soon" tile until real data exists.
- No claim of survey accuracy.

## Anti-goals

- Gaps or overlaps between neighbouring barangays after smoothing.
- A map that is only usable by mouse or by tapping tiny shapes.
- Credits missing: the data license requires attribution.

## Data (decided, verified 2026-11-10)

- Source: [faeldon/philippines-json-maps](https://github.com/faeldon/philippines-json-maps), PSGC 3Q 2026 build. San Jose City is PSGC `0304926000` (file suffix `304926000`). `…4919…` is Palayan City, so the build script must assert the 38 expected names.
- 38 features, all `geom_src: source` (real shapes). Only medium and low resolution exist for this city, with roughly 8 to 25 points per barangay, hence the smoothing below.
- License: scripts MIT, boundaries CC BY-IGO. Footer credit: NAMRIA and PSA via OCHA's COD-AB. Boundaries are indicative only (NAMRIA's own wording), and the map says so.

## Approaches considered

1. **Custom SVG map, smoothed once at build time.** Chosen.
2. Leaflet with smoothed shapes over tiles: real streets, but tiles are already blocked on some hosts, and flat colours over a street map look busy.
3. Leaflet without tiles: Leaflet's weight for no visible gain over 1.

Chosen by the user's delegation ("whatever you think is the best one"), my recommendation: 1.

## Design

### Build script

`scripts/build-barangay-map.mjs`, run on demand (not on every build); the output is committed.

1. Read the TopoJSON medium-resolution file for `304926000`, where neighbouring barangays share the same border arcs.
2. Smooth each arc once (Chaikin corner cutting, 2 passes), keeping each arc's two end points fixed (they are the junctions between barangays). Shared borders therefore stay shared: no gaps, no overlaps.
3. Cap drift: fail the script if any smoothed point moves more than 40 m from the original line. (My call; adjust if the check trips.)
4. Project longitude/latitude to a flat plane with an equirectangular projection at the city's mean latitude, and round to 1 decimal.
5. Write `src/data/barangay-shapes.json`: per barangay `{ id (adm4_psgc), name, path (SVG path string), bbox, centroid }`, plus the city bbox.
6. Assert: exactly 38 barangays, names match the list in the script, no empty paths.

No new dependencies; arc decoding and Chaikin are about 40 lines.

### Component

`src/components/BarangayMap.tsx` (client component), used by a new `src/components/home/HomeBarangays.tsx` section placed after `HomeWeather` on the home page. `CityMap` is untouched.

- One `<svg>` with a `viewBox` that animates. Fly-in/out: `requestAnimationFrame`, 600 ms, ease-out cubic, target = barangay bbox plus padding with the map's aspect ratio. `prefers-reduced-motion`: jump instantly.
- Each barangay is a `<path>` with a flat theme-token fill, hover and selected states, `tabindex="0"`, `role="button"`, `aria-label` = name. Enter/Space selects, Escape returns to the city view.
- A "Find a barangay" `<select>` listing all 38 names (small shapes are hard to tap on a phone, and it is the keyboard/screen-reader route). Selecting one flies there too.
- Labels: names appear only when zoomed in or on hover, to avoid clutter at city view.
- Detail card for the selected barangay: name, and three tiles (population, captain, services) using the existing `ComingSoon` pattern until real data is available. A "Back to city" button.
- Footer line (translated): "Boundaries are indicative only. Source: NAMRIA and PSA via OCHA COD-AB (CC BY-IGO)."

### Style rules

Colours come from `src/styles/theme.css` tokens, so light and dark both work (`scripts/check-theme.mjs` keeps the two dark blocks identical; any new token goes in both). No gradients. Icons from the existing Phosphor set, rebuilt with `npm run icons` if new ones are used.

### i18n

All visible strings go through the existing translation system with English and Filipino entries. `scripts/check-i18n.mjs` must pass. Barangay names stay as given in the data.

## Verification

- `npm run check` passes (icons, i18n, theme, format, typecheck, build).
- Build script assertions pass (38 names, drift cap).
- In the browser: city view shows 38 shapes with no visible gaps; tapping flies in smoothly; Back and Escape return; the select works; light and dark look right; 375 px width works; Filipino strings appear.

## Left to the builder

- Exact padding, label sizing and tile layout.
- Whether to also show faint City Hall and weather-station pins (real coordinates needed; not in scope unless the user asks).
- Choosing the neighbour-aware fill palette (a few green tones so adjacent barangays differ).

## My calls (check these)

- Smoothing method and the 40 m drift cap.
- Separate home section rather than replacing `CityMap`.
- The "Find a barangay" select.
- Names appear only when zoomed in.

## Revision, 2026-11-10 (found while building)

The medium-resolution TopoJSON named in "Data" turned out to be almost entirely straight chords (74 of 110 border segments had two points), so no smoothing could stay within the 40 m cap (worst drift 415 m). With the user's go-ahead the build now starts from the full-resolution release (`faeldon/philippines-psgc-shapefiles` v1.0.1, checksum verified, same CC BY-IGO boundaries) and:

- `scripts/extract-san-jose.mjs` cuts San Jose City's 38 barangays out of the shapefile once (coordinates are UTM 51N metres; neighbours share exact border points) into `scripts/source/san-jose-city-barangays.json`.
- `scripts/build-barangay-map.mjs` splits them into shared arcs, simplifies each arc once (Douglas-Peucker, 15 m), then smooths with Chaikin (2 passes, cut length capped at 25 m so real corners between long straight borders stay sharp).
- The 40 m cap is measured both ways against the full-resolution arcs; the committed data's worst gap is 24.4 m.
