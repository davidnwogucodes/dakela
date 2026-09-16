"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Settings } from "@/lib/model";
import { CommodityInput } from "./CommodityInput";
import { PairInput } from "./PairInput";
import ui from "@/styles/admin.module.css";
import styles from "./ExportInfoEditor.module.css";

/** The list blocks, in the order they appear on a product page. */
const BLOCKS = [
  {
    key: "packaging" as const,
    title: "Packaging options",
    hint: "Bag types and sizes you can supply.",
  },
  {
    key: "loading_ports" as const,
    title: "Loading ports",
    hint: "Where shipments leave from.",
  },
  {
    key: "quality_assurance" as const,
    title: "Quality assurance",
    hint: "The controls every shipment passes. Shown as a numbered sequence.",
  },
  {
    key: "certifications" as const,
    title: "Export documentation",
    hint: "Documents provided with a shipment, as applicable.",
  },
  {
    key: "incoterms" as const,
    title: "Incoterms",
    hint: "Terms you trade on.",
  },
  {
    key: "shipment_options" as const,
    title: "Shipment options",
    hint: "FCL, LCL, and any conditions.",
  },
  {
    key: "why_us" as const,
    title: "Why buy from us",
    hint: "Short claims, one per line.",
  },
];

/**
 * Edits the export information every product page shares.
 *
 * Changing anything here changes every product page at once — which is the
 * point. A product that genuinely differs overrides the block on its own editor
 * instead.
 */
export function ExportInfoEditor({ settings }: { settings: Settings }) {
  const router = useRouter();

  const [form, setForm] = useState(() => ({
    packaging: settings.packaging ?? [],
    loading_ports: settings.loading_ports ?? [],
    quality_assurance: settings.quality_assurance ?? [],
    certifications: settings.certifications ?? [],
    incoterms: settings.incoterms ?? [],
    shipment_options: settings.shipment_options ?? [],
    why_us: settings.why_us ?? [],
    faq: settings.faq ?? [],
    default_moq: settings.default_moq ?? "",
    default_lead_time: settings.default_lead_time ?? "",
    downloads_note: settings.downloads_note ?? "",
  }));

  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaveError(null);
    setSaved(false);
    setBusy(true);

    try {
      const response = await fetch("/api/admin/export-info", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        setSaveError(data.error ?? "Could not save. Please try again.");
        return;
      }

      setSaved(true);
      router.refresh();
    } catch {
      setSaveError("Could not reach the server. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      {saveError && <p className={ui.noticeError}>{saveError}</p>}
      {saved && <p className={ui.noticeOk}>Saved. Every product page is updated.</p>}

      {/* --- Commercial defaults ------------------------------------------ */}
      <section className={ui.panel}>
        <div className={ui.panelHead}>
          <h2 className={ui.panelTitle}>Commercial defaults</h2>
        </div>
        <p className={ui.hint}>
          Used on any product that has not set its own under Commercial terms.
        </p>

        <div className={ui.stack}>
          <div className={ui.field}>
            <label htmlFor="default_moq" className={ui.label}>
              Minimum order
            </label>
            <input
              id="default_moq"
              className={ui.input}
              value={form.default_moq}
              onChange={(e) => set("default_moq", e.target.value)}
            />
          </div>

          <div className={ui.field}>
            <label htmlFor="default_lead_time" className={ui.label}>
              Lead time
            </label>
            <input
              id="default_lead_time"
              className={ui.input}
              value={form.default_lead_time}
              onChange={(e) => set("default_lead_time", e.target.value)}
            />
          </div>

          <div className={ui.field}>
            <label htmlFor="downloads_note" className={ui.label}>
              Documents note
            </label>
            <p className={ui.hint}>
              Shown on a product that has no PDFs attached, in place of the download list.
            </p>
            <textarea
              id="downloads_note"
              className={ui.textarea}
              rows={2}
              value={form.downloads_note}
              onChange={(e) => set("downloads_note", e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* --- List blocks --------------------------------------------------- */}
      {BLOCKS.map((block) => (
        <section key={block.key} className={ui.panel}>
          <div className={ui.panelHead}>
            <h2 className={ui.panelTitle}>{block.title}</h2>
            <span className={styles.count}>
              {form[block.key].length}{" "}
              {form[block.key].length === 1 ? "entry" : "entries"}
            </span>
          </div>
          <p className={ui.hint}>{block.hint}</p>

          <CommodityInput
            value={form[block.key]}
            onChange={(next) => set(block.key, next)}
          />
        </section>
      ))}

      {/* --- FAQ ------------------------------------------------------------ */}
      <section className={ui.panel}>
        <div className={ui.panelHead}>
          <h2 className={ui.panelTitle}>General questions</h2>
        </div>
        <p className={ui.hint}>
          Shown on every product page. A product can add its own on top of these.
        </p>

        <PairInput
          value={form.faq.map((row) => ({ left: row.question, right: row.answer }))}
          onChange={(next) =>
            set(
              "faq",
              next.map((row) => ({ question: row.left, answer: row.right })),
            )
          }
          leftLabel="Question"
          rightLabel="Answer"
          multilineRight
          addLabel="Add a question"
          max={30}
        />
      </section>

      <div className={styles.actions}>
        <button type="submit" className={ui.buttonPrimary} disabled={busy}>
          {busy ? "Saving…" : "Save export info"}
        </button>
      </div>
    </form>
  );
}
