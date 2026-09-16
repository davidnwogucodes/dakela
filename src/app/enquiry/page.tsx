import type { Metadata } from "next";
import Link from "next/link";
import { EnquiryForm } from "@/components/EnquiryForm";
import { Footer } from "@/components/Footer";
import { Logo } from "@/components/Logo";
import { ThemeStyle } from "@/components/ThemeStyle";
import { site, site_email_href } from "@/config/site";
import { getFormFields, getPublishedProducts, getSettings } from "@/lib/content";
import shared from "@/styles/shared.module.css";
import styles from "./page.module.css";

/** Same ISR policy as the home page: static, rebuilt when the owner saves. */
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Enquiry & supplier application",
  description:
    "Request an indicative offer on Nigerian agricultural commodities, or apply to join the Dakela Exports supplier network.",
  alternates: { canonical: "/enquiry" },
  openGraph: {
    title: "Enquiry & supplier application — Dakela Exports",
    description:
      "Request an indicative offer on Nigerian agricultural commodities, or apply to join the Dakela Exports supplier network.",
    url: site.url + "/enquiry",
  },
};

export default async function EnquiryPage() {
  const [fields, products, settings] = await Promise.all([
    getFormFields(true),
    getPublishedProducts(),
    getSettings(),
  ]);

  // The commodity dropdown follows the catalogue, so adding a product adds its
  // commodities to the form with nothing else to do.
  const commodities = Array.from(
    new Set(products.flatMap((product) => product.commodities)),
  );

  const heading =
    settings.enquiry_heading?.trim() || "Tell us what you need, or what you can supply.";

  return (
    <>
      <ThemeStyle />
      {/* The site header is a scroll-spy over same-page anchors, which have no
          targets here — this page gets a plain masthead back to the home page. */}
      <header className={styles.masthead}>
        <div className={shared.container + " " + styles.mastheadInner}>
          <Logo href="/" />
          <Link href="/" className={styles.back}>
            ← Back to site
          </Link>
        </div>
      </header>

      <main>
        <section className={styles.section}>
          <div className={shared.container}>
            <div className={styles.intro}>
              <p className={shared.eyebrow}>Enquiry</p>
              <h1 className={styles.heading}>{heading}</h1>
              <p className={styles.lede}>
                {settings.enquiry_intro?.trim() || (
                  <>
                    One form for both sides of the trade. Buyers get an indicative offer
                    within one working day; suppliers go to our sourcing team for review.
                    If you would rather talk first,{" "}
                    <a href={site_email_href}>email the trade desk</a>.
                  </>
                )}
              </p>
            </div>

            <div className={styles.formWrap}>
              <EnquiryForm
                fields={fields}
                commodities={commodities}
                buyerEnabled={settings.buyer_enabled}
                supplierEnabled={settings.supplier_enabled}
              />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
