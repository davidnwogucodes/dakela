# Dakela Exports Nigeria Limited — marketing site

Single-page marketing site for a Nigerian exporter of agricultural commodities.
Built from the design handoff in [design_handoff_dakela_exports/](design_handoff_dakela_exports/).

**Before launch, work through [CLIENT-TODO.md](CLIENT-TODO.md)** — the RC number, email,
office address, domain and full-resolution photography are still placeholders.

## Stack

Next.js 15 (App Router) · React 19 · TypeScript · CSS Modules.

No CSS framework: the design specifies exact hex values, type sizes and grid ratios, so
the tokens live as CSS custom properties in [src/app/globals.css](src/app/globals.css)
and each section owns a small module. Every page is statically prerendered — there is no
client-side data fetching, and the only client component is the header (mobile menu and
scroll-spy).

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # static prerender
npm run typecheck
```

## Layout

```
src/
  app/
    layout.tsx        fonts, metadata, Open Graph, JSON-LD
    page.tsx          section order
    globals.css       design tokens + reset
    icon.svg          favicon / app icon (mark on ink)
    apple-icon.tsx    180px touch icon, generated at build time
    manifest.ts, robots.ts, sitemap.ts
  components/         one .tsx + .module.css per band
  styles/
    shared.module.css container, eyebrows, buttons, frames, hairline grid
  config/site.ts      company details, links, feature flags
  data/               products, section copy
public/assets/        the nine client photographs
```

## Design system notes

- **Colour.** Every colour is a token in `globals.css`. Two background families (ink,
  paper) plus white for the Products band. No gradients.
- **Radius is 0 everywhere.** This is load-bearing for the institutional feel.
- **Shadows: none**, except the floating WhatsApp button.
- **Hairline grids.** Card grids are a wrapper with `background: <line>`, `gap: 1px` and
  cells filled with the section background — see `.hairlineGrid` in
  [src/styles/shared.module.css](src/styles/shared.module.css). Dividers stay exactly 1px
  and never double up.
- **Fonts.** Spectral (display) and Archivo (UI/body), self-hosted via `next/font/google`
  and subset to latin + latin-ext. Nothing is fetched from the Google CDN at runtime.
- **Measure.** Body paragraphs are capped in `ch` units, not px — keep it that way.

## Content flags

Three build-time flags in [src/config/site.ts](src/config/site.ts), carried over from the
prototype. Each is read in exactly one place, so flipping one never means editing markup:

| Flag | Default | Effect |
|---|---|---|
| `showCommodityLists` | `true` | Commodity chip lists inside the product cards |
| `showSuppliers` | `true` | The whole "For local suppliers" section (and its nav link) |
| `showStickyBar` | `true` | The floating WhatsApp button |

## Responsive

Breakpoints follow the handoff. `--pad-x` and `--section-y` step down in `globals.css`;
individual grids collapse in their own modules.

| Width | Behaviour |
|---|---|
| ≥1240px | As designed — 1240px container, 40px padding |
| 1024–1239px | Container padding 32px; Process grid wraps 3 + 2 |
| 768–1023px | Two-column grids collapse; hero image 420px; Products 2 columns; Process 2 columns; About column un-sticks; section padding 88px; nav collapses to a hamburger with the quote CTA still in the bar |
| <768px | Single column; padding 20px; section padding 64px; hero image 300px; value/fact/step grids stack; floating button becomes a 52×52 icon |

## SEO

- Real `<h1>`/`<h2>`/`<h3>` hierarchy; each product card carries an anchor id
  (`#spices-and-herbs`, …) so commodity searches can deep-link.
- Metadata, Open Graph and Twitter tags in `layout.tsx`; `robots.txt` and `sitemap.xml`
  generated from `site.url`.
- `Organization` + `LocalBusiness` JSON-LD in
  [src/components/JsonLd.tsx](src/components/JsonLd.tsx), written conservatively — no
  claims the company cannot yet support.
- **Highest-value expansion:** per-commodity landing pages at `/products/[slug]`.
  [src/data/products.ts](src/data/products.ts) already carries `slug`, so the routes can be
  generated from the same source without restructuring.

## Hosting

The whole site prerenders to static HTML. Any host works.

- **Vercel / Netlify / Cloudflare Pages** — deploy as-is; `next/image` optimisation and
  AVIF/WebP `srcset` generation work out of the box.
- **Plain static host** (S3, GitHub Pages, nginx) — set `output: "export"` and
  `images.unoptimized: true` in [next.config.ts](next.config.ts), then serve `out/`. You
  lose automatic responsive variants, so pre-generate them from the full-resolution
  originals instead.

Buyers open this on slow mobile connections: keep it server-rendered, keep the JS payload
where it is (~110 kB first load), and do not introduce client-side data fetching.
