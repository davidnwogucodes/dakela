/**
 * Receives the enquiry form and writes one row to Supabase.
 *
 * What counts as a valid submission is not fixed here — it is whatever the
 * owner has configured in form_fields, which this route loads fresh on every
 * request. That also means answers are filtered against the real field list, so
 * a crafted payload cannot write arbitrary keys into the answers JSON.
 *
 * The secret key is read here and only here on this path. The browser talks to
 * this route, never to Supabase.
 */

import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getFormFields, getSettings } from "@/lib/content";
import { adminClient, isConfigured } from "@/lib/supabase/server";
import {
  contactColumns,
  normaliseAnswers,
  normaliseItems,
  validateSubmission,
  type Submission,
} from "@/lib/submission";

/** Reject bodies larger than this before parsing — nothing legitimate is close. */
const MAX_BODY_BYTES = 64 * 1024;

/**
 * Crude per-instance throttle: 5 submissions per IP per 10 minutes. Serverless
 * instances do not share this map, so it thins out floods rather than stopping
 * them. Put Vercel WAF or Cloudflare Turnstile in front if abuse becomes real.
 */
const RATE_LIMIT = { max: 5, windowMs: 10 * 60 * 1000 };
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT.windowMs);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear(); // bound the map; correctness does not depend on it
  return recent.length > RATE_LIMIT.max;
}

export async function POST(request: Request) {
  if (!isConfigured()) {
    console.error("[enquiry] Supabase credentials are not set");
    return NextResponse.json(
      {
        error:
          "The form is not set up yet. Please email us in the meantime.",
      },
      { status: 503 },
    );
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  if (rateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many submissions from this connection. Please try again shortly." },
      { status: 429 },
    );
  }

  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "That submission is too large." }, { status: 413 });
  }

  let body: Submission;
  try {
    body = JSON.parse(raw) as Submission;
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  // Honeypot. A real person never sees this field, so anything in it is a bot.
  // Answer 200 so the bot records a success and does not retry with variations.
  if (typeof body.website === "string" && body.website.trim()) {
    return NextResponse.json({ ok: true });
  }

  const [fields, settings] = await Promise.all([getFormFields(true), getSettings()]);

  if (fields.length === 0) {
    return NextResponse.json(
      { error: "The form is not available right now. Please email us instead." },
      { status: 503 },
    );
  }

  // Respect the owner having closed one side of the form, even if a stale page
  // still offers it.
  if (
    (body.type === "buyer" && !settings.buyer_enabled) ||
    (body.type === "supplier" && !settings.supplier_enabled)
  ) {
    return NextResponse.json(
      { error: "That part of the form is closed at the moment. Please email us instead." },
      { status: 409 },
    );
  }

  // The commodity rows only apply when there is a catalogue to choose from.
  const { count } = await adminClient()
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("published", true);

  const errors = validateSubmission(fields, body, (count ?? 0) > 0);
  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ errors }, { status: 422 });
  }

  const answers = normaliseAnswers(fields, body.answers);

  const { error } = await adminClient()
    .from("enquiries")
    .insert({
      type: body.type,
      ...contactColumns(fields, answers),
      answers,
      items: normaliseItems(body.items),
    });

  if (error) {
    // Log the detail server-side; return a generic message so database errors
    // are not echoed to the browser.
    console.error("[enquiry] insert failed:", error.message);
    return NextResponse.json(
      { error: "We could not save that. Please try again, or email us instead." },
      { status: 502 },
    );
  }

  // The dashboard's unread count is rendered server-side.
  revalidatePath("/admin");
  revalidatePath("/admin/enquiries");

  return NextResponse.json({ ok: true });
}
