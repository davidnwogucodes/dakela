import Image from "next/image";
import { marketFacts } from "@/data/content";
import shared from "@/styles/shared.module.css";
import styles from "./Markets.module.css";

export function Markets() {
  return (
    <section id="reach" className={styles.section}>
      <div className={`${shared.container} ${styles.grid}`}>
        <div className={styles.left}>
          <p className={shared.eyebrow}>04 — Markets</p>
          <h2 className={`${shared.h2} ${styles.heading}`}>
            Shipping worldwide from Nigerian ports.
          </h2>
          <p className={styles.body}>
            We quote FOB, CFR and CIF to any commercial destination, loading
            through Lagos (Apapa and Tin Can) and Onne. Tell us your port and we
            will confirm freight and lead time.
          </p>

          <dl className={`${shared.hairlineGrid} ${styles.facts}`}>
            {marketFacts.map((fact) => (
              <div key={fact.label} className={styles.fact}>
                <dt className={styles.factLabel}>{fact.label}</dt>
                <dd className={styles.factValue}>{fact.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className={`${shared.frame} ${styles.frame}`}>
          <Image
            src="/assets/reach-photo.webp"
            alt="Shipping containers loaded at a Nigerian port for export"
            fill
            sizes="(max-width: 1023px) 100vw, 46vw"
            className={shared.frameImage}
          />
        </div>
      </div>
    </section>
  );
}
