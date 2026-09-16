/**
 * Uploads a product image to Supabase Storage and returns its object path.
 *
 * The filename is generated here, never taken from the upload: a client-supplied
 * name is attacker-controlled and has no business becoming a path. The declared
 * content type is likewise only a hint — the extension is derived from the
 * allowlist below, so an .html file announcing itself as image/png cannot be
 * stored as something a browser would execute.
 */

import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { requireAdmin } from "@/lib/auth";
import { adminClient } from "@/lib/supabase/server";

const MAX_BYTES = 6 * 1024 * 1024; // 6 MB — generous for a web-sized photo

/** The only types that may be stored, mapped to the extension they get. */
const ALLOWED: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

/**
 * Sniffs the real format from the file's magic bytes. A caller can put anything
 * in the multipart content-type header, so the bytes decide.
 */
function sniff(bytes: Uint8Array): string | null {
  const startsWith = (...sig: number[]) => sig.every((b, i) => bytes[i] === b);

  if (startsWith(0xff, 0xd8, 0xff)) return "image/jpeg";
  if (startsWith(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)) return "image/png";

  // RIFF....WEBP
  if (startsWith(0x52, 0x49, 0x46, 0x46)) {
    const tag = String.fromCharCode(bytes[8], bytes[9], bytes[10], bytes[11]);
    if (tag === "WEBP") return "image/webp";
  }

  // ISO-BMFF box: ....ftypavif / ftypavis
  const brand = String.fromCharCode(...Array.from(bytes.slice(4, 12)));
  if (brand.startsWith("ftyp") && (brand.includes("avif") || brand.includes("avis"))) {
    return "image/avif";
  }

  return null;
}

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Malformed upload." }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file was sent." }, { status: 400 });
  }

  if (file.size === 0) {
    return NextResponse.json({ error: "That file is empty." }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "That image is larger than 6 MB. Please resize it and try again." },
      { status: 413 },
    );
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const detected = sniff(bytes);

  if (!detected || !ALLOWED[detected]) {
    return NextResponse.json(
      { error: "Only JPEG, PNG, WebP and AVIF images can be uploaded." },
      { status: 415 },
    );
  }

  const path = "products/" + randomUUID() + "." + ALLOWED[detected];

  const { error } = await adminClient()
    .storage.from("product-images")
    .upload(path, bytes, {
      contentType: detected,
      // Long cache: the path is unique per upload, so a replaced image gets a
      // new URL rather than needing the old one invalidated.
      cacheControl: "31536000",
      upsert: false,
    });

  if (error) {
    console.error("[admin/upload] storage upload failed:", error.message);
    return NextResponse.json(
      {
        error:
          "Could not store that image. If this is a new project, check the " +
          "product-images bucket exists (it is created by schema.sql).",
      },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true, path });
}
