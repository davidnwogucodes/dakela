import Link from "next/link";
import { supplierBlocks } from "@/data/content";
import { ENQUIRY_PATH } from "@/config/site";
import shared from "@/styles/shared.module.css";
import styles from "./Suppliers.module.css";

export function Suppliers() {
  return (
    <section id="suppliers" className={styles.section}>
      <div className={`${shared.container} ${styles.grid}`}>
        <div className={styles.left}>
          <p className={shared.eyebrow}>05 — For local suppliers</p>
          <h2 className={styles.heading}>Selling into our network</h2>
        </div>

        <div className={styles.right}>
          <p className={styles.intro}>
            We are always adding aggregators, processors and farm cooperatives to
            our verified supplier list. If you can supply consistent quality at
            volume, send us your commodity, location, monthly capacity and
            current grade details.
          </p>

          <div className={styles.blocks}>
            {supplierBlocks.map((block) => (
              <div key={block.title} className={styles.block}>
                <h3 className={styles.blockTitle}>{block.title}</h3>
                <p className={styles.blockBody}>{block.body}</p>
              </div>
            ))}
          </div>

          <div className={styles.actions}>
            <Link href={ENQUIRY_PATH} className={styles.link}>
              Apply to supply →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
