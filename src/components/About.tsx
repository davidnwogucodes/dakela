import Image from "next/image";
import { values } from "@/data/content";
import shared from "@/styles/shared.module.css";
import styles from "./About.module.css";

export function About() {
  return (
    <section id="about" className={styles.section}>
      <div className={`${shared.container} ${styles.grid}`}>
        <div className={styles.left}>
          <p className={`${shared.eyebrow} ${styles.eyebrow}`}>01 — Who we are</p>
          <div className={`${shared.frame} ${styles.frame}`}>
            <Image
              src="/assets/about-photo.webp"
              alt="Dakela staff inspecting commodity lots at origin in Nigeria"
              fill
              sizes="(max-width: 1023px) 100vw, 40vw"
              className={shared.frameImage}
            />
          </div>
        </div>

        <div className={styles.right}>
          <h2 className={`${shared.h2} ${styles.heading}`}>
            A dependable trade partner between Nigeria&rsquo;s farms and the
            world&rsquo;s buyers.
          </h2>

          <p className={styles.body}>
            Dakela Exports Nig. Ltd. is a Nigerian exporter of agricultural
            commodities, dedicated to supplying international markets with
            high-quality products from Nigeria&rsquo;s agricultural sector. We
            work closely with verified suppliers to deliver consistent quality,
            competitive sourcing, and efficient export solutions.
          </p>

          <p className={`${styles.body} ${styles.bodyLast}`}>
            Beyond supplying commodities, we help international buyers simplify
            procurement by coordinating sourcing, quality inspection, packaging,
            documentation, and shipment — connecting Nigeria&rsquo;s agricultural
            potential with buyers around the world through professionalism,
            integrity, and excellence.
          </p>

          <div className={`${shared.hairlineGrid} ${styles.valuesGrid}`}>
            {values.map((value) => (
              <div key={value.title} className={styles.valueCell}>
                <h3 className={styles.valueTitle}>{value.title}</h3>
                <p className={styles.valueBody}>{value.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
