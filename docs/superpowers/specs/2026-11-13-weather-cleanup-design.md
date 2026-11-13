# Weather card cleanup — short design

## Why

The home weather card shows readings and station fields that residents do not use (light in lux, the
station ID, coordinates, a reading number). One tile sits alone on the last row. The card should
show what a resident checks — temperature, rain, wind, UV — and keep the technical detail out of the
way without deleting it.

## Goals

- Remove the Light tile, so 6 tiles fill the grid evenly (3 columns on desktop, 2 on phones).
- "Latest reading" shows date and time only, without the `(#id)` reading number.
- The station panel always shows: Station, Status, Address (or Location), Latest reading, Refreshes.
- Type, Operated by, Station ID, Coordinates, Elevation and Active since move under a
  "More station details" toggle that is closed by default.
- The toggle label is translated (Filipino: "Iba pang detalye ng istasyon").

## Non-goals

- No change to the forecast, map, data fetching or refresh timing.
- No new weather readings.

## Anti-goals

- Information lost: every current field stays reachable.
- A toggle that needs JavaScript or breaks keyboard and screen reader use.

## Approaches

- **Toggle (picked by the user):** native `<details>`/`<summary>` around the technical rows. Works
  without JS, keyboard and screen reader friendly, matches existing use in `ScholarLookup.tsx` and
  `CodeCard.tsx`.
- Remove the rows: least code, but the information is gone. Rejected.
- Keep the Light tile with words (Dark/Dim/Bright): still leaves 7 tiles and an orphan. Rejected.

## Builder's calls

- Styling of the summary line follows the existing `details` styles in the site; small chevron if
  one already exists, otherwise plain link-style text.
- The `sd-` translation keys follow the existing pattern in `StationDetails.tsx`.
- The 2-column `dl` grid inside the toggle is the same as the visible part.
