"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Settings } from "@/lib/model";
import {
  accentIsLegible,
  contrastRatio,
  deriveAccent,
  presetById,
  THEME_PRESETS,
} from "@/lib/theme";
import { HEX_PATTERN, validateSettings } from "@/lib/validation";
import ui from "@/styles/admin.module.css";
import styles from "./AppearanceEditor.module.css";

export function AppearanceEditor({ settings }: { settings: Settings }) {
  const router = useRouter();

  const [preset, setPreset] = useState(settings.theme_preset || "default");
  const [accent, setAccent] = useState(settings.accent ?? "");
  const [heading, setHeading] = useState(settings.enquiry_heading ?? "");
  const [intro, setIntro] = useState(settings.enquiry_intro ?? "");
  const [buyerEnabled, setBuyerEnabled] = useState(settings.buyer_enabled);
  const [supplierEnabled, setSupplierEnabled] = useState(settings.supplier_enabled);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  const active = presetById(preset);

  // The preview reflects exactly what themeCss will produce, including the
  // automatic darkening applied to keep link text legible.
  const validAccent = accent && HEX_PATTERN.test(accent) ? accent : null;
  const derived = validAccent
    ? deriveAccent(validAccent, active.tokens.paper)
    : {
        accent: active.tokens.accent,
        accentLight: active.tokens.accentLight,
        accentDeep: active.tokens.accentDeep,
      };

  const buttonContrast = contrastRatio(derived.accent, active.tokens.ink);
  const legible = accentIsLegible(derived.accent, active.tokens.ink);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaveError(null);
    setSaved(false);

    const found = validateSettings({
      accent: accent || null,
      enquiry_heading: heading,
      enquiry_intro: intro,
      buyer_enabled: buyerEnabled,
      supplier_enabled: supplierEnabled,
    });

    if (Object.keys(found).length > 0) {
      setErrors(found);
      return;
    }

    setErrors({});
    setBusy(true);

    try {
      const response = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          theme_preset: preset,
          accent: accent || null,
          enquiry_heading: heading,
          enquiry_intro: intro,
          buyer_enabled: buyerEnabled,
          supplier_enabled: supplierEnabled,
        }),
      });

      if (response.status === 422) {
        const data = (await response.json()) as { errors?: Record<string, string> };
        setErrors(data.errors ?? {});
        setBusy(false);
        return;
      }

      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        setSaveError(data.error ?? "Could not save. Please try again.");
        setBusy(false);
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
      {saved && <p className={ui.noticeOk}>Saved. The site is updated.</p>}

      {/* --- Palette ------------------------------------------------------ */}
      <section className={ui.panel}>
        <div className={ui.panelHead}>
          <h2 className={ui.panelTitle}>Palette</h2>
        </div>
        <p className={ui.hint}>
          Each palette has been checked for legibility. Pick one, then optionally
          override just the accent colour below.
        </p>

        <div className={styles.presets}>
          {THEME_PRESETS.map((option) => (
            <label
              key={option.id}
              className={
                styles.preset + (preset === option.id ? " " + styles.presetActive : "")
              }
            >
              <input
                type="radio"
                name="preset"
                value={option.id}
                checked={preset === option.id}
                onChange={() => setPreset(option.id)}
                className={ui.visuallyHidden}
              />

              <span className={styles.swatches} aria-hidden="true">
                <span style={{ background: option.tokens.ink }} />
                <span style={{ background: option.tokens.paper }} />
                <span
                  style={{
                    background:
                      preset === option.id && validAccent
                        ? derived.accent
                        : option.tokens.accent,
                  }}
                />
                <span style={{ background: option.tokens.line }} />
              </span>

              <span className={styles.presetName}>{option.name}</span>
              <span className={styles.presetNote}>{option.description}</span>
            </label>
          ))}
        </div>
      </section>

      {/* --- Accent ------------------------------------------------------- */}
      <section className={ui.panel}>
        <div className={ui.panelHead}>
          <h2 className={ui.panelTitle}>Accent colour</h2>
        </div>
        <p className={ui.hint}>
          Used for buttons, links and the small section labels. Leave blank to use the
          palette&rsquo;s own accent.
        </p>

        <div className={styles.accentRow}>
          <input
            type="color"
            className={styles.colorInput}
            value={validAccent ?? active.tokens.accent}
            onChange={(e) => setAccent(e.target.value)}
            aria-label="Pick an accent colour"
          />

          <div className={ui.field + " " + styles.hexField}>
            <label htmlFor="accent-hex" className={ui.label}>
              Hex
            </label>
            <input
              id="accent-hex"
              className={ui.input}
              value={accent}
              onChange={(e) => setAccent(e.target.value)}
              placeholder={active.tokens.accent}
              aria-invalid={Boolean(errors.accent)}
            />
            {errors.accent && <p className={ui.error}>{errors.accent}</p>}
          </div>

          {accent && (
            <button
              type="button"
              className={ui.buttonSecondary + " " + ui.buttonSmall}
              onClick={() => setAccent("")}
            >
              Use palette accent
            </button>
          )}
        </div>

        {validAccent && !legible && (
          <p className={ui.noticeWarn}>
            This accent is close in tone to the dark text used on buttons (contrast{" "}
            {buttonContrast.toFixed(1)}:1, below the 4.5:1 guideline). Button labels may be
            hard to read. A deeper or brighter colour will help.
          </p>
        )}

        {accent && !validAccent && (
          <p className={ui.noticeWarn}>
            That is not a complete hex colour yet — use six digits, like{" "}
            <code>#b07c2e</code>.
          </p>
        )}

        {/* --- Preview ---------------------------------------------------- */}
        <div className={styles.preview} style={{ background: active.tokens.paper }}>
          <p className={styles.previewEyebrow} style={{ color: derived.accentDeep }}>
            01 — Preview
          </p>
          <p className={styles.previewHeading} style={{ color: active.tokens.ink }}>
            Sourced to buyer specification.
          </p>
          <p className={styles.previewBody} style={{ color: active.tokens.ink }}>
            Body text on the paper ground, with{" "}
            <span style={{ color: derived.accentDeep, fontWeight: 600 }}>a link</span>{" "}
            inside it.
          </p>
          <div className={styles.previewButtons}>
            <span
              className={styles.previewButton}
              style={{ background: derived.accent, color: active.tokens.ink }}
            >
              Make an enquiry
            </span>
            <span
              className={styles.previewButton}
              style={{
                background: active.tokens.ink,
                color: "#ffffff",
              }}
            >
              Email the trade desk
            </span>
          </div>
        </div>
      </section>

      {/* --- Enquiry page copy -------------------------------------------- */}
      <section className={ui.panel}>
        <div className={ui.panelHead}>
          <h2 className={ui.panelTitle}>Enquiry page wording</h2>
        </div>
        <p className={ui.hint}>
          Leave blank to keep the wording the site ships with.
        </p>

        <div className={ui.stack}>
          <div className={ui.field}>
            <label htmlFor="enquiry-heading" className={ui.label}>
              Heading
            </label>
            <input
              id="enquiry-heading"
              className={ui.input}
              value={heading}
              onChange={(e) => setHeading(e.target.value)}
              placeholder="Tell us what you need, or what you can supply."
              aria-invalid={Boolean(errors.enquiry_heading)}
            />
            {errors.enquiry_heading && <p className={ui.error}>{errors.enquiry_heading}</p>}
          </div>

          <div className={ui.field}>
            <label htmlFor="enquiry-intro" className={ui.label}>
              Intro paragraph
            </label>
            <textarea
              id="enquiry-intro"
              className={ui.textarea}
              rows={3}
              value={intro}
              onChange={(e) => setIntro(e.target.value)}
              placeholder="One form for both sides of the trade…"
              aria-invalid={Boolean(errors.enquiry_intro)}
            />
            {errors.enquiry_intro && <p className={ui.error}>{errors.enquiry_intro}</p>}
          </div>
        </div>
      </section>

      {/* --- Who can submit ------------------------------------------------ */}
      <section className={ui.panel}>
        <div className={ui.panelHead}>
          <h2 className={ui.panelTitle}>Who can submit</h2>
        </div>
        <p className={ui.hint}>
          Close one side if you are not taking those enquiries at the moment. The branch
          chooser disappears and only the open side is shown.
        </p>

        <div className={styles.switches}>
          <label className={styles.switch}>
            <input
              type="checkbox"
              checked={buyerEnabled}
              onChange={(e) => setBuyerEnabled(e.target.checked)}
            />
            <span>
              <strong>Buyers</strong>
              <em>Overseas buyers requesting an offer</em>
            </span>
          </label>

          <label className={styles.switch}>
            <input
              type="checkbox"
              checked={supplierEnabled}
              onChange={(e) => setSupplierEnabled(e.target.checked)}
            />
            <span>
              <strong>Suppliers</strong>
              <em>Aggregators and processors applying to supply</em>
            </span>
          </label>
        </div>

        {errors.buyer_enabled && <p className={ui.error}>{errors.buyer_enabled}</p>}
      </section>

      <div className={styles.actions}>
        <button type="submit" className={ui.buttonPrimary} disabled={busy}>
          {busy ? "Saving…" : "Save appearance"}
        </button>
      </div>
    </form>
  );
}
