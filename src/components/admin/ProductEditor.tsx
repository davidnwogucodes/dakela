"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  OVERRIDABLE,
  OVERRIDABLE_LABELS,
  type Overridable,
  type Product,
} from "@/lib/model";
import { slugify, validateProduct, type ProductInput } from "@/lib/validation";
import { CommodityInput } from "./CommodityInput";
import { DocumentsField } from "./DocumentsField";
import { ImageField } from "./ImageField";
import { PairInput } from "./PairInput";
import ui from "@/styles/admin.module.css";
import styles from "./ProductEditor.module.css";

/** Teaser fields shown on the home-page hover card. */
const TEASER_FIELDS = [
  {
    key: "origin" as const,
    label: "Origin",
    hint: "Leave blank to use the producing states above.",
  },
  {
    key: "uses" as const,
    label: "Uses",
    hint: "Leave blank to use the applications above.",
  },
  { key: "nutrition" as const, label: "Nutrition", hint: "Worth claiming in one line." },
  { key: "grades" as const, label: "Grades", hint: "Typical grades or purity." },
  { key: "seasonality" as const, label: "Season", hint: "When it is harvested." },
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

    overview: product?.overview ?? "",
    botanical_name: product?.botanical_name ?? "",
    producing_states: product?.producing_states ?? [],
    applications: product?.applications ?? [],
    forms: product?.forms ?? [],
    specifications: product?.specifications ?? [],
    moq: product?.moq ?? "",
    lead_time: product?.lead_time ?? "",
    related_slugs: product?.related_slugs ?? [],
    faq: product?.faq ?? [],
    documents: product?.documents ?? [],

    packaging: product?.packaging ?? [],
    loading_ports: product?.loading_ports ?? [],
    incoterms: product?.incoterms ?? [],
    shipment_options: product?.shipment_options ?? [],
    quality_assurance: product?.quality_assurance ?? [],
    certifications: product?.certifications ?? [],

    published: product?.published ?? true,
  };
}

export function ProductEditor({
  product,
  imageUrl,
  siblings,
}: {
  product: Product | null;
  /** Resolved server-side, since the storage base URL is not public. */
  imageUrl: string | null;
  /** Other products, for the "related" picker. */
  siblings: { slug: string; title: string }[];
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

          <div className={ui.grid2}>
            <div className={ui.field}>
              <label htmlFor="field-slug" className={ui.label}>
                Slug
              </label>
              <p className={ui.hint}>
                The web address: /products/<strong>{form.slug || "…"}</strong>. Changing it
                on a live product breaks existing links.
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
              <label htmlFor="field-botanical_name" className={ui.label}>
                Botanical name
              </label>
              <p className={ui.hint}>Optional. Shown in italics under the title.</p>
              <input
                id="field-botanical_name"
                className={ui.input}
                value={form.botanical_name}
                onChange={(e) => set("botanical_name", e.target.value)}
                placeholder="e.g. Hibiscus sabdariffa"
              />
            </div>
          </div>

          <div className={ui.field}>
            <label htmlFor="field-description" className={ui.label}>
              Short description
            </label>
            <p className={ui.hint}>
              One or two sentences. Used on the product card and at the top of the product
              page.
            </p>
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

      {/* --- Photograph --------------------------------------------------- */}
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

      {/* --- Product page ------------------------------------------------- */}
      <section className={ui.panel}>
        <div className={ui.panelHead}>
          <h2 className={ui.panelTitle}>Product page</h2>
        </div>
        <p className={ui.hint}>
          Everything here appears at /products/{form.slug || "…"}. Leave any part blank and
          that section is left out of the page entirely.
        </p>

        <div className={ui.stack}>
          <div className={ui.field}>
            <label htmlFor="field-overview" className={ui.label}>
              Overview
            </label>
            <p className={ui.hint}>
              A paragraph or two: what it is, why buyers want it, what makes the Nigerian
              crop distinctive.
            </p>
            <textarea
              id="field-overview"
              className={ui.textarea}
              rows={6}
              value={form.overview}
              onChange={(e) => set("overview", e.target.value)}
              aria-invalid={Boolean(errors.overview)}
            />
            {errors.overview && <p className={ui.error}>{errors.overview}</p>}
          </div>

          <div className={ui.field}>
            <span className={ui.label}>Major producing states</span>
            <p className={ui.hint}>Type a state and press Enter.</p>
            <CommodityInput
              value={form.producing_states}
              onChange={(next) => set("producing_states", next)}
            />
          </div>

          <div className={ui.field}>
            <span className={ui.label}>Available forms</span>
            <p className={ui.hint}>
              How it can be supplied — whole, cleaned, tea cut, powder, and so on.
            </p>
            <CommodityInput value={form.forms} onChange={(next) => set("forms", next)} />
          </div>

          <div className={ui.field}>
            <span className={ui.label}>Applications</span>
            <p className={ui.hint}>The industries and uses buyers care about.</p>
            <CommodityInput
              value={form.applications}
              onChange={(next) => set("applications", next)}
            />
          </div>
        </div>
      </section>

      {/* --- Specification ------------------------------------------------ */}
      <section className={ui.panel}>
        <div className={ui.panelHead}>
          <h2 className={ui.panelTitle}>Specification table</h2>
        </div>
        <p className={ui.hint}>
          Whatever parameters matter for this commodity — moisture and purity for a dried
          flower, free fatty acid for an oil, kernel outturn for a nut.
        </p>

        <PairInput
          value={form.specifications.map((row) => ({ left: row.label, right: row.value }))}
          onChange={(next) =>
            set(
              "specifications",
              next.map((row) => ({ label: row.left, value: row.right })),
            )
          }
          leftLabel="Parameter"
          rightLabel="Specification"
          leftPlaceholder="Moisture content"
          rightPlaceholder="12% max"
          addLabel="Add a parameter"
        />
        {errors.specifications && <p className={ui.error}>{errors.specifications}</p>}
      </section>

      {/* --- Commercial terms --------------------------------------------- */}
      <section className={ui.panel}>
        <div className={ui.panelHead}>
          <h2 className={ui.panelTitle}>Commercial terms</h2>
        </div>
        <p className={ui.hint}>
          Leave either blank to use the site-wide default set under Export info.
        </p>

        <div className={ui.grid2}>
          <div className={ui.field}>
            <label htmlFor="field-moq" className={ui.label}>
              Minimum order
            </label>
            <input
              id="field-moq"
              className={ui.input}
              value={form.moq}
              onChange={(e) => set("moq", e.target.value)}
              placeholder="One 20 ft container"
            />
          </div>

          <div className={ui.field}>
            <label htmlFor="field-lead_time" className={ui.label}>
              Lead time
            </label>
            <input
              id="field-lead_time"
              className={ui.input}
              value={form.lead_time}
              onChange={(e) => set("lead_time", e.target.value)}
              placeholder="2–4 weeks after confirmation"
            />
          </div>
        </div>
      </section>

      {/* --- Documents ----------------------------------------------------- */}
      <section className={ui.panel}>
        <div className={ui.panelHead}>
          <h2 className={ui.panelTitle}>Documents</h2>
        </div>
        <p className={ui.hint}>
          Specification sheets, technical data sheets, brochures. These become download
          links on the product page. With none attached, the page shows the
          &ldquo;available on request&rdquo; note from Export info instead.
        </p>

        <DocumentsField
          value={form.documents}
          onChange={(next) => set("documents", next)}
        />
      </section>

      {/* --- FAQ ----------------------------------------------------------- */}
      <section className={ui.panel}>
        <div className={ui.panelHead}>
          <h2 className={ui.panelTitle}>Questions</h2>
        </div>
        <p className={ui.hint}>
          Questions specific to this commodity. These are shown <em>in addition to</em> the
          general ones set under Export info, not instead of them.
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
        {errors.faq && <p className={ui.error}>{errors.faq}</p>}
      </section>

      {/* --- Related ------------------------------------------------------- */}
      {siblings.length > 0 && (
        <section className={ui.panel}>
          <div className={ui.panelHead}>
            <h2 className={ui.panelTitle}>Related products</h2>
          </div>
          <p className={ui.hint}>Shown at the foot of the product page.</p>

          <div className={styles.related}>
            {siblings.map((sibling) => {
              const checked = form.related_slugs.includes(sibling.slug);
              return (
                <label key={sibling.slug} className={styles.relatedItem}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() =>
                      set(
                        "related_slugs",
                        checked
                          ? form.related_slugs.filter((s) => s !== sibling.slug)
                          : [...form.related_slugs, sibling.slug],
                      )
                    }
                  />
                  <span>{sibling.title}</span>
                </label>
              );
            })}
          </div>
        </section>
      )}

      {/* --- Hover card ---------------------------------------------------- */}
      <section className={ui.panel}>
        <div className={ui.panelHead}>
          <h2 className={ui.panelTitle}>Home page hover card</h2>
        </div>
        <p className={ui.hint}>
          The short teaser shown when someone hovers this product on the home page. Each
          line is optional.
        </p>

        <div className={ui.stack}>
          {TEASER_FIELDS.map((field) => (
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

      {/* --- Overrides ------------------------------------------------------ */}
      <details className={styles.advanced}>
        <summary className={styles.advancedSummary}>
          Override the shared export information for this product
        </summary>
        <div className={styles.advancedBody}>
          <p className={ui.hint}>
            These blocks normally come from Export info and are the same on every product
            page. Fill one in here and this product alone uses your version. Leave it empty
            and it keeps following the shared list, so changing the shared one updates this
            page too.
          </p>

          <div className={ui.stack}>
            {OVERRIDABLE.map((key: Overridable) => (
              <div key={key} className={ui.field}>
                <span className={ui.label}>{OVERRIDABLE_LABELS[key]}</span>
                <p className={ui.hint}>
                  {form[key].length > 0
                    ? "Overridden for this product."
                    : "Inheriting the shared list."}
                </p>
                <CommodityInput value={form[key]} onChange={(next) => set(key, next)} />
              </div>
            ))}
          </div>
        </div>
      </details>

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
        {!isNew && form.published && (
          <a
            href={"/products/" + form.slug}
            target="_blank"
            rel="noopener"
            className={ui.buttonSecondary}
          >
            View page ↗
          </a>
        )}
      </div>
    </form>
  );
}
