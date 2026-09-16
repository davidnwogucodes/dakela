/**
 * Generates an ADMIN_PASSWORD_HASH for the dashboard.
 *
 *   node scripts/hash-password.mjs "the new password"
 *
 * Paste the printed line into .env.local and into the Vercel environment
 * variables, then redeploy. The password itself is never stored anywhere — if
 * it is lost, generate a new one rather than trying to recover the old.
 */

import { randomBytes, scrypt } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);

const password = process.argv[2];

if (!password) {
  console.error('Usage: node scripts/hash-password.mjs "the new password"');
  process.exit(1);
}

if (password.length < 12) {
  console.error("Use at least 12 characters. Three unrelated words plus digits is plenty.");
  process.exit(1);
}

const salt = randomBytes(16);
const derived = await scryptAsync(password, salt, 64, { N: 16384, r: 8, p: 1 });

// Colon-separated: dotenv expands $NAME inside .env values, which would eat the
// cost parameters out of a $-delimited hash.
const hash = ["scrypt", 16384, 8, 1, salt.toString("hex"), derived.toString("hex")].join(":");

console.log("\nADMIN_PASSWORD_HASH=" + hash + "\n");
console.log("Paste that into .env.local and Vercel, then redeploy.");
console.log("Sessions issued before the change keep working until AUTH_SECRET changes too.\n");
