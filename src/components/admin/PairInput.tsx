"use client";

import ui from "@/styles/admin.module.css";
import styles from "./PairInput.module.css";

export type Pair = { left: string; right: string };

/**
 * Editor for an ordered list of two-part rows.
 *
 * Serves both the specification table (Parameter / Specification) and the FAQ
 * (Question / Answer) — the same interaction with different headings, and a
 * taller second field when the answer is prose.
 *
 * Rows are addressed by index rather than by key: a specification table can
 * legitimately repeat a label while the owner is mid-edit, so an index is the
 * only stable handle.
 */
export function PairInput({
  value,
  onChange,
  leftLabel,
  rightLabel,
  leftPlaceholder,
  rightPlaceholder,
  multilineRight = false,
  addLabel = "Add a row",
  max = 60,
}: {
  value: Pair[];
  onChange: (next: Pair[]) => void;
  leftLabel: string;
  rightLabel: string;
  leftPlaceholder?: string;
  rightPlaceholder?: string;
  multilineRight?: boolean;
  addLabel?: string;
  max?: number;
}) {
  function setRow(index: number, key: keyof Pair, text: string) {
    onChange(value.map((row, i) => (i === index ? { ...row, [key]: text } : row)));
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= value.length) return;
    const next = [...value];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  return (
    <div className={styles.wrap}>
      {value.length > 0 && (
        <ol className={styles.rows}>
          {value.map((row, index) => (
            <li key={index} className={styles.row}>
              <div className={styles.reorder}>
                <button
                  type="button"
                  className={styles.arrow}
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  aria-label={"Move row " + (index + 1) + " up"}
                >
                  ↑
                </button>
                <button
                  type="button"
                  className={styles.arrow}
                  onClick={() => move(index, 1)}
                  disabled={index === value.length - 1}
                  aria-label={"Move row " + (index + 1) + " down"}
                >
                  ↓
                </button>
              </div>

              <div className={multilineRight ? styles.fieldsStacked : styles.fields}>
                <div className={ui.field}>
                  <label className={styles.miniLabel}>{leftLabel}</label>
                  <input
                    className={ui.input}
                    value={row.left}
                    onChange={(e) => setRow(index, "left", e.target.value)}
                    placeholder={leftPlaceholder}
                  />
                </div>

                <div className={ui.field}>
                  <label className={styles.miniLabel}>{rightLabel}</label>
                  {multilineRight ? (
                    <textarea
                      className={ui.textarea}
                      rows={3}
                      value={row.right}
                      onChange={(e) => setRow(index, "right", e.target.value)}
                      placeholder={rightPlaceholder}
                    />
                  ) : (
                    <input
                      className={ui.input}
                      value={row.right}
                      onChange={(e) => setRow(index, "right", e.target.value)}
                      placeholder={rightPlaceholder}
                    />
                  )}
                </div>
              </div>

              <button
                type="button"
                className={styles.remove}
                onClick={() => onChange(value.filter((_, i) => i !== index))}
                aria-label={"Remove row " + (index + 1)}
              >
                Remove
              </button>
            </li>
          ))}
        </ol>
      )}

      {value.length < max && (
        <button
          type="button"
          className={styles.add}
          onClick={() => onChange([...value, { left: "", right: "" }])}
        >
          + {addLabel}
        </button>
      )}
    </div>
  );
}
