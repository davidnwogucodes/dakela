"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Enquiry, FormField } from "@/lib/model";
import { ENQUIRY_STATUSES } from "@/lib/model";
import ui from "@/styles/admin.module.css";
import styles from "./EnquiryTable.module.css";

const STATUS_LABELS: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  quoted: "Quoted",
  closed: "Closed",
};

/** Filter + search over submissions. Both are client-side: the list is capped
 *  at 200 rows, so there is nothing to gain from a round trip per keystroke. */
export function EnquiryTable({
  enquiries,
  fields,
}: {
  enquiries: Enquiry[];
  fields: FormField[];
}) {
  const [type, setType] = useState<"all" | "buyer" | "supplier">("all");
  const [status, setStatus] = useState<string>("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return enquiries.filter((enquiry) => {
      if (type !== "all" && enquiry.type !== type) return false;
      if (status !== "all" && enquiry.status !== status) return false;
      if (!needle) return true;

      // Search the contact columns, the commodity rows, and every answer —
      // otherwise a search for a country or port finds nothing.
      const haystack = [
        enquiry.full_name,
        enquiry.company,
        enquiry.email,
        enquiry.phone,
        ...enquiry.items.map((item) => item.commodity),
        ...Object.values(enquiry.answers ?? {}).map((value) =>
          Array.isArray(value) ? value.join(" ") : String(value ?? ""),
        ),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(needle);
    });
  }, [enquiries, type, status, query]);

  const unread = enquiries.filter((e) => !e.read).length;

  return (
    <>
      <div className={styles.filters}>
        <input
          className={ui.input + " " + styles.search}
          placeholder="Search name, company, commodity, anywhere…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search submissions"
        />

        <select
          className={ui.select + " " + styles.filter}
          value={type}
          onChange={(e) => setType(e.target.value as typeof type)}
          aria-label="Filter by type"
        >
          <option value="all">Buyers and suppliers</option>
          <option value="buyer">Buyers only</option>
          <option value="supplier">Suppliers only</option>
        </select>

        <select
          className={ui.select + " " + styles.filter}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          aria-label="Filter by status"
        >
          <option value="all">Any status</option>
          {ENQUIRY_STATUSES.map((value) => (
            <option key={value} value={value}>
              {STATUS_LABELS[value]}
            </option>
          ))}
        </select>
      </div>

      <p className={styles.count}>
        {filtered.length === enquiries.length
          ? enquiries.length + (enquiries.length === 1 ? " submission" : " submissions")
          : "Showing " + filtered.length + " of " + enquiries.length}
        {unread > 0 && " · " + unread + " unread"}
      </p>

      {filtered.length === 0 ? (
        <p className={ui.notice}>Nothing matches those filters.</p>
      ) : (
        <div className={ui.tableWrap}>
          <table className={ui.table}>
            <thead>
              <tr>
                <th>Received</th>
                <th>From</th>
                <th>Type</th>
                <th>Commodities</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((enquiry) => (
                <tr key={enquiry.id} className={enquiry.read ? undefined : styles.unread}>
                  <td className={styles.dateCell}>
                    <Link href={"/admin/enquiries/" + enquiry.id} className={styles.rowLink}>
                      {new Date(enquiry.created_at).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </Link>
                  </td>
                  <td>
                    <Link href={"/admin/enquiries/" + enquiry.id} className={styles.rowLink}>
                      <span className={styles.company}>
                        {enquiry.company || enquiry.full_name || "—"}
                      </span>
                      {enquiry.full_name && enquiry.company && (
                        <span className={styles.person}>{enquiry.full_name}</span>
                      )}
                    </Link>
                  </td>
                  <td>
                    <span className={ui.badge}>
                      {enquiry.type === "buyer" ? "Buyer" : "Supplier"}
                    </span>
                  </td>
                  <td className={styles.commodities}>
                    {enquiry.items.length > 0
                      ? enquiry.items
                          .slice(0, 2)
                          .map((item) => item.commodity)
                          .join(", ") +
                        (enquiry.items.length > 2
                          ? " +" + (enquiry.items.length - 2)
                          : "")
                      : "—"}
                  </td>
                  <td>
                    <span className={enquiry.status === "new" ? ui.badgeOn : ui.badgeOff}>
                      {STATUS_LABELS[enquiry.status] ?? enquiry.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {fields.length === 0 && (
        <p className={ui.noticeWarn}>
          No form questions are configured, so new submissions cannot be labelled. Run{" "}
          <code>supabase/seed.sql</code> or add questions under Enquiry form.
        </p>
      )}
    </>
  );
}
