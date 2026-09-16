/**
 * Signed session cookies for the dashboard.
 *
 * A token is `<payload>.<signature>`, where the payload carries the username and
 * an expiry, and the signature is an HMAC of that payload under AUTH_SECRET.
 * Nothing sensitive is stored in the cookie — it is a claim the server verifies,
 * not a credential. Tampering with the payload invalidates the signature, and
 * the expiry is inside the signed payload so it cannot be extended by editing
 * the cookie.
 *
 * Built on Web Crypto rather than node:crypto because the proxy runs on the
 * Edge runtime, where node:crypto is unavailable. Web Crypto works in both.
 */

export const SESSION_COOKIE = "dakela_session";

/** Eight hours. Long enough for a working day, short enough that a forgotten
 *  session on a shared machine expires on its own. */
export const SESSION_TTL_SECONDS = 8 * 60 * 60;

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(value: string): Uint8Array {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(padded + "=".repeat((4 - (padded.length % 4)) % 4));
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

type Payload = { u: string; exp: number };

/** Issues a token for `username`, valid for SESSION_TTL_SECONDS. */
export async function signSession(username: string, secret: string): Promise<string> {
  const payload: Payload = {
    u: username,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  };

  const encoded = base64UrlEncode(new TextEncoder().encode(JSON.stringify(payload)));

  const signature = await crypto.subtle.sign(
    "HMAC",
    await hmacKey(secret),
    new TextEncoder().encode(encoded),
  );

  return encoded + "." + base64UrlEncode(new Uint8Array(signature));
}

/**
 * Returns the username when the token is authentic and unexpired, else null.
 *
 * crypto.subtle.verify does the comparison itself, in constant time — never
 * compare signatures with `===`, which leaks their contents through timing.
 */
export async function verifySession(
  token: string | undefined,
  secret: string,
): Promise<string | null> {
  if (!token || !secret) return null;

  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;

  const encoded = token.slice(0, dot);
  const signature = token.slice(dot + 1);

  let valid: boolean;
  try {
    valid = await crypto.subtle.verify(
      "HMAC",
      await hmacKey(secret),
      base64UrlDecode(signature),
      new TextEncoder().encode(encoded),
    );
  } catch {
    // Malformed base64 in the signature — treat as a failed verification.
    return null;
  }

  if (!valid) return null;

  let payload: Payload;
  try {
    payload = JSON.parse(new TextDecoder().decode(base64UrlDecode(encoded))) as Payload;
  } catch {
    return null;
  }

  if (typeof payload.exp !== "number" || payload.exp * 1000 < Date.now()) return null;
  if (typeof payload.u !== "string" || !payload.u) return null;

  return payload.u;
}

/** Cookie attributes. Secure is dropped in development, where there is no HTTPS. */
export function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}
