"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  FIELD_TYPE_LABELS,
  FORM_SECTIONS,
  type FormField,
  type FormSection,
} from "@/lib/model";
import { FieldEditor } from "./FieldEditor";
import ui from "@/styles/admin.module.css";
import styles from "./FormBuilder.module.css";

/**
 * The owner's view of the enquiry form: three sections, each a reorderable list
 * of questions that expand into an editor in place.
 *
 * Reordering is optimistic and rolls back on failure. Everything else waits for
 * the server, because a failed save that looked like it worked is how a form
 * quietly loses a question.
 */
export function FormBuilder({ fields }: { fields: FormField[] }) {
  const router = useRouter();
  const [rows, setRows] = useState<FormField[]>(fields);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addingTo, setAddingTo] = useState<FormSection | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const bySection = (section: FormSection) =>
    rows.filter((row) => row.form === section).sort((a, b) => a.sort_order - b.sort_order);

  function refresh() {
    startTransition(() => router.refresh());
  }

  async function persistOrder(section: FormSection, ordered: FormField[]) {
    const previous = rows;

    // Renumber only this section; the others keep the sort_order they had.
    const renumbered = rows.map((row) => {
      const index = ordered.findIndex((o) => o.id === row.id);
      return index === -1 ? row : { ...row, sort_order: index + 1 };
    });
    setRows(renumbered);
    setError(null);

    try {
      const response = await fetch("/api/admin/fields", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: ordered.map((o) => o.id) }),
      });
      if (!response.ok) throw new Error();
      refresh();
    } catch {
      setRows(previous);
      setError("Could not save the new order. Nothing was changed.");
    }
  }

  function move(section: FormSection, index: number, direction: -1 | 1) {
    const list = bySection(section);
    const target = index + direction;
    if (target < 0 || target >= list.length) return;

    const next = [...list];
    [next[index], next[target]] = [next[target], next[index]];
    void persistOrder(section, next);
  }

  async function toggleVisible(field: FormField) {
    setError(null);
    setBusyId(field.id);

    try {
      const response = await fetch("/api/admin/fields/" + field.id, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          form: field.form,
          key: field.key,
          label: field.label,
          hint: field.hint ?? "",
          placeholder: field.placeholder ?? "",
          type: field.type,
          options: field.options,
          required: field.required,
          visible: !field.visible,
        }),
      });

      if (!response.ok) throw new Error();

      setRows((current) =>
        current.map((r) => (r.id === field.id ? { ...r, visible: !r.visible } : r)),
      );
      refresh();
    } catch {
      setError("Could not change that question's visibility.");
    } finally {
      setBusyId(null);
    }
  }

  async function remove(field: FormField) {
    const ok = window.confirm(
      "Delete “" +
        field.label +
        "”?\n\nIt disappears from the form immediately. Answers already submitted are " +
        "kept and stay visible under Submissions.\n\nTo take it off the form " +
        "temporarily, use Hide instead.",
    );
    if (!ok) return;

    setError(null);
    setBusyId(field.id);

    try {
      const response = await fetch("/api/admin/fields/" + field.id, { method: "DELETE" });

      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? "Could not delete that question.");
        return;
      }

      setRows((current) => current.filter((r) => r.id !== field.id));
      refresh();
    } catch {
      setError("Could not delete that question.");
    } finally {
      setBusyId(null);
    }
  }

  function onSaved() {
    setEditingId(null);
    setAddingTo(null);
    router.refresh();
  }

  return (
    <>
      {error && <p className={ui.noticeError}>{error}</p>}

      {FORM_SECTIONS.map((section) => {
        const list = bySection(section.value);

        return (
          <section key={section.value} className={styles.section}>
            <div className={styles.sectionHead}>
              <div>
                <h2 className={styles.sectionTitle}>{section.label}</h2>
                <p className={styles.sectionNote}>{section.note}</p>
              </div>
              <button
                type="button"
                className={ui.buttonSecondary + " " + ui.buttonSmall}
                onClick={() => {
                  setAddingTo(addingTo === section.value ? null : section.value);
                  setEditingId(null);
                }}
              >
                {addingTo === section.value ? "Cancel" : "Add a question"}
              </button>
            </div>

            {addingTo === section.value && (
              <div className={styles.editorSlot}>
                <FieldEditor
                  field={null}
                  section={section.value}
                  onSaved={onSaved}
                  onCancel={() => setAddingTo(null)}
                />
              </div>
            )}

            {list.length === 0 ? (
              <p className={styles.sectionEmpty}>
                No questions here yet.
                {section.value === "shared"
                  ? " Questions here are asked of everyone."
                  : " Questions here only appear for that side of the form."}
              </p>
            ) : (
              <ol className={styles.list}>
                {list.map((field, index) => (
                  <li key={field.id} className={styles.item}>
                    <div className={styles.itemRow}>
                      <div className={styles.reorder}>
                        <button
                          type="button"
                          className={styles.arrow}
                          onClick={() => move(section.value, index, -1)}
                          disabled={index === 0}
                          aria-label={"Move " + field.label + " up"}
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          className={styles.arrow}
                          onClick={() => move(section.value, index, 1)}
                          disabled={index === list.length - 1}
                          aria-label={"Move " + field.label + " down"}
                        >
                          ↓
                        </button>
                      </div>

                      <div className={styles.itemMain}>
                        <p className={styles.itemLabel}>
                          {field.label}
                          {field.required && (
                            <span className={styles.requiredMark} title="Required">
                              {" *"}
                            </span>
                          )}
                        </p>
                        <p className={styles.itemMeta}>
                          {FIELD_TYPE_LABELS[field.type]}
                          {field.options.length > 0 &&
                            " · " + field.options.length + " choices"}
                          {field.system && " · core question"}
                        </p>
                      </div>

                      <div className={styles.itemState}>
                        <span className={field.visible ? ui.badgeOn : ui.badgeOff}>
                          {field.visible ? "On form" : "Hidden"}
                        </span>
                      </div>

                      <div className={styles.itemActions}>
                        <button
                          type="button"
                          className={ui.buttonSecondary + " " + ui.buttonSmall}
                          onClick={() => {
                            setEditingId(editingId === field.id ? null : field.id);
                            setAddingTo(null);
                          }}
                        >
                          {editingId === field.id ? "Close" : "Edit"}
                        </button>
                        <button
                          type="button"
                          className={ui.buttonSecondary + " " + ui.buttonSmall}
                          onClick={() => toggleVisible(field)}
                          disabled={busyId === field.id}
                        >
                          {field.visible ? "Hide" : "Show"}
                        </button>
                        {!field.system && (
                          <button
                            type="button"
                            className={ui.buttonDanger + " " + ui.buttonSmall}
                            onClick={() => remove(field)}
                            disabled={busyId === field.id}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>

                    {editingId === field.id && (
                      <div className={styles.editorSlot}>
                        <FieldEditor
                          field={field}
                          section={field.form}
                          onSaved={onSaved}
                          onCancel={() => setEditingId(null)}
                        />
                      </div>
                    )}
                  </li>
                ))}
              </ol>
            )}
          </section>
        );
      })}
    </>
  );
}
