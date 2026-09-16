/**
 * Reads of owner-managed content, shared by the public site and the dashboard.
 *
 * Everything here uses the secret-key client, because RLS denies the browser
 * key every table. These functions are safe to call from public pages: they
 * return only published rows and never take a table, column or filter from user
 * input. Writes live in the admin route handlers, behind requireAdmin().
 *
 * Shapes live in model.ts, which has no server imports — client components can
 * pull a type from there without dragging the secret key into a bundle.
 */

import "server-only";
import { adminClient, isConfigured } from "./supabase/server";
import {
  defaultSettings,
  type Enquiry,
  type FaqItem,
  type FormField,
  type Product,
  type ProductDocument,
  type Settings,
  type SpecRow,
} from "./model";

export type {
  Enquiry,
  EnquiryItem,
  FaqItem,
  FieldType,
  FormField,
  FormSection,
  Overridable,
  Product,
  ProductDocument,
  Settings,
  SpecRow,
} from "./model";
export {
  defaultSettings,
  FIELD_TYPES,
  OVERRIDABLE,
  OVERRIDABLE_LABELS,
  resolveBlock,
} from "./model";

/* -------------------------------------------------------------------------- */
/* Normalisation                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Fills in any column the database has not got.
 *
 * Postgres returns only the columns that exist, so a project that has run
 * schema.sql but not migration-002 hands back rows with no `forms`, no
 * `specifications` and so on. Reading `.length` off those would crash the page.
 * Defaulting here means the site renders — sections with no data simply do not
 * appear — and the only visible symptom is the missing content itself.
 */
function normaliseProduct(row: Record<string, unknown>): Product {
  const list = (v: unknown): string[] =>
    Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];

  const text = (v: unknown): string | null =>
    typeof v === "string" && v.trim() ? v : null;

  const json = <T,>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);

  return {
    ...(row as Product),
    commodities: list(row.commodities),
    producing_states: list(row.producing_states),
    applications: list(row.applications),
    forms: list(row.forms),
    related_slugs: list(row.related_slugs),
    packaging: list(row.packaging),
    loading_ports: list(row.loading_ports),
    incoterms: list(row.incoterms),
    shipment_options: list(row.shipment_options),
    quality_assurance: list(row.quality_assurance),
    certifications: list(row.certifications),
    specifications: json<SpecRow>(row.specifications),
    faq: json<FaqItem>(row.faq),
    documents: json<ProductDocument>(row.documents),
    overview: text(row.overview),
    botanical_name: text(row.botanical_name),
    moq: text(row.moq),
    lead_time: text(row.lead_time),
  };
}

/** The same guard for settings, which migration-002 also extends. */
function normaliseSettings(row: Record<string, unknown>): Settings {
  const list = (v: unknown): string[] =>
    Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];

  return {
    ...defaultSettings,
    ...(row as Partial<Settings>),
    loading_ports: list(row.loading_ports),
    incoterms: list(row.incoterms),
    shipment_options: list(row.shipment_options),
    quality_assurance: list(row.quality_assurance),
    certifications: list(row.certifications),
    packaging: list(row.packaging),
    why_us: list(row.why_us),
    faq: Array.isArray(row.faq) ? (row.faq as FaqItem[]) : [],
  };
}

/* -------------------------------------------------------------------------- */
/* Reads                                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Published products in display order.
 *
 * Returns [] rather than throwing when Supabase is unreachable: a database blip
 * should degrade the products band, not take the whole home page down. The
 * error is logged, so the cause is still visible in the Vercel logs.
 */
export async function getPublishedProducts(): Promise<Product[]> {
  if (!isConfigured()) return [];

  const { data, error } = await adminClient()
    .from("products")
    .select("*")
    .eq("published", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[content] getPublishedProducts failed:", error.message);
    return [];
  }

  return (data ?? []).map((row) => normaliseProduct(row as Record<string, unknown>));
}

/** Every product, published or not, for the dashboard list. */
export async function getAllProducts(): Promise<Product[]> {
  const { data, error } = await adminClient()
    .from("products")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw new Error("Could not load products: " + error.message);
  return (data ?? []).map((row) => normaliseProduct(row as Record<string, unknown>));
}

/** One published product by slug, for its public detail page. */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (!isConfigured()) return null;

  const { data, error } = await adminClient()
    .from("products")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (error) {
    console.error("[content] getProductBySlug failed:", error.message);
    return null;
  }

  return data ? normaliseProduct(data as Record<string, unknown>) : null;
}

export async function getProduct(id: string): Promise<Product | null> {
  const { data, error } = await adminClient()
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error("Could not load that product: " + error.message);
  return data ? normaliseProduct(data as Record<string, unknown>) : null;
}

/**
 * Form fields. `visibleOnly` is what the public form asks for; the dashboard
 * needs the hidden ones too, so they can be switched back on.
 */
export async function getFormFields(visibleOnly = false): Promise<FormField[]> {
  if (!isConfigured()) return [];

  let query = adminClient().from("form_fields").select("*");
  if (visibleOnly) query = query.eq("visible", true);

  const { data, error } = await query
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[content] getFormFields failed:", error.message);
    return [];
  }

  return (data ?? []) as FormField[];
}

export async function getSettings(): Promise<Settings> {
  if (!isConfigured()) return defaultSettings;

  const { data, error } = await adminClient()
    .from("settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  if (error || !data) {
    if (error) console.error("[content] getSettings failed:", error.message);
    return defaultSettings;
  }

  return normaliseSettings(data as Record<string, unknown>);
}

export async function getEnquiries(limit = 200): Promise<Enquiry[]> {
  const { data, error } = await adminClient()
    .from("enquiries")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error("Could not load submissions: " + error.message);
  return (data ?? []) as Enquiry[];
}

export async function getEnquiry(id: string): Promise<Enquiry | null> {
  const { data, error } = await adminClient()
    .from("enquiries")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error("Could not load that submission: " + error.message);
  return (data as Enquiry) ?? null;
}

/** Counts for the overview cards. Head-only, so no row data crosses the wire. */
export async function getCounts() {
  const db = adminClient();

  const [products, fields, enquiries, unread] = await Promise.all([
    db.from("products").select("id", { count: "exact", head: true }),
    db.from("form_fields").select("id", { count: "exact", head: true }),
    db.from("enquiries").select("id", { count: "exact", head: true }),
    db.from("enquiries").select("id", { count: "exact", head: true }).eq("read", false),
  ]);

  return {
    products: products.count ?? 0,
    fields: fields.count ?? 0,
    enquiries: enquiries.count ?? 0,
    unread: unread.count ?? 0,
  };
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Resolves a stored image reference to a URL.
 *
 * A path starting with "/" is a file already in public/assets — that is how the
 * original photography is seeded. Anything else is an object in the
 * `product-images` Storage bucket.
 */
export function productImageUrl(path: string | null): string | null {
  if (!path) return null;
  if (path.startsWith("/")) return path;

  const base = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return null;

  return base + "/storage/v1/object/public/product-images/" + path;
}

/** Public URL for an uploaded product document (PDF spec sheet, brochure). */
export function productDocUrl(path: string | null): string | null {
  if (!path) return null;

  const base = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return null;

  return base + "/storage/v1/object/public/product-docs/" + path;
}
