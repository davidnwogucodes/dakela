import { WhatsAppIcon } from "./WhatsAppIcon";
import { site, site_email_href } from "@/config/site";
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
            <a
              href={site.whatsappHref}
              target="_blank"
              rel="noopener"
              className={shared.btnPrimary}
            >
              <WhatsAppIcon />
              Chat on WhatsApp
            </a>
            <a href={site_email_href} className={shared.btnSecondary}>
              {site.email}
            </a>
          </div>
        </div>

        {/* No contact form by design — the client asked for direct contact only. */}
        <div className={styles.panel}>
          <div className={styles.panelRow}>
            <div className={styles.panelLabel}>Telephone / WhatsApp</div>
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
