"use client";

import { useState } from "react";
import {
  FIELD_TYPES,
  FIELD_TYPE_LABELS,
  FORM_SECTIONS,
  type FieldType,
  type FormField,
  type FormSection,
} from "@/lib/model";
import { CHOICE_TYPES, keyify, validateFormField, type FormFieldInput } from "@/lib/validation";
import { CommodityInput } from "./CommodityInput";
import ui from "@/styles/admin.module.css";
import styles from "./FormBuilder.module.css";

function toInput(field: FormField | null, section: FormSection): FormFieldInput {
  return {
    form: field?.form ?? section,
    key: field?.key ?? "",
    label: field?.label ?? "",
    hint: field?.hint ?? "",
    placeholder: field?.placeholder ?? "",
    type: field?.type ?? "text",
    options: field?.options ?? [],
    required: field?.required ?? false,
    visible: field?.visible ?? true,
  };
}

/**
 * Add or edit one question.
 *
 * The key is derived from the label while the label is being typed for a new
 * question, then frozen: it is what past answers are filed under, so changing
 * it on an existing question would orphan them. For that reason it is not
 * editable at all once a question exists.
 */
export function FieldEditor({
  field,
  section,
  onSaved,
  onCancel,
}: {
  field: FormField | null;
  section: FormSection;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const isNew = field === null;
  const [form, setForm] = useState<FormFieldInput>(() => toInput(field, section));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saveError, setSaveError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const needsOptions = CHOICE_TYPES.includes(form.type);
  const id = (name: string) => (field?.id ?? "new") + "-" + name;

  function set<K extends keyof FormFieldInput>(key: K, value: FormFieldInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!(key in prev)) return prev;
      const next = { ...prev };
      delete next[key as string];
      return next;
    });
  }

  function setLabel(value: string) {
    set("label", value);
    // Only ever auto-derive for a question that does not exist yet.
    if (isNew) set("key", keyify(value));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaveError(null);

    const found = validateFormField(form);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      return;
    }

    setBusy(true);
    try {
      const response = await fetch(
        isNew ? "/api/admin/fields" : "/api/admin/fields/" + field.id,
        {
          method: isNew ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        },
      );

      if (response.status === 422) {
        const data = (await response.json()) as { errors?: Record<string, string> };
        setErrors(data.errors ?? {});
        setBusy(false);
        return;
      }

      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        setSaveError(data.error ?? "Could not save. Please try again.");
        setBusy(false);
        return;
      }

      onSaved();
    } catch {
      setSaveError("Could not reach the server. Check your connection and try again.");
      setBusy(false);
    }
  }

  return (
    <form className={styles.editor} onSubmit={handleSubmit} noValidate>
      {saveError && <p className={ui.noticeError}>{saveError}</p>}

      <div className={ui.grid2}>
        <div className={ui.field}>
          <label htmlFor={id("label")} className={ui.label}>
            Question
          </label>
          <p className={ui.hint}>What the visitor sees above the box.</p>
          <input
            id={id("label")}
            className={ui.input}
            value={form.label}
            onChange={(e) => setLabel(e.target.value)}
            aria-invalid={Boolean(errors.label)}
          />
          {errors.label && <p className={ui.error}>{errors.label}</p>}
        </div>

        <div className={ui.field}>
          <label htmlFor={id("type")} className={ui.label}>
            Answer type
          </label>
          <p className={ui.hint}>How the visitor answers.</p>
          <select
            id={id("type")}
            className={ui.select}
            value={form.type}
            onChange={(e) => set("type", e.target.value as FieldType)}
            disabled={Boolean(field?.system)}
          >
            {FIELD_TYPES.map((type) => (
              <option key={type} value={type}>
                {FIELD_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
          {field?.system && (
            <p className={ui.hint}>
              Fixed — this is one of the core contact questions.
            </p>
          )}
          {errors.type && <p className={ui.error}>{errors.type}</p>}
        </div>
      </div>

      <div className={ui.field}>
        <label htmlFor={id("hint")} className={ui.label}>
          Helper text
        </label>
        <p className={ui.hint}>Optional. A line of guidance under the question.</p>
        <input
          id={id("hint")}
          className={ui.input}
          value={form.hint}
          onChange={(e) => set("hint", e.target.value)}
          aria-invalid={Boolean(errors.hint)}
        />
        {errors.hint && <p className={ui.error}>{errors.hint}</p>}
      </div>

      {!needsOptions && form.type !== "checkbox" && (
        <div className={ui.field}>
          <label htmlFor={id("placeholder")} className={ui.label}>
            Example answer
          </label>
          <p className={ui.hint}>
            Optional. Shown faintly inside the empty box, e.g. &ldquo;Rotterdam&rdquo;.
          </p>
          <input
            id={id("placeholder")}
            className={ui.input}
            value={form.placeholder}
            onChange={(e) => set("placeholder", e.target.value)}
          />
        </div>
      )}

      {form.type === "checkbox" && (
        <div className={ui.field}>
          <label htmlFor={id("placeholder")} className={ui.label}>
            Tick box wording
          </label>
          <p className={ui.hint}>
            The text beside the box itself, e.g. &ldquo;Yes, I have samples ready&rdquo;.
          </p>
          <input
            id={id("placeholder")}
            className={ui.input}
            value={form.placeholder}
            onChange={(e) => set("placeholder", e.target.value)}
          />
        </div>
      )}

      {needsOptions && (
        <div className={ui.field}>
          <span className={ui.label}>Choices</span>
          <p className={ui.hint}>
            Type a choice and press Enter. Paste a comma-separated list to add several at
            once.
          </p>
          <CommodityInput value={form.options} onChange={(next) => set("options", next)} />
          {errors.options && <p className={ui.error}>{errors.options}</p>}
        </div>
      )}

      <div className={ui.grid2}>
        <div className={ui.field}>
          <label htmlFor={id("form")} className={ui.label}>
            Shown to
          </label>
          <select
            id={id("form")}
            className={ui.select}
            value={form.form}
            onChange={(e) => set("form", e.target.value as FormSection)}
            disabled={Boolean(field?.system)}
          >
            {FORM_SECTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {field?.system && (
            <p className={ui.hint}>Fixed — core questions are asked of everyone.</p>
          )}
        </div>

        <div className={styles.switches}>
          <label className={styles.switch}>
            <input
              type="checkbox"
              checked={form.required}
              onChange={(e) => set("required", e.target.checked)}
            />
            <span>
              <strong>Required</strong>
              <em>The form cannot be sent without it</em>
            </span>
          </label>

          <label className={styles.switch}>
            <input
              type="checkbox"
              checked={form.visible}
              onChange={(e) => set("visible", e.target.checked)}
            />
            <span>
              <strong>On the form</strong>
              <em>Uncheck to hide without deleting</em>
            </span>
          </label>
        </div>
      </div>

      {!isNew && (
        <p className={ui.hint}>
          Stored under the key <code>{form.key}</code>. This never changes, so past
          answers stay attached even if you rename the question.
        </p>
      )}
      {errors.key && <p className={ui.error}>{errors.key}</p>}

      <div className={ui.buttonRow}>
        <button type="submit" className={ui.buttonPrimary} disabled={busy}>
          {busy ? "Saving…" : isNew ? "Add question" : "Save changes"}
        </button>
        <button
          type="button"
          className={ui.buttonSecondary}
          onClick={onCancel}
          disabled={busy}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
