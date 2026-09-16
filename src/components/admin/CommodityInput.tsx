"use client";

import { useState } from "react";
import styles from "./CommodityInput.module.css";

/**
 * Tag-style list editor.
 *
 * Enter or comma commits the current text; Backspace on an empty box removes
 * the last tag. Pasting a comma-separated list adds all of them at once, which
 * is how the owner will realistically move a list in from a spreadsheet.
 */
export function CommodityInput({
  value,
  onChange,
}: {
  value: string[];
  onChange: (next: string[]) => void;
}) {
  const [draft, setDraft] = useState("");

  function add(raw: string) {
    const additions = raw
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);

    if (additions.length === 0) return;

    // Case-insensitive de-dupe, but keep the casing already stored.
    const existing = new Set(value.map((v) => v.toLowerCase()));
    const next = [...value];
    for (const addition of additions) {
      if (!existing.has(addition.toLowerCase())) {
        next.push(addition);
        existing.add(addition.toLowerCase());
      }
    }

    onChange(next);
    setDraft("");
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === ",") {
      // Enter would otherwise submit the whole product form.
      event.preventDefault();
      add(draft);
      return;
    }

    if (event.key === "Backspace" && draft === "" && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  }

  return (
    <div className={styles.wrap}>
      {value.length > 0 && (
        <ul className={styles.tags}>
          {value.map((item, index) => (
            <li key={item + index} className={styles.tag}>
              <span>{item}</span>
              <button
                type="button"
                className={styles.remove}
                onClick={() => onChange(value.filter((_, i) => i !== index))}
                aria-label={"Remove " + item}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className={styles.entry}>
        <input
          className={styles.input}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          // Commit whatever is half-typed when focus leaves, so a value is not
          // silently lost by clicking Save.
          onBlur={() => add(draft)}
          placeholder="Type a commodity and press Enter"
          aria-label="Add a commodity"
        />
        <button
          type="button"
          className={styles.add}
          onClick={() => add(draft)}
          disabled={!draft.trim()}
        >
          Add
        </button>
      </div>
    </div>
  );
}
