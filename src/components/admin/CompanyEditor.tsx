"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { CompanyRecord } from "@/lib/model";
import ui from "@/styles/admin.module.css";
import styles from "./CompanyEditor.module.css";

/**
 * The company's contact details.
 *
 * Every field falls back to the value shipped in the code when left blank, so
 * clearing one restores the default rather than emptying the site. The hints
 * say so, because "blank means default" is not guessable.
 */
export function CompanyEditor({
  record,
  fallbacks,
}: {
  record: CompanyRecord | null;
  /** What the site renders when a field here is left blank. */
  fallbacks: { email: string; phone: string; rcNumber: string; country: string };
}) {
  const router = useRouter();

  const [form, setForm] = useState({
    email: record?.email ?? "",
    phone: record?.phone ?? "",
    street: record?.street ?? "",
    city: record?.city ?? "",
    state: record?.state ?? "",
    country: record?.country ?? "",
    rcNumber: record?.rcNumber ?? "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  function set(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
    setErrors((prev) => {
      if (!(key in prev)) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  const hasStreet = form.street.trim().length > 0;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaveError(null);
    setSaved(false);
    setBusy(true);

    try {
      const response = await fetch("/api/admin/company", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (response.status === 422) {
        const data = (await response.json()) as { errors?: Record<string, string> };
        setErrors(data.errors ?? {});
        return;
      }

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
      {saved && <p className={ui.noticeOk}>Saved. The site is updated.</p>}

      {/* --- Contact ------------------------------------------------------ */}
      <section className={ui.panel}>
        <div className={ui.panelHead}>
          <h2 className={ui.panelTitle}>Contact</h2>
        </div>
        <p className={ui.hint}>
          Shown in the contact panel, the hero, the enquiry page and the structured
          data search engines read.
        </p>

        <div className={ui.grid2}>
          <div className={ui.field}>
            <label htmlFor="email" className={ui.label}>
              Email
            </label>
            <p className={ui.hint}>
              Blank uses <code>{fallbacks.email}</code>.
            </p>
            <input
              id="email"
              type="email"
              inputMode="email"
              className={ui.input}
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder={fallbacks.email}
              aria-invalid={Boolean(errors.email)}
            />
            {errors.email && <p className={ui.error}>{errors.email}</p>}
          </div>

          <div className={ui.field}>
            <label htmlFor="phone" className={ui.label}>
              Telephone
            </label>
            <p className={ui.hint}>
              Written as you want it read. The dial link strips the spaces itself.
            </p>
            <input
              id="phone"
              type="tel"
              inputMode="tel"
              className={ui.input}
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder={fallbacks.phone}
              aria-invalid={Boolean(errors.phone)}
            />
            {errors.phone && <p className={ui.error}>{errors.phone}</p>}
          </div>
        </div>
      </section>

      {/* --- Registration -------------------------------------------------- */}
      <section className={ui.panel}>
        <div className={ui.panelHead}>
          <h2 className={ui.panelTitle}>Registration</h2>
        </div>

        <div className={ui.field}>
          <label htmlFor="rcNumber" className={ui.label}>
            CAC RC number
          </label>
          <p className={ui.hint}>
            Appears in the credibility strip and the contact panel.
          </p>
          <input
            id="rcNumber"
            className={ui.input}
            value={form.rcNumber}
            onChange={(e) => set("rcNumber", e.target.value)}
            placeholder={fallbacks.rcNumber}
            aria-invalid={Boolean(errors.rcNumber)}
          />
          {errors.rcNumber && <p className={ui.error}>{errors.rcNumber}</p>}
        </div>
      </section>

      {/* --- Office --------------------------------------------------------- */}
      <section className={ui.panel}>
        <div className={ui.panelHead}>
          <h2 className={ui.panelTitle}>Registered office</h2>
          <span className={hasStreet ? ui.badgeOn : ui.badgeOff}>
            {hasStreet ? "Published" : "Not set"}
          </span>
        </div>
        <p className={ui.hint}>
          Leave these blank until the office is confirmed. While the street is empty
          the Office row is left out of the contact panel entirely, and no postal
          address is published to search engines — a half-written address is worse
          than none.
        </p>

        <div className={ui.stack}>
          <div className={ui.field}>
            <label htmlFor="street" className={ui.label}>
              Street
            </label>
            <input
              id="street"
              className={ui.input}
              value={form.street}
              onChange={(e) => set("street", e.target.value)}
              placeholder="e.g. 14 Trans-Amadi Industrial Layout"
              autoComplete="street-address"
            />
          </div>

          <div className={ui.grid3}>
            <div className={ui.field}>
              <label htmlFor="city" className={ui.label}>
                City
              </label>
              <input
                id="city"
                className={ui.input}
                value={form.city}
                onChange={(e) => set("city", e.target.value)}
                autoComplete="address-level2"
                aria-invalid={Boolean(errors.city)}
              />
              {errors.city && <p className={ui.error}>{errors.city}</p>}
            </div>

            <div className={ui.field}>
              <label htmlFor="state" className={ui.label}>
                State
              </label>
              <input
                id="state"
                className={ui.input}
                value={form.state}
                onChange={(e) => set("state", e.target.value)}
                autoComplete="address-level1"
              />
            </div>

            <div className={ui.field}>
              <label htmlFor="country" className={ui.label}>
                Country
              </label>
              <input
                id="country"
                className={ui.input}
                value={form.country}
                onChange={(e) => set("country", e.target.value)}
                placeholder={fallbacks.country}
                autoComplete="country-name"
              />
            </div>
          </div>
        </div>
      </section>

      <div className={styles.actions}>
        <button type="submit" className={ui.buttonPrimary} disabled={busy}>
          {busy ? "Saving…" : "Save company details"}
        </button>
      </div>
    </form>
  );
}
