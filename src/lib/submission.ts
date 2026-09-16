/**
 * Validating an enquiry against the owner's current form definition.
 *
 * Client-safe on purpose: the public form imports this to show errors before a
 * round trip, and the API route imports the same functions to decide what is
 * actually accepted. The server always re-runs them — a client check is a
 * courtesy, never a guarantee.
 */

import type { EnquiryItem, FormField, FormSection } from "./model";
import { MAX_ITEMS } from "./model";

export type AnswerValue = string | string[] | boolean;
export type Answers = Record<string, AnswerValue>;

export type Submission = {
  type: "buyer" | "supplier";
  answers: Answers;
  items: EnquiryItem[];
  /** Honeypot — must stay empty. */
  website: string;
};

const MAX_TEXT = 500;
const MAX_LONG_TEXT = 2000;

const trimmed = (v: unknown): string => (typeof v === "string" ? v.trim() : "");

/** Fields that apply to one side of the branch: its own plus the shared ones. */
export function fieldsFor(fields: FormField[], type: "buyer" | "supplier"): FormField[] {
  const sections: FormSection[] = ["shared", type];
  return fields
    .filter((field) => sections.includes(field.form) && field.visible)
    .sort((a, b) => a.sort_order - b.sort_order);
}

/** The blank answer for a field, so controlled inputs always have a value. */
export function emptyAnswer(field: FormField): AnswerValue {
  if (field.type === "multiselect") return [];
  if (field.type === "checkbox") return false;
  return "";
}

export function emptyAnswers(fields: FormField[]): Answers {
  const answers: Answers = {};
  for (const field of fields) answers[field.key] = emptyAnswer(field);
  return answers;
}

export const emptyItem = (unit: string): EnquiryItem => ({
  commodity: "",
  grade: "",
  volume: "",
  unit,
});

/** True when the field has been answered — what `required` is measured against. */
function isAnswered(field: FormField, value: AnswerValue | undefined): boolean {
  if (field.type === "multiselect") return Array.isArray(value) && value.length > 0;
  if (field.type === "checkbox") return value === true;
  return trimmed(value).length > 0;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Returns field key → message. Empty means valid.
 * Item errors are keyed `items.<index>.<field>`; the list itself is `items`.
 */
export function validateSubmission(
  fields: FormField[],
  submission: Submission,
  requireItems: boolean,
): Record<string, string> {
  const errors: Record<string, string> = {};

  if (submission.type !== "buyer" && submission.type !== "supplier") {
    errors.type = "Choose whether you are buying or supplying.";
    return errors;
  }

  const applicable = fieldsFor(fields, submission.type);

  for (const field of applicable) {
    const value = submission.answers[field.key];

    if (field.required && !isAnswered(field, value)) {
      errors[field.key] = field.label + " is required.";
      continue;
    }

    // Everything past here only applies to a field that was answered.
    if (!isAnswered(field, value)) continue;

    if (field.type === "email" && !EMAIL.test(trimmed(value))) {
      errors[field.key] = "That does not look like an email address.";
      continue;
    }

    if (field.type === "number" && !/^-?\d+(\.\d+)?$/.test(trimmed(value))) {
      errors[field.key] = "Numbers only.";
      continue;
    }

    if (field.type === "textarea" && trimmed(value).length > MAX_LONG_TEXT) {
      errors[field.key] = "Please keep this under " + MAX_LONG_TEXT + " characters.";
      continue;
    }

    if (
      ["text", "tel", "email", "month"].includes(field.type) &&
      trimmed(value).length > MAX_TEXT
    ) {
      errors[field.key] = "Please keep this under " + MAX_TEXT + " characters.";
      continue;
    }

    // A choice field must be answered from its own option list. Guards against
    // a tampered payload, and against an option the owner deleted after the
    // page was loaded.
    if (field.type === "select" && !field.options.includes(trimmed(value))) {
      errors[field.key] = "Choose one of the listed options.";
      continue;
    }

    if (field.type === "multiselect") {
      const chosen = Array.isArray(value) ? value.map(String) : [];
      if (chosen.some((option) => !field.options.includes(option))) {
        errors[field.key] = "Choose from the listed options.";
      }
    }
  }

  if (requireItems) {
    const items = Array.isArray(submission.items) ? submission.items : [];
    const filled = items.filter((item) => trimmed(item?.commodity));

    if (items.length > MAX_ITEMS) {
      errors.items = "No more than " + MAX_ITEMS + " commodities per submission.";
    } else if (filled.length === 0) {
      errors.items = "Choose a commodity for at least one row.";
    }

    // Keyed by position in `items`, not in `filled`, so a message lands on the
    // row the form actually rendered when a blank row sits above a filled one.
    items.forEach((item, index) => {
      if (!trimmed(item?.commodity)) return;
      if (!trimmed(item.volume)) {
        errors["items." + index + ".volume"] =
          submission.type === "buyer" ? "Volume required." : "Capacity required.";
      } else if (!/^\d+(\.\d+)?$/.test(trimmed(item.volume))) {
        errors["items." + index + ".volume"] = "Numbers only.";
      }
    });
  }

  return errors;
}

/**
 * Normalises answers for storage: drops keys with no matching field, trims,
 * clamps, and coerces each value to the shape its field type implies.
 *
 * Filtering by the field list is what stops a crafted payload writing arbitrary
 * keys into the answers JSON.
 */
export function normaliseAnswers(fields: FormField[], answers: Answers): Answers {
  const byKey = new Map(fields.map((field) => [field.key, field]));
  const output: Answers = {};

  for (const [key, value] of Object.entries(answers ?? {})) {
    const field = byKey.get(key);
    if (!field) continue;

    if (field.type === "checkbox") {
      if (value === true) output[key] = true;
      continue;
    }

    if (field.type === "multiselect") {
      const chosen = (Array.isArray(value) ? value : [])
        .map(String)
        .filter((option) => field.options.includes(option))
        .slice(0, 100);
      if (chosen.length > 0) output[key] = chosen;
      continue;
    }

    const text = trimmed(value);
    if (!text) continue;
    output[key] = text.slice(0, field.type === "textarea" ? MAX_LONG_TEXT : MAX_TEXT);
  }

  return output;
}

export function normaliseItems(items: EnquiryItem[]): EnquiryItem[] {
  return (Array.isArray(items) ? items : [])
    .filter((item) => trimmed(item?.commodity))
    .slice(0, MAX_ITEMS)
    .map((item) => ({
      commodity: trimmed(item.commodity).slice(0, 120),
      grade: trimmed(item.grade).slice(0, 120),
      volume: trimmed(item.volume).slice(0, 40),
      unit: trimmed(item.unit).slice(0, 40),
    }));
}

/**
 * The contact details lifted out of `answers` into their own columns, so the
 * dashboard list can sort and search without unpacking JSON per row. Falls back
 * to any field of the right type when the owner has renamed or removed the
 * originals.
 */
export function contactColumns(fields: FormField[], answers: Answers) {
  const pick = (key: string, type?: string): string | null => {
    const direct = answers[key];
    if (typeof direct === "string" && direct.trim()) return direct.trim().slice(0, 200);

    if (type) {
      const field = fields.find((f) => f.type === type);
      const value = field ? answers[field.key] : undefined;
      if (typeof value === "string" && value.trim()) return value.trim().slice(0, 200);
    }

    return null;
  };

  return {
    full_name: pick("fullName"),
    company: pick("company"),
    email: pick("email", "email"),
    phone: pick("phone", "tel"),
  };
}
