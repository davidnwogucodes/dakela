import { processSteps } from "@/data/content";
import shared from "@/styles/shared.module.css";
import styles from "./Process.module.css";

export function Process() {
  return (
    <section id="process" className={styles.section}>
      <div className={shared.container}>
        <div className={styles.intro}>
          <p className={shared.eyebrowDark}>03 — How we work</p>
          <h2 className={`${shared.h2} ${styles.heading}`}>
            One point of contact, from enquiry to bill of lading.
          </h2>
          <p className={styles.introBody}>
            We coordinate the whole procurement chain at origin so your team
            manages a single relationship instead of five.
          </p>
        </div>

        <ol className={`${shared.hairlineGridDark} ${styles.steps}`}>
          {processSteps.map((step) => (
            <li key={step.numeral} className={styles.step}>
              <div className={styles.numeral} aria-hidden="true">
                {step.numeral}
              </div>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepBody}>{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
