import { credibilityClaims } from "@/data/content";
import { getCompany } from "@/lib/content";
import shared from "@/styles/shared.module.css";
import styles from "./CredibilityStrip.module.css";

export async function CredibilityStrip() {
  const company = await getCompany();

  return (
    <section className={styles.strip} aria-label="Company credentials">
      <ul className={`${shared.container} ${styles.row}`}>
        {credibilityClaims(company.rcNumber).map((claim) => (
          <li key={claim} className={styles.item}>
            {claim}
          </li>
        ))}
      </ul>
    </section>
  );
}
