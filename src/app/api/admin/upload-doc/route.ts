/**
 * Uploads a product document (specification sheet, brochure) to Supabase
 * Storage and returns its object path.
 *
 * Same rules as the image uploader: the filename is generated here rather than
 * taken from the upload, and the format is decided by the file's own magic
 * bytes, not by the content type the caller claims. A document bucket is served
 * to the public internet, so "it said it was a PDF" is not good enough.
 */

import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { requireAdmin } from "@/lib/auth";
import { adminClient } from "@/lib/supabase/server";

const MAX_BYTES = 20 * 1024 * 1024; // 20 MB — a generous brochure

/** "%PDF-" — the only signature this route accepts. */
function isPdf(bytes: Uint8Array): boolean {
  return (
    bytes[0] === 0x25 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x44 &&
    bytes[3] === 0x46 &&
    bytes[4] === 0x2d
  );
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
      { error: "That document is larger than 20 MB." },
      { status: 413 },
    );
  }

  const bytes = new Uint8Array(await file.arrayBuffer());

  if (!isPdf(bytes)) {
    return NextResponse.json(
      { error: "Only PDF documents can be uploaded." },
      { status: 415 },
    );
  }

  const path = "docs/" + randomUUID() + ".pdf";

  const { error } = await adminClient()
    .storage.from("product-docs")
    .upload(path, bytes, {
      contentType: "application/pdf",
      // The path is unique per upload, so a replacement gets a new URL rather
      // than needing the old one invalidated.
      cacheControl: "31536000",
      upsert: false,
    });

  if (error) {
    console.error("[admin/upload-doc] storage upload failed:", error.message);
    return NextResponse.json(
      {
        error:
          "Could not store that document. Check the product-docs bucket exists " +
          "(it is created by migration-002).",
      },
      { status: 502 },
    );
  }

  // The label defaults to the uploaded filename, minus its extension — the
  // owner can rename it, but a sensible default beats an empty box.
  const label = file.name.replace(/\.[^.]+$/, "").slice(0, 160) || "Document";

  return NextResponse.json({ ok: true, path, size: file.size, label });
}
