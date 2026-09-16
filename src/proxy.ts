/**
 * Gate on every /admin request: no valid session cookie, no dashboard.
 *
 * This is a first gate, not the only one. It runs before the page and checks
 * the cookie's signature; every admin route handler independently calls
 * requireAdmin(), because the API is reachable directly whatever the UI shows.
 *
 * Runs on the Edge runtime, so it uses Web Crypto via verifySession — node:crypto
 * is not available here. Password checking lives in the login route, on Node.
 */

import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/session";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLogin = pathname === "/admin/login";

  const secret = process.env.AUTH_SECRET;

  // Nothing to verify against. Let the request through to the page, which
  // renders a setup message rather than a redirect loop nobody can escape.
  if (!secret) return NextResponse.next();

  const username = await verifySession(
    request.cookies.get(SESSION_COOKIE)?.value,
    secret,
  );

  if (!username && !isLogin) {
    const redirect = request.nextUrl.clone();
    redirect.pathname = "/admin/login";
    // Remember where they were headed so login can return them there.
    redirect.searchParams.set("next", pathname);
    return NextResponse.redirect(redirect);
  }

  if (username && isLogin) {
    const redirect = request.nextUrl.clone();
    redirect.pathname = "/admin";
    redirect.search = "";
    return NextResponse.redirect(redirect);
  }

  return NextResponse.next();
}

export const config = {
  // Admin pages only. The public site and the enquiry API never touch this.
  matcher: ["/admin/:path*"],
};
