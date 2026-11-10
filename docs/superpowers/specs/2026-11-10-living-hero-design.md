# Living hero — design

Branch: `frontend-wow-factor`. Part 1 of the "wow factor" set (the barangay map is done; the finder is next; the scroll story was dropped).

## Intent

The home page hero stops being a fixed photo and becomes an illustrated rice-field scene of San Jose City that matches the city right now: the real time of day, the real weather, and the date, including Philippine holiday themes. A visitor who opens the site at night during a storm in December sees a stormy night with parols; at 8 am on an ordinary day, a calm golden morning. It replaces the existing rice-field photo.

## Goals

- Real time, real weather, real date, with no manual controls for visitors.
- Look premium and cohesive: the same art style from sunrise to storm to Christmas.
- Flat colours only (no gradients), matching the site's navy, gold and cream.
- Light on weight: the scene must not slow the home page on a mid-range phone.
- Works in English and Filipino, light and dark site theme, and respects reduced motion.
- Static export friendly: nothing needs a server.

## Non-goals

- No weather or time text in the hero (the weather section already shows it; the hero is visual only).
- No holiday beyond the four below in this round; the holiday table must make adding one easy.
- No sunrise and sunset lookups; fixed daylight hours are enough near the equator (see "My calls").
- Not a replacement for the weather section.

## Anti-goals

- A flash of the wrong scene on load (for example morning, then jumping to night).
- A hero that hides or lowers contrast of the headline or search box.
- Motion for people who ask for reduced motion.
- A layout shift while the images load.

## Art (decided, verified 2026-11-10)

Three layers made by ChatGPT from one flat-vector brief and delivered as transparent PNGs, all exactly 1586 × 992 so they stack with no shifts (a pixel comparison against the original image showed about 8% of pixels noticeably different, almost all in the redrawn foreground strip):

1. `hills`: far ridge and mid hills.
2. `paddies`: terraced paddies, nipa hut, coconut palms.
3. `foreground`: rice stalks with golden grain.

ChatGPT's fourth layer (sun, clouds, birds) is discarded because the sun must move; its sky layer came back empty and is not needed. Sky, sun, moon, stars, clouds, birds, rain, lightning, fireflies, the hut's window glow and all holiday decorations are drawn in code.

The art is AI-generated; the user should confirm they are comfortable with that for a city site.

Prototype: a working spike lives outside the repo (scratch folder `hero-spike/index.html`); it is throwaway but shows the intended result and contains workable code for the palette, filters and decorations.

## Design

### Scene

One inline `<svg viewBox="0 0 1586 992" preserveAspectRatio="xMaxYMid slice">` in the existing curved right-hand panel of `HomeHero` (the gold edge line, navy swoosh and clip path stay as they are today). Back to front: flat sky bands, stars, sun, moon, clouds, birds, `hills`, `paddies`, hut window glow, fireflies, `foreground` (gentle skew sway), rain, lightning, holiday decorations, a Holy Week tint.

### Time, weather and day as data

A pure module `src/lib/sky.ts` (no React, no DOM) with:

- `skyAt(hour: number)`: night factor `n` (0 to 1), sky colours, and a multiply tint colour, interpolated between fixed keyframes (night until 5:00, dawn 6:30, golden morning 8:00, noon 12:00, afternoon 16:00, dusk 18:00, night from 19:30). The spike's keyframe table is the starting point.
- `weatherKind(code: number | null): 'clear' | 'cloudy' | 'rain' | 'storm'` from an Open-Meteo weather code: 0 and 1 clear; 2, 3, 45, 48 cloudy; 51 to 67 and 80 to 82 rain; 95 to 99 storm; `null` (unknown) clear.
- `holidayOn(date: { y: number; m: number; d: number }): 'xmas' | 'indep' | 'saints' | 'holy' | null` using the table below, with Easter computed (Meeus/Jones/Butcher algorithm).
- `manilaNow()`: hour (with half-hour precision is enough) and date parts in `Asia/Manila`. The scene always shows the city's time, not the visitor's, so someone abroad sees San Jose as it is.

Holiday table (my calls, easy to edit):

| Theme    | Dates                                                          | Decoration                       |
| -------- | -------------------------------------------------------------- | -------------------------------- |
| `xmas`   | 1 Dec to 6 Jan                                                 | parols and string lights         |
| `indep`  | 10 to 12 Jun                                                   | flag bunting and a flag by hut   |
| `saints` | 31 Oct to 2 Nov                                                | candles along the foreground     |
| `holy`   | Palm Sunday to Holy Saturday (the 7 days before Easter Sunday) | muted tint and a cross on a hill |

### Weather feed

The scene uses the Open-Meteo `weather_code` the weather widget already fetches. The fetch in `WeatherWidget` is extracted into one shared hook (one request, one cache, in `src/lib/`) used by both the widget and the hero; the widget's behaviour is unchanged. If no forecast is available yet, the hero uses the cached value if there is one and otherwise "clear". It re-reads when the forecast refreshes.

### First paint

The static export renders a neutral scene. A small inline script (like the existing language gate) sets the time-of-day and holiday on the hero root before first paint, and reads the weather from the weather widget's `localStorage` cache if present. The scene therefore does not jump between morning and night on load. When a fresh forecast arrives, the weather layer updates in place.

### Weight and performance

- Layers converted from PNG (about 1.8 MB for three) to WebP, targeting about 300 KB or less in total; the conversion can be done with a browser canvas `toBlob('image/webp')` if no tool is installed, and the original PNGs are not shipped.
- `hills` and `paddies` load with high priority; the explicit `width` and `height` on the `<image>` (and a fixed aspect ratio on the panel) prevent layout shift.
- Decorations, sky and weather are code, so they add almost nothing.
- Mouse-parallax only on devices with a fine pointer; none on touch.

### Accessibility and i18n

- The scene is decorative: `role="img"` with one translated label (`hero-photo-alt` is replaced by `hero-scene-alt`, English and Filipino, for example "Illustrated rice fields of San Jose City"). Changes in time and weather are not announced.
- The headline and search keep the cream panel and their present contrast in light and dark themes; the scene does not depend on the site theme.
- `prefers-reduced-motion`: no sway, drift, falling rain, birds, firefly pulse or parol swing; the scene is static but still reflects time, weather and holiday.

### Replacing the photo

Remove the old photo markup and the three `san-jose-rice-fields*.jpg` files from `public/assets/images/hero/`, and any now-unused CSS for `.home-hero-pic img`. If the photo's Wikimedia credit appears anywhere (footer, credits page), remove or update it; the builder greps for it. The AI-generated art may need a credit line if the user wants one.

### Preview override (my call)

A query string such as `/?sky=21:00,storm,xmas` forces the time, weather and holiday, so the scene can be checked and demoed in any combination without waiting. It only changes what is drawn, and is ignored if malformed.

## Verification

- `npm run check` passes, including new `node:test` tests for `src/lib/sky.ts`.
- Tests: Easter dates (2026-04-05, 2027-03-28, 2028-04-16); holiday boundaries (30 Nov no, 1 Dec yes, 6 Jan yes, 7 Jan no; 9 Jun no, 10 Jun yes; the Holy Week range); weather code mapping including `null`; `skyAt` continuity at keyframes and `n` of 1 at 0:00 and 0 at 12:00.
- In the browser: morning, dusk, night, rain, storm and each holiday via the override; light and dark site theme; Filipino; 375 px wide; reduced motion; no horizontal scroll; first paint shows the right time of day (reload at night).
- The page's total transferred weight is compared before and after.

## Left to the builder

- Exact keyframe colours and tint values (start from the spike).
- Where the hut window glow, flag and cross sit if the layer positions need nudging.
- Whether the inline script is a standalone file or follows the language gate's pattern.
- The WebP quality setting, as long as the budget above holds.

## My calls (check these)

- Replace the photo completely, with no fallback photo.
- The scene shows San Jose's time (`Asia/Manila`), not the visitor's.
- Fixed daylight hours instead of sunrise and sunset data.
- The holiday set and dates in the table above, and Easter Sunday itself not themed.
- The `?sky=` preview override.
- Using the existing weather source rather than the station feed (the station has no sky condition).
