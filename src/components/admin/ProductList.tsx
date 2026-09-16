"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Product } from "@/lib/model";
import ui from "@/styles/admin.module.css";
import styles from "./ProductList.module.css";

type Row = Product & { imageUrl: string | null };

/**
 * Product list with inline reordering, publish toggle and delete.
 *
 * Reordering is optimistic — the row moves immediately and the request follows.
 * If the request fails the previous order is restored and the error shown,
 * because silently drifting out of sync with the database is worse than a
 * moment of lag.
 */
export function ProductList({ products }: { products: Row[] }) {
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>(products);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function persistOrder(next: Row[], previous: Row[]) {
    setError(null);
    try {
      const response = await fetch("/api/admin/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: next.map((row) => row.id) }),
      });
      if (!response.ok) throw new Error();
      startTransition(() => router.refresh());
    } catch {
      setRows(previous);
      setError("Could not save the new order. Nothing was changed.");
    }
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= rows.length) return;

    const previous = rows;
    const next = [...rows];
    [next[index], next[target]] = [next[target], next[index]];
    setRows(next);
    void persistOrder(next, previous);
  }

  async function togglePublished(row: Row) {
    setError(null);
    setBusyId(row.id);

    try {
      const response = await fetch("/api/admin/products/" + row.id, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        // PATCH validates the whole product, so send the full row with just the
        // one field flipped rather than a partial patch.
        body: JSON.stringify({
          ...row,
          origin: row.origin ?? "",
          uses: row.uses ?? "",
          nutrition: row.nutrition ?? "",
          grades: row.grades ?? "",
          seasonality: row.seasonality ?? "",
          published: !row.published,
        }),
      });

      if (!response.ok) throw new Error();

      setRows((current) =>
        current.map((r) => (r.id === row.id ? { ...r, published: !r.published } : r)),
      );
      startTransition(() => router.refresh());
    } catch {
      setError("Could not change that product's visibility.");
    } finally {
      setBusyId(null);
    }
  }

  async function remove(row: Row) {
    const ok = window.confirm(
      "Delete “" +
        row.title +
        "”?\n\nThis removes it from the site and cannot be undone. " +
        "To take it off the site temporarily, use Hide instead.",
    );
    if (!ok) return;

    setError(null);
    setBusyId(row.id);

    try {
      const response = await fetch("/api/admin/products/" + row.id, { method: "DELETE" });
      if (!response.ok) throw new Error();

      setRows((current) => current.filter((r) => r.id !== row.id));
      startTransition(() => router.refresh());
    } catch {
      setError("Could not delete that product.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      {error && <p className={ui.noticeError}>{error}</p>}

      <ol className={styles.list} aria-busy={pending}>
        {rows.map((row, index) => (
          <li key={row.id} className={styles.row}>
            <div className={styles.reorder}>
              <button
                type="button"
                className={styles.arrow}
                onClick={() => move(index, -1)}
                disabled={index === 0}
                aria-label={"Move " + row.title + " up"}
              >
                ↑
              </button>
              <button
                type="button"
                className={styles.arrow}
                onClick={() => move(index, 1)}
                disabled={index === rows.length - 1}
                aria-label={"Move " + row.title + " down"}
              >
                ↓
              </button>
            </div>

            <div className={styles.thumb}>
              {row.imageUrl ? (
                // Plain <img>: these are admin thumbnails, and next/image would
                // add a remote-pattern dependency for no visible benefit here.
                // eslint-disable-next-line @next/next/no-img-element
                <img src={row.imageUrl} alt="" className={styles.thumbImage} />
              ) : (
                <span className={styles.thumbEmpty}>No image</span>
              )}
            </div>

            <div className={styles.main}>
              <Link href={"/admin/products/" + row.id} className={styles.title}>
                {row.title}
              </Link>
              <p className={styles.meta}>
                {row.commodities.length > 0
                  ? row.commodities.slice(0, 4).join(", ") +
                    (row.commodities.length > 4
                      ? " +" + (row.commodities.length - 4) + " more"
                      : "")
                  : "No commodities listed"}
              </p>
            </div>

            <div className={styles.state}>
              <span className={row.published ? ui.badgeOn : ui.badgeOff}>
                {row.published ? "Live" : "Hidden"}
              </span>
            </div>

            <div className={styles.actions}>
              <Link
                href={"/admin/products/" + row.id}
                className={ui.buttonSecondary + " " + ui.buttonSmall}
              >
                Edit
              </Link>
              <button
                type="button"
                className={ui.buttonSecondary + " " + ui.buttonSmall}
                onClick={() => togglePublished(row)}
                disabled={busyId === row.id}
              >
                {row.published ? "Hide" : "Show"}
              </button>
              <button
                type="button"
                className={ui.buttonDanger + " " + ui.buttonSmall}
                onClick={() => remove(row)}
                disabled={busyId === row.id}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ol>
    </>
  );
}
