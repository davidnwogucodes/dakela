import Link from "next/link";
import { ENQUIRY_PATH, site, site_email_href } from "@/config/site";
import shared from "@/styles/shared.module.css";
import styles from "./Contact.module.css";

export function Contact() {
  const { street, city, state, country, placeholderLines } = site.address;
  const addressLines = street
    ? [street, [city, state].filter(Boolean).join(", "), country].filter(Boolean)
    : placeholderLines;

  return (
    <section id="contact" className={styles.section}>
      <div className={`${shared.container} ${styles.grid}`}>
        <div className={styles.left}>
          <p className={`${shared.eyebrowDark} ${styles.eyebrow}`}>06 — Contact</p>
          <h2 className={styles.heading}>
            Send us your specification and destination port.
          </h2>
          <p className={styles.body}>
            Include the commodity, grade, monthly volume and required Incoterm.
            We reply with an indicative offer within one working day.
          </p>

          <div className={shared.buttonRow}>
            <Link href={ENQUIRY_PATH} className={shared.btnPrimary}>
              Send your specification
            </Link>
            <a href={site_email_href} className={shared.btnSecondary}>
              {site.email}
            </a>
          </div>
        </div>

        {/* Still no form in this section — the client asked for direct contact
            here. The structured enquiry form lives on its own page, linked
            above, so this panel stays contact details only. */}
        <div className={styles.panel}>
          <div className={styles.panelRow}>
            <div className={styles.panelLabel}>Telephone</div>
            <a href={site.phoneHref} className={styles.phone}>
              {site.phoneDisplay}
            </a>
          </div>

          <div className={styles.panelRow}>
            <div className={styles.panelLabel}>Email</div>
            <a href={site_email_href} className={styles.emailValue}>
              {site.email}
            </a>
          </div>

          <div className={styles.panelRow}>
            <div className={styles.panelLabel}>Office</div>
            <address className={styles.panelText}>
              {addressLines.map((line, index) => (
                <span key={line}>
                  {line}
                  {index < addressLines.length - 1 && <br />}
                </span>
              ))}
            </address>
          </div>

          <div className={styles.panelRow}>
            <div className={styles.panelLabel}>Registration</div>
            <div className={styles.panelText}>CAC RC {site.rcNumber}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
