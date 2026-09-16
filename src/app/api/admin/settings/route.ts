/** Site-wide settings: theme, accent, enquiry copy, which sides of the form are open. */

import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { adminClient } from "@/lib/supabase/server";
import { presetById } from "@/lib/theme";
import { HEX_PATTERN, validateSettings } from "@/lib/validation";

export async function PATCH(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  let body: {
    theme_preset?: unknown;
    accent?: unknown;
    enquiry_heading?: unknown;
    enquiry_intro?: unknown;
    buyer_enabled?: unknown;
    supplier_enabled?: unknown;
  };

  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  const text = (v: unknown, max: number) =>
    typeof v === "string" && v.trim() ? v.trim().slice(0, max) : null;

  // An accent of null means "use the preset's own"; anything non-hex is rejected
  // outright rather than quietly ignored, so a typo does not look like a save.
  const accentRaw = typeof body.accent === "string" ? body.accent.trim() : "";
  const accent = accentRaw && HEX_PATTERN.test(accentRaw) ? accentRaw.toLowerCase() : null;

  const input = {
    accent: accentRaw ? accentRaw : null,
    enquiry_heading: typeof body.enquiry_heading === "string" ? body.enquiry_heading : "",
    enquiry_intro: typeof body.enquiry_intro === "string" ? body.enquiry_intro : "",
    buyer_enabled: body.buyer_enabled !== false,
    supplier_enabled: body.supplier_enabled !== false,
  };

  const errors = validateSettings(input);
  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ errors }, { status: 422 });
  }

  // presetById falls back to the default for an unknown id, so an unrecognised
  // value can never be stored.
  const preset = presetById(typeof body.theme_preset === "string" ? body.theme_preset : null);

  const { error } = await adminClient()
    .from("settings")
    .update({
      theme_preset: preset.id,
      accent,
      enquiry_heading: text(body.enquiry_heading, 200),
      enquiry_intro: text(body.enquiry_intro, 800),
      buyer_enabled: input.buyer_enabled,
      supplier_enabled: input.supplier_enabled,
    })
    .eq("id", 1);

  if (error) {
    console.error("[admin/settings] update failed:", error.message);
    return NextResponse.json({ error: "Could not save those settings." }, { status: 502 });
  }

  // Theme and copy are baked into both public pages at build time.
  revalidatePath("/");
  revalidatePath("/enquiry");
  revalidatePath("/admin/appearance");

  return NextResponse.json({ ok: true });
}
