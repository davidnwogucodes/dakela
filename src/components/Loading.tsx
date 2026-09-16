import { LogoMark } from "./Logo";
import styles from "./Loading.module.css";

/**
 * Loading state shown while a route is being fetched.
 *
 * Uses the brand mark rather than a generic spinner: the leaf outline draws
 * itself, which reads as the same object the header shows rather than as a
 * borrowed widget. Pure CSS, so it costs no JavaScript and appears instantly.
 *
 * Never used on the home page — that is static HTML and renders immediately, so
 * a loading state there would only add a flash of nothing before content that
 * was already ready.
 */
export function Loading({ label = "Loading" }: { label?: string }) {
  return (
    <div className={styles.screen} role="status" aria-live="polite">
      <div className={styles.mark}>
        <LogoMark size={40} />
      </div>
      <p className={styles.label}>{label}</p>
      <div className={styles.bar} aria-hidden="true">
        <span className={styles.barFill} />
      </div>
    </div>
  );
}
