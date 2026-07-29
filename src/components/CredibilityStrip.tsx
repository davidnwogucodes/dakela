import { credibilityClaims } from "@/data/content";
import { site } from "@/config/site";
import shared from "@/styles/shared.module.css";
import styles from "./CredibilityStrip.module.css";

export function CredibilityStrip() {
  return (
    <section className={styles.strip} aria-label="Company credentials">
      <ul className={`${shared.container} ${styles.row}`}>
        {credibilityClaims(site.rcNumber).map((claim) => (
          <li key={claim} className={styles.item}>
            {claim}
          </li>
        ))}
      </ul>
    </section>
  );
}
