/** Update or delete a single form field. */

import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { adminClient } from "@/lib/supabase/server";
import { CHOICE_TYPES, validateFormField, type FormFieldInput } from "@/lib/validation";

type Context = { params: Promise<{ id: string }> };

function toRow(input: FormFieldInput) {
  const text = (v: unknown, max: number) =>
    typeof v === "string" && v.trim() ? v.trim().slice(0, max) : null;

  return {
    form: input.form,
    key: String(input.key).trim(),
    label: String(input.label).trim().slice(0, 120),
    hint: text(input.hint, 300),
    placeholder: text(input.placeholder, 120),
    type: input.type,
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

function revalidatePublic() {
  revalidatePath("/enquiry");
  revalidatePath("/admin/form");
}

export async function PATCH(request: Request, { params }: Context) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;

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

  const { data: existing } = await db
    .from("form_fields")
    .select("system, key, form")
    .eq("id", id)
    .maybeSingle();

  if (!existing) {
    return NextResponse.json({ error: "That question no longer exists." }, { status: 404 });
  }

  const row = toRow(input);

  // System fields carry the contact details the dashboard reads by key, and the
  // section they sit in is what puts them on both sides of the branch. Label,
  // hint, order and required stay editable; key, section and type do not.
  if (existing.system) {
    row.key = existing.key;
    row.form = existing.form;
  }

  const { error } = await db.from("form_fields").update(row).eq("id", id);

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { errors: { key: "Another question in this section already uses that key." } },
        { status: 422 },
      );
    }
    console.error("[admin/fields] update failed:", error.message);
    return NextResponse.json({ error: "Could not save that question." }, { status: 502 });
  }

  revalidatePublic();
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: Context) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  const db = adminClient();

  const { data: existing } = await db
    .from("form_fields")
    .select("system")
    .eq("id", id)
    .maybeSingle();

  if (!existing) {
    return NextResponse.json({ error: "That question no longer exists." }, { status: 404 });
  }

  // The form cannot function without a name, company and email to reply to.
  // Hiding one is allowed; removing it is not.
  if (existing.system) {
    return NextResponse.json(
      {
        error:
          "This question is part of the form's core and cannot be deleted. " +
          "You can hide it instead.",
      },
      { status: 409 },
    );
  }

  const { error } = await db.from("form_fields").delete().eq("id", id);

  if (error) {
    console.error("[admin/fields] delete failed:", error.message);
    return NextResponse.json({ error: "Could not delete that question." }, { status: 502 });
  }

  // Past submissions keep their answers under this key; nothing is rewritten.
  // The dashboard falls back to showing the raw key for an answer whose field
  // has since been removed, so no history is lost.
  revalidatePublic();
  return NextResponse.json({ ok: true });
}
