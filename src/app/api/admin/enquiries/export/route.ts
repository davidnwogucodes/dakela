/**
 * Exports every submission as CSV, for opening in Excel or Google Sheets.
 *
 * Columns are built from the current form definition, so a spreadsheet's
 * headings read like the questions rather than like database keys. Answers to
 * questions the owner has since deleted are appended at the end under their raw
 * key, so history is never silently dropped from the export.
 */

import { requireAdmin } from "@/lib/auth";
import { getEnquiries, getFormFields } from "@/lib/content";
import type { AnswerValue } from "@/lib/submission";

/**
 * Escapes one CSV cell.
 *
 * The leading apostrophe on =, +, - and @ is deliberate: Excel and Sheets treat
 * a cell starting with those as a formula, so a submitted value like
 * `=HYPERLINK(...)` would execute on open. This is CSV injection, and the
 * submissions here come from the public internet.
 */
function cell(value: unknown): string {
  if (value === null || value === undefined) return "";

  let text = Array.isArray(value) ? value.join("; ") : String(value);

  if (/^[=+\-@\t\r]/.test(text)) text = "'" + text;

  // Quote when the value contains a delimiter, a quote or a newline.
  if (/["\n\r,]/.test(text)) text = '"' + text.replace(/"/g, '""') + '"';

  return text;
}

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  const [fields, enquiries] = await Promise.all([getFormFields(), getEnquiries(5000)]);

  // Deduplicate by key: a key can exist in more than one section only if the
  // owner created it twice, but the export should still have one column.
  const seen = new Set<string>();
  const columns = fields.filter((field) => {
    if (seen.has(field.key)) return false;
    seen.add(field.key);
    return true;
  });

  // Keys present in the data but no longer in the form.
  const orphans = new Set<string>();
  for (const enquiry of enquiries) {
    for (const key of Object.keys(enquiry.answers ?? {})) {
      if (!seen.has(key)) orphans.add(key);
    }
  }
  const orphanKeys = Array.from(orphans).sort();

  const header = [
    "Submitted",
    "Type",
    "Status",
    ...columns.map((field) => field.label),
    ...orphanKeys.map((key) => key + " (removed question)"),
    "Commodities",
  ];

  const rows = enquiries.map((enquiry) => {
    const answers = (enquiry.answers ?? {}) as Record<string, AnswerValue>;

    const items = (enquiry.items ?? [])
      .map((item) =>
        [item.commodity, item.grade, item.volume + " " + item.unit]
          .map((part) => String(part ?? "").trim())
          .filter(Boolean)
          .join(" · "),
      )
      .join(" | ");

    return [
      new Date(enquiry.created_at).toISOString(),
      enquiry.type,
      enquiry.status,
      ...columns.map((field) => answers[field.key]),
      ...orphanKeys.map((key) => answers[key]),
      items,
    ];
  });

  const csv = [header, ...rows].map((row) => row.map(cell).join(",")).join("\r\n");

  const stamp = new Date().toISOString().slice(0, 10);

  return new Response(
    // A BOM, so Excel opens UTF-8 correctly instead of mangling the accented
    // characters in place names and company names.
    "﻿" + csv,
    {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="dakela-enquiries-' + stamp + '.csv"',
        "Cache-Control": "no-store",
      },
    },
  );
}
