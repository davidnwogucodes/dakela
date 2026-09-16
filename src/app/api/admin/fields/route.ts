/** Create a form field, and reorder the list within a section. */

import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { adminClient } from "@/lib/supabase/server";
import { CHOICE_TYPES, validateFormField, type FormFieldInput } from "@/lib/validation";

/** Trims and clamps into real columns. The client object is never spread. */
export function toRow(input: FormFieldInput) {
  const text = (v: unknown, max: number) =>
    typeof v === "string" && v.trim() ? v.trim().slice(0, max) : null;

  return {
    form: input.form,
    key: String(input.key).trim(),
    label: String(input.label).trim().slice(0, 120),
    hint: text(input.hint, 300),
    placeholder: text(input.placeholder, 120),
    type: input.type,
    // Options are meaningless on a non-choice type; storing them anyway leaves
    // stale data behind when a field is switched from dropdown to text.
    options: CHOICE_TYPES.includes(input.type)
      ? (input.options ?? [])
          .map((o) => String(o).trim())
          .filter(Boolean)
          .slice(0, 100)
      : [],
    required: Boolean(input.required),
    visible: Boolean(input.visible),
  };
}

/** The public form and its page are both cached; a field change must clear them. */
function revalidatePublic() {
  revalidatePath("/enquiry");
  revalidatePath("/admin/form");
}

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  let input: FormFieldInput;
  try {
    input = (await request.json()) as FormFieldInput;
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  const errors = validateFormField(input);
  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ errors }, { status: 422 });
  }

  const db = adminClient();

  // New fields land at the end of their own section.
  const { data: last } = await db
    .from("form_fields")
    .select("sort_order")
    .eq("form", input.form)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data, error } = await db
    .from("form_fields")
    .insert({ ...toRow(input), system: false, sort_order: (last?.sort_order ?? 0) + 1 })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { errors: { key: "Another question in this section already uses that key." } },
        { status: 422 },
      );
    }
    console.error("[admin/fields] insert failed:", error.message);
    return NextResponse.json({ error: "Could not add that question." }, { status: 502 });
  }

  revalidatePublic();
  return NextResponse.json({ ok: true, id: data.id });
}

/** Reorder one section: the full list of ids in their new order. */
export async function PATCH(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  let ids: string[];
  try {
    const body = (await request.json()) as { ids?: unknown };
    ids = Array.isArray(body.ids) ? body.ids.map(String) : [];
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  if (ids.length === 0 || ids.length > 200) {
    return NextResponse.json({ error: "Nothing to reorder." }, { status: 400 });
  }

  const db = adminClient();

  for (let index = 0; index < ids.length; index++) {
    const { error } = await db
      .from("form_fields")
      .update({ sort_order: index + 1 })
      .eq("id", ids[index]);

    if (error) {
      console.error("[admin/fields] reorder failed:", error.message);
      return NextResponse.json({ error: "Could not save the new order." }, { status: 502 });
    }
  }

  revalidatePublic();
  return NextResponse.json({ ok: true });
}
