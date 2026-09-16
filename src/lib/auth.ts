import "server-only";

/**
 * Dashboard access control.
 *
 * One account, configured entirely by environment variable:
 *
 *   ADMIN_USERNAME       the name typed at the login screen
 *   ADMIN_PASSWORD_HASH  scrypt hash of the password — never the password
 *   AUTH_SECRET          signs the session cookie
 *
 * A request is authorised when it carries a session cookie this server signed
 * and the cookie has not expired. Every admin route handler checks this itself:
 * the proxy guards pages, and the API is reachable directly regardless of what
 * the UI shows.
 */

import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE, verifySession } from "./session";

/** True when all three variables are present. Missing any one means nobody can
 *  sign in, which is reported as a setup problem rather than a wrong password. */
export function isAuthConfigured(): boolean {
  return Boolean(
    process.env.ADMIN_USERNAME &&
      process.env.ADMIN_PASSWORD_HASH &&
      process.env.AUTH_SECRET,
  );
}

export type AdminCheck =
  | { ok: true; username: string }
  | { ok: false; reason: "unauthenticated" | "unconfigured" };

export async function checkAdmin(): Promise<AdminCheck> {
  if (!isAuthConfigured()) return { ok: false, reason: "unconfigured" };

  const store = await cookies();
  const username = await verifySession(
    store.get(SESSION_COOKIE)?.value,
    process.env.AUTH_SECRET as string,
  );

  if (!username) return { ok: false, reason: "unauthenticated" };

  // The username is inside the signed payload, so it cannot have been edited —
  // but it can be stale if ADMIN_USERNAME was changed after the cookie was
  // issued. Comparing here retires old sessions on a username change.
  if (username !== process.env.ADMIN_USERNAME) return { ok: false, reason: "unauthenticated" };

  return { ok: true, username };
}

/**
 * Guard for route handlers. Returns null when the caller is authorised, or the
 * Response to send back when they are not.
 *
 *   const denied = await requireAdmin();
 *   if (denied) return denied;
 */
export async function requireAdmin(): Promise<NextResponse | null> {
  const check = await checkAdmin();
  if (check.ok) return null;

  if (check.reason === "unconfigured") {
    console.error(
      "[auth] ADMIN_USERNAME, ADMIN_PASSWORD_HASH or AUTH_SECRET is not set — " +
        "every admin request is being denied.",
    );
    return NextResponse.json(
      { error: "The dashboard is not configured on the server." },
      { status: 503 },
    );
  }

  // 404 rather than 403: there is no reason to confirm to a stranger that
  // these endpoints exist.
  return NextResponse.json({ error: "Not found." }, { status: 404 });
}
