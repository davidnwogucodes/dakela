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
import { defaultSettings, type Enquiry, type FormField, type Product, type Settings } from "./model";

export type {
  Enquiry,
  EnquiryItem,
  FieldType,
  FormField,
  FormSection,
  Product,
  Settings,
} from "./model";
export { defaultSettings, FIELD_TYPES } from "./model";

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

  return (data ?? []) as Product[];
}

/** Every product, published or not, for the dashboard list. */
export async function getAllProducts(): Promise<Product[]> {
  const { data, error } = await adminClient()
    .from("products")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw new Error("Could not load products: " + error.message);
  return (data ?? []) as Product[];
}

export async function getProduct(id: string): Promise<Product | null> {
  const { data, error } = await adminClient()
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error("Could not load that product: " + error.message);
  return (data as Product) ?? null;
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

  return { ...defaultSettings, ...(data as Partial<Settings>) };
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
