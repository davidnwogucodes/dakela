/** Update or delete a single product. */

import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { adminClient } from "@/lib/supabase/server";
import { validateProduct, type ProductInput } from "@/lib/validation";

type Context = { params: Promise<{ id: string }> };

function toRow(input: ProductInput) {
  const text = (v: unknown, max = 600) =>
    typeof v === "string" && v.trim() ? v.trim().slice(0, max) : null;

  return {
    slug: String(input.slug).trim().toLowerCase(),
    title: String(input.title).trim().slice(0, 120),
    description: text(input.description) ?? "",
    commodities: Array.isArray(input.commodities)
      ? input.commodities
          .map((c) => String(c).trim())
          .filter(Boolean)
          .slice(0, 30)
      : [],
    image_path: text(input.image_path, 400),
    image_position: text(input.image_position, 40) ?? "center",
    alt: text(input.alt, 300) ?? "",
    origin: text(input.origin),
    uses: text(input.uses),
    nutrition: text(input.nutrition),
    grades: text(input.grades),
    seasonality: text(input.seasonality),
    published: Boolean(input.published),
  };
}

export async function PATCH(request: Request, { params }: Context) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;

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

  const { error } = await adminClient().from("products").update(toRow(input)).eq("id", id);

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { errors: { slug: "Another product already uses that slug." } },
        { status: 422 },
      );
    }
    console.error("[admin/products] update failed:", error.message);
    return NextResponse.json({ error: "Could not save that product." }, { status: 502 });
  }

  revalidatePath("/");
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: Context) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  const db = adminClient();

  // Read the image path first: once the row is gone there is no way back to the
  // uploaded file, and orphans sit in Storage consuming the free-tier quota.
  const { data: existing } = await db
    .from("products")
    .select("image_path")
    .eq("id", id)
    .maybeSingle();

  const { error } = await db.from("products").delete().eq("id", id);

  if (error) {
    console.error("[admin/products] delete failed:", error.message);
    return NextResponse.json({ error: "Could not delete that product." }, { status: 502 });
  }

  // Only remove uploads. A path starting with "/" is seeded photography living
  // in public/assets, which is part of the repo and must survive.
  const path = existing?.image_path;
  if (path && !path.startsWith("/")) {
    const { error: storageError } = await db.storage.from("product-images").remove([path]);
    // A failed cleanup is not worth failing the delete over — the row is gone,
    // which is what was asked for.
    if (storageError) {
      console.error("[admin/products] orphaned image", path, storageError.message);
    }
  }

  revalidatePath("/");
  return NextResponse.json({ ok: true });
}
