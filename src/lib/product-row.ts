import "server-only";

/**
 * Maps a validated ProductInput onto database columns.
 *
 * Shared by the create and update routes so they cannot drift — a field added
 * to one and forgotten in the other is exactly the bug that makes "it saves
 * when I add it but not when I edit it".
 *
 * The client object is never spread into a query. Every column is listed here
 * explicitly, so a crafted payload cannot set something that was not offered.
 */

import type { ProductInput } from "./validation";
import type { FaqItem, ProductDocument, SpecRow } from "./model";

const text = (v: unknown, max = 600): string | null =>
  typeof v === "string" && v.trim() ? v.trim().slice(0, max) : null;

const list = (v: unknown, max = 40, itemMax = 200): string[] =>
  Array.isArray(v)
    ? v
        .map((item) => String(item).trim().slice(0, itemMax))
        .filter(Boolean)
        .slice(0, max)
    : [];

function specs(v: unknown): SpecRow[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((row) => ({
      label: text((row as SpecRow)?.label, 120) ?? "",
      value: text((row as SpecRow)?.value, 300) ?? "",
    }))
    // A row with no label has nothing to say; a row with no value is an
    // unanswered parameter and is likewise not worth rendering.
    .filter((row) => row.label && row.value)
    .slice(0, 60);
}

function faq(v: unknown): FaqItem[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((row) => ({
      question: text((row as FaqItem)?.question, 300) ?? "",
      answer: text((row as FaqItem)?.answer, 2000) ?? "",
    }))
    .filter((row) => row.question && row.answer)
    .slice(0, 30);
}

function documents(v: unknown): ProductDocument[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((row) => ({
      label: text((row as ProductDocument)?.label, 160) ?? "",
      path: text((row as ProductDocument)?.path, 400) ?? "",
      size: Number((row as ProductDocument)?.size) || 0,
    }))
    .filter((row) => row.label && row.path)
    .slice(0, 20);
}

export function toProductRow(input: ProductInput) {
  return {
    slug: String(input.slug).trim().toLowerCase(),
    title: String(input.title).trim().slice(0, 120),
    description: text(input.description) ?? "",
    commodities: list(input.commodities, 30),

    image_path: text(input.image_path, 400),
    image_position: text(input.image_position, 40) ?? "center",
    alt: text(input.alt, 300) ?? "",

    // Hover-card teasers
    origin: text(input.origin),
    uses: text(input.uses),
    nutrition: text(input.nutrition),
    grades: text(input.grades),
    seasonality: text(input.seasonality),

    // Product page
    overview: text(input.overview, 4000),
    botanical_name: text(input.botanical_name, 160),
    producing_states: list(input.producing_states),
    applications: list(input.applications),
    forms: list(input.forms),
    specifications: specs(input.specifications),
    moq: text(input.moq, 400),
    lead_time: text(input.lead_time, 400),
    related_slugs: list(input.related_slugs, 12, 60),
    faq: faq(input.faq),
    documents: documents(input.documents),

    // Empty array means inherit the site-wide list.
    packaging: list(input.packaging),
    loading_ports: list(input.loading_ports),
    incoterms: list(input.incoterms),
    shipment_options: list(input.shipment_options),
    quality_assurance: list(input.quality_assurance),
    certifications: list(input.certifications),

    published: Boolean(input.published),
  };
}
