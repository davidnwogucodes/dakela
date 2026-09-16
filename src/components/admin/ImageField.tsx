"use client";

import { useRef, useState } from "react";
import ui from "@/styles/admin.module.css";
import styles from "./ImageField.module.css";

/** Where the focal point of the crop sits. The card frame is a fixed height, so
 *  a tall photo has to be told which part matters. */
const POSITIONS = [
  { value: "center", label: "Centre" },
  { value: "top", label: "Top" },
  { value: "bottom", label: "Bottom" },
  { value: "left", label: "Left" },
  { value: "right", label: "Right" },
];

export function ImageField({
  path,
  initialUrl,
  position,
  alt,
  onPathChange,
  onPositionChange,
  onAltChange,
}: {
  path: string | null;
  initialUrl: string | null;
  position: string;
  alt: string;
  onPathChange: (path: string | null) => void;
  onPositionChange: (position: string) => void;
  onAltChange: (alt: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  // Preview follows whatever is current: the server-resolved URL on load, then
  // a local object URL the moment a new file is chosen.
  const [preview, setPreview] = useState<string | null>(initialUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File) {
    setError(null);
    setUploading(true);

    // Show the local file immediately rather than waiting on the round trip.
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);

    try {
      const body = new FormData();
      body.append("file", file);

      const response = await fetch("/api/admin/upload", { method: "POST", body });
      const data = (await response.json().catch(() => ({}))) as {
        path?: string;
        error?: string;
      };

      if (!response.ok || !data.path) {
        setError(data.error ?? "Could not upload that image.");
        // Put the previous image back — a failed upload must not look like it
        // replaced anything.
        setPreview(initialUrl);
        return;
      }

      onPathChange(data.path);
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
      setPreview(initialUrl);
    } finally {
      setUploading(false);
      // Clear the input so re-choosing the same file still fires a change event.
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) void upload(file);
  }

  const isSeeded = Boolean(path && path.startsWith("/"));

  return (
    <div className={styles.wrap}>
      <div className={styles.previewCol}>
        <div className={styles.preview} style={{ backgroundPosition: position }}>
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt=""
              className={styles.previewImage}
              style={{ objectPosition: position }}
            />
          ) : (
            <span className={styles.previewEmpty}>No image yet</span>
          )}
          {uploading && <span className={styles.uploading}>Uploading…</span>}
        </div>

        <div className={styles.previewActions}>
          <button
            type="button"
            className={ui.buttonSecondary + " " + ui.buttonSmall}
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
          >
            {preview ? "Replace" : "Upload"}
          </button>
          {preview && (
            <button
              type="button"
              className={ui.buttonDanger + " " + ui.buttonSmall}
              onClick={() => {
                onPathChange(null);
                setPreview(null);
                setError(null);
              }}
              disabled={uploading}
            >
              Remove
            </button>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          className={ui.visuallyHidden}
          onChange={handleChange}
          tabIndex={-1}
        />
      </div>

      <div className={styles.fields}>
        {error && <p className={ui.noticeError}>{error}</p>}

        {isSeeded && (
          <p className={ui.notice}>
            This is one of the original site photographs. Uploading a replacement leaves
            the original file untouched in the project.
          </p>
        )}

        <div className={ui.field}>
          <label htmlFor="field-alt" className={ui.label}>
            Alt text
          </label>
          <p className={ui.hint}>
            Describes the photo for screen readers and for search engines. Say what is in
            it, not &ldquo;photo of&rdquo;.
          </p>
          <input
            id="field-alt"
            className={ui.input}
            value={alt}
            onChange={(e) => onAltChange(e.target.value)}
          />
        </div>

        <div className={ui.field}>
          <label htmlFor="field-position" className={ui.label}>
            Crop focus
          </label>
          <p className={ui.hint}>
            The card crops to a fixed height. Choose which part of the photo to keep.
          </p>
          <select
            id="field-position"
            className={ui.select}
            value={position}
            onChange={(e) => onPositionChange(e.target.value)}
          >
            {POSITIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <p className={ui.hint}>
          JPEG, PNG, WebP or AVIF, up to 6 MB. Landscape photos around 1600&times;1200
          work best.
        </p>
      </div>
    </div>
  );
}
