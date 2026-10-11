# Outstanding client input — do not launch until these are resolved

Carried over from the design handoff. Each item lists exactly where it is set in code.

| # | Item | Current placeholder | Where to change |
|---|---|---|---|
| 1 | ~~CAC RC number~~ — **done** (9113189) | — | Editable at `/admin/company` |
| 2 | ~~Email address~~ — **done** (info@dakela.com.ng) | — | Editable at `/admin/company` |
| 3 | **Office address** — still unconfirmed. While the street is blank the Office row is hidden and no postal address is published as structured data. | Not shown | Editable at `/admin/company` — no developer needed |
| 4 | ~~Production domain~~ — **done** (https://dakela.com.ng) | — | `site.url` in [src/config/site.ts](src/config/site.ts) |
| 5 | **Full-resolution photography** | Browser-drop exports from the prototype | Upload per product at `/admin/products`, or replace the files in [public/assets/](public/assets/) |
| 6 | **Per-image alt text and framing** | Descriptive placeholders written during the build | Per product at `/admin/products` — alt text and crop focus sit beside the photo upload |
| 7 | **Destination markets**, if the client wants them named | Not shown | The Markets fact grid (`marketFacts` in [src/data/content.ts](src/data/content.ts)) is the right place. Per the handoff, do **not** add a world map or country list until real destinations are confirmed. |
| 8 | **Real certifications** (NEPC registration, SGS/phytosanitary) once obtained | Export documents listed as "as applicable" | `/admin/export-info` → Export documentation. Harder claims belong in `credibilityClaims` in [src/data/content.ts](src/data/content.ts) |

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

Also confirm framing per image while you are asking: crop focus is `center` for all six
product cards and the three feature photos. Product framing is set beside the photo
upload at `/admin/products`; the feature photos are still set in code.

## Deliberately not claimed

The copy is factual because the company is new. Do not add certifications, shipment
volumes, years in operation or client logos that do not exist. The JSON-LD is written
the same way: no founding date, no aggregate ratings, and no postal address until a
real one is supplied.

## No contact form

Direct WhatsApp and email contact only, at the client's request. If a form is added
later it must not replace the phone number.
