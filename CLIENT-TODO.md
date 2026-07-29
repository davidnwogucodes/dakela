# Outstanding client input — do not launch until these are resolved

Carried over from the design handoff. Each item lists exactly where it is set in code.

| # | Item | Current placeholder | Where to change |
|---|---|---|---|
| 1 | **CAC RC number** — appears twice (credibility strip, contact panel) | `0000000` | `site.rcNumber` in [src/config/site.ts](src/config/site.ts) |
| 2 | **Email address** — assumed, not confirmed | `info@dakelaexports.com` | `site.email` in [src/config/site.ts](src/config/site.ts) |
| 3 | **Office address** | "Add street, city and state" | `site.address` in [src/config/site.ts](src/config/site.ts) — filling in `street` also switches the JSON-LD from country-only to a full `PostalAddress` |
| 4 | **Production domain** — used for canonical URL, Open Graph, sitemap, JSON-LD | `https://dakelaexports.com` | `site.url` in [src/config/site.ts](src/config/site.ts) |
| 5 | **Full-resolution photography** | Browser-drop exports from the prototype | Replace files in [public/assets/](public/assets/) — see the table below |
| 6 | **Per-image alt text and framing** | Descriptive placeholders written during the build | `alt` and `imagePosition` in [src/data/products.ts](src/data/products.ts); `alt` props in `Hero`, `About`, `Markets` |
| 7 | **Destination markets**, if the client wants them named | Not shown | The Markets fact grid (`marketFacts` in [src/data/content.ts](src/data/content.ts)) is the right place. Per the handoff, do **not** add a world map or country list until real destinations are confirmed. |
| 8 | **Real certifications** (NEPC registration, SGS/phytosanitary) once obtained | Not claimed | `credibilityClaims` in [src/data/content.ts](src/data/content.ts), or the Markets fact grid |

## Photography — what to ask the client for

The nine files in `public/assets/` are the prototype's browser-drop exports. Measured
against the frames they fill at the 1240px design width, every one is below what a 2×
display needs — the hero is the worst, and is already being upscaled vertically today.

| File | Supplied | Frame at 1240px | Needed for 2× |
|---|---|---|---|
| `hero-photo.webp` | 746 × 496 | ~590 × 640 | **1180 × 1280** |
| `reach-photo.webp` | 768 × 512 | ~530 × 520 | **1060 × 1040** |
| `about-photo.webp` | 690 × 487 | ~480 × 420 | **960 × 840** |
| `prod-*.webp` (six files) | 528 × 352 or smaller | ~365 × 220 | **730 × 440** |

Ask for the original camera files. `next/image` generates the responsive `srcset` and
AVIF/WebP variants from whatever is in `public/assets/`, so no code changes are needed
once the originals land — but it cannot invent detail that is not in the source.

Also confirm framing per image while you are asking: `imagePosition` in
[src/data/products.ts](src/data/products.ts) is currently `center` for all six cards,
and the three feature photos crop from centre.

## Deliberately not claimed

The copy is factual because the company is new. Do not add certifications, shipment
volumes, years in operation or client logos that do not exist. The JSON-LD is written
the same way: no founding date, no aggregate ratings, and no postal address until a
real one is supplied.

## No contact form

Direct WhatsApp and email contact only, at the client's request. If a form is added
later it must not replace the phone number.
