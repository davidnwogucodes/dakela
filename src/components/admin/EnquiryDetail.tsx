"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Enquiry, FormField } from "@/lib/model";
import { ENQUIRY_STATUSES } from "@/lib/model";
import ui from "@/styles/admin.module.css";
import styles from "./EnquiryDetail.module.css";

const STATUS_LABELS: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  quoted: "Quoted",
  closed: "Closed",
};

function displayValue(value: unknown): string {
  if (value === true) return "Yes";
  if (value === false || value === null || value === undefined) return "—";
  if (Array.isArray(value)) return value.join(", ");
  return String(value);
}

export function EnquiryDetail({
  enquiry,
  fields,
}: {
  enquiry: Enquiry;
  fields: FormField[];
}) {
  const router = useRouter();
  const [status, setStatus] = useState(enquiry.status);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Opening the page is what marks it read. Fire once, and ignore failure: a
  // read receipt is not worth an error message in front of the owner.
  useEffect(() => {
    if (enquiry.read) return;

    void fetch("/api/admin/enquiries/" + enquiry.id, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ read: true }),
    })
      .then(() => router.refresh())
      .catch(() => {});
  }, [enquiry.id, enquiry.read, router]);

  const answers = enquiry.answers ?? {};

  // Fields still on the form, in form order, that this submission answered.
  const answered = fields
    .filter((field) => field.key in answers)
    .sort((a, b) => a.sort_order - b.sort_order);

  // Answers whose question has since been deleted or renamed away.
  const known = new Set(fields.map((field) => field.key));
  const orphans = Object.keys(answers).filter((key) => !known.has(key));

  async function updateStatus(next: string) {
    const previous = status;
    setStatus(next as typeof status);
    setError(null);
    setBusy(true);

    try {
      const response = await fetch("/api/admin/enquiries/" + enquiry.id, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!response.ok) throw new Error();
      router.refresh();
    } catch {
      setStatus(previous);
      setError("Could not update the status.");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    const ok = window.confirm(
      "Delete this submission permanently?\n\nThis cannot be undone. Export to CSV first " +
        "if you might need it later.",
    );
    if (!ok) return;

    setBusy(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/enquiries/" + enquiry.id, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error();
      router.push("/admin/enquiries");
      router.refresh();
    } catch {
      setError("Could not delete that submission.");
      setBusy(false);
    }
  }

  return (
    <div className={styles.layout}>
      <div className={styles.main}>
        {error && <p className={ui.noticeError}>{error}</p>}

        <section className={ui.panel}>
          <div className={ui.panelHead}>
            <h2 className={ui.panelTitle}>Answers</h2>
          </div>

          {answered.length === 0 && orphans.length === 0 ? (
            <p className={ui.hint}>This submission has no answers recorded.</p>
          ) : (
            <dl className={styles.answers}>
              {answered.map((field) => (
                <div key={field.key} className={styles.answerRow}>
                  <dt className={styles.answerTerm}>{field.label}</dt>
                  <dd className={styles.answerValue}>{displayValue(answers[field.key])}</dd>
                </div>
              ))}

              {orphans.map((key) => (
                <div key={key} className={styles.answerRow}>
                  <dt className={styles.answerTerm}>
                    {key}
                    <span className={styles.orphanTag}>removed question</span>
                  </dt>
                  <dd className={styles.answerValue}>{displayValue(answers[key])}</dd>
                </div>
              ))}
            </dl>
          )}
        </section>

        {enquiry.items.length > 0 && (
          <section className={ui.panel}>
            <div className={ui.panelHead}>
              <h2 className={ui.panelTitle}>
                {enquiry.type === "buyer" ? "What they need" : "What they can supply"}
              </h2>
            </div>

            <div className={ui.tableWrap}>
              <table className={ui.table}>
                <thead>
                  <tr>
                    <th>Commodity</th>
                    <th>Grade / spec</th>
                    <th>{enquiry.type === "buyer" ? "Volume" : "Capacity"}</th>
                  </tr>
                </thead>
                <tbody>
                  {enquiry.items.map((item, index) => (
                    <tr key={index}>
                      <td>{item.commodity}</td>
                      <td>{item.grade || "—"}</td>
                      <td>
                        {item.volume} {item.unit}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>

      <aside className={styles.side}>
        <section className={ui.panel}>
          <div className={ui.panelHead}>
            <h2 className={ui.panelTitle}>Reply</h2>
          </div>

          <div className={styles.contact}>
            {enquiry.email && (
              <a className={styles.contactLink} href={"mailto:" + enquiry.email}>
                {enquiry.email}
              </a>
            )}
            {enquiry.phone && (
              <>
                <a className={styles.contactLink} href={"tel:" + enquiry.phone}>
                  {enquiry.phone}
                </a>
                <a
                  className={styles.contactLink}
                  // wa.me wants digits only, no +, spaces or dashes.
                  href={"https://wa.me/" + enquiry.phone.replace(/\D/g, "")}
                  target="_blank"
                  rel="noopener"
                >
                  Open in WhatsApp ↗
                </a>
              </>
            )}
            {!enquiry.email && !enquiry.phone && (
              <p className={ui.hint}>No contact details were submitted.</p>
            )}
          </div>
        </section>

        <section className={ui.panel}>
          <div className={ui.panelHead}>
            <h2 className={ui.panelTitle}>Status</h2>
          </div>

          <div className={ui.field}>
            <label htmlFor="status" className={ui.label}>
              Where this stands
            </label>
            <select
              id="status"
              className={ui.select}
              value={status}
              onChange={(e) => updateStatus(e.target.value)}
              disabled={busy}
            >
              {ENQUIRY_STATUSES.map((value) => (
                <option key={value} value={value}>
                  {STATUS_LABELS[value]}
                </option>
              ))}
            </select>
            <p className={ui.hint}>Saved as soon as you change it.</p>
          </div>
        </section>

        <button
          type="button"
          className={ui.buttonDanger + " " + styles.deleteButton}
          onClick={remove}
          disabled={busy}
        >
          Delete this submission
        </button>
      </aside>
    </div>
  );
}
