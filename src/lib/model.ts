/**
 * Shapes and constants shared by the browser and the server.
 *
 * Deliberately free of imports: content.ts is server-only (it reaches for the
 * secret key), so anything a client component needs — a type, a list of field
 * types — has to live somewhere neutral. Importing a value from a server-only
 * module is what drags server code into a browser bundle.
 */

export type Product = {
  id: string;
  slug: string;
  title: string;
  description: string;
  commodities: string[];
  image_path: string | null;
  image_position: string;
  alt: string;
  origin: string | null;
  uses: string | null;
  nutrition: string | null;
  grades: string | null;
  seasonality: string | null;
  sort_order: number;
  published: boolean;
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
};
