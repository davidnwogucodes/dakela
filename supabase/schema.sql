-- ==========================================================================
-- Dakela Exports — admin-managed content store
--
-- Run once in the Supabase SQL Editor (Dashboard → SQL Editor → New query).
-- Safe to re-run: every statement is idempotent.
--
-- Access model
--   Row-level security is ON for every table and NO policies are defined, which
--   denies all access via the publishable (browser) key. The browser uses that
--   key for one thing only: signing the owner in. Every read and write of data
--   goes through a Next.js server route holding the secret key, which bypasses
--   RLS — and those routes check the session before touching anything.
-- ==========================================================================

-- --------------------------------------------------------------------------
-- Products — the six commodity groups on the home page, now owner-editable.
-- --------------------------------------------------------------------------
create table if not exists public.products (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  title       text not null,
  description text not null default '',
  commodities text[] not null default '{}',

  -- Storage object path inside the `product-images` bucket, e.g.
  -- "products/sesame-a1b2.webp". Null renders the placeholder.
  image_path     text,
  image_position text not null default 'center',
  alt            text not null default '',

  -- Fixed detail set shown on hover. Any of these may be blank; blank fields
  -- are skipped when the card renders, so partial data still looks deliberate.
  origin      text,
  uses        text,
  nutrition   text,
  grades      text,
  seasonality text,

  sort_order  integer not null default 0,
  published   boolean not null default true,

  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists products_sort_idx on public.products (sort_order, created_at);

-- --------------------------------------------------------------------------
-- Form fields — the owner's definition of the enquiry form.
--
-- `key` is the stable identifier a submitted answer is filed under, so renaming
-- a label never orphans past submissions. `system` marks the fields the form
-- cannot function without (name, company, email): they can be reordered and
-- relabelled, but not deleted.
-- --------------------------------------------------------------------------
create table if not exists public.form_fields (
  id       uuid primary key default gen_random_uuid(),

  -- 'shared' fields appear on both sides of the buyer/supplier branch.
  form     text not null check (form in ('shared', 'buyer', 'supplier')),
  key      text not null,
  label    text not null,
  hint     text,
  placeholder text,

  type     text not null check (type in (
             'text', 'email', 'tel', 'textarea', 'number',
             'select', 'multiselect', 'checkbox', 'month'
           )),

  -- Choices for select / multiselect / checkbox. Ignored by the other types.
  options  text[] not null default '{}',

  required boolean not null default false,
  visible  boolean not null default true,
  system   boolean not null default false,

  sort_order integer not null default 0,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (form, key)
);

create index if not exists form_fields_form_idx on public.form_fields (form, sort_order);

-- --------------------------------------------------------------------------
-- Enquiries — one row per submission.
--
-- `answers` is keyed by form_fields.key, so the shape follows whatever the
-- owner has configured. The four contact columns are denormalised out of the
-- system fields purely so the admin list can be sorted and searched without
-- unpacking JSON on every row.
-- --------------------------------------------------------------------------
create table if not exists public.enquiries (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  type       text not null check (type in ('buyer', 'supplier')),

  full_name text,
  company   text,
  email     text,
  phone     text,

  answers jsonb not null default '{}'::jsonb,

  -- Repeating commodity rows, kept separate from `answers` because their shape
  -- is a list, not a single value:
  -- [{ "commodity": "Sesame Seeds", "grade": "99/1", "volume": "200", "unit": "MT/month" }]
  items jsonb not null default '[]'::jsonb,

  status text not null default 'new'
         check (status in ('new', 'contacted', 'quoted', 'closed')),
  read   boolean not null default false
);

create index if not exists enquiries_created_at_idx on public.enquiries (created_at desc);
create index if not exists enquiries_type_status_idx on public.enquiries (type, status);

-- --------------------------------------------------------------------------
-- Settings — a single row (id is pinned to 1) holding site-wide preferences.
-- --------------------------------------------------------------------------
create table if not exists public.settings (
  id integer primary key default 1 check (id = 1),

  theme_preset text not null default 'default',
  -- Optional hex override for the accent colour, e.g. '#b07c2e'.
  accent       text,

  -- Owner-editable copy on the enquiry page.
  enquiry_heading text,
  enquiry_intro   text,

  -- Let the owner close either side of the form without a deploy.
  buyer_enabled    boolean not null default true,
  supplier_enabled boolean not null default true,

  updated_at timestamptz not null default now()
);

insert into public.settings (id) values (1) on conflict (id) do nothing;

-- --------------------------------------------------------------------------
-- updated_at maintenance
-- --------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_touch on public.products;
create trigger products_touch before update on public.products
  for each row execute function public.touch_updated_at();

drop trigger if exists form_fields_touch on public.form_fields;
create trigger form_fields_touch before update on public.form_fields
  for each row execute function public.touch_updated_at();

drop trigger if exists settings_touch on public.settings;
create trigger settings_touch before update on public.settings
  for each row execute function public.touch_updated_at();

-- --------------------------------------------------------------------------
-- Table privileges.
--
-- Two separate mechanisms, and both must allow a request:
--   GRANT decides whether a role may touch the table at all.
--   RLS   decides which rows it may touch once it may.
--
-- service_role bypasses RLS, but it still needs the GRANT. Newer Supabase
-- projects no longer add these automatically for tables created through the SQL
-- editor, so they are stated explicitly here.
--
-- anon and authenticated are deliberately granted nothing: the publishable key
-- that ships to the browser is then blocked at both layers, not just by RLS.
-- --------------------------------------------------------------------------
grant usage on schema public to service_role;

grant all privileges on public.products    to service_role;
grant all privileges on public.form_fields to service_role;
grant all privileges on public.enquiries   to service_role;
grant all privileges on public.settings    to service_role;

-- --------------------------------------------------------------------------
-- Lock everything down. No policies == no access with the publishable key.
-- --------------------------------------------------------------------------
alter table public.products    enable row level security;
alter table public.form_fields enable row level security;
alter table public.enquiries   enable row level security;
alter table public.settings    enable row level security;

-- --------------------------------------------------------------------------
-- Storage bucket for product images. Public read so <img> works without signed
-- URLs; writes happen server-side with the secret key, so no write policy is
-- needed for the browser.
-- --------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;
