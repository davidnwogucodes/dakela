import "server-only";

/**
 * The Supabase client. One of them now — Supabase is the database, not the
 * login system; the dashboard signs in against a username and password hash of
 * its own (see src/lib/auth.ts).
 *
 * adminClient() carries the secret key. It bypasses row-level security, so
 * every caller must either have checked the session (requireAdmin) or be
 * reading strictly published public content.
 *
 * The "server-only" import above makes it a build error for any of this to be
 * pulled into a client bundle, which is the mistake that leaks a secret key.
 */

import { createClient } from "@supabase/supabase-js";
import { required } from "./shared";

/** True when the server-side credentials are present. Lets pages and routes
 *  degrade with a useful message instead of a stack trace. */
export function isConfigured(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function adminClient() {
  return createClient(
    required("SUPABASE_URL", process.env.SUPABASE_URL),
    required("SUPABASE_SERVICE_ROLE_KEY", process.env.SUPABASE_SERVICE_ROLE_KEY),
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
