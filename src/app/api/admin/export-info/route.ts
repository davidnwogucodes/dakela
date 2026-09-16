/**
 * The site-wide export information shared by every product page.
 *
 * Separate from /api/admin/settings, which owns appearance and the enquiry
 * page. Splitting them means the Appearance screen cannot accidentally blank a
 * list it does not render, and vice versa: each route writes only its own
 * columns.
 */

import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { adminClient } from "@/lib/supabase/server";
import type { FaqItem } from "@/lib/model";

const list = (v: unknown, max = 40, itemMax = 300): string[] =>
  Array.isArray(v)
    ? v
        .map((item) => String(item).trim().slice(0, itemMax))
        .filter(Boolean)
        .slice(0, max)
    : [];

const text = (v: unknown, max: number): string | null =>
  typeof v === "string" && v.trim() ? v.trim().slice(0, max) : null;

function faq(v: unknown): FaqItem[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((row) => ({
      question: text((row as FaqItem)?.question, 300) ?? "",
      answer: text((row as FaqItem)?.answer, 2000) ?? "",
    }))
    .filter((row) => row.question && row.answer)
    .slice(0, 30);
}

export async function PATCH(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  const { error } = await adminClient()
    .from("settings")
    .update({
      loading_ports: list(body.loading_ports),
      incoterms: list(body.incoterms),
      shipment_options: list(body.shipment_options),
      quality_assurance: list(body.quality_assurance),
      certifications: list(body.certifications),
      packaging: list(body.packaging),
      why_us: list(body.why_us),
      faq: faq(body.faq),
      default_moq: text(body.default_moq, 400),
      default_lead_time: text(body.default_lead_time, 400),
      downloads_note: text(body.downloads_note, 600),
    })
    .eq("id", 1);

  if (error) {
    console.error("[admin/export-info] update failed:", error.message);
    return NextResponse.json(
      { error: "Could not save that. If this is a new project, run migration-002." },
      { status: 502 },
    );
  }

  // Every product page embeds these blocks, so all of them need rebuilding.
  revalidatePath("/products/[slug]", "page");
  revalidatePath("/admin/export-info");

  return NextResponse.json({ ok: true });
}
