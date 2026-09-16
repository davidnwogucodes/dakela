import "server-only";

/**
 * Password hashing for the single dashboard account.
 *
 * scrypt, with a random salt per hash, in the format
 *   scrypt:<N>:<r>:<p>:<salt-hex>:<hash-hex>
 *
 * Colon-separated, not the conventional $, because dotenv expands $NAME inside
 * .env values — a $-delimited hash arrives at the server with its cost
 * parameters silently eaten, and every password then fails to verify. Hex and
 * digits contain no colon, so this separator is unambiguous.
 *
 * Only the hash goes in the environment, so the password itself exists nowhere
 * on the server — not in Vercel's settings, not in a file, not in a log. Anyone
 * with access to the deployment sees a hash they cannot reverse.
 *
 * node:crypto, not Web Crypto, because Web Crypto has no scrypt. That is fine:
 * verification only ever happens in the login route, which runs on Node. The
 * proxy checks the session cookie instead and never touches this file.
 */

import { randomBytes, scrypt, timingSafeEqual, type ScryptOptions } from "node:crypto";

/** promisify() collapses scrypt to its no-options overload, which drops the cost
 *  parameters, so the callback form is wrapped by hand instead. */
function scryptAsync(
  password: string,
  salt: Buffer,
  keyLength: number,
  options: ScryptOptions,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, keyLength, options, (error, derivedKey) => {
      if (error) reject(error);
      else resolve(derivedKey);
    });
  });
}

/** Deliberately costly. ~100ms per attempt, which makes guessing impractical
 *  while staying imperceptible on a real sign-in. */
const PARAMS = { N: 16384, r: 8, p: 1, keyLength: 64 };

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);

  const derived = await scryptAsync(password, salt, PARAMS.keyLength, {
    N: PARAMS.N,
    r: PARAMS.r,
    p: PARAMS.p,
  });

  return [
    "scrypt",
    PARAMS.N,
    PARAMS.r,
    PARAMS.p,
    salt.toString("hex"),
    derived.toString("hex"),
  ].join(":");
}

/**
 * Constant-time verification. Returns false for anything malformed rather than
 * throwing, so a corrupted env var reads as "wrong password" instead of a 500.
 */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  if (!password || !stored) return false;

  const parts = stored.split(":");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;

  const [, n, r, p, saltHex, hashHex] = parts;

  let salt: Buffer;
  let expected: Buffer;
  try {
    salt = Buffer.from(saltHex, "hex");
    expected = Buffer.from(hashHex, "hex");
  } catch {
    return false;
  }

  if (salt.length === 0 || expected.length === 0) return false;

  let derived: Buffer;
  try {
    derived = await scryptAsync(password, salt, expected.length, {
      N: Number(n),
      r: Number(r),
      p: Number(p),
    });
  } catch {
    return false;
  }

  // Lengths must match before timingSafeEqual, which throws otherwise.
  if (derived.length !== expected.length) return false;

  return timingSafeEqual(derived, expected);
}
