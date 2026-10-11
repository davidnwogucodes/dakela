import "server-only";

/**
 * A small JSON document store, backed by a private Supabase Storage bucket.
 *
 * Why not another Postgres table or column? Because adding one needs DDL, and
 * DDL needs either the dashboard or a database password. Storage buckets and
 * objects are reachable with the service key alone — the same key the app
 * already holds — so content stored this way can be added and changed without
 * anyone logging into Supabase.
 *
 * The trade-off, stated plainly: no queries, no indexes, no constraints, and
 * the values are invisible in the Table Editor. That is acceptable for a
 * handful of documents read in full on every render. It would not be
 * acceptable for the products or enquiries tables, which is why those stay in
 * Postgres.
 *
 * Caching has two modes, because the two callers want opposite things:
 *
 *   Public pages are statically generated and must stay that way. An uncached
 *   fetch inside one forces the whole route to render per-request, so they read
 *   through the data cache and tolerate being up to a minute behind.
 *
 *   The dashboard must never show a value the owner has just replaced, so it
 *   passes { fresh: true } and reads uncached. Those pages are already
 *   force-dynamic, so there is nothing to lose.
 */

import { isConfigured } from "./supabase/server";

const BUCKET = "site-content";

function endpoint(name: string): string | null {
  const base = process.env.SUPABASE_URL;
  if (!base) return null;
  return base + "/storage/v1/object/" + BUCKET + "/" + name;
}

function authHeaders(): Record<string, string> {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
  return { apikey: key, Authorization: "Bearer " + key };
}

/**
 * Reads a JSON document, or null when it does not exist yet.
 *
 * A missing document is the normal state before the owner has saved anything,
 * so 404 resolves to null rather than throwing. Every other failure is logged
 * and also resolves null: a storage blip should fall back to defaults, not take
 * down the page that embeds it.
 */
export async function readDoc<T>(
  name: string,
  options: { fresh?: boolean } = {},
): Promise<T | null> {
  if (!isConfigured()) return null;

  const url = endpoint(name);
  if (!url) return null;

  try {
    const response = await fetch(url, {
      headers: authHeaders(),
      ...(options.fresh
        ? { cache: "no-store" as const }
        : { next: { revalidate: 60 } }),
    });

    if (response.status === 404) return null;

    if (!response.ok) {
      console.error("[store] read", name, "failed:", response.status);
      return null;
    }

    return (await response.json()) as T;
  } catch (error) {
    console.error("[store] read", name, "threw:", (error as Error).message);
    return null;
  }
}

/**
 * Writes a JSON document, creating or replacing it.
 *
 * Returns false rather than throwing, so a caller can turn a storage failure
 * into a message the owner can act on instead of a stack trace.
 */
export async function writeDoc(name: string, data: unknown): Promise<boolean> {
  const url = endpoint(name);
  if (!url) return false;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        ...authHeaders(),
        "Content-Type": "application/json",
        // Without this a second save returns 409 Duplicate.
        "x-upsert": "true",
        // These documents are read through the API, never linked directly, so
        // a cached copy would only ever be a stale one.
        "cache-control": "no-cache",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      console.error("[store] write", name, "failed:", response.status, await response.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error("[store] write", name, "threw:", (error as Error).message);
    return false;
  }
}
