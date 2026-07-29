import Image from "next/image";
import { products } from "@/data/products";
import { features } from "@/config/site";
import shared from "@/styles/shared.module.css";
import styles from "./Products.module.css";

export function Products() {
  return (
    <section id="products" className={styles.section}>
      <div className={shared.container}>
        <div className={styles.header}>
          <div>
            <p className={shared.eyebrow}>02 — What we export</p>
            <h2 className={`${shared.h2} ${styles.heading}`}>
              Six commodity groups, sourced to buyer specification.
            </h2>
          </div>
          <p className={styles.intro}>
            Grades, moisture levels, packaging and MOQ are confirmed per enquiry.
            Send us your specification and destination port for an indicative
            offer.
          </p>
        </div>

        <div className={styles.grid}>
          {products.map((product) => (
            <article key={product.slug} className={styles.card}>
              <div className={`${shared.frameWarm} ${styles.cardFrame}`}>
                <Image
                  src={product.image}
                  alt={product.alt}
                  fill
                  sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw"
                  className={shared.frameImage}
                  style={{ objectPosition: product.imagePosition }}
                />
              </div>

              {/* Anchor heading — one per commodity group, for search landings. */}
              <h3 id={product.slug} className={styles.cardTitle}>
                {product.title}
              </h3>
              <p className={styles.cardBody}>{product.description}</p>

              {features.showCommodityLists && (
                <ul className={styles.chips}>
                  {product.commodities.map((commodity) => (
                    <li key={commodity} className={styles.chip}>
                      {commodity}
                    </li>
                  ))}
                </ul>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
