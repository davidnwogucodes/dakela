-- ==========================================================================
-- Migration 002 — product detail pages
--
-- Run in the Supabase SQL Editor AFTER schema.sql and seed.sql. Additive and
-- idempotent: every statement uses IF NOT EXISTS, nothing is dropped, and no
-- existing content is overwritten. Safe to re-run.
--
-- Adds the fields a full B2B product page needs, and the site-wide export
-- information those pages share.
--
-- The inherit-or-override pattern
-- -------------------------------
-- Blocks that are the same for every commodity (loading ports, quality control
-- steps, export documents) live once on `settings`. Each product has a matching
-- array column that is EMPTY by default, meaning "use the site-wide list". Fill
-- it in and that product alone overrides it. Editing your ports then means one
-- edit, not one per commodity — while a commodity that genuinely differs can
-- still say so.
-- ==========================================================================

-- --------------------------------------------------------------------------
-- Products — commodity-specific detail
-- --------------------------------------------------------------------------

alter table public.products
  -- Prose. The opening paragraphs of the product page.
  add column if not exists overview text,

  -- e.g. "Hibiscus sabdariffa". Rendered in italics beside the title.
  add column if not exists botanical_name text,

  -- Structured lists. `origin` and `uses` stay as the short hover-card teasers;
  -- when they are blank the card falls back to joining these, so the owner can
  -- fill in the list alone and get a sensible hover for free.
  add column if not exists producing_states text[] not null default '{}',
  add column if not exists applications     text[] not null default '{}',
  add column if not exists forms            text[] not null default '{}',

  -- [{ "label": "Moisture Content", "value": "<=12%" }, ...]
  -- Free-form rows, because the parameters that matter differ completely per
  -- commodity: moisture and purity for hibiscus, free fatty acid for palm oil,
  -- kernel outturn for cashew. Fixed columns would not survive a second product.
  add column if not exists specifications jsonb not null default '[]'::jsonb,

  -- Commercial terms. Blank inherits the site-wide default.
  add column if not exists moq       text,
  add column if not exists lead_time text,

  -- Slugs of other products shown under "Related products".
  add column if not exists related_slugs text[] not null default '{}',

  -- [{ "question": "...", "answer": "..." }] — ADDED to the site-wide FAQ for
  -- this product, not replacing it.
  add column if not exists faq jsonb not null default '[]'::jsonb,

  -- [{ "label": "Specification Sheet", "path": "docs/uuid.pdf", "size": 148213 }]
  add column if not exists documents jsonb not null default '[]'::jsonb,

  -- Override columns. Empty array == inherit from settings.
  add column if not exists packaging         text[] not null default '{}',
  add column if not exists loading_ports     text[] not null default '{}',
  add column if not exists incoterms         text[] not null default '{}',
  add column if not exists shipment_options  text[] not null default '{}',
  add column if not exists quality_assurance text[] not null default '{}',
  add column if not exists certifications    text[] not null default '{}';

-- --------------------------------------------------------------------------
-- Settings — the site-wide export information every product page shares
-- --------------------------------------------------------------------------

alter table public.settings
  add column if not exists loading_ports     text[] not null default '{}',
  add column if not exists incoterms         text[] not null default '{}',
  add column if not exists shipment_options  text[] not null default '{}',
  add column if not exists quality_assurance text[] not null default '{}',
  add column if not exists certifications    text[] not null default '{}',
  add column if not exists packaging         text[] not null default '{}',
  add column if not exists why_us            text[] not null default '{}',
  add column if not exists faq               jsonb  not null default '[]'::jsonb,
  add column if not exists default_moq       text,
  add column if not exists default_lead_time text,
  add column if not exists downloads_note    text;

-- --------------------------------------------------------------------------
-- Seed the site-wide blocks, only where they are still empty. An owner who has
-- already edited these keeps their edits if this file is re-run.
-- --------------------------------------------------------------------------

update public.settings set
  loading_ports = case when cardinality(loading_ports) = 0 then array[
    'Apapa Port (Lagos)',
    'Tin Can Island Port (Lagos)',
    'Onne Port (Port Harcourt), where applicable'
  ] else loading_ports end,

  incoterms = case when cardinality(incoterms) = 0 then array[
    'EXW', 'FCA', 'FOB', 'CFR', 'CIF', 'DAP (subject to agreement)'
  ] else incoterms end,

  shipment_options = case when cardinality(shipment_options) = 0 then array[
    'Full Container Load (FCL)',
    'Less than Container Load (LCL), where practical'
  ] else shipment_options end,

  quality_assurance = case when cardinality(quality_assurance) = 0 then array[
    'Careful sourcing',
    'Cleaning',
    'Sorting',
    'Grading',
    'Moisture verification',
    'Foreign matter removal',
    'Quality inspection before shipment',
    'Proper export packaging'
  ] else quality_assurance end,

  certifications = case when cardinality(certifications) = 0 then array[
    'Commercial Invoice',
    'Packing List',
    'Certificate of Origin',
    'Phytosanitary Certificate',
    'Fumigation Certificate',
    'Inspection Certificate (SGS or Bureau Veritas, on request)',
    'Bill of Lading',
    'Other export documents as required by the destination country'
  ] else certifications end,

  packaging = case when cardinality(packaging) = 0 then array[
    '25 kg PP bags',
    '50 kg PP bags',
    'Kraft paper bags',
    'Food-grade poly-lined bags',
    'Customised packaging',
    'Private label packaging (on request)'
  ] else packaging end,

  why_us = case when cardinality(why_us) = 0 then array[
    'Reliable sourcing network across Nigeria',
    'Consistent export-quality products',
    'Flexible packaging solutions',
    'Buyer-focused quality control',
    'Competitive pricing',
    'Timely shipment coordination',
    'Responsive customer support',
    'Professional export documentation'
  ] else why_us end,

  faq = case when jsonb_array_length(faq) = 0 then '[
    {"question": "Can you supply customised specifications?",
     "answer": "Yes. We meet buyer specifications wherever it is commercially and technically feasible."},
    {"question": "Do you provide samples?",
     "answer": "Yes. Samples are available on request, subject to product availability and shipping arrangements."},
    {"question": "Which countries do you export to?",
     "answer": "We serve buyers across Europe, Asia, the Middle East and Africa, subject to applicable trade regulations."},
    {"question": "What are your payment terms?",
     "answer": "Payment terms are agreed during contract negotiation and vary with order size and commercial arrangements."},
    {"question": "Can you arrange inspection?",
     "answer": "Yes. Independent third-party inspection can be arranged at the buyer''s request."}
  ]'::jsonb else faq end,

  default_moq = coalesce(default_moq,
    'One 20 ft container. Smaller trial orders may be discussed subject to availability.'),

  default_lead_time = coalesce(default_lead_time,
    'Typically 2–4 weeks after order confirmation, depending on quantity and packaging.'),

  downloads_note = coalesce(downloads_note,
    'Specification sheets, technical data sheets and brochures are available on request.')
where id = 1;

-- --------------------------------------------------------------------------
-- New enquiry-form questions, for buyers only. Guarded by the existing
-- unique (form, key) constraint, so re-running adds nothing.
-- --------------------------------------------------------------------------

insert into public.form_fields
  (form, key, label, hint, placeholder, type, options, required, system, sort_order)
values
  ('buyer', 'preferredPackaging', 'Preferred packaging', null, null, 'select',
     array['25 kg PP bags', '50 kg PP bags', 'Kraft paper bags',
           'Food-grade poly-lined bags', 'Customised packaging',
           'Private label packaging'],
     false, false, 5),

  ('buyer', 'shipmentType', 'Shipment type', null, null, 'select',
     array['Full Container Load (FCL)', 'Less than Container Load (LCL)'],
     false, false, 6),

  ('buyer', 'inspection', 'Third-party inspection',
     'We can arrange independent inspection before loading.', null, 'select',
     array['Not required', 'SGS', 'Bureau Veritas', 'Buyer will appoint'],
     false, false, 7),

  ('buyer', 'sampleRequested', 'Sample', null, 'Please send a sample before we order',
     'checkbox', '{}', false, false, 8)
on conflict (form, key) do nothing;

-- DAP was missing from the Incoterm list the form offers.
update public.form_fields
set options = array['EXW', 'FCA', 'FOB', 'CFR', 'CIF', 'DAP']
where form = 'buyer' and key = 'incoterm' and not ('DAP' = any(options));

-- --------------------------------------------------------------------------
-- Hibiscus — the worked example. Only fills columns that are still empty, so
-- an owner who has already written their own copy keeps it.
-- --------------------------------------------------------------------------

update public.products set
  botanical_name = coalesce(botanical_name, 'Hibiscus sabdariffa'),

  overview = coalesce(overview,
    'Hibiscus (Hibiscus sabdariffa) is one of Nigeria''s leading agricultural export ' ||
    'commodities, valued globally for its rich colour, natural flavour and health ' ||
    'benefits. Nigerian hibiscus is recognised for its deep red calyces, high ' ||
    'anthocyanin content and consistent quality, making it suitable for both ' ||
    'industrial processing and retail applications.'),

  producing_states = case when cardinality(producing_states) = 0 then array[
    'Kano', 'Jigawa', 'Katsina', 'Bauchi', 'Gombe', 'Borno', 'Yobe'
  ] else producing_states end,

  forms = case when cardinality(forms) = 0 then array[
    'Whole dried hibiscus flowers',
    'Machine-cleaned hibiscus',
    'Hand-picked premium grade',
    'Tea cut',
    'Hibiscus powder',
    'Customised processing on request'
  ] else forms end,

  applications = case when cardinality(applications) = 0 then array[
    'Herbal tea manufacturing',
    'Beverage production',
    'Food processing',
    'Natural food colouring',
    'Pharmaceutical manufacturing',
    'Nutraceutical products',
    'Cosmetic formulations',
    'Health and wellness products'
  ] else applications end,

  specifications = case when jsonb_array_length(specifications) = 0 then '[
    {"label": "Botanical name",   "value": "Hibiscus sabdariffa"},
    {"label": "Product type",     "value": "Dried flower (calyx)"},
    {"label": "Origin",           "value": "Nigeria"},
    {"label": "Colour",           "value": "Deep red to dark crimson"},
    {"label": "Moisture content", "value": "12% max"},
    {"label": "Purity",           "value": "99% min"},
    {"label": "Foreign matter",   "value": "1% max"},
    {"label": "Admixture",        "value": "1% max"},
    {"label": "Odour",            "value": "Natural, characteristic"},
    {"label": "Taste",            "value": "Slightly tart"},
    {"label": "Shelf life",       "value": "24 months"},
    {"label": "Storage",          "value": "Cool, dry, well-ventilated area"}
  ]'::jsonb else specifications end,

  related_slugs = case when cardinality(related_slugs) = 0 then array[
    'oilseeds-and-grains', 'nuts-and-oil-crops', 'cocoa-products'
  ] else related_slugs end,

  -- Overwritten rather than coalesced: the value seeded earlier was a
  -- placeholder written during the build, and this one is the client's own.
  seasonality = 'Harvest November to February.'
where slug = 'spices-and-herbs';

-- --------------------------------------------------------------------------
-- Storage: product documents (PDF spec sheets, brochures). Public read, so a
-- buyer can download without an account; writes happen server-side only.
-- --------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('product-docs', 'product-docs', true)
on conflict (id) do nothing;
