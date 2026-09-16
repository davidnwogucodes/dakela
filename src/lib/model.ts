/**
 * Shapes and constants shared by the browser and the server.
 *
 * Deliberately free of imports: content.ts is server-only (it reaches for the
 * secret key), so anything a client component needs — a type, a list of field
 * types — has to live somewhere neutral. Importing a value from a server-only
 * module is what drags server code into a browser bundle.
 */

/** A row in a product specification table. Free-form label/value, because the
 *  parameters that matter differ completely between commodities: moisture and
 *  purity for hibiscus, free fatty acid for palm oil, kernel outturn for cashew. */
export type SpecRow = { label: string; value: string };

export type FaqItem = { question: string; answer: string };

/** An uploaded PDF attached to a product. The path is a Storage object path. */
export type ProductDocument = { label: string; path: string; size: number };

export type Product = {
  id: string;
  slug: string;
  title: string;
  description: string;
  commodities: string[];
  image_path: string | null;
  image_position: string;
  alt: string;

  // Hover-card teasers. When blank, the card falls back to joining the
  // structured lists below, so filling in the list alone is enough.
  origin: string | null;
  uses: string | null;
  nutrition: string | null;
  grades: string | null;
  seasonality: string | null;

  // Product page
  overview: string | null;
  botanical_name: string | null;
  producing_states: string[];
  applications: string[];
  forms: string[];
  specifications: SpecRow[];
  moq: string | null;
  lead_time: string | null;
  related_slugs: string[];
  faq: FaqItem[];
  documents: ProductDocument[];

  // Empty array means inherit the site-wide list from Settings.
  packaging: string[];
  loading_ports: string[];
  incoterms: string[];
  shipment_options: string[];
  quality_assurance: string[];
  certifications: string[];

  sort_order: number;
  published: boolean;
};

/** Blocks a product may override. Each key exists on both Product and Settings. */
export const OVERRIDABLE = [
  "packaging",
  "loading_ports",
  "incoterms",
  "shipment_options",
  "quality_assurance",
  "certifications",
] as const;

export type Overridable = (typeof OVERRIDABLE)[number];

/** How each overridable block is labelled in the dashboard and on the page. */
export const OVERRIDABLE_LABELS: Record<Overridable, string> = {
  packaging: "Packaging options",
  loading_ports: "Loading ports",
  incoterms: "Incoterms",
  shipment_options: "Shipment options",
  quality_assurance: "Quality assurance",
  certifications: "Export documentation",
};

export const FIELD_TYPES = [
  "text",
  "email",
  "tel",
  "textarea",
  "number",
  "select",
  "multiselect",
  "checkbox",
  "month",
] as const;

export type FieldType = (typeof FIELD_TYPES)[number];

/** How each field type is described in the dashboard's type picker. */
export const FIELD_TYPE_LABELS: Record<FieldType, string> = {
  text: "Short text",
  email: "Email address",
  tel: "Phone number",
  textarea: "Long text",
  number: "Number",
  select: "Dropdown — pick one",
  multiselect: "Checkboxes — pick several",
  checkbox: "Single tick box",
  month: "Month and year",
};

export type FormSection = "shared" | "buyer" | "supplier";

export const FORM_SECTIONS: { value: FormSection; label: string; note: string }[] = [
  {
    value: "shared",
    label: "Both",
    note: "Asked of buyers and suppliers alike",
  },
  {
    value: "buyer",
    label: "Buyers only",
    note: "Shown when someone says they are buying",
  },
  {
    value: "supplier",
    label: "Suppliers only",
    note: "Shown when someone says they are supplying",
  },
];

export type FormField = {
  id: string;
  form: FormSection;
  key: string;
  label: string;
  hint: string | null;
  placeholder: string | null;
  type: FieldType;
  options: string[];
  required: boolean;
  visible: boolean;
  system: boolean;
  sort_order: number;
};

export type Settings = {
  theme_preset: string;
  accent: string | null;
  enquiry_heading: string | null;
  enquiry_intro: string | null;
  buyer_enabled: boolean;
  supplier_enabled: boolean;

  // Site-wide export information, shared by every product page.
  loading_ports: string[];
  incoterms: string[];
  shipment_options: string[];
  quality_assurance: string[];
  certifications: string[];
  packaging: string[];
  why_us: string[];
  faq: FaqItem[];
  default_moq: string | null;
  default_lead_time: string | null;
  downloads_note: string | null;
};

export type EnquiryItem = {
  commodity: string;
  grade: string;
  volume: string;
  unit: string;
};

export type Enquiry = {
  id: string;
  created_at: string;
  type: "buyer" | "supplier";
  full_name: string | null;
  company: string | null;
  email: string | null;
  phone: string | null;
  answers: Record<string, unknown>;
  items: EnquiryItem[];
  status: "new" | "contacted" | "quoted" | "closed";
  read: boolean;
};

export const ENQUIRY_STATUSES = ["new", "contacted", "quoted", "closed"] as const;

/** Units offered on the repeating commodity rows. */
export const UNITS = ["MT/month", "MT total", "Containers/month", "Litres/month"] as const;

/** Most rows anyone may add to one submission. */
export const MAX_ITEMS = 8;

export const defaultSettings: Settings = {
  theme_preset: "default",
  accent: null,
  enquiry_heading: null,
  enquiry_intro: null,
  buyer_enabled: true,
  supplier_enabled: true,
  loading_ports: [],
  incoterms: [],
  shipment_options: [],
  quality_assurance: [],
  certifications: [],
  packaging: [],
  why_us: [],
  faq: [],
  default_moq: null,
  default_lead_time: null,
  downloads_note: null,
};

/**
 * Resolves one overridable block: the product's own list when it has filled one
 * in, otherwise the site-wide list. An empty array is what "inherit" looks like,
 * so the dashboard can express it by simply leaving the field alone.
 */
export function resolveBlock(
  product: Pick<Product, Overridable>,
  settings: Pick<Settings, Overridable>,
  key: Overridable,
): { values: string[]; inherited: boolean } {
  const own = product[key] ?? [];
  if (own.length > 0) return { values: own, inherited: false };
  return { values: settings[key] ?? [], inherited: true };
}
