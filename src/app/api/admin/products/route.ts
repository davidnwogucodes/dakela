/**
 * Create a product, and reorder the whole list.
 *
 * Both handlers write with the secret-key client, so both begin with
 * requireAdmin(). The layout guard protects the pages; these protect the API,
 * which is reachable directly regardless of what the UI allows.
 */

import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { adminClient } from "@/lib/supabase/server";
import { toProductRow } from "@/lib/product-row";
import { validateProduct, type ProductInput } from "@/lib/validation";

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  let input: ProductInput;
  try {
    input = (await request.json()) as ProductInput;
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  const errors = validateProduct(input);
  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ errors }, { status: 422 });
  }

  const db = adminClient();

  // New products land at the end of the list.
  const { data: last } = await db
    .from("products")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data, error } = await db
    .from("products")
    .insert({ ...toProductRow(input), sort_order: (last?.sort_order ?? 0) + 1 })
    .select("id")
    .single();

  if (error) {
    // 23505 is unique_violation — the only user-fixable error here, and always
    // the slug, since it is the sole unique column.
    if (error.code === "23505") {
      return NextResponse.json(
        { errors: { slug: "Another product already uses that slug." } },
        { status: 422 },
      );
    }
    console.error("[admin/products] insert failed:", error.message);
    return NextResponse.json({ error: "Could not save that product." }, { status: 502 });
  }

  revalidatePath("/");
  return NextResponse.json({ ok: true, id: data.id });
}

/**
 * Reorder. Takes the full list of ids in their new order and rewrites
 * sort_order to match, so the client never has to compute index arithmetic.
 */
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

  // Sequential rather than parallel: Postgres handles either, but a failure
  // halfway through a Promise.all leaves an order nobody can reason about.
  for (let index = 0; index < ids.length; index++) {
    const { error } = await db
      .from("products")
      .update({ sort_order: index + 1 })
      .eq("id", ids[index]);

    if (error) {
      console.error("[admin/products] reorder failed:", error.message);
      return NextResponse.json({ error: "Could not save the new order." }, { status: 502 });
    }
  }

  revalidatePath("/");
  return NextResponse.json({ ok: true });
}
