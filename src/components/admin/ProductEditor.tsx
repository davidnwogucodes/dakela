"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@/lib/model";
import { slugify, validateProduct, type ProductInput } from "@/lib/validation";
import { CommodityInput } from "./CommodityInput";
import { ImageField } from "./ImageField";
import ui from "@/styles/admin.module.css";
import styles from "./ProductEditor.module.css";

/** The five hover-card fields, kept in one place so the form and the public
 *  card cannot disagree about what exists or what it is called. */
const DETAIL_FIELDS = [
  {
    key: "origin" as const,
    label: "Where it comes from",
    hint: "States or regions. Shown first on the hover card.",
  },
  {
    key: "uses" as const,
    label: "What it is used for",
    hint: "The industries and applications buyers care about.",
  },
  {
    key: "nutrition" as const,
    label: "Nutritional value",
    hint: "Protein, oil content, vitamins — whatever is worth claiming.",
  },
  {
    key: "grades" as const,
    label: "Grades and specification",
    hint: "Typical grades, purity, moisture.",
  },
  {
    key: "seasonality" as const,
    label: "Season",
    hint: "When it is harvested and when you can ship it.",
  },
];

function toInput(product: Product | null): ProductInput {
  return {
    slug: product?.slug ?? "",
    title: product?.title ?? "",
    description: product?.description ?? "",
    commodities: product?.commodities ?? [],
    image_path: product?.image_path ?? null,
    image_position: product?.image_position ?? "center",
    alt: product?.alt ?? "",
    origin: product?.origin ?? "",
    uses: product?.uses ?? "",
    nutrition: product?.nutrition ?? "",
    grades: product?.grades ?? "",
    seasonality: product?.seasonality ?? "",
    published: product?.published ?? true,
  };
}

export function ProductEditor({
  product,
  imageUrl,
}: {
  product: Product | null;
  /** Resolved server-side, since the storage base URL is not public. */
  imageUrl: string | null;
}) {
  const router = useRouter();
  const isNew = product === null;

  const [form, setForm] = useState<ProductInput>(() => toInput(product));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saveError, setSaveError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  /** Once the owner edits the slug by hand, stop deriving it from the title. */
  const [slugTouched, setSlugTouched] = useState(!isNew);

  function set<K extends keyof ProductInput>(key: K, value: ProductInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!(key in prev)) return prev;
      const next = { ...prev };
      delete next[key as string];
      return next;
    });
  }

  function setTitle(value: string) {
    set("title", value);
    if (!slugTouched) set("slug", slugify(value));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaveError(null);

    const found = validateProduct(form);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      const first = document.getElementById("field-" + Object.keys(found)[0]);
      first?.focus();
      first?.scrollIntoView({ block: "center", behavior: "smooth" });
      return;
    }

    setBusy(true);
    try {
      const response = await fetch(
        isNew ? "/api/admin/products" : "/api/admin/products/" + product.id,
        {
          method: isNew ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        },
      );

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

      router.push("/admin/products");
      router.refresh();
    } catch {
      setSaveError("Could not reach the server. Check your connection and try again.");
      setBusy(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      {saveError && <p className={ui.noticeError}>{saveError}</p>}

      {/* --- Basics ------------------------------------------------------- */}
      <section className={ui.panel}>
        <div className={ui.panelHead}>
          <h2 className={ui.panelTitle}>Basics</h2>
          <label className={styles.publishToggle}>
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => set("published", e.target.checked)}
            />
            <span>{form.published ? "Showing on the site" : "Hidden from the site"}</span>
          </label>
        </div>

        <div className={ui.stack}>
          <div className={ui.field}>
            <label htmlFor="field-title" className={ui.label}>
              Title
            </label>
            <input
              id="field-title"
              className={ui.input}
              value={form.title}
              onChange={(e) => setTitle(e.target.value)}
              aria-invalid={Boolean(errors.title)}
            />
            {errors.title && <p className={ui.error}>{errors.title}</p>}
          </div>

          <div className={ui.field}>
            <label htmlFor="field-slug" className={ui.label}>
              Slug
            </label>
            <p className={ui.hint}>
              Used in the web address. Lowercase, hyphens instead of spaces. Changing it
              on a live product breaks any existing links to it.
            </p>
            <input
              id="field-slug"
              className={ui.input}
              value={form.slug}
              onChange={(e) => {
                setSlugTouched(true);
                set("slug", e.target.value);
              }}
              aria-invalid={Boolean(errors.slug)}
            />
            {errors.slug && <p className={ui.error}>{errors.slug}</p>}
          </div>

          <div className={ui.field}>
            <label htmlFor="field-description" className={ui.label}>
              Description
            </label>
            <p className={ui.hint}>One or two sentences, shown on the product card.</p>
            <textarea
              id="field-description"
              className={ui.textarea}
              rows={3}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              aria-invalid={Boolean(errors.description)}
            />
            {errors.description && <p className={ui.error}>{errors.description}</p>}
          </div>

          <div className={ui.field}>
            <span className={ui.label}>Commodities</span>
            <p className={ui.hint}>
              The individual items in this group. These also become the choices buyers and
              suppliers pick from on the enquiry form.
            </p>
            <CommodityInput
              value={form.commodities}
              onChange={(next) => set("commodities", next)}
            />
            {errors.commodities && <p className={ui.error}>{errors.commodities}</p>}
          </div>
        </div>
      </section>

      {/* --- Image -------------------------------------------------------- */}
      <section className={ui.panel}>
        <div className={ui.panelHead}>
          <h2 className={ui.panelTitle}>Photograph</h2>
        </div>

        <ImageField
          path={form.image_path}
          initialUrl={imageUrl}
          position={form.image_position}
          alt={form.alt}
          onPathChange={(path) => set("image_path", path)}
          onPositionChange={(position) => set("image_position", position)}
          onAltChange={(alt) => set("alt", alt)}
        />
        {errors.alt && <p className={ui.error}>{errors.alt}</p>}
      </section>

      {/* --- Hover details ------------------------------------------------ */}
      <section className={ui.panel}>
        <div className={ui.panelHead}>
          <h2 className={ui.panelTitle}>Details shown on hover</h2>
        </div>
        <p className={ui.hint}>
          These appear when someone hovers the product card on the home page. Leave any of
          them blank and that line is simply left out.
        </p>

        <div className={ui.stack}>
          {DETAIL_FIELDS.map((field) => (
            <div key={field.key} className={ui.field}>
              <label htmlFor={"field-" + field.key} className={ui.label}>
                {field.label}
              </label>
              <p className={ui.hint}>{field.hint}</p>
              <textarea
                id={"field-" + field.key}
                className={ui.textarea}
                rows={2}
                value={form[field.key]}
                onChange={(e) => set(field.key, e.target.value)}
                aria-invalid={Boolean(errors[field.key])}
              />
              {errors[field.key] && <p className={ui.error}>{errors[field.key]}</p>}
            </div>
          ))}
        </div>
      </section>

      <div className={styles.actions}>
        <button type="submit" className={ui.buttonPrimary} disabled={busy}>
          {busy ? "Saving…" : isNew ? "Add product" : "Save changes"}
        </button>
        <button
          type="button"
          className={ui.buttonSecondary}
          onClick={() => router.push("/admin/products")}
          disabled={busy}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
