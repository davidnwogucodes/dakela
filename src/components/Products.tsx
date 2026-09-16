import { ProductCard, type ProductCardData } from "./ProductCard";
import { features } from "@/config/site";
import { getPublishedProducts, productImageUrl } from "@/lib/content";
import shared from "@/styles/shared.module.css";
import styles from "./Products.module.css";

/** Small counts read better spelled out in a display heading. Falls back to
 *  digits past twelve, where words start to look worse than numerals. */
const NUMBER_WORDS = [
  "Zero", "One", "Two", "Three", "Four", "Five", "Six",
  "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve",
];

function counted(n: number): string {
  return NUMBER_WORDS[n] ?? String(n);
}

/** Hover-card rows, in the order they read best. Blank values are dropped, so a
 *  half-filled product still produces a tidy panel. */
function detailsOf(product: Awaited<ReturnType<typeof getPublishedProducts>>[number]) {
  return [
    { label: "Origin", value: product.origin },
    { label: "Uses", value: product.uses },
    { label: "Nutrition", value: product.nutrition },
    { label: "Grades", value: product.grades },
    { label: "Season", value: product.seasonality },
  ].filter((row): row is { label: string; value: string } => Boolean(row.value?.trim()));
}

export async function Products() {
  const products = await getPublishedProducts();

  // Nothing to show: render no band at all rather than an empty grid with a
  // heading promising six commodity groups.
  if (products.length === 0) return null;

  const cards: ProductCardData[] = products.map((product) => ({
    slug: product.slug,
    title: product.title,
    description: product.description,
    commodities: product.commodities,
    imageUrl: productImageUrl(product.image_path),
    imagePosition: product.image_position,
    alt: product.alt,
    details: detailsOf(product),
  }));

  return (
    <section id="products" className={styles.section}>
      <div className={shared.container}>
        <div className={styles.header}>
          <div>
            <p className={shared.eyebrow}>02 — What we export</p>
            <h2 className={shared.h2 + " " + styles.heading}>
              {counted(cards.length)} commodity{" "}
              {cards.length === 1 ? "group" : "groups"}, sourced to buyer specification.
            </h2>
          </div>
          <p className={styles.intro}>
            Grades, moisture levels, packaging and MOQ are confirmed per enquiry. Send us
            your specification and destination port for an indicative offer.
          </p>
        </div>

        <div className={styles.grid}>
          {cards.map((product) => (
            <ProductCard
              key={product.slug}
              product={product}
              showCommodities={features.showCommodityLists}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
