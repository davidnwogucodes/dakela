import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
import { Masthead } from "@/components/Masthead";
import { ThemeStyle } from "@/components/ThemeStyle";
import { ENQUIRY_PATH, site } from "@/config/site";
import {
  getProductBySlug,
  getPublishedProducts,
  getSettings,
  productDocUrl,
  productImageUrl,
  resolveBlock,
  type Product,
} from "@/lib/content";
import shared from "@/styles/shared.module.css";
import styles from "./product.module.css";

/** Same ISR policy as the rest of the public site. */
export const revalidate = 60;

/** Prerender every published product at build time. */
export async function generateStaticParams() {
  const products = await getPublishedProducts();
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) return { title: "Product not found" };

  // The overview reads better as a description than the card blurb, but it is
  // long — trim to something a search result will actually show.
  const raw = (product.overview ?? product.description ?? "").replace(/\s+/g, " ").trim();
  const description = raw.length > 300 ? raw.slice(0, 297).trimEnd() + "…" : raw;

  const image = productImageUrl(product.image_path);

  return {
    title: product.title + " — export specification",
    description,
    alternates: { canonical: "/products/" + product.slug },
    openGraph: {
      title: product.title + " — Dakela Exports",
      description,
      url: site.url + "/products/" + product.slug,
      images: image && !image.startsWith("/") ? [image] : undefined,
    },
  };
}

/** A section that renders only when it has something to say. */
function Band({
  number,
  title,
  lead,
  dark,
  children,
}: {
  number: string;
  title: string;
  lead?: string | null;
  dark?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className={dark ? styles.bandDark : styles.band}>
      <div className={shared.container}>
        <div className={styles.bandHead}>
          <p className={dark ? shared.eyebrowDark : shared.eyebrow}>
            {number} — {title}
          </p>
          {lead && <p className={dark ? styles.leadDark : styles.lead}>{lead}</p>}
        </div>
        {children}
      </div>
    </section>
  );
}

/** Plain list rendered as the site's hairline grid. */
function ListGrid({ items, dark }: { items: string[]; dark?: boolean }) {
  return (
    <ul className={dark ? styles.listGridDark : styles.listGrid}>
      {items.map((item) => (
        <li key={item} className={dark ? styles.listCellDark : styles.listCell}>
          {item}
        </li>
      ))}
    </ul>
  );
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [product, settings, all] = await Promise.all([
    getProductBySlug(slug),
    getSettings(),
    getPublishedProducts(),
  ]);

  if (!product) notFound();

  const image = productImageUrl(product.image_path);

  // Each of these is the product's own list, or the site-wide one it inherits.
  const packaging = resolveBlock(product, settings, "packaging");
  const ports = resolveBlock(product, settings, "loading_ports");
  const incoterms = resolveBlock(product, settings, "incoterms");
  const shipment = resolveBlock(product, settings, "shipment_options");
  const quality = resolveBlock(product, settings, "quality_assurance");
  const documents = resolveBlock(product, settings, "certifications");

  const moq = product.moq?.trim() || settings.default_moq;
  const leadTime = product.lead_time?.trim() || settings.default_lead_time;

  // Product FAQs are added to the site-wide set, not a replacement for it.
  const faq = [...(product.faq ?? []), ...(settings.faq ?? [])];

  const related = (product.related_slugs ?? [])
    .map((s) => all.find((p) => p.slug === s))
    .filter((p): p is Product => Boolean(p) && p!.slug !== product.slug);

  // Carries the commodity into the form, so the first row arrives filled in.
  const quoteHref =
    ENQUIRY_PATH + "?commodity=" + encodeURIComponent(product.commodities[0] ?? product.title);

  const exportFacts = [
    { label: "Country of origin", value: "Nigeria" },
    { label: "Harvest season", value: product.seasonality },
    { label: "Minimum order", value: moq },
    { label: "Lead time", value: leadTime },
  ].filter((fact): fact is { label: string; value: string } => Boolean(fact.value?.trim()));

  /* Numbering is computed rather than written in, so hiding a section does not
     leave a gap in the sequence down the page. */
  let n = 0;
  const step = () => String(++n).padStart(2, "0");

  return (
    <>
      <ThemeStyle />
      <Masthead backHref="/#products" backLabel="All products" />

      <main>
        {/* --- Hero ------------------------------------------------------- */}
        <section className={styles.hero}>
          <div className={shared.container + " " + styles.heroGrid}>
            <div className={styles.heroText}>
              <p className={shared.eyebrow}>Product specification</p>
              <h1 className={styles.heroTitle}>{product.title}</h1>
              {product.botanical_name && (
                <p className={styles.botanical}>{product.botanical_name}</p>
              )}
              <p className={styles.heroLead}>{product.description}</p>

              <div className={shared.buttonRow}>
                <Link href={quoteHref} className={shared.btnPrimary}>
                  Request a quote
                </Link>
              </div>

              {product.commodities.length > 0 && (
                <ul className={styles.chips}>
                  {product.commodities.map((commodity) => (
                    <li key={commodity} className={styles.chip}>
                      {commodity}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {image && (
              <div className={shared.frameWarm + " " + styles.heroFrame}>
                <Image
                  src={image}
                  alt={product.alt || product.title}
                  fill
                  priority
                  sizes="(max-width: 1023px) 100vw, 46vw"
                  className={shared.frameImage}
                  style={{ objectPosition: product.image_position }}
                />
              </div>
            )}
          </div>
        </section>

        {/* --- Overview --------------------------------------------------- */}
        {product.overview?.trim() && (
          <Band number={step()} title="Overview">
            <p className={styles.prose}>{product.overview}</p>
            {product.producing_states.length > 0 && (
              <div className={styles.statesBlock}>
                <p className={styles.subhead}>Major producing states</p>
                <ListGrid items={product.producing_states} />
              </div>
            )}
          </Band>
        )}

        {/* --- Available forms -------------------------------------------- */}
        {product.forms.length > 0 && (
          <Band
            number={step()}
            title="Available forms"
            lead="Supplied in whichever form suits your process."
          >
            <ListGrid items={product.forms} />
          </Band>
        )}

        {/* --- Specifications --------------------------------------------- */}
        {product.specifications.length > 0 && (
          <Band
            number={step()}
            title="Specification"
            lead="Specifications can be adjusted to buyer requirements where feasible."
            dark
          >
            <div className={styles.specTableWrap}>
              <table className={styles.specTable}>
                <tbody>
                  {product.specifications.map((row) => (
                    <tr key={row.label}>
                      <th scope="row">{row.label}</th>
                      <td>{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Band>
        )}

        {/* --- Packaging --------------------------------------------------- */}
        {packaging.values.length > 0 && (
          <Band number={step()} title="Packaging">
            <ListGrid items={packaging.values} />
          </Band>
        )}

        {/* --- Export information ------------------------------------------ */}
        {(exportFacts.length > 0 || ports.values.length > 0) && (
          <Band number={step()} title="Export information">
            {exportFacts.length > 0 && (
              <dl className={styles.facts}>
                {exportFacts.map((fact) => (
                  <div key={fact.label} className={styles.fact}>
                    <dt className={styles.factLabel}>{fact.label}</dt>
                    <dd className={styles.factValue}>{fact.value}</dd>
                  </div>
                ))}
              </dl>
            )}

            {ports.values.length > 0 && (
              <div className={styles.statesBlock}>
                <p className={styles.subhead}>Loading ports</p>
                <ListGrid items={ports.values} />
              </div>
            )}
          </Band>
        )}

        {/* --- Quality assurance ------------------------------------------- */}
        {quality.values.length > 0 && (
          <Band
            number={step()}
            title="Quality assurance"
            lead="Every shipment passes the same controls before it loads."
            dark
          >
            <ol className={styles.steps}>
              {quality.values.map((item, index) => (
                <li key={item} className={styles.step}>
                  <span className={styles.stepNumber}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className={styles.stepLabel}>{item}</span>
                </li>
              ))}
            </ol>
          </Band>
        )}

        {/* --- Applications ------------------------------------------------ */}
        {product.applications.length > 0 && (
          <Band number={step()} title="Applications">
            <ListGrid items={product.applications} />
          </Band>
        )}

        {/* --- Export documentation ---------------------------------------- */}
        {documents.values.length > 0 && (
          <Band
            number={step()}
            title="Export documentation"
            lead="Provided as applicable to the destination country."
          >
            <ListGrid items={documents.values} />
          </Band>
        )}

        {/* --- Logistics --------------------------------------------------- */}
        {(incoterms.values.length > 0 || shipment.values.length > 0) && (
          <Band number={step()} title="Logistics &amp; shipping" dark>
            {incoterms.values.length > 0 && (
              <div className={styles.statesBlock}>
                <p className={styles.subheadDark}>Incoterms</p>
                <ListGrid items={incoterms.values} dark />
              </div>
            )}
            {shipment.values.length > 0 && (
              <div className={styles.statesBlock}>
                <p className={styles.subheadDark}>Shipment options</p>
                <ListGrid items={shipment.values} dark />
              </div>
            )}
          </Band>
        )}

        {/* --- Downloads ---------------------------------------------------- */}
        {(product.documents.length > 0 || settings.downloads_note?.trim()) && (
          <Band number={step()} title="Documents">
            {product.documents.length > 0 ? (
              <ul className={styles.docs}>
                {product.documents.map((doc) => {
                  const url = productDocUrl(doc.path);
                  if (!url) return null;
                  return (
                    <li key={doc.path} className={styles.doc}>
                      <a href={url} className={styles.docLink} target="_blank" rel="noopener">
                        <span className={styles.docLabel}>{doc.label}</span>
                        <span className={styles.docMeta}>
                          PDF · {Math.max(1, Math.round(doc.size / 1024))} KB
                        </span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className={styles.prose}>{settings.downloads_note}</p>
            )}
          </Band>
        )}

        {/* --- Why us ------------------------------------------------------- */}
        {settings.why_us.length > 0 && (
          <Band number={step()} title={"Why " + site.shortName}>
            <ListGrid items={settings.why_us} />
          </Band>
        )}

        {/* --- FAQ ---------------------------------------------------------- */}
        {faq.length > 0 && (
          <Band number={step()} title="Questions">
            <div className={styles.faq}>
              {faq.map((item) => (
                <details key={item.question} className={styles.faqItem}>
                  <summary className={styles.faqQuestion}>{item.question}</summary>
                  <p className={styles.faqAnswer}>{item.answer}</p>
                </details>
              ))}
            </div>
          </Band>
        )}

        {/* --- Related ------------------------------------------------------ */}
        {related.length > 0 && (
          <Band number={step()} title="Related products">
            <div className={styles.related}>
              {related.map((item) => {
                const thumb = productImageUrl(item.image_path);
                return (
                  <Link
                    key={item.slug}
                    href={"/products/" + item.slug}
                    className={styles.relatedCard}
                  >
                    <span className={styles.relatedFrame}>
                      {thumb && (
                        <Image
                          src={thumb}
                          alt=""
                          fill
                          sizes="(max-width: 767px) 100vw, 30vw"
                          className={shared.frameImage}
                          style={{ objectPosition: item.image_position }}
                        />
                      )}
                    </span>
                    <span className={styles.relatedTitle}>{item.title}</span>
                    <span className={styles.relatedNote}>
                      {item.commodities.slice(0, 3).join(", ")}
                    </span>
                  </Link>
                );
              })}
            </div>
          </Band>
        )}

        {/* --- Request a quote ----------------------------------------------- */}
        <section className={styles.quote}>
          <div className={shared.container + " " + styles.quoteInner}>
            <div>
              <p className={shared.eyebrowDark}>{step()} — Request a quote</p>
              <h2 className={styles.quoteHeading}>
                Send your specification and destination port.
              </h2>
              <p className={styles.quoteBody}>
                Tell us the quantity, packaging and Incoterm you need. We reply with an
                indicative offer and a proforma invoice within one working day.
              </p>
            </div>
            <div className={shared.buttonRow}>
              <Link href={quoteHref} className={shared.btnPrimary}>
                Request a quote
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
