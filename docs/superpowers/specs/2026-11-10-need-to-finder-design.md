# "I need to…" finder — design

Date: 2026-11-10 · Branch: `frontend-wow-factor` · Status: awaiting approval

## Intent

A visitor arrives with a need, not a department name. The finder lets them finish the sentence
"I need to…" and lands them on the right page in two taps. It should feel as crafted as the hero and
the barangay map: one big, calm sentence, not another grid of tiles.

## Goals

- Finish-the-sentence interaction: big "I need to" line, choices underneath, picking one completes the
  sentence and reveals a result card with one button.
- Works with only today's pages; grows by adding one line per intent.
- Honest "not online yet" cards for services that have no page, with Contact as the fallback.
- Fully keyboard and screen-reader usable; English and Filipino; phone first.

## Non-goals

- No free-text search, no AI, no new backend, no new service data (`services.json` stays empty).
- Not a replacement for the Services page or the hero search box.

## Anti-goals

- No gradients; flat colours only. Real Phosphor icons. Minimal sub-text.
- No content repeated from elsewhere on the home page (see Placement).
- Must not send anyone to a dead end: every result has a working button.

## Approaches considered

1. **Sentence builder (chosen by the user).** Fits the site's crafted feel, distinctive, mobile friendly.
2. Icon tile grid — resembles the existing popular-services tiles. Rejected.
3. Type-to-ask box — plain, needs many intents to feel useful. Rejected.

## Design

**Data.** One typed list `INTENTS` in `src/config/finder.ts`. Each intent: `id`, `icon` (Phosphor class),
`key` (translation key for the choice, written to finish the sentence, e.g. "pay my business tax"),
`titleKey` (result card headline), `href` (existing route) or `soon: true`.

Starting intents (my proposal; the user can reword):

| Choice | Goes to |
|---|---|
| pay my business tax | /business-taxes |
| estimate my business tax | /business-taxes/estimator |
| apply for a scholarship | /scholarship |
| read city news | /news |
| see where the budget goes | /budget |
| look up city numbers | /statistics |
| read city ordinances | /legislative |
| find an office or official | /government |
| get a certificate | soon, then /contact |
| ask for senior, PWD or welfare help | soon, then /contact |
| get farming help | soon, then /contact |
| reach City Hall | /contact |

**Behaviour.** The sentence reads "I need to ___". Choices are buttons (radio-like, one selected). On
select the blank fills with the chosen phrase and a result card appears below: icon, headline, one
button ("Go" to the destination, or "Contact City Hall" plus a short "Not online yet" note for `soon`
intents). Selecting another choice swaps the card. Enter or Space selects; focus moves to the result
button so keyboard users go straight on. The result area is a live region.

**Visual.** Flat solid colours from the existing green/gold tokens. The sentence is large display type;
the blank is a gold underline that the phrase writes into. Choices are pill buttons with a small icon.
The result card slides up and fades in (short, transform and opacity only). `prefers-reduced-motion`:
no movement, instant swap.

**Placement.** A new section directly under the hero, replacing the "Popular services" tile band in
`HomeServices` (the finder covers those destinations, so keeping both would repeat content). The
"All services" link moves into the finder section footer. My call; reversible.

**Files.** New: `src/config/finder.ts`, `src/components/home/HomeFinder.tsx`, styles appended to
`src/styles/home.css`, translation keys (en and fil) in `src/i18n/translations.ts`. Modified:
`src/app/page.tsx` (swap `HomeServices` for `HomeFinder`; delete `HomeServices.tsx` if nothing else
imports it). Pure helper `resolveIntent(id)` in `finder.ts` with a `node:test` file.

**Testing.** `node:test` for `finder.ts`: every intent has a unique id, every `href` is an existing
route, every `soon` intent falls back to /contact, every intent has en and fil text (also covered by
the project's i18n check). Visual check at phone and desktop widths in light and dark. `npm run check`
must pass.

## Left to the builder

Exact copy wording in Filipino, icon choice per intent, animation timing, spacing.

## Open items for the user

- Confirm the starting intents and wording.
- Confirm replacing the Popular services tiles (vs keeping both).
