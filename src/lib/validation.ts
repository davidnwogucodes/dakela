/**
 * Validation shared by the dashboard forms and the routes that accept them.
 *
 * The client copy is a convenience so the owner sees a problem before a round
 * trip; the server copy is the one that counts. Both import from here so they
 * cannot drift apart.
 */

import {
  FIELD_TYPES,
  type FaqItem,
  type FieldType,
  type FormSection,
  type ProductDocument,
  type SpecRow,
} from "./model";

export type Errors = Record<string, string>;

const trimmed = (v: unknown): string => (typeof v === "string" ? v.trim() : "");

/* -------------------------------------------------------------------------- */
/* Products                                                                    */
/* -------------------------------------------------------------------------- */

export type ProductInput = {
  slug: string;
  title: string;
  description: string;
  commodities: string[];
  image_path: string | null;
  image_position: string;
  alt: string;

  // Hover-card teasers
  origin: string;
  uses: string;
  nutrition: string;
  grades: string;
  seasonality: string;

  // Product page
  overview: string;
  botanical_name: string;
  producing_states: string[];
  applications: string[];
  forms: string[];
  specifications: SpecRow[];
  moq: string;
  lead_time: string;
  related_slugs: string[];
  faq: FaqItem[];
  documents: ProductDocument[];

  // Empty means inherit the site-wide list
  packaging: string[];
  loading_ports: string[];
  incoterms: string[];
  shipment_options: string[];
  quality_assurance: string[];
  certifications: string[];

  published: boolean;
};

/** Lowercase, hyphen-separated, no leading/trailing hyphen. Matches the slugs
 *  already in products.ts, and keeps /products/<slug> URLs clean later. */
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // strip accents
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function validateProduct(input: ProductInput): Errors {
  const errors: Errors = {};

  if (!trimmed(input.title)) errors.title = "A title is required.";
  else if (trimmed(input.title).length > 120) errors.title = "Keep the title under 120 characters.";

  const slug = trimmed(input.slug);
  if (!slug) errors.slug = "A slug is required.";
  else if (!SLUG_PATTERN.test(slug)) {
    errors.slug = "Lowercase letters, numbers and single hyphens only.";
  } else if (slug.length > 60) errors.slug = "Keep the slug under 60 characters.";

  if (trimmed(input.description).length > 600) {
    errors.description = "Keep the description under 600 characters.";
  }

  if (!Array.isArray(input.commodities)) errors.commodities = "Commodities must be a list.";
  else if (input.commodities.length > 30) errors.commodities = "No more than 30 commodities.";

  for (const key of ["origin", "uses", "nutrition", "grades", "seasonality"] as const) {
    if (trimmed(input[key]).length > 600) {
      errors[key] = "Keep this under 600 characters.";
    }
  }

  if (trimmed(input.alt).length > 300) errors.alt = "Keep the alt text under 300 characters.";

  if (trimmed(input.overview).length > 4000) {
    errors.overview = "Keep the overview under 4000 characters.";
  }

  // A specification row needs both halves to mean anything. Flagging it here is
  // kinder than silently dropping it on save, which looks like data loss.
  const rows = Array.isArray(input.specifications) ? input.specifications : [];
  if (rows.length > 60) {
    errors.specifications = "No more than 60 specification rows.";
  } else {
    const halfFilled = rows.findIndex(
      (row) => Boolean(trimmed(row?.label)) !== Boolean(trimmed(row?.value)),
    );
    if (halfFilled !== -1) {
      errors.specifications = "Every specification row needs both a label and a value.";
    }
  }

  const questions = Array.isArray(input.faq) ? input.faq : [];
  if (questions.length > 30) {
    errors.faq = "No more than 30 questions.";
  } else if (
    questions.some(
      (row) => Boolean(trimmed(row?.question)) !== Boolean(trimmed(row?.answer)),
    )
  ) {
    errors.faq = "Every question needs an answer.";
  }

  return errors;
}

/* -------------------------------------------------------------------------- */
/* Form fields                                                                 */
/* -------------------------------------------------------------------------- */

export type FormFieldInput = {
  form: FormSection;
  key: string;
  label: string;
  hint: string;
  placeholder: string;
  type: FieldType;
  options: string[];
  required: boolean;
  visible: boolean;
};

/** Types whose answer is chosen from `options`, so an empty list is useless. */
export const CHOICE_TYPES: FieldType[] = ["select", "multiselect", "checkbox"];

/** A field key becomes a JSON object key in `answers`, and must stay stable. */
export const KEY_PATTERN = /^[a-zA-Z][a-zA-Z0-9_]{0,39}$/;

export function keyify(label: string): string {
  const camel = label
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+(.)/g, (_, chr: string) => chr.toUpperCase())
    .replace(/[^a-zA-Z0-9]/g, "");

  // Keys must start with a letter; prefix rather than silently dropping digits.
  const safe = /^[a-zA-Z]/.test(camel) ? camel : "field" + camel;
  return safe.slice(0, 40) || "field";
}

export function validateFormField(input: FormFieldInput): Errors {
  const errors: Errors = {};

  if (!["shared", "buyer", "supplier"].includes(input.form)) {
    errors.form = "Choose which side of the form this belongs to.";
  }

  if (!trimmed(input.label)) errors.label = "A label is required.";
  else if (trimmed(input.label).length > 120) errors.label = "Keep the label under 120 characters.";

  const key = trimmed(input.key);
  if (!key) errors.key = "A key is required.";
  else if (!KEY_PATTERN.test(key)) {
    errors.key = "Start with a letter; letters, numbers and underscores only.";
  }

  if (!FIELD_TYPES.includes(input.type)) errors.type = "Choose a field type.";

  if (CHOICE_TYPES.includes(input.type)) {
    const options = (input.options ?? []).map(trimmed).filter(Boolean);
    if (options.length === 0) {
      errors.options = "Add at least one choice for this field type.";
    } else if (options.length > 100) {
      errors.options = "No more than 100 choices.";
    } else if (new Set(options.map((o) => o.toLowerCase())).size !== options.length) {
      errors.options = "Choices must be unique.";
    }
  }

  if (trimmed(input.hint).length > 300) errors.hint = "Keep the hint under 300 characters.";

  return errors;
}

/* -------------------------------------------------------------------------- */
/* Settings                                                                    */
/* -------------------------------------------------------------------------- */

export const HEX_PATTERN = /^#[0-9a-fA-F]{6}$/;

export function validateSettings(input: {
  accent: string | null;
  enquiry_heading: string;
  enquiry_intro: string;
  buyer_enabled: boolean;
  supplier_enabled: boolean;
}): Errors {
  const errors: Errors = {};

  if (input.accent && !HEX_PATTERN.test(input.accent)) {
    errors.accent = "Use a 6-digit hex colour, e.g. #b07c2e.";
  }

  if (trimmed(input.enquiry_heading).length > 200) {
    errors.enquiry_heading = "Keep the heading under 200 characters.";
  }

  if (trimmed(input.enquiry_intro).length > 800) {
    errors.enquiry_intro = "Keep the intro under 800 characters.";
  }

  if (!input.buyer_enabled && !input.supplier_enabled) {
    errors.buyer_enabled = "At least one side of the form must stay open.";
  }

  return errors;
}
