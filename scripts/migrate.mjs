/**
 * Applies the SQL files in supabase/ to the database, in order, once each.
 *
 *   node scripts/migrate.mjs            apply anything not yet applied
 *   node scripts/migrate.mjs --status   list what has and has not run
 *   node scripts/migrate.mjs --force    re-apply everything (all files are idempotent)
 *
 * Needs DATABASE_URL in .env.local — the Supabase connection string, which you
 * paste in once and never think about again. It is read from the file, never
 * passed on the command line, so it does not end up in your shell history.
 *
 * Each file runs inside a transaction: if any statement fails the whole file is
 * rolled back, so a half-applied migration is not a state you can reach.
 * Applied filenames are recorded in schema_migrations, so re-running is a no-op.
 *
 * This is a local developer tool. Vercel never needs DATABASE_URL — the running
 * site talks to Supabase over the REST API with the service key, and has no
 * business holding credentials that can drop tables.
 */

import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const migrationsDir = join(root, "supabase");

/* -------------------------------------------------------------------------- */
/* Config                                                                      */
/* -------------------------------------------------------------------------- */

/** Minimal .env parser. dotenv expands $NAME inside values, which would corrupt
 *  a password containing a dollar sign — this deliberately does not. */
function readEnvLocal() {
  let raw;
  try {
    raw = readFileSync(join(root, ".env.local"), "utf8");
  } catch {
    return {};
  }

  const env = {};
  for (const line of raw.split(/\r?\n/)) {
    const match = /^([A-Z_][A-Z0-9_]*)=(.*)$/.exec(line.trim());
    if (!match) continue;
    let value = match[2].trim();
    // Strip surrounding quotes if the value was pasted with them.
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[match[1]] = value;
  }
  return env;
}

const env = readEnvLocal();
const connectionString = env.DATABASE_URL || process.env.DATABASE_URL;

if (!connectionString) {
  console.error(`
DATABASE_URL is not set.

  1. Supabase dashboard -> Connect (top of the page)
  2. Copy the "Session pooler" connection string
  3. Replace [YOUR-PASSWORD] with your database password
  4. Add it as one line in .env.local:

       DATABASE_URL=postgresql://postgres.<ref>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres

Use the Session pooler string rather than the direct one: direct connections are
IPv6-only, which fails on many networks. The pooler answers over IPv4.
`);
  process.exit(1);
}

const args = new Set(process.argv.slice(2));
const force = args.has("--force");
const statusOnly = args.has("--status");

/* -------------------------------------------------------------------------- */
/* Run                                                                         */
/* -------------------------------------------------------------------------- */

/** Numbered migrations first, in order; then the base files. */
function migrationFiles() {
  const all = readdirSync(migrationsDir).filter((f) => f.endsWith(".sql"));

  // schema and seed are the foundation and must precede the numbered files.
  const base = ["schema.sql", "seed.sql"].filter((f) => all.includes(f));
  const numbered = all.filter((f) => /^migration-\d+/.test(f)).sort();
  const rest = all.filter((f) => !base.includes(f) && !numbered.includes(f)).sort();

  return [...base, ...numbered, ...rest];
}

const client = new pg.Client({
  connectionString,
  // Supabase terminates TLS with a certificate this client has no CA bundle
  // for. The connection is still encrypted; it is the certificate chain that
  // goes unverified, which is the standard posture for Supabase clients.
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();
} catch (error) {
  console.error("\nCould not connect:", error.message);
  console.error(
    "\nCheck the password in DATABASE_URL, and that you used the Session pooler\n" +
      "string rather than the direct (IPv6-only) one.\n",
  );
  process.exit(1);
}

try {
  await client.query(`
    create table if not exists public.schema_migrations (
      filename   text primary key,
      applied_at timestamptz not null default now()
    )
  `);

  const { rows } = await client.query("select filename from public.schema_migrations");
  const applied = new Set(rows.map((r) => r.filename));

  const files = migrationFiles();

  if (statusOnly) {
    console.log("");
    for (const file of files) {
      console.log("  " + (applied.has(file) ? "applied" : "PENDING").padEnd(9) + file);
    }
    console.log("");
    process.exit(0);
  }

  const pending = force ? files : files.filter((f) => !applied.has(f));

  if (pending.length === 0) {
    console.log("\nNothing to apply — the database is up to date.\n");
    process.exit(0);
  }

  console.log("");
  for (const file of pending) {
    const sql = readFileSync(join(migrationsDir, file), "utf8");
    process.stdout.write("  " + file + " … ");

    try {
      // One transaction per file: a failure rolls the whole file back rather
      // than leaving half a migration applied.
      await client.query("begin");
      await client.query(sql);
      await client.query(
        `insert into public.schema_migrations (filename) values ($1)
         on conflict (filename) do update set applied_at = now()`,
        [file],
      );
      await client.query("commit");
      console.log("ok");
    } catch (error) {
      await client.query("rollback").catch(() => {});
      console.log("FAILED");
      console.error("\n  " + error.message + "\n");
      console.error("  Nothing from this file was applied. Earlier files are unaffected.\n");
      process.exit(1);
    }
  }

  console.log("\nDone.\n");
} finally {
  await client.end().catch(() => {});
}
