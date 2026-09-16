"use client";

import { useId, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import shared from "@/styles/shared.module.css";
import styles from "./Products.module.css";

export type ProductCardData = {
  slug: string;
  title: string;
  description: string;
  commodities: string[];
  imageUrl: string | null;
  imagePosition: string;
  alt: string;
  details: { label: string; value: string }[];
};

/**
 * A product card whose photograph reveals the commodity's details.
 *
 * Two ways in, because hover alone excludes most of the people who will use
 * this: on a device that can hover, moving onto the card reveals the panel via
 * CSS; everywhere else — touch, keyboard — the Details button toggles it. The
 * button is always present rather than hidden on desktop, so a keyboard user on
 * a laptop is not left without a way to open it.
 */
export function ProductCard({
  product,
  showCommodities,
}: {
  product: ProductCardData;
  showCommodities: boolean;
}) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const hasDetails = product.details.length > 0;

  return (
    <article className={styles.card + (open ? " " + styles.cardOpen : "")}>
      <div className={shared.frameWarm + " " + styles.cardFrame}>
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.alt}
            fill
            sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw"
            className={shared.frameImage}
            style={{ objectPosition: product.imagePosition }}
          />
        ) : (
          <div className={styles.cardFrameEmpty} aria-hidden="true" />
        )}

        {hasDetails && (
          <>
            <div
              id={panelId}
              className={styles.detail}
              // Hidden from assistive tech until opened by the button. The
              // hover reveal is decorative duplication of the same content.
              aria-hidden={!open}
            >
              <dl className={styles.detailList}>
                {product.details.map((detail) => (
                  <div key={detail.label} className={styles.detailRow}>
                    <dt className={styles.detailTerm}>{detail.label}</dt>
                    <dd className={styles.detailValue}>{detail.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <button
              type="button"
              className={styles.detailToggle}
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls={panelId}
            >
              {open ? "Close" : "Details"}
              <span className={styles.toggleIcon} aria-hidden="true">
                {open ? "×" : "+"}
              </span>
            </button>
          </>
        )}
      </div>

      {/* Anchor heading — one per commodity group, for search landings. */}
      <h3 id={product.slug} className={styles.cardTitle}>
        <Link href={"/products/" + product.slug} className={styles.cardTitleLink}>
          {product.title}
        </Link>
      </h3>
      <p className={styles.cardBody}>{product.description}</p>

      {/* The hover panel is a teaser; the full specification lives on its own
          page, which is also what search engines index. */}
      <Link href={"/products/" + product.slug} className={styles.cardMore}>
        Full specification →
      </Link>

      {showCommodities && product.commodities.length > 0 && (
        <ul className={styles.chips}>
          {product.commodities.map((commodity) => (
            <li key={commodity} className={styles.chip}>
              {commodity}
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
