/** Update a submission's status / read flag, or delete it. */

import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { adminClient } from "@/lib/supabase/server";
import { ENQUIRY_STATUSES } from "@/lib/model";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Context) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;

  let body: { status?: unknown; read?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  // Build the patch from known keys only — never spread the request body into
  // an update, or a caller can set any column they like.
  const patch: { status?: string; read?: boolean } = {};

  if (body.status !== undefined) {
    const status = String(body.status);
    if (!ENQUIRY_STATUSES.includes(status as (typeof ENQUIRY_STATUSES)[number])) {
      return NextResponse.json({ error: "Unknown status." }, { status: 422 });
    }
    patch.status = status;
  }

  if (body.read !== undefined) patch.read = Boolean(body.read);

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  }

  const { error } = await adminClient().from("enquiries").update(patch).eq("id", id);

  if (error) {
    console.error("[admin/enquiries] update failed:", error.message);
    return NextResponse.json({ error: "Could not update that submission." }, { status: 502 });
  }

  revalidatePath("/admin");
  revalidatePath("/admin/enquiries");
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: Context) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;

  const { error } = await adminClient().from("enquiries").delete().eq("id", id);

  if (error) {
    console.error("[admin/enquiries] delete failed:", error.message);
    return NextResponse.json({ error: "Could not delete that submission." }, { status: 502 });
  }

  revalidatePath("/admin");
  revalidatePath("/admin/enquiries");
  return NextResponse.json({ ok: true });
}
