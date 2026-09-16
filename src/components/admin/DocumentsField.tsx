"use client";

import { useRef, useState } from "react";
import type { ProductDocument } from "@/lib/model";
import ui from "@/styles/admin.module.css";
import styles from "./DocumentsField.module.css";

/**
 * Attached PDFs — specification sheets, technical data sheets, brochures.
 *
 * Uploading adds a row immediately with the filename as its label; the owner
 * renames it in place. Removing a row detaches it from the product but leaves
 * the file in storage: a delete that fires before the product is saved would
 * destroy a file the owner could still get back by cancelling the edit.
 */
export function DocumentsField({
  value,
  onChange,
}: {
  value: ProductDocument[];
  onChange: (next: ProductDocument[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File) {
    setError(null);
    setUploading(true);

    try {
      const body = new FormData();
      body.append("file", file);

      const response = await fetch("/api/admin/upload-doc", { method: "POST", body });
      const data = (await response.json().catch(() => ({}))) as {
        path?: string;
        size?: number;
        label?: string;
        error?: string;
      };

      if (!response.ok || !data.path) {
        setError(data.error ?? "Could not upload that document.");
        return;
      }

      onChange([
        ...value,
        { label: data.label ?? "Document", path: data.path, size: data.size ?? 0 },
      ]);
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
    } finally {
      setUploading(false);
      // Clear the input so re-choosing the same file still fires a change event.
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className={styles.wrap}>
      {error && <p className={ui.noticeError}>{error}</p>}

      {value.length > 0 && (
        <ul className={styles.list}>
          {value.map((doc, index) => (
            <li key={doc.path} className={styles.item}>
              <div className={ui.field}>
                <label className={styles.miniLabel}>Shown as</label>
                <input
                  className={ui.input}
                  value={doc.label}
                  onChange={(e) =>
                    onChange(
                      value.map((d, i) =>
                        i === index ? { ...d, label: e.target.value } : d,
                      ),
                    )
                  }
                />
              </div>

              <span className={styles.meta}>
                PDF · {Math.max(1, Math.round(doc.size / 1024))} KB
              </span>

              <button
                type="button"
                className={styles.remove}
                onClick={() => onChange(value.filter((_, i) => i !== index))}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className={ui.buttonRow}>
        <button
          type="button"
          className={ui.buttonSecondary + " " + ui.buttonSmall}
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? "Uploading…" : "Upload a PDF"}
        </button>
        <span className={ui.hint}>PDF only, up to 20 MB.</span>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className={ui.visuallyHidden}
        tabIndex={-1}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void upload(file);
        }}
      />
    </div>
  );
}
