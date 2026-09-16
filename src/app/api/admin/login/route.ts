/**
 * Signs the owner in.
 *
 * Deliberately slow and deliberately vague: scrypt verification takes ~100ms,
 * which throttles guessing, and the response never distinguishes a wrong
 * username from a wrong password — that difference is a free hint to anyone
 * probing the form.
 */

import { NextResponse } from "next/server";
import { isAuthConfigured } from "@/lib/auth";
import { verifyPassword } from "@/lib/password";
import { cookieOptions, SESSION_COOKIE, SESSION_TTL_SECONDS, signSession } from "@/lib/session";

/** Per-instance throttle on failures: 10 attempts per IP per 15 minutes.
 *  Serverless instances do not share this, so it slows an attack rather than
 *  stopping one — scrypt's cost is the real defence. */
const LIMIT = { max: 10, windowMs: 15 * 60 * 1000 };
const attempts = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (attempts.get(ip) ?? []).filter((t) => now - t < LIMIT.windowMs);
  recent.push(now);
  attempts.set(ip, recent);
  if (attempts.size > 5000) attempts.clear();
  return recent.length > LIMIT.max;
}

export async function POST(request: Request) {
  if (!isAuthConfigured()) {
    console.error("[auth] login attempted with no credentials configured");
    return NextResponse.json(
      { error: "The dashboard is not configured on the server." },
      { status: 503 },
    );
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  if (rateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many attempts. Please wait a few minutes and try again." },
      { status: 429 },
    );
  }

  let body: { username?: unknown; password?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  const username = typeof body.username === "string" ? body.username.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";

  // Verify the password even when the username is wrong, so both paths take the
  // same time. Returning early on a bad username would make usernames
  // enumerable by timing the response.
  const passwordOk = await verifyPassword(
    password,
    process.env.ADMIN_PASSWORD_HASH as string,
  );
  const usernameOk = username === process.env.ADMIN_USERNAME;

  if (!usernameOk || !passwordOk) {
    return NextResponse.json(
      { error: "That username and password do not match." },
      { status: 401 },
    );
  }

  const token = await signSession(username, process.env.AUTH_SECRET as string);

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, token, cookieOptions(SESSION_TTL_SECONDS));
  return response;
}
