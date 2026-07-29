# Handoff: Dakela Exports Nigeria Limited — marketing website

## Overview

A single-page marketing website for **Dakela Exports Nig. Ltd.**, a Nigerian exporter of
agricultural commodities. The site's job is to convince international buyers (commodity
importers, trading houses, food & beverage manufacturers) that Dakela is a credible,
professional trade partner, and to get them to make contact — **primary action is WhatsApp**,
secondary is email.

The brand did not exist before this design: the logo mark, colour palette, typography and
tone of voice in this bundle were created from scratch and should be treated as the brand
system going forward.

Audience, in priority order:
1. Foreign commodity importers / trading houses
2. Food & beverage manufacturers sourcing raw inputs
3. Investors / partners
4. Local Nigerian suppliers wanting to sell into Dakela's network (dedicated section)

## About the design files

The files in this bundle are **design references authored in HTML** — a prototype showing
intended look, content and behaviour. **They are not production code to copy directly.**

The task is to **recreate this design in the target codebase's environment** using its
established patterns, component library and build tooling. If no codebase exists yet
(likely — this is a new site), choose an appropriate stack. For a brochure site of this
kind, a static-site generator or a React/Next.js app with a small CMS for the product
list is a sensible default. Priorities for the real build, in order:

1. **Static, fast, cheap to host.** Buyers will open this on slow mobile connections in
   many markets. Server-render or pre-render; no client-side data fetching required.
2. **SEO.** This site's main acquisition channel is buyers searching for e.g. "Nigeria
   sesame seed exporter". Real `<h1>`/`<h2>` hierarchy, meta description, Open Graph tags,
   `Organization` + `LocalBusiness` JSON-LD schema, per-commodity anchor headings.
3. **Responsive down to 360px.** The prototype is desktop-first; see *Responsive behaviour*.
4. **Accessibility.** Colour contrast is already compliant; keep focus states visible.

`support.js` and `image-slot.js` are runtime helpers for the prototyping environment.
**Do not port them.** In particular, `<image-slot>` is a drag-and-drop placeholder
component used during design — replace every instance with a normal responsive `<img>`
(or the framework's image component) pointing at the corresponding file in `assets/`.

## Fidelity

**High-fidelity.** Colours, typography, spacing and copy are final and should be
reproduced faithfully. Exact values are in *Design tokens* and per-section notes below.
Layout structure (grid ratios, section rhythm) should also be matched. The developer may
deviate where responsive behaviour demands it, and should improve on the prototype's
mobile handling, which is deliberately unspecified beyond guidance below.

---

## Brand system

### Logo

Wordmark plus abstract mark. **No illustration, no photographic logo, no gradients.**

- **Mark:** a leaf/seed silhouette drawn as two mirrored arcs meeting at a point top and
  bottom, with a vertical centre stem and two short diagonal strokes branching off it
  (suggesting growth and trade routing). Drawn on a 32×32 grid, `stroke-width: 1.6`,
  no fill except an 18%-opacity ochre wash inside the leaf. Rendered at 26×26 in the
  header, 20×20 in the footer (footer version drops the ochre strokes and wash, using
  a single muted colour).
  SVG source is in the design file — copy the paths verbatim:
  - Leaf: `M16 2.5C23.2 10 23.2 22 16 29.5C8.8 22 8.8 10 16 2.5Z`
  - Stem: `M16 7.5V24.5`
  - Branches: `M16 14.5L21 11` and `M16 19.5L11 16`
- **Wordmark:** `DAKELA` — Spectral 600, 18px, `letter-spacing: 0.14em`, uppercase.
- **Descriptor:** `EXPORTS NIGERIA LTD` — Archivo 500, 9px, `letter-spacing: 0.22em`,
  uppercase, colour `#6B7570`, sits 4px below the wordmark, left-aligned to it.
- **Lockup:** mark and text block side by side, `gap: 12px`, vertically centred.
- **Clear space:** minimum equal to the cap-height of the wordmark on all sides.
- Produce a favicon and a 512px app icon from the mark alone on `#0F1D18`.

### Voice

Understated, specific, institutional. Trade vocabulary used correctly (FOB/CFR/CIF,
MOQ, moisture, FFA, phytosanitary, NXP, FCL/LCL). No exclamation marks, no "leading
provider" filler, no emoji. Claims are kept factual because the company is new — **do
not add certifications, volumes, years-in-operation or client logos that don't exist.**

---

## Design tokens

### Colour

| Token | Hex | Use |
|---|---|---|
| `ink` | `#0F1D18` | Dark section backgrounds (hero, process, contact), primary text on light |
| `ink-deep` | `#0B1613` | Footer background |
| `ink-line` | `#22342C` | Hairlines and grid dividers on dark |
| `ink-border` | `#3A4B44` | Secondary button border on dark |
| `paper` | `#F5F2EC` | Page background, text on dark |
| `paper-alt` | `#EFEBE1` | Alternate band background (credibility strip, Markets section) |
| `white` | `#FFFFFF` | Products section background |
| `line` | `#DED7C9` | Borders / dividers on paper |
| `line-warm` | `#E4DED1` | Borders inside the Products section (on white) |
| `accent` | `#B07C2E` | Ochre. Primary button fill, rules, logo wash, mark branches |
| `accent-light` | `#C9A063` | Accent on dark backgrounds (eyebrows, numerals), primary button hover |
| `accent-deep` | `#8C5E1A` | Eyebrow labels on paper, default link colour |
| `text` | `#0F1D18` | Headings on paper |
| `text-body` | `#3D4A44` | Body copy on paper |
| `text-muted` | `#5C6660` | Secondary body copy on paper |
| `text-quiet` | `#6B7570` | Small caps labels on paper |
| `text-quiet-warm` | `#8C7C60` | Small caps labels inside bordered cards on paper |
| `text-on-dark` | `#B8C4BD` | Body copy on ink |
| `text-muted-dark` | `#98A6A0` | Small body copy on ink |
| `text-quiet-dark` | `#7E8C86` | Labels on ink, footer text |
| `nav-link` | `#37453F` | Header nav links |

Only these colours. Two background families (ink, paper) plus white for the Products
band. No gradients anywhere. `::selection` is `#B07C2E` on `#FFFFFF`.

### Typography

Two families, both Google Fonts:

- **Spectral** (serif) — display. Weights 300/400/500/600, italic 300/400 available.
  Used for: h1/h2 (400), product h3 (500), wordmark (600), card titles (600),
  step numerals (400), fact values (400), contact phone/email (400).
  Fallback stack: `Spectral, Georgia, serif`.
- **Archivo** (grotesque) — UI and body. Weights 400/500/600/700.
  Used for: body copy (400), buttons/nav/labels (500–600), eyebrows (600).
  Fallback stack: `Archivo, system-ui, sans-serif`.

Scale as used:

| Role | Family | Size | Weight | Line-height | Letter-spacing |
|---|---|---|---|---|---|
| Hero h1 | Spectral | `clamp(42px, 4.6vw, 68px)` | 400 | 1.06 | -0.02em |
| Contact h2 | Spectral | `clamp(34px, 3.6vw, 52px)` | 400 | 1.1 | -0.02em |
| Section h2 | Spectral | `clamp(32px, 3.2vw, 46px)` | 400 | 1.14 | -0.015em |
| Suppliers h2 | Spectral | `clamp(28px, 2.6vw, 38px)` | 400 | 1.16 | -0.015em |
| Product h3 | Spectral | 22px | 500 | default | default |
| Contact phone | Spectral | 22px | 400 | — | — |
| Fact value | Spectral | 17px | 400 | — | — |
| Card title | Spectral | 15px | 600 | — | — |
| Step numeral | Spectral | 13px | 400 | — | 0.1em |
| Hero body | Archivo | 17px | 400 | 1.65 | — |
| About body | Archivo | 17px | 400 | 1.7 | — |
| Section body | Archivo | 16.5px | 400 | 1.7 | — |
| Intro body | Archivo | 15px | 400 | 1.65 | — |
| Product body | Archivo | 14.5px | 400 | 1.65 | — |
| Button / nav CTA | Archivo | 14px | 600 | — | 0.02em |
| Nav link | Archivo | 13px | 500 | — | 0.04em |
| Small body | Archivo | 13.5px | 400 | 1.6 | — |
| Step title | Archivo | 15px | 600 | — | 0.01em |
| Commodity chip | Archivo | 12px | 400 | — | 0.02em |
| Footer text | Archivo | 12px | 400 | — | 0.04em |
| Eyebrow | Archivo | 11px | 600 | — | 0.2em, uppercase |
| Strip label | Archivo | 11px | 600 | — | 0.18em, uppercase |
| Card label | Archivo | 10px | 600 | — | 0.18em, uppercase |
| Logo descriptor | Archivo | 9px | 500 | — | 0.22em, uppercase |

Headings and long paragraphs use `text-wrap: pretty`. Body paragraphs are measure-capped
with `max-width` in `ch` units (values noted per section) — keep that, don't switch to px.

### Layout & spacing

- Content container: `max-width: 1240px`, `margin: 0 auto`, `padding: 0 40px`.
- Header height: `76px`, sticky, `z-index: 50`.
- Standard section vertical padding: `120px 0`. Suppliers section: `110px 0`.
  Contact: `120px 0 100px`. Credibility strip: `22px 0`. Footer: `32px 0`.
- Spacing steps in use: 4, 6, 8, 10, 12, 14, 16, 20, 22, 24, 26, 28, 32, 36, 40, 44,
  48, 56, 64, 72, 88, 96, 100, 110, 120 px. Treat 4px as the base unit.
- **Border radius: `0` everywhere.** Nothing is rounded. This is load-bearing for the
  institutional feel — do not soften it.
- **Shadows: none**, with one exception: the floating WhatsApp button uses
  `0 12px 32px rgba(15,29,24,0.28)`.
- Card grids are built as **1px hairline grids**: a wrapper with
  `background: <line>; border: 1px solid <line>; display: grid; gap: 1px`, and each cell
  filled with the section background colour. Reproduce this rather than per-cell borders.
- Transitions: none specified in the prototype. Add `transition: color .15s ease,
  background-color .15s ease, border-color .15s ease` to interactive elements.

---

## Screens / views

One page, nine bands in this order. `data-screen-label` in the design file marks the
major ones. Section ids: `#top`, `#about`, `#products`, `#process`, `#reach`,
`#suppliers`, `#contact`.

### 1. Header (sticky)

- **Purpose:** persistent navigation and quote CTA.
- **Layout:** sticky top, `background: rgba(245,242,236,0.92)`,
  `backdrop-filter: blur(10px)`, `border-bottom: 1px solid #DED7C9`. Inner row is the
  1240px container, `height: 76px`, flex, `space-between`, `gap: 32px`.
- **Left:** logo lockup (see *Brand system*), links to `#top`.
- **Right:** nav — flex, `gap: 30px`, links **About / Products / Process / Markets /
  Suppliers** (13px, `#37453F`, hover `#0F1D18`, `white-space: nowrap`), then the CTA
  **Request a quote** — 14px/600, `color: #F5F2EC`, `background: #0F1D18`,
  `border: 1px solid #0F1D18`, `padding: 11px 20px`, hover `background: #1B3229`,
  `white-space: nowrap`, `flex-shrink: 0`. Links to the WhatsApp URL.
- All internal nav uses smooth scrolling (`html { scroll-behavior: smooth }`); offset
  anchor targets by the 76px header height (`scroll-margin-top: 76px`) in the real build.

### 2. Hero — `#top`

- **Purpose:** state what the company sells and to whom; drive first contact.
- **Layout:** `background: #0F1D18`, `color: #F5F2EC`. Container grid
  `1.05fr 0.95fr`, `gap: 72px`, `align-items: center`, `min-height: 640px`.
  Both columns need `min-width: 0`.
- **Left column** (`padding: 96px 0`):
  - Eyebrow row: 28×1px `#B07C2E` rule + `gap: 12px` +
    `AGRICULTURAL COMMODITY EXPORTER · NIGERIA` in `#C9A063`. Margin-bottom 32px.
  - **h1:** "Nigerian agricultural commodities, delivered to specification."
    Margin-bottom 28px.
  - **Body:** "Dakela Exports Nig. Ltd. supplies international markets with sesame,
    cocoa, cashew, hibiscus, palm and cassava products — sourced through verified
    suppliers and inspected before every shipment." `color: #B8C4BD`, `max-width: 52ch`,
    margin-bottom 40px.
  - **Buttons** (flex, `gap: 14px`, wrap):
    1. Primary — WhatsApp glyph + "WhatsApp: +234 916 269 4790".
       `background: #B07C2E`, `color: #0F1D18`, `padding: 16px 26px`,
       hover `background: #C9A063`, `white-space: nowrap`.
       `href="https://wa.me/2349162694790"`, `target="_blank" rel="noopener"`.
    2. Secondary — "Email the trade desk". Transparent, `border: 1px solid #3A4B44`,
       `color: #F5F2EC`, same padding, hover `border-color: #B8C4BD; color: #FFFFFF`.
       `href="mailto:…"`.
- **Right column:** `width: 100%`, `height: 640px`, `overflow: hidden`,
  `border-left: 1px solid #22342C`, `min-width: 0`, image `object-fit: cover`.
  → `assets/hero-photo.webp`
- The WhatsApp glyph is an inline SVG (24×24 viewBox, `fill: currentColor`) — path is in
  the design file, reused in three places. Extract it as a single icon component.

### 3. Credibility strip

- **Layout:** `background: #EFEBE1`, `border-bottom: 1px solid #DED7C9`, container
  `padding: 22px 40px`, flex, `space-between`, `gap: 40px`, wrap.
- **Four labels** (11px/600, 0.18em, uppercase, `#6B7570`):
  `Registered in Nigeria · CAC RC 0000000` **(placeholder — insert the real RC number)**,
  `Verified supplier network`, `Pre-shipment quality inspection`,
  `Full export documentation`.

### 4. About — `#about`

- **Purpose:** company description and values.
- **Layout:** `padding: 120px 0` on paper. Grid `0.9fr 1.1fr`, `gap: 88px`,
  `align-items: start`. Both columns `min-width: 0`.
- **Left:** `position: sticky; top: 116px`. Eyebrow `01 — WHO WE ARE` (`#8C5E1A`,
  margin-bottom 24px), then a `height: 420px` framed image
  (`border: 1px solid #DED7C9`, `overflow: hidden`). → `assets/about-photo.webp`
- **Right:**
  - **h2:** "A dependable trade partner between Nigeria's farms and the world's buyers."
  - Two paragraphs (17px/1.7, `#3D4A44`, `max-width: 62ch`) — the company's own
    boilerplate; text is in the design file, reproduce verbatim. Second paragraph
    margin-bottom 48px.
  - **Values grid:** 3 columns, hairline grid (`#DED7C9`), cells `background: #F5F2EC`,
    `padding: 28px 24px`. Titles **Reliability / Quality / Integrity** (Spectral 15/600,
    margin-bottom 10px) with a 13.5px `#5C6660` sentence each.

### 5. Products — `#products`

- **Purpose:** show the six commodity groups and their SKUs.
- **Layout:** `background: #FFFFFF`, hairline top and bottom borders (`#DED7C9`),
  `padding: 120px 0`.
- **Header row:** flex, `align-items: end`, `space-between`, `gap: 48px`, wrap,
  margin-bottom 56px. Left: eyebrow `02 — WHAT WE EXPORT` + h2 "Six commodity groups,
  sourced to buyer specification." (`max-width: 22ch`). Right: 15px `#5C6660` paragraph
  about grades/MOQ (`max-width: 34ch`).
- **Card grid:** 3 columns, `gap: 40px 32px`. Cards are `min-width: 0`, flex column,
  no border, no background.
  - Image frame: `height: 220px`, `border: 1px solid #E4DED1`, `overflow: hidden`,
    image `object-fit: cover`.
  - h3 (Spectral 22/500): `margin: 22px 0 10px`.
  - Description: 14.5px/1.65 `#5C6660`, margin-bottom 18px.
  - Chip list: `margin-top: auto`, `border-top: 1px solid #E4DED1`, `padding-top: 16px`,
    flex wrap, `gap: 8px`. Chips are `<li>`: 12px, `color: #37453F`,
    `background: #F5F2EC`, `padding: 6px 10px`, square corners. Semantic `<ul>` with
    `list-style: none`.
  - `margin-top: auto` on the chip list is what bottom-aligns chips across a row —
    keep it so uneven description lengths don't break the rhythm.

The six cards, in order, with their chips and asset:

| # | Title | Description | Chips | Asset |
|---|---|---|---|---|
| 1 | Spices & Herbs | Sun-dried and cleaned aromatics from northern Nigeria, sorted for colour, aroma and low foreign matter. | Hibiscus Flowers, Ginger, Turmeric, Garlic, Chili Pepper | `assets/prod-spices.webp` |
| 2 | Oilseeds & Grains | Bulk staples for crushing and milling, cleaned to agreed purity and moisture before bagging. | Sesame Seeds, Soybeans, Sorghum, Millet, Maize | `assets/prod-oilseeds.webp` |
| 3 | Nuts & Oil Crops | Raw cashew, shea and groundnut lots sized and graded for processors and kernel buyers. | Cashew Nuts, Shea Nuts, Groundnuts | `assets/prod-nuts.webp` |
| 4 | Cocoa Products | Fermented beans and processed derivatives from the south-west belt, for confectionery and beverage manufacturers. | Cocoa Beans, Cocoa Powder, Cocoa Butter, Cocoa Cake | `assets/prod-cocoa.webp` |
| 5 | Palm Products | Crude and kernel oils in drums or flexitanks, with free fatty acid levels confirmed before loading. | Crude Palm Oil, Palm Kernel Oil, Palm Kernel | `assets/prod-palm.webp` |
| 6 | Cassava Products | Flour, starch, garri and high-quality cassava flour milled for food and industrial use. | Cassava Flour, Garri, Cassava Starch, HQCF | `assets/prod-cassava.webp` |

**Recommendation for the real build:** drive this grid from structured data (JSON, MDX
or CMS collection) — `{ slug, title, description, image, commodities[] }`. The client will
add commodities over time, and per-commodity landing pages
(`/products/sesame-seeds`) are the highest-value SEO expansion. The prototype's flat
markup is a design reference, not a data model.

### 6. Process — `#process`

- **Purpose:** show that Dakela handles the whole procurement chain.
- **Layout:** `background: #0F1D18`, `color: #F5F2EC`, `padding: 120px 0`.
- **Intro** (`max-width: 760px`, margin-bottom 64px): eyebrow `03 — HOW WE WORK`
  (`#C9A063`), h2 "One point of contact, from enquiry to bill of lading.", then 16.5px
  `#B8C4BD` paragraph (`max-width: 58ch`).
- **Steps:** 5-column hairline grid, divider colour `#22342C`, cells `background: #0F1D18`,
  `padding: 36px 26px 40px`. Each cell: Spectral numeral `01`–`05` in `#C9A063`
  (`margin-bottom: 44px` — this generous gap is deliberate), Archivo 15/600 title,
  13.5px `#98A6A0` body.
- Steps: **Sourcing / Quality inspection / Packaging / Documentation / Shipment** —
  copy in the design file.

### 7. Markets — `#reach`

- **Layout:** `background: #EFEBE1`, `padding: 120px 0`. Grid `1fr 1fr`, `gap: 88px`,
  `align-items: center`. Both columns `min-width: 0`.
- **Left:** eyebrow `04 — MARKETS`, h2 "Shipping worldwide from Nigerian ports.",
  paragraph (`max-width: 52ch`, margin-bottom 36px) covering Incoterms and load ports,
  then a 2×2 hairline fact grid (`max-width: 460px`, cells `#F5F2EC`,
  `padding: 22px 24px`): label 10px/0.18em `#8C7C60` + Spectral 17px value.
  - Incoterms → `FOB · CFR · CIF`
  - Load ports → `Lagos · Onne`
  - Shipment → `FCL · LCL · Bulk`
  - Enquiry reply → `Within 24 hours`
- **Right:** `height: 520px` framed image (`border: 1px solid #DED7C9`,
  `overflow: hidden`). → `assets/reach-photo.webp`
- The client exports globally and did not name specific destination markets. **Do not add
  a world map or country list** until real destinations are confirmed; if they are, the
  fact grid is the right place to extend.

### 8. Suppliers — `#suppliers`

- **Purpose:** recruit Nigerian aggregators, processors and cooperatives.
- **Layout:** `background: #F5F2EC`, `border-top: 1px solid #DED7C9`, `padding: 110px 0`.
  Grid `0.85fr 1.15fr`, `gap: 88px`, `align-items: start`, both `min-width: 0`.
- **Left:** eyebrow `05 — FOR LOCAL SUPPLIERS` + h2 "Selling into our network".
- **Right:** intro paragraph (`max-width: 60ch`, margin-bottom 32px); two side-by-side
  blocks (flex, `gap: 40px`, wrap, each `min-width: 180px`, `border-top: 1px solid
  #DED7C9`, `padding-top: 14px`) titled **What we look for** / **What you get**; then a
  text link "Send your supply details on WhatsApp →" — 14px/600 `#0F1D18` with
  `border-bottom: 1px solid #B07C2E`, `padding-bottom: 4px`, hover `color: #8C5E1A`.
- This whole section is behind a toggle in the prototype (`showSuppliers`). Keep it
  removable — one config flag or a CMS boolean, not a code edit.

### 9. Contact — `#contact`

- **Layout:** `background: #0F1D18`, `color: #F5F2EC`, `padding: 120px 0 100px`.
  Grid `1.1fr 0.9fr`, `gap: 88px`, `align-items: start`, both `min-width: 0`.
- **Left:** eyebrow `06 — CONTACT`, h2 "Send us your specification and destination port.",
  paragraph (`max-width: 50ch`, margin-bottom 40px) listing what to include, then the two
  buttons (same styling as the hero pair): "Chat on WhatsApp" (primary, with glyph) and
  the email address (secondary).
- **Right — details panel:** `border: 1px solid #22342C`, four stacked rows separated by
  `border-bottom: 1px solid #22342C` (last row has none), each `padding: 26px 28px`.
  Row = 10px/0.18em uppercase label in `#7E8C86` (margin-bottom 10px) + value.
  1. Telephone / WhatsApp → `+234 916 269 4790`, Spectral 22px, `href="tel:+2349162694790"`,
     hover `#C9A063`
  2. Email → `info@dakelaexports.com`, Spectral 18px, `mailto:` **(placeholder domain)**
  3. Office → "Add street, city and state / Nigeria" **(placeholder)**
  4. Registration → `CAC RC 0000000` **(placeholder)**
- There is deliberately **no contact form** — the client asked for direct WhatsApp/email
  contact. If a form is added later, it must not replace the phone number.

### 10. Footer

- `background: #0B1613`, `color: #7E8C86`, `border-top: 1px solid #22342C`,
  `padding: 32px 40px` inside the container. Flex, `space-between`, `gap: 32px`, wrap.
- Left: 20×20 monochrome mark (`#7E8C86`, leaf + stem only) + "Dakela Exports Nigeria
  Limited". Centre: "Agricultural commodity exports · Nigeria".
  Right: "© 2026 Dakela Exports Nig. Ltd." — make the year dynamic.

### 11. Floating WhatsApp button

- `position: fixed; bottom: 24px; right: 24px; z-index: 60`.
- `background: #0F1D18`, `color: #F5F2EC`, `border: 1px solid #B07C2E`,
  `padding: 14px 20px`, 13px/600, `box-shadow: 0 12px 32px rgba(15,29,24,0.28)`,
  hover `background: #1B3229`. Ochre (`#B07C2E`) WhatsApp glyph + label "Enquire now".
- Toggleable in the prototype (`showStickyBar`). On mobile, keep it but shrink to an
  icon-only square with a minimum 44×44 hit area; make sure it never covers the footer
  links or the contact panel.

---

## Interactions & behaviour

- **Navigation:** in-page anchor scrolling only, smooth, with 76px scroll offset.
  Consider highlighting the active section in the nav on scroll (not in the prototype).
- **Hover states:** listed per component above. All are colour/background/border changes
  only — no transforms, no scaling, no lifting.
- **Outbound links:** all WhatsApp links use `https://wa.me/2349162694790`,
  `target="_blank"`, `rel="noopener"`. Phone uses `tel:+2349162694790`.
- **No animations** in the prototype. If any are added, keep them to short opacity/
  translate reveals on scroll (≤300ms) and respect `prefers-reduced-motion`.
- **No loading, error, empty or validation states** — the site has no forms or data
  fetching.

### Responsive behaviour

The prototype is authored desktop-first at 1240px content width and is not fully
responsive; the developer owns this. Intended adaptation:

- **≥1240px:** as designed.
- **1024–1239px:** container padding 32px; Products grid to 3 columns still; Process
  grid to 3 + 2 wrap or a horizontal scroll rail.
- **768–1023px:** all two-column grids collapse to one column (hero text above image,
  hero image `height: 420px`); Products grid to 2 columns; Process grid to 2 columns;
  About sticky column becomes static; section padding 88px; nav collapses to a hamburger
  with the "Request a quote" CTA staying visible outside the menu.
- **<768px:** single column everywhere; container padding 20px; section padding 64px;
  hero h1 at the 42px floor; hero image `height: 300px`; values/fact/step grids stack;
  Products chips remain wrapped; floating button becomes icon-only.
- Every image should be responsive (`width: 100%`, `height: 100%`, `object-fit: cover`)
  inside a fixed-height frame; frames get shorter at each breakdown.
- All grid children carrying images must have `min-width: 0`, or `1fr` tracks blow out.

## State management

Effectively none — this is a static brochure page. The only stateful things:

- Mobile nav open/closed (below 1024px).
- Optional scroll-spy for the active nav link.
- Three build-time/config flags carried over from the prototype's tweaks:
  - `showCommodityLists` (default `true`) — show/hide the commodity chip lists
  - `showSuppliers` (default `true`) — show/hide the whole Suppliers section
  - `showStickyBar` (default `true`) — show/hide the floating WhatsApp button

## Assets

Nine photographs supplied by the client, extracted from the prototype into `assets/`
(WebP, as delivered):

| File | Used in |
|---|---|
| `hero-photo.webp` | Hero, right column (640px tall frame) |
| `about-photo.webp` | About, left column (420px frame) |
| `prod-spices.webp` | Products card 1 (220px frame) |
| `prod-oilseeds.webp` | Products card 2 |
| `prod-nuts.webp` | Products card 3 |
| `prod-cocoa.webp` | Products card 4 |
| `prod-palm.webp` | Products card 5 |
| `prod-cassava.webp` | Products card 6 |
| `reach-photo.webp` | Markets, right column (520px frame) |

Notes for the build:
- These are the client's own photos, exported from the prototype at browser-drop
  resolution. **Ask the client for the original full-resolution files** before launch —
  the hero especially will be soft on large displays.
- Any cropping/panning applied in the prototype is not baked into these files. Set a
  sensible `object-position` per image, or ask the client to confirm framing.
- Generate responsive `srcset` variants and AVIF/WebP pairs at build time.
- Every image needs real descriptive `alt` text (e.g. "Dried hibiscus flowers being
  sorted for export") — this matters for SEO on commodity searches.

Icons: two inline SVGs only — the WhatsApp glyph and the logo mark. No icon library
needed.

Fonts: Spectral and Archivo from Google Fonts. Self-host both (subset to latin +
latin-ext) rather than loading from the Google CDN; the prototype uses the CDN for
convenience only.

## Content still to be supplied by the client

Flagged as placeholders in the design — **do not launch with these**:

1. **CAC RC number** — appears twice (credibility strip, contact panel), shown as `0000000`.
2. **Email address** — `info@dakelaexports.com` is assumed, not confirmed.
3. **Office address** — currently "Add street, city and state".
4. **Full-resolution photography** and per-image alt text.
5. **Destination markets**, if they want them named.
6. Any real certifications (NEPC registration, SGS/phytosanitary) once obtained — there
   is room in the credibility strip and Markets fact grid.

## Files in this bundle

| File | What it is |
|---|---|
| `README.md` | This document — the implementation spec |
| `Dakela Exports.dc.html` | The design prototype. Read the inline styles for exact values. Reference only. |
| `support.js`, `image-slot.js` | Prototyping-environment runtime. **Do not port.** |
| `.image-slots.state.json` | Where the prototype stored the dropped photos (already extracted to `assets/`). Not needed for the build. |
| `assets/*.webp` | The nine client photographs |
| `screenshots/*.png` | Rendered reference screenshots of each section, in page order. Captured at a ~910px-wide viewport, so column proportions are tighter than the 1240px design width — trust the README values over the screenshots where they disagree. |

To view the prototype as designed, open `Dakela Exports.dc.html` from a local web server
(not `file://`) in the same folder as its siblings above.
