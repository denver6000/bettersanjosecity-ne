# Site copy review: capital letters, wording, Tagalog

Date: 2026-11-11. Source: `src/i18n/translations.ts` (English and Filipino). Nothing has been changed yet; this is a list of proposed edits for the owner to approve.

## 1. Capital letters

### English: headings mix two styles

Some headings use sentence case (only the first word is capitalised), others use Title Case. Both appear on the same page.

| Sentence case (home page)   | Title Case (inner pages, footer, buttons)       |
| --------------------------- | ----------------------------------------------- |
| Explore your barangay       | Contact & Hotlines                              |
| Check your scholarship      | City Services                                   |
| San Jose in numbers         | Frequently Asked Questions                      |
| Weather right now           | Business Taxes and Fees                         |
| Latest news                 | Quick Links, Terms of Use, Privacy Policy       |
| City leadership             | Find a Service, Go to Homepage, Browse Services |
| Service details coming soon | Elected Officials, City Departments             |

Recommendation: use sentence case everywhere, keeping proper nouns capitalised (City Hall, City Mayor, Sangguniang Panlungsod, Better San Jose, PSA, Treasurer's Office). It is easier to read, matches the home page and the finder, and is the modern government-site convention. This touches about 60 English strings: every `pg-*-title`, `*-t` card title, `foot-*`, `home-quick-links`, `home-terms-of-use`, `home-privacy-policy`, `err-*` and button labels.

### Filipino: Title Case is not how Tagalog is normally written

"Mga Madalas Itanong", "Mga Mabilisang Link", "Mga Tuntunin ng Paggamit", "Mga Hotline sa Emerhensiya" and similar are capitalised word by word, which is an English habit. Use sentence case ("Mga madalas itanong", "Mga tuntunin ng paggamit"). Same rule as English, so the two languages stay in step.

### Strings that start lowercase on purpose (leave as they are)

These are fragments that sit inside a sentence or label, so the lowercase is correct: `finder-*` choices (they finish "I need to…"), `scholar-req-missing`, `scholar-req-submitted`, `wx-from`, `wx-latest-reading`, `wx-past-hour`, `bt-printed-as`, `bt-and-above`, `home-map-radius`, `map-radius-label`. No capital needed.

### Strings that should start with a capital

- `finder-soon` (Filipino): fine, starts with a capital.
- No standalone sentence was found starting with a lowercase letter. The only change needed is the heading consistency above.

## 2. English wording worth changing

| Key                                       | Now                                                                | Suggested                                                                                | Why                                                              |
| ----------------------------------------- | ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `home-barangays-sub`                      | Tap an area to zoom in.                                            | Select an area to zoom in.                                                               | Desktop users click, not tap.                                    |
| `accessibility-statement-being-drafted-d` | Better San Jose targets WCAG 2.1 AA.                               | Better San Jose aims to meet WCAG 2.1 AA.                                                | "Targets" reads as jargon.                                       |
| `foot-cost`                               | Cost to the People of San Jose =                                   | Needs an owner decision                                                                  | Unclear what it means; the "=" has nothing after it in the text. |
| `footer-tagline`                          | Empowering the people of San Jose City with transparent access to… | Clear access to the services, programs and public funds of the San Jose City government. | Marketing wording; the plain version says the same.              |
| `bt-chip-no-retire`                       | Not on retirement                                                  | Retirement not covered                                                                   | Unclear.                                                         |
| `wx-depositing-rime-fog`                  | Depositing rime fog                                                | Foggy, with frost                                                                        | Rime frost does not occur in Nueva Ecija; rarely shown.          |

## 3. Tagalog: wrong meaning or reads wrongly

These are the ones a Filipino reader would notice first.

| Key                                                                                                                           | Now                                             | Problem                                                                                                      | Suggested                                                                        |
| ----------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------- |
| `wx-latest-reading`, `wx-readings`, `sd-latest-reading`                                                                       | pinakabagong **basa**, Mga **basa** ng istasyon | "Basa" alone means **wet**. "Reading" needs "sukat" (measurement).                                           | Pinakabagong sukat, Mga sukat ng istasyon                                        |
| `foot-estimator`, `pg-estimator-*`, `bt-tab-estimator`, `bt-callout-title`, `est-about-title`, `est-fine`, `est-s-notcharged` | **Taya** ng Buwis, Tayahin, Tinatayang          | "Taya" on its own means a **bet or wager**. The site also mixes Taya, Tantiya and Tayahin for the same idea. | Use one word: **Tantiya** (Tantiya ng buwis sa negosyo, Tantiyahin, Tinatantiya) |
| `finder-soon`                                                                                                                 | Wala pa online.                                 | Missing "ito"; sounds clipped.                                                                               | Wala pa ito online. Matutulungan ka ng City Hall.                                |
| `statistics-demographics-d`                                                                                                   | antas ng paglaki                                | "Antas" means level, not rate.                                                                               | bilis ng paglaki                                                                 |
| `hero-line-1`, `hero-line-2`                                                                                                  | Iyong lungsod. Iyong serbisyo.                  | "Iyong" at the start of a line reads like "that city".                                                       | Lungsod mo. Serbisyo mo. Mas pinadali.                                           |
| `wx-slight-rain`, `wx-light-drizzle`                                                                                          | Bahagyang ulan, Bahagyang ambon                 | "Bahagyang" is "slightly"; weather reports say "mahina".                                                     | Mahinang ulan, Mahinang ambon                                                    |
| `wx-rain-showers`                                                                                                             | Pag-ulan                                        | That is just "raining".                                                                                      | Pabugso-bugsong ulan                                                             |
| `err-403-t`                                                                                                                   | Hindi Pinahintulutan                            | Stiff.                                                                                                       | Walang pahintulot                                                                |

## 4. Tagalog: correct but too literal or too formal

| Key                                                                         | Now                                                                   | Suggested                                                                                               | Note                                                                                               |
| --------------------------------------------------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `nav-home`, `breadcrumb-home`                                               | Tahanan                                                               | Home                                                                                                    | "Tahanan" means a residence. Also `err-home` already says "Homepage", so it is inconsistent today. |
| `footer-tagline`                                                            | Pinapalakas ang mga mamamayan… sa pamamagitan ng malinaw na access    | Para sa mga taga-San Jose: malinaw na access sa mga serbisyo, programa at pondo ng pamahalaang lungsod. | Direct translation of "Empowering".                                                                |
| `topstrip-disclaimer`                                                       | Independiyenteng civic site · hindi ito ang opisyal na website ng LGU | Hindi opisyal na website ng LGU. Gawa ng mga mamamayan.                                                 | Half English, half Tagalog.                                                                        |
| `home-quick-links`                                                          | Mga Mabilisang Link                                                   | Mabilis na link                                                                                         |                                                                                                    |
| `home-resources`                                                            | Mga Mapagkukunan                                                      | Mga sanggunian                                                                                          | "Mapagkukunan" is "source of supply".                                                              |
| `home-barangays-sub`                                                        | Pindutin ang lugar para mag-zoom in.                                  | Pindutin ang isang lugar para palakihin.                                                                |                                                                                                    |
| `bm-note`                                                                   | Indikatibo lamang ang mga hangganan.                                  | Tinatayang hangganan lamang ang mga ito.                                                                | "Indikatibo" is a loanword.                                                                        |
| `home-city-mayor`, `home-city-vice-mayor`, `government-elected-officials-d` | Punong Lungsod, Pangalawang Punong Lungsod                            | Alkalde, Bise Alkalde                                                                                   | What people actually say. Optional; the current form is formally correct.                          |
| `home-news-empty-title`                                                     | Wala pang mga update                                                  | Wala pang bagong balita                                                                                 |                                                                                                    |
| `wx-ago-min`, `wx-ago-hr`, `wx-ago-day(s)`                                  | {n} min na ang nakaraan                                               | {n} min ang nakalipas                                                                                   |                                                                                                    |
| `wx-updated`                                                                | Na-update {ago}                                                       | Huling na-update {ago}                                                                                  |                                                                                                    |
| `wx-loading`                                                                | Nilo-load ang datos ng panahon                                        | Kinukuha ang datos ng panahon                                                                           |                                                                                                    |
| `wx-unavailable-text`                                                       | Hindi available ngayon ang datos ng panahon.                          | Hindi makuha ngayon ang datos ng panahon.                                                               |                                                                                                    |
| `sd-elevation`                                                              | Taas                                                                  | Taas mula sa dagat                                                                                      |                                                                                                    |
| `err-404-d`                                                                 | …bumalik muli maya-maya.                                              | …bumalik na lang mamaya.                                                                                |                                                                                                    |
| `accessibility-*`                                                           | isang website na naaabot ng lahat                                     | website na magagamit ng lahat                                                                           |                                                                                                    |
| `accessibility-statement-being-drafted-d`                                   | Layunin ng Better San Jose ang WCAG 2.1 AA.                           | Layunin ng Better San Jose na matugunan ang WCAG 2.1 AA.                                                |                                                                                                    |
| `svc-certificates-d`                                                        | Mga talaan ng kapanganakan, kasal at kamatayan                        | Sertipiko ng kapanganakan, kasal at kamatayan                                                           | The service is the certificate, not the record.                                                    |
| `finder-certificate`                                                        | kumuha ng sertipiko                                                   | kumuha ng certificate                                                                                   | "Sertipiko" is rarely spoken. Choice for the owner.                                                |
| `svc-public-safety-d`                                                       | Pagbabawas ng panganib sa sakuna…                                     | Paghahanda sa sakuna, at kapayapaan at kaayusan                                                         |                                                                                                    |
| `svc-health-d`                                                              | Tanggapang pangkalusugan ng lungsod at mga programa                   | Tanggapang pangkalusugan at mga programa ng lungsod                                                     |                                                                                                    |
| `budget-infrastructure-projects-d`                                          | kasalukuyan at natapos na pampublikong proyekto                       | ginagawa at natapos na proyekto                                                                         |                                                                                                    |
| `bt-g-fromto-d`                                                             | Ang saklaw na dapat kasama ang kabuuang benta                         | Ang saklaw kung saan dapat pumasok ang kabuuang benta                                                   |                                                                                                    |
| `bt-chip-no-retire`                                                         | Hindi sa retirement                                                   | Hindi sakop ang retirement                                                                              |                                                                                                    |
| `est-showing`                                                               | …Magdagdag ng salita para paliitin.                                   | …Magdagdag ng salita para paikliin ang resulta.                                                         |                                                                                                    |
| `est-pending-*`                                                             | {n} aytem                                                             | {n} item                                                                                                | "Aytem" is an odd spelling.                                                                        |
| `est-about-4`                                                               | Walang lumalabas sa browser mo ng anumang tina-type mo.               | Walang ipinapadala palabas ng browser mo sa anumang tina-type mo.                                       | Word order is hard to follow.                                                                      |
| `sch-upd-value`                                                             | Tamang halaga                                                         | Tamang detalye                                                                                          | "Halaga" means price or value.                                                                     |
| `sch-year-level`                                                            | Taon {n}                                                              | Ika-{n} taon                                                                                            |                                                                                                    |
| `est-qp-agri`                                                               | Gamit pang-agrikultura                                                | Gamit sa pagsasaka                                                                                      |                                                                                                    |
| `est-qp-sari`                                                               | Tindahang sari-sari                                                   | Sari-sari store                                                                                         |                                                                                                    |

## 5. Tagalog: spelling and consistency

- "Tulong-pinansyal" and "anunsyo" use the "-sy-" spelling, while "pinansiya", "lisensiya", "porsiyento" and "emerhensiya" use "-siy-". Pick the KWF form: pinansiyal, anunsiyo.
- "Lungsod ng San Jose" and "San Jose City" both appear in the same strings. Pick one.
- "Kwalipikado" is used throughout; fine, keep it consistent.
- Mixed English terms (payout, requirements, scholarship, update, contact details) are normal Taglish for this audience. Keep them for payout, scholarship and requirements, but "contact details" could be "paraan ng pakikipag-ugnayan".

## 6. Suggested order of work

1. Fix the meaning errors in section 3 (about 15 strings, 10 minutes).
2. Choose one word for the estimator (Tantiya) and update every use.
3. Decide sentence case vs Title Case and apply it in both languages (about 60 strings).
4. Apply the wording changes in sections 2, 4 and 5 that the owner agrees with.
5. Ask a native Filipino speaker or someone at City Hall to read the final Tagalog once.

All edits stay inside `src/i18n/translations.ts` (plus the components that pass a hard-coded English child to `T`). `npm run check` verifies key parity after the change.
