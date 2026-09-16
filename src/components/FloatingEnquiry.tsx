import Link from "next/link";
import { ENQUIRY_PATH } from "@/config/site";
import styles from "./FloatingEnquiry.module.css";

/**
 * Persistent shortcut to the enquiry form.
 *
 * The one action the site exists to produce, kept reachable from anywhere on the
 * page without scrolling back to a section. Collapses to a compact pill on
 * mobile, where screen space is worth more.
 */
export function FloatingEnquiry() {
  return (
    <div className={styles.wrapper}>
      <Link href={ENQUIRY_PATH} className={styles.button}>
        <span className={styles.label}>Make an enquiry</span>
        <span className={styles.arrow} aria-hidden="true">
          →
        </span>
      </Link>
    </div>
  );
}
