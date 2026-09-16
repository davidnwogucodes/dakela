/** Signs the owner out by expiring the session cookie. */

import { NextResponse } from "next/server";
import { cookieOptions, SESSION_COOKIE } from "@/lib/session";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  // maxAge 0 tells the browser to drop it immediately. The cookie is the only
  // thing holding the session, so there is no server-side state to clear.
  response.cookies.set(SESSION_COOKIE, "", cookieOptions(0));
  return response;
}
