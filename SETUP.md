# Setting up the dashboard

One-time steps to get the owner-managed site running.

---

## 1. Create the database tables

Supabase → **SQL Editor** → **New query**.

1. Paste the whole of [`supabase/schema.sql`](supabase/schema.sql) and press **Run**.
   This creates four tables, their indexes, the `product-images` storage bucket,
   the privilege grants, and turns on row-level security.
2. Paste the whole of [`supabase/seed.sql`](supabase/seed.sql) and press **Run**.
   This loads the six original commodity groups and the default enquiry form.

Both are safe to re-run. `schema.sql` is idempotent; `seed.sql` skips rows that
already exist, so re-running it will not overwrite the owner's later edits.

**Expected afterwards:** `products` 6 rows, `form_fields` 13 rows, `enquiries` 0,
`settings` 1.

> If reads fail with `permission denied for table products`, the grants at the
> bottom of `schema.sql` have not been applied — run that file again.

## 2. Set the environment variables

Copy [`.env.example`](.env.example) to `.env.local` for local development, and
set the same five in Vercel → **Settings** → **Environment Variables**, ticked
for Production, Preview and Development.

| Variable | What it is | Secret? |
| --- | --- | --- |
| `SUPABASE_URL` | Project Settings → API Keys → Project URL | No |
| `SUPABASE_SERVICE_ROLE_KEY` | Project Settings → API Keys → **Secret key** (`sb_secret_…`) | **Yes** |
| `ADMIN_USERNAME` | The name typed at the login screen | No |
| `ADMIN_PASSWORD_HASH` | scrypt hash of the password — never the password itself | No |
| `AUTH_SECRET` | Signs the session cookie | **Yes** |

The Supabase secret key bypasses row-level security. It is read only in server
code and must never be given a `NEXT_PUBLIC_` prefix. If it leaks, revoke it in
Project Settings → API Keys and issue a new one.

There is no step 3. Sign-in needs nothing configured in Supabase — the dashboard
account is these environment variables and nothing else.

---

## The dashboard account

One account, no sign-up, no user table.

**To change the password:**

```
node scripts/hash-password.mjs "the new password"
```

Paste the printed `ADMIN_PASSWORD_HASH` into `.env.local` and Vercel, then
redeploy. The password itself is stored nowhere — only the hash, which cannot be
reversed. If the password is lost, generate a new one; it cannot be recovered.

**To sign everyone out immediately,** change `AUTH_SECRET` and redeploy. Every
existing session cookie stops verifying at once.

Sessions last eight hours.

> **Note on the hash format.** It is colon-separated (`scrypt:16384:8:1:…`),
> not the conventional `$`-separated form. Dotenv expands `$NAME` inside `.env`
> values, so a `$`-delimited hash arrives at the server with its cost parameters
> eaten and every password then fails to verify.

## How access control works

Three independent gates, so no single mistake opens the door:

1. **Database privileges and row-level security.** RLS is on for every table
   with no policies, and only `service_role` is granted anything. The browser is
   never given a database key at all.
2. **The proxy** ([`src/proxy.ts`](src/proxy.ts)) refuses any `/admin` request
   without a validly signed, unexpired session cookie.
3. **`requireAdmin()`** ([`src/lib/auth.ts`](src/lib/auth.ts)) runs inside every
   admin API route. The page guard protects pages; the API is reachable
   directly, so it checks for itself. An unauthenticated call gets a 404, not a
   403 — there is no reason to confirm the endpoint exists.

The session cookie is HttpOnly, SameSite=Lax, Secure in production, and signed
with HMAC-SHA256. It carries a username and an expiry and nothing else — it is a
claim the server verifies, not a credential.

Passwords are hashed with scrypt at ~100ms per attempt, verified in constant
time, and the login route answers identically for a wrong username and a wrong
password so neither can be enumerated.

## What the owner can change

| Screen | Controls |
| --- | --- |
| **Products** | Add, edit, reorder, hide and delete commodity groups. Upload photographs. Fill in the origin, uses, nutrition, grades and season shown on hover. |
| **Enquiry form** | Rename and reorder questions, mark them required, hide them, edit dropdown choices, add new questions — for buyers, suppliers, or both. |
| **Submissions** | Read, search and filter enquiries; set status; export everything to CSV. |
| **Appearance** | Switch palette, override the accent colour, reword the enquiry page, close either side of the form. |

## Things that are deliberately not editable

- **The three core contact questions** (name, company, email) cannot be deleted
  or retyped. The dashboard reads contact details by key to build the
  submissions list, and replying depends on having an email. They can be
  renamed, reordered and hidden.
- **A question's key.** The label is what visitors read; the key is what past
  answers are filed under. Renaming a question keeps its history attached.
  Deleting one keeps the answers too — they appear under "removed question" on
  the submission and in the CSV export.
- **The commodity rows** on the enquiry form. They are generated from the
  published products, so adding a product adds its commodities automatically.

## How content reaches the site

The home page and enquiry page are static HTML, rebuilt at most once a minute
(`export const revalidate = 60`). Saving in the dashboard calls
`revalidatePath()` for the affected pages, so changes appear immediately rather
than waiting for that interval.

Product images live in Supabase Storage. A stored path beginning with `/` is a
file in `public/assets` — that is how the original photography is seeded — and
anything else is an uploaded object. Uploads are validated by their magic bytes,
not by the declared content type, and renamed to a generated UUID.

CSV exports prefix any cell starting with `=`, `+`, `-` or `@` with an
apostrophe. Submissions come from the open internet, and without that a crafted
value would execute as a formula when the file is opened in Excel.

## Costs

Everything is on free tiers: Supabase (500 MB database, 1 GB storage) and Vercel.
The Supabase free tier pauses a project after about a week with no activity; one
click wakes it. A live site with real traffic never idles that long.
