/**
 * The company's own contact details: email, phone, registered office, RC number.
 *
 * Written to a JSON document in Supabase Storage rather than to columns on the
 * settings table. Adding columns needs DDL, which needs the Supabase dashboard
 * or a database password; Storage needs only the service key the app already
 * holds. See src/lib/store.ts for the trade-off.
 */

import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { COMPANY_DOC, type CompanyRecord } from "@/lib/model";
import { writeDoc } from "@/lib/store";

/** Loose on purpose: matches a@b.c, rejects the obvious typos, and leaves the
 *  rest to the reply bouncing. Stricter patterns reject valid addresses. */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const text = (v: unknown, max: number): string =>
  typeof v === "string" ? v.trim().slice(0, max) : "";

export async function PATCH(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  const record: CompanyRecord = {
    email: text(body.email, 200),
    phone: text(body.phone, 60),
    street: text(body.street, 200),
    city: text(body.city, 120),
    state: text(body.state, 120),
    country: text(body.country, 120),
    rcNumber: text(body.rcNumber, 40),
  };

  const errors: Record<string, string> = {};

  if (record.email && !EMAIL.test(record.email)) {
    errors.email = "That does not look like an email address.";
  }

  // Digits, spaces, brackets, dashes and a leading plus. Anything else is a
  // typo, and it ends up inside a tel: link.
  if (record.phone && !/^\+?[\d\s()\-]{6,}$/.test(record.phone)) {
    errors.phone = "Use digits, spaces and an optional leading +.";
  }

  if (record.rcNumber && !/^[A-Za-z0-9\-/]{2,}$/.test(record.rcNumber)) {
    errors.rcNumber = "Letters, numbers and hyphens only.";
  }

  // A street with no city reads as an incomplete address wherever it renders,
  // and would be published as structured data to search engines.
  if (record.street && !record.city) {
    errors.city = "Add a city as well, or leave the street blank for now.";
  }

  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ errors }, { status: 422 });
  }

  const written = await writeDoc(COMPANY_DOC, record);

  if (!written) {
    return NextResponse.json(
      { error: "Could not save those details. Please try again." },
      { status: 502 },
    );
  }

  // Rebuilds every page that embeds these details — the contact panel,
  // credibility strip, hero, footer, enquiry page and the structured data.
  // The document read is uncached, so each rebuild picks up the new value.
  revalidatePath("/", "layout");
  revalidatePath("/enquiry");
  revalidatePath("/products/[slug]", "page");
  revalidatePath("/admin/company");

  return NextResponse.json({ ok: true });
}
