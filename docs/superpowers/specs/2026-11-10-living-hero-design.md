# Living hero — design (revision 2)

Branch: `frontend-wow-factor`. Part 1 of the "wow factor" set (the barangay map is done; the finder is next; the scroll story was dropped). Revision 2 (2026-11-10) replaces the first draft after the user asked for a livelier, interactive hero whose holidays and occasions are built into the scene with intent.

## Intent

The home page hero becomes an illustrated rice-field scene of San Jose City that is alive and true to the city right now: the real time, the real weather, the real farming season, and the occasion of the day. It replaces the rice-field photo. Visitors can play with it, but the sky never lies: it always shows the city's actual time and weather.

An occasion (Christmas, Independence Day, the city's anniversary, Holy Week, Undas, harvest thanksgiving) is not a sticker on top of the picture. It is part of the scene: attached to its landmarks, in front of or behind the right layers, lit by the same light, moved by the same wind, and behaving the way the day deserves.

## Goals

- Real time, real weather, real date; the sky is never faked for visitors.
- One cohesive art style from sunrise to storm to Christmas Eve.
- Interactions that feel playful where the day is happy, and none where it is solemn.
- Occasions that look designed into the scene (see "Rules of intent").
- Light on weight: only what the visitor needs is loaded, and the base hero is small.
- English and Filipino, light and dark site theme, reduced motion, phones.
- Static export friendly; no server.

## Non-goals

- No weather or time text in the hero (the weather section already shows it).
- No sound.
- No visitor control of the sky (no time slider or weather picker on the live site).
- No label or caption for the occasion on the picture (the user's design taste is minimal sub-text); the occasion is announced only to screen readers in the scene's description.

## Anti-goals

- A prop that looks pasted on: wrong scale, wrong light, floating, or in front of things it should be behind.
- A playful reaction on a solemn day.
- A flash of the wrong scene on load.
- Reduced contrast on the headline or search box.
- Motion for people who ask for reduced motion.
- Using the national flag in a way the Flag and Heraldic Code forbids (see "Occasions: care").

## Art

### Base scene (made, verified)

Three transparent PNG layers from ChatGPT, all exactly 1586 × 992 so they stack without shifts: `hills`, `paddies` (terraced paddies, nipa hut, palms), `foreground` (rice stalks). Checked against the source image: about 8% of pixels noticeably differ, almost all in the redrawn foreground strip. ChatGPT's sun layer is discarded (the sun moves) and its sky layer came back empty (the sky is drawn in code). Layers must never be moved against each other (their edges and the seam between hills and paddies show); all life comes from code drawn on top of the stack.

The art is AI-generated; the user should confirm they are comfortable with that on a city site, and whether to credit it.

### Occasion art (hybrid)

ChatGPT draws the signature art for each occasion; code supplies light, glow, wind, motion and reactions. Art comes in two kinds, both transparent PNG at 1586 × 992 so positions stay in the scene's coordinates:

1. **Set dressing**: a static layer that belongs to the composition (for example string lights along the hut roof, a carabao cart in a paddy). Placed in a named depth slot (see below).
2. **Sprites**: separate objects that code moves or lights (a parol that swings, a flag that waves, a candle with a flame). Delivered as a sprite sheet (a clean grid of transparent objects at the scene's scale); a build script finds each object by its alpha bounding box and writes a small manifest (name, crop rectangle, anchor point). Sprites are cropped into one WebP per sheet.

Each occasion's assets load only when that occasion is active.

Season paddies: both planting and harvest are new art, made by ChatGPT as variants of the `paddies` layer (a flooded, freshly planted paddy and a ripe golden one) with the same hut, palms and terraces. Recolouring the existing layer was tested and rejected: the hue shift turns the hut pink and the golden patches red.

Production rules for every ChatGPT piece: give ChatGPT the base image as the reference, state the anchor landmark and depth, ask for real transparency at the same canvas size, and run the same stack check as the base (same size, aligned, no halo, style match) before accepting it. A piece that fails is regenerated, not patched.

## Rules of intent

Every occasion must satisfy these; they are the review checklist.

1. **Anchored.** Each prop attaches to a named landmark with fixed coordinates: hut eave, hut roof, palm crown, paddy dike, ridge line, foreground edge. Nothing floats in the sky unless it is meant to be in it (the Christmas star, fireworks).
2. **Depth.** Every prop belongs to a slot: behind hills, between hills and paddies, between paddies and foreground, in front of foreground. The foreground rice always covers the lowest props.
3. **One light.** Props take the same time-of-day and weather tint as the scene. Lamps, candles and window glow switch on with the night factor and stay lit in rain; their glow is flat shapes (no gradients).
4. **One wind.** Cloth and light things (flags, bunting, banderitas) move with the real wind speed: calm air hangs, a gust whips.
5. **Behaviour with a reason.** Each occasion has a small time script that fits it (for example the flag is raised at 8:00 on Independence Day).
6. **Tone decides interaction.** Celebrate allows pokes, Remember allows none, Season changes the land and nothing else.
7. **One at a time.** Only one occasion is drawn; precedence is below.
8. **Budget.** A visitor downloads only the base layers and the active occasion.

## Occasion system

### Three tones

| Tone      | Feel                                       | Interaction                              |
| --------- | ------------------------------------------ | ---------------------------------------- |
| Celebrate | Warm and lively                            | Pokes allowed, props react to the cursor |
| Remember  | Quiet and respectful, muted, slower motion | No pokes; no birds scattering; no sparks |
| Season    | The land itself                            | None; it changes the paddies only        |

### Calendar

Dates are my calls except where a law is cited; the local ones are to be confirmed with the city government before launch and live in one editable table.

| Occasion                       | Tone      | Dates                                                          | Notes                                                                            |
| ------------------------------ | --------- | -------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Christmas                      | Celebrate | 1 Dec to 6 Jan                                                 | Simbang Gabi and Christmas Eve moments below                                     |
| New Year                       | Celebrate | 31 Dec (evening) to 1 Jan                                      | Midnight countdown and first sunrise                                             |
| Independence Day               | Celebrate | 10 to 12 Jun                                                   | Flag raising at 8:00 on 12 Jun                                                   |
| Araw ng San Jose City          | Celebrate | 10 Aug (RA 9776 special holiday); 4 Aug (RA 6051 charter date) | To confirm which day the city celebrates                                         |
| Fiesta of St. Joseph           | Celebrate | 19 Mar                                                         | Patron saint; lilies and banderitas                                              |
| Pagibang Damara (harvest fest) | Celebrate | April, dates to confirm (sources conflict)                     | Harvest thanksgiving, sheaves and carabao cart                                   |
| Labor Day                      | Celebrate | 1 May                                                          | A farmer and carabao ploughing a paddy                                           |
| Araw ng Kagitingan             | Remember  | 9 Apr                                                          | One flag, quiet                                                                  |
| Holy Week                      | Remember  | Palm Sunday to Holy Saturday                                   | Cross on the ridge, palaspas on the hut; Good Friday is the darkest              |
| Undas                          | Remember  | 31 Oct to 2 Nov                                                | Candles and flowers at the dike and hut                                          |
| Planting season                | Season    | 1 Dec to 31 Jan and 1 Jun to 31 Jul                            | Flooded paddies reflecting the sky (to confirm with the city agriculture office) |
| Growing season                 | Season    | other dates not in planting or harvest                         | The existing green paddies                                                       |
| Harvest season                 | Season    | 1 Mar to 30 Apr and 1 Oct to 30 Nov                            | Golden paddies, new art (to confirm)                                             |

### Precedence

Remember beats Celebrate beats nothing. Among Celebrate occasions that overlap, the one with the narrower date range wins (for example 31 Dec to 1 Jan beats Christmas). Season always applies underneath the chosen occasion, so Christmas can sit on planted paddies. Holy Week and Araw ng Kagitingan overlap in some years (Remember with Remember): Holy Week wins.

### Occasion compositions

Each is a brief for the art and the behaviour. Anchors are named landmarks, not coordinates; the builder reads exact positions from the base layers.

- **Christmas.** Parols (several sizes and colours) hang from the hut eaves and the palm fronds; string lights run along the hut roofline and between the palms. Set dressing sits between paddies and foreground; parols are sprites that sway with the wind and light up with the night factor. Simbang Gabi (16 to 24 Dec, 4:00 to 6:00): parols lit, hut window glowing, in the pre-dawn light. Christmas Eve evening (24 Dec): a single bright Christmas star over the ridge. Pokes: a parol swings and glows brighter.
- **New Year.** 31 Dec evening: quiet build-up. At midnight in San Jose time the sky opens with a short fireworks finale behind the hills (code particles). 1 Jan sunrise: a brighter, clean golden dawn. Pokes: click the sky for a burst.
- **Independence Day.** A tall bamboo flagpole on the highest dike with the flag, correctly drawn; at 8:00 on 12 Jun it is raised (one slow animation, once). Plain colour bunting (blue, red, white) is strung from the hut to the nearest palm. Fireworks as above. Pokes: click the sky for fireworks.
- **Araw ng San Jose City.** Banderitas in the city's colours (navy, gold, green) across the paddies from hut to palm, and a banner post on the dike (no text). Pokes: the banderitas flutter.
- **Fiesta of St. Joseph.** Banderitas in many colours; white lilies (St. Joseph's flower) in bunches at the hut steps and along the dike. Pokes: the banderitas flutter.
- **Pagibang Damara.** Sheaves of palay stacked at the dike, a carabao with a cart in a golden paddy, baskets in the foreground. This is the harvest-thanksgiving day, so the season is also harvest; the two reinforce each other.
- **Labor Day.** A farmer in a salakot ploughing a flooded paddy behind a carabao, drawn small in the mid-ground so it reads as part of the land. Pokes: the carabao lifts its head.
- **Araw ng Kagitingan.** A single flag on the dike pole, flying calmly; a golden-hour palette no matter the hour is not used (the real time still rules); no pokes.
- **Holy Week.** A muted tint over the whole scene, a cross on the far ridge, palaspas (woven palm) tied to the hut. The sway slows. Good Friday is the darkest. No pokes and no scattering birds.
- **Undas.** Candles and chrysanthemums at the dike and the hut steps; lit at dusk, burning on through rain (the flames sit sheltered). Fireflies calm. No pokes.
- **Planting season.** Flooded paddies reflecting the sky, young seedlings in rows (new art variant of `paddies`).
- **Harvest season.** A new golden-paddy variant of `paddies`, with a few sheaves on a dike.

### Occasions: care

- **The national flag** has legal display rules (the Flag and Heraldic Code, RA 8491). Show it only correctly drawn (blue over red, white triangle with eight-rayed sun and three stars) on a pole; never as bunting, a banner, or inside fireworks. The user should verify with the code before launch. Bunting uses plain blue, red and white pennants.
- **Religious days** (Holy Week, Undas, St. Joseph): reverent, no jokes, no fireworks, no playful reactions.
- **Local dates** come from the city's own calendar, not from my assumptions.

## Interactions (the live sky stays real)

Kept from the playable spike, to be built properly:

- **Always moving, on the real sky:** sun rays turn slowly and the sun breathes; stars twinkle; clouds drift at the real wind speed; rain density follows the real rainfall with ripples spreading on the paddies; birds cross by day and fireflies come out at night.
- **Cursor wind:** about 66 code-drawn rice stalks in front of the foreground part and lean away from the cursor and settle back.
- **Pokes (Celebrate days and ordinary days only):** click the sun for a 14-second time-lapse through the day that lands back on the real time; click a cloud for a 6-second shower; click the birds to scatter the flock; fireflies gather round the cursor at night; the occasion's own pokes above. Remember days switch all pokes off; reduced motion switches them to instant, still responses or off.
- Touch: no cursor wind; taps work for pokes.
- Pointer hover gives clear affordance (a pointer cursor and a small scale on things you can poke).
- Open question carried from the spike: the code stalks are dense and may cover too much of the picture; tune density and height so the artwork still shows.

## Technical design

### Modules

- `src/lib/sky.ts` (pure, no React or DOM): `skyAt(hour)`, `weatherKind(code)`, `seasonOn(date)`, `occasionOn(date, hour)` returning the chosen occasion (with precedence), Easter calculation, and the calendar table. Unit tested with `node:test`.
- `src/lib/forecast.ts`: the shared Open-Meteo hook (one request, one cache) extracted from `WeatherWidget`, which gains wind speed and precipitation; the widget's behaviour is unchanged.
- `src/components/home/HeroScene.tsx` (client): the SVG, the animation loop, the interactions; one `requestAnimationFrame` loop, paused when the tab is hidden.
- `src/components/home/hero/occasions/*`: one small module per occasion: its assets, anchors, time script, and pokes.
- `scripts/build-hero-assets.mjs`: converts the layers and sprite sheets to WebP (via a headless-browser canvas if no tool is installed), finds sprite bounding boxes, writes manifests, and checks size and alignment.
- `HomeHero.tsx`: the photo is removed and the scene mounted in the existing curved panel.

### First paint

The static export renders a neutral scene. A small inline script (like the existing language gate) sets time of day, occasion and season on the hero root before first paint and reads the weather from the weather widget's `localStorage` cache, so the scene does not jump. A fresh forecast updates the weather in place.

### Time and weather

The scene uses San Jose time (`Asia/Manila`), not the visitor's. Weather comes from Open-Meteo `weather_code`, `wind_speed_10m` and `precipitation`; unknown means clear. Daylight uses fixed keyframes (night until 5:00, dawn 6:30, golden morning 8:00, noon 12:00, afternoon 16:00, dusk 18:00, night from 19:30).

### Preview override

`/?sky=21:00,storm&on=christmas&season=harvest` forces the time, weather, occasion and season so any combination can be reviewed and demoed. It only changes what is drawn and is ignored if malformed.

### Weight

The three base layers go from about 1.8 MB of PNG to WebP of about 300 KB in total. Each occasion's assets are expected under about 150 KB and load only when active. Decorations, sky, weather and interactions are code.

### Accessibility and i18n

The scene is decorative: `role="img"` with one translated description that mentions the occasion when there is one (for example "Illustrated rice fields of San Jose City, decorated for Christmas"); English and Filipino keys per occasion. No live announcements. The headline and search keep the cream panel and their contrast in light and dark themes. `prefers-reduced-motion` removes sway, drift, falling rain, birds, firefly motion and pokes; the scene stays static but still reflects time, weather and occasion.

### Replacing the photo

Remove the old photo markup and the three `san-jose-rice-fields*.jpg` files, unused CSS for `.home-hero-pic img`, and any photo credit (the builder greps for it).

## Delivery in two plans

The work is large and splits cleanly, so there are two plans in this order:

1. **Engine plan:** `sky.ts`, `forecast.ts`, the base scene replacing the photo, the real-sky behaviour, the ambient motion, cursor wind, the ordinary pokes, the preview override, tests, and the asset build script for the base layers. Shippable on its own.
2. **Occasion plan:** the occasion registry and each occasion's art (made in ChatGPT and checked), time scripts and pokes, the seasons, and the sprite-sheet pipeline. Delivered occasion by occasion, safest first.

## Verification

- `npm run check` passes, including `node:test` tests for `sky.ts`: Easter (2026-04-05, 2027-03-28, 2028-04-16); every occasion's boundary dates; precedence cases (31 Dec versus Christmas; Holy Week versus Araw ng Kagitingan; Remember versus Celebrate); season boundaries; weather-code mapping including unknown; `skyAt` continuity.
- In the browser, for each occasion: morning, dusk, night, rain and storm via the override; check each of the eight rules of intent; light and dark site theme; Filipino; 375 px wide; reduced motion; no horizontal scroll; first paint shows the right scene when reloaded at night.
- The user reviews each occasion's screenshots before it ships.
- Page weight before and after.

## Left to the builder

- Exact keyframe colours and tint values (start from the spike).
- Exact anchor coordinates and sprite scales.
- The WebP quality setting within the budget.
- Stalk density and height.

## My calls (check these)

- No label on the picture; screen-reader description only.
- All dates and precedence above, especially the Season windows and the planting and harvest months.
- Remember days have no pokes at all, and Easter Sunday is not themed.
- The flag appears only on a pole, never as bunting.
- San Jose time, not the visitor's.
- Two plans, engine first.
- Fixed daylight hours instead of sunrise and sunset data.
