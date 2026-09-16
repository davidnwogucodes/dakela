"use client";

import { useId, useState } from "react";
import type { FormField } from "@/lib/model";
import { MAX_ITEMS, UNITS } from "@/lib/model";
import {
  emptyAnswers,
  emptyItem,
  fieldsFor,
  validateSubmission,
  type AnswerValue,
  type Answers,
  type Submission,
} from "@/lib/submission";
import { site, site_email_href } from "@/config/site";
import shared from "@/styles/shared.module.css";
import styles from "./EnquiryForm.module.css";

type Status = "idle" | "submitting" | "done";

/** Label + error wrapper. Ties the message to its control for screen readers. */
function Field({
  id,
  label,
  hint,
  error,
  required,
  children,
}: {
  id: string;
  label: string;
  hint?: string | null;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
        {required && (
          <span aria-hidden="true" className={styles.required}>
            {" *"}
          </span>
        )}
      </label>
      {hint && <p className={styles.hint}>{hint}</p>}
      {children}
      {error && (
        <p id={id + "-error"} className={styles.error} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function EnquiryForm({
  fields,
  commodities,
  buyerEnabled,
  supplierEnabled,
}: {
  fields: FormField[];
  /** Drawn from the published products, so the dropdown follows the catalogue. */
  commodities: string[];
  buyerEnabled: boolean;
  supplierEnabled: boolean;
}) {
  const uid = useId();

  // Whichever side is open — if only one is, the branch chooser is not shown.
  const initialType: "buyer" | "supplier" = buyerEnabled ? "buyer" : "supplier";
  const bothOpen = buyerEnabled && supplierEnabled;
  const requireItems = commodities.length > 0;

  const [type, setType] = useState<"buyer" | "supplier">(initialType);
  const [answers, setAnswers] = useState<Answers>(() => emptyAnswers(fields));
  const [items, setItems] = useState(() => [emptyItem(UNITS[0])]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [website, setWebsite] = useState("");

  const visible = fieldsFor(fields, type);
  const isBuyer = type === "buyer";
  const fid = (name: string) => uid + "-" + name;

  const aria = (name: string) =>
    errors[name]
      ? { "aria-invalid": true as const, "aria-describedby": fid(name) + "-error" }
      : {};

  function clearError(key: string) {
    setErrors((prev) => {
      if (!(key in prev)) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function setAnswer(key: string, value: AnswerValue) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
    clearError(key);
  }

  function toggleMulti(key: string, option: string) {
    setAnswers((prev) => {
      const current = Array.isArray(prev[key]) ? (prev[key] as string[]) : [];
      return {
        ...prev,
        [key]: current.includes(option)
          ? current.filter((o) => o !== option)
          : [...current, option],
      };
    });
    clearError(key);
  }

  function setItem(index: number, key: keyof (typeof items)[number], value: string) {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [key]: value } : item)),
    );
    clearError("items." + index + "." + key);
  }

  function switchType(next: "buyer" | "supplier") {
    setType(next);
    // Answers to the other side's questions are dropped, so a half-filled buyer
    // section is never stored against a supplier submission.
    setAnswers(emptyAnswers(fields));
    setErrors({});
    setSubmitError(null);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitError(null);

    const submission: Submission = { type, answers, items, website };
    const found = validateSubmission(fields, submission, requireItems);

    if (Object.keys(found).length > 0) {
      setErrors(found);
      const first = document.getElementById(fid(Object.keys(found)[0]));
      first?.focus();
      first?.scrollIntoView({ block: "center", behavior: "smooth" });
      return;
    }

    setStatus("submitting");
    try {
      const response = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submission),
      });

      if (response.status === 422) {
        const data = (await response.json()) as { errors?: Record<string, string> };
        setErrors(data.errors ?? {});
        setStatus("idle");
        return;
      }

      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        setSubmitError(data.error ?? "Something went wrong. Please try again.");
        setStatus("idle");
        return;
      }

      setStatus("done");
    } catch {
      setSubmitError("We could not reach the server. Check your connection and try again.");
      setStatus("idle");
    }
  }

  /* --- One field ---------------------------------------------------------- */

  function renderControl(field: FormField) {
    const id = fid(field.key);
    const value = answers[field.key];

    switch (field.type) {
      case "textarea":
        return (
          <textarea
            id={id}
            className={styles.textarea}
            rows={5}
            value={typeof value === "string" ? value : ""}
            onChange={(e) => setAnswer(field.key, e.target.value)}
            placeholder={field.placeholder ?? undefined}
            {...aria(field.key)}
          />
        );

      case "select":
        return (
          <select
            id={id}
            className={styles.select}
            value={typeof value === "string" ? value : ""}
            onChange={(e) => setAnswer(field.key, e.target.value)}
            {...aria(field.key)}
          >
            <option value="">{field.required ? "Select" : "No preference"}</option>
            {field.options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case "multiselect":
        return (
          <div className={styles.checks} id={id} {...aria(field.key)}>
            {field.options.map((option) => (
              <label key={option} className={styles.check}>
                <input
                  type="checkbox"
                  checked={Array.isArray(value) && value.includes(option)}
                  onChange={() => toggleMulti(field.key, option)}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        );

      case "checkbox":
        return (
          <label className={styles.check}>
            <input
              id={id}
              type="checkbox"
              checked={value === true}
              onChange={(e) => setAnswer(field.key, e.target.checked)}
            />
            <span>{field.placeholder ?? "Yes"}</span>
          </label>
        );

      default: {
        // text, email, tel, number, month all map to one input, differing only
        // in the keyboard they raise and the validation already applied above.
        const inputMode =
          field.type === "number" ? "decimal" : field.type === "tel" ? "tel" : undefined;

        return (
          <input
            id={id}
            type={field.type === "month" ? "month" : field.type === "email" ? "email" : "text"}
            inputMode={inputMode}
            className={styles.input}
            value={typeof value === "string" ? value : ""}
            onChange={(e) => setAnswer(field.key, e.target.value)}
            placeholder={field.placeholder ?? undefined}
            autoComplete={
              field.key === "fullName"
                ? "name"
                : field.key === "company"
                  ? "organization"
                  : field.type === "email"
                    ? "email"
                    : field.type === "tel"
                      ? "tel"
                      : undefined
            }
            {...aria(field.key)}
          />
        );
      }
    }
  }

  /* --- Success ------------------------------------------------------------ */

  if (status === "done") {
    return (
      <div className={styles.success} role="status">
        <p className={shared.eyebrow}>Received</p>
        <h2 className={styles.successHeading}>
          Thank you — we have your {isBuyer ? "enquiry" : "details"}.
        </h2>
        <p className={styles.successBody}>
          {isBuyer
            ? "We reply with an indicative offer within one working day. If it is urgent, email us and quote your company name."
            : "Our sourcing team reviews new suppliers weekly and will be in touch. If it is urgent, email us and quote your company name."}
        </p>
        <div className={shared.buttonRow}>
          <a href={site_email_href} className={shared.btnPrimary}>
            {site.email}
          </a>
          <button
            type="button"
            className={styles.linkButton}
            onClick={() => {
              setAnswers(emptyAnswers(fields));
              setItems([emptyItem(UNITS[0])]);
              setErrors({});
              setStatus("idle");
            }}
          >
            Send another
          </button>
        </div>
      </div>
    );
  }

  /* --- No form configured ------------------------------------------------- */

  if (visible.length === 0) {
    return (
      <div className={styles.success}>
        <h2 className={styles.successHeading}>The form is not available right now.</h2>
        <p className={styles.successBody}>
          Please email us and we will pick it up from there.
        </p>
        <div className={shared.buttonRow}>
          <a href={site_email_href} className={shared.btnPrimary}>
            {site.email}
          </a>
        </div>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      {bothOpen && (
        <fieldset className={styles.fieldset}>
          <legend className={styles.legend}>I am…</legend>
          <div className={styles.toggle}>
            {(
              [
                {
                  value: "buyer",
                  label: "Buying",
                  note: "I want to import Nigerian commodities",
                },
                {
                  value: "supplier",
                  label: "Supplying",
                  note: "I aggregate, process or farm in Nigeria",
                },
              ] as const
            ).map((option) => (
              <label
                key={option.value}
                className={
                  styles.toggleOption +
                  (type === option.value ? " " + styles.toggleOptionActive : "")
                }
              >
                <input
                  type="radio"
                  name="type"
                  value={option.value}
                  checked={type === option.value}
                  onChange={() => switchType(option.value)}
                  className={styles.visuallyHidden}
                />
                <span className={styles.toggleLabel}>{option.label}</span>
                <span className={styles.toggleNote}>{option.note}</span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>
          {isBuyer ? "Your enquiry" : "Your details"}
        </legend>
        <div className={styles.grid2}>
          {visible.map((field) => (
            // Long-form and multi-choice fields need the full width; the rest
            // pair up two to a row.
            <div
              key={field.id}
              className={
                field.type === "textarea" || field.type === "multiselect"
                  ? styles.spanFull
                  : undefined
              }
            >
              <Field
                id={fid(field.key)}
                label={field.label}
                hint={field.hint}
                error={errors[field.key]}
                required={field.required}
              >
                {renderControl(field)}
              </Field>
            </div>
          ))}
        </div>
      </fieldset>

      {requireItems && (
        <fieldset className={styles.fieldset}>
          <legend className={styles.legend}>
            {isBuyer ? "What you need" : "What you can supply"}
          </legend>
          <p className={styles.hint}>
            {isBuyer
              ? "Add a row per commodity. Volumes are indicative — we confirm against current lots."
              : "Add a row per commodity, with the volume you can move in a typical month."}
          </p>

          {errors.items && (
            <p className={styles.error} role="alert">
              {errors.items}
            </p>
          )}

          <div className={styles.items}>
            {items.map((item, index) => (
              <div key={index} className={styles.itemRow}>
                <Field id={fid("items." + index + ".commodity")} label="Commodity">
                  <select
                    id={fid("items." + index + ".commodity")}
                    className={styles.select}
                    value={item.commodity}
                    onChange={(e) => setItem(index, "commodity", e.target.value)}
                  >
                    <option value="">Select</option>
                    {commodities.map((commodity) => (
                      <option key={commodity} value={commodity}>
                        {commodity}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field id={fid("items." + index + ".grade")} label="Grade / spec">
                  <input
                    id={fid("items." + index + ".grade")}
                    className={styles.input}
                    value={item.grade}
                    onChange={(e) => setItem(index, "grade", e.target.value)}
                    placeholder={isBuyer ? "e.g. 99/1, KOR 48" : "e.g. moisture 8%"}
                  />
                </Field>

                <Field
                  id={fid("items." + index + ".volume")}
                  label={isBuyer ? "Volume" : "Capacity"}
                  error={errors["items." + index + ".volume"]}
                >
                  <input
                    id={fid("items." + index + ".volume")}
                    inputMode="decimal"
                    className={styles.input}
                    value={item.volume}
                    onChange={(e) => setItem(index, "volume", e.target.value)}
                    placeholder="0"
                    {...(errors["items." + index + ".volume"]
                      ? {
                          "aria-invalid": true as const,
                          "aria-describedby":
                            fid("items." + index + ".volume") + "-error",
                        }
                      : {})}
                  />
                </Field>

                <Field id={fid("items." + index + ".unit")} label="Unit">
                  <select
                    id={fid("items." + index + ".unit")}
                    className={styles.select}
                    value={item.unit}
                    onChange={(e) => setItem(index, "unit", e.target.value)}
                  >
                    {UNITS.map((unit) => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>
                </Field>

                {items.length > 1 && (
                  <button
                    type="button"
                    className={styles.removeButton}
                    onClick={() => {
                      setItems((prev) => prev.filter((_, i) => i !== index));
                      setErrors({});
                    }}
                    aria-label={"Remove commodity row " + (index + 1)}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>

          {items.length < MAX_ITEMS && (
            <button
              type="button"
              className={styles.addButton}
              onClick={() => setItems((prev) => [...prev, emptyItem(UNITS[0])])}
            >
              + Add another commodity
            </button>
          )}
        </fieldset>
      )}

      {/* Honeypot. Hidden from people, irresistible to bots. Kept out of the tab
          order and off-screen rather than display:none, which some bots skip. */}
      <div className={styles.visuallyHidden} aria-hidden="true">
        <label htmlFor={fid("website")}>Website</label>
        <input
          id={fid("website")}
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>

      {submitError && (
        <p className={styles.submitError} role="alert">
          {submitError}
        </p>
      )}

      <div className={styles.actions}>
        <button
          type="submit"
          className={shared.btnPrimary}
          disabled={status === "submitting"}
        >
          {status === "submitting"
            ? "Sending…"
            : isBuyer
              ? "Request an offer"
              : "Submit supply details"}
        </button>
        <p className={styles.actionsNote}>
          We reply within one working day. Your details are not shared with anyone else.
        </p>
      </div>
    </form>
  );
}
