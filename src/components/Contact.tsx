import Link from "next/link";
import { ENQUIRY_PATH } from "@/config/site";
import { getCompany } from "@/lib/content";
import shared from "@/styles/shared.module.css";
import styles from "./Contact.module.css";

export async function Contact() {
  const company = await getCompany();

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
            <a href={company.emailHref} className={shared.btnSecondary}>
              {company.email}
            </a>
          </div>
        </div>

        {/* Still no form in this section — the client asked for direct contact
            here. The structured enquiry form lives on its own page, linked
            above, so this panel stays contact details only. */}
        <div className={styles.panel}>
          <div className={styles.panelRow}>
            <div className={styles.panelLabel}>Telephone</div>
            <a href={company.phoneHref} className={styles.phone}>
              {company.phone}
            </a>
          </div>

          <div className={styles.panelRow}>
            <div className={styles.panelLabel}>Email</div>
            <a href={company.emailHref} className={styles.emailValue}>
              {company.email}
            </a>
          </div>

          {/* The office row is left out entirely until an address is on file.
              An empty row, or a "coming soon" placeholder, both read worse on a
              live site than the row simply not being there. */}
          {company.addressLines.length > 1 && (
            <div className={styles.panelRow}>
              <div className={styles.panelLabel}>Office</div>
              <address className={styles.panelText}>
                {company.addressLines.map((line, index) => (
                  <span key={line}>
                    {line}
                    {index < company.addressLines.length - 1 && <br />}
                  </span>
                ))}
              </address>
            </div>
          )}

          <div className={styles.panelRow}>
            <div className={styles.panelLabel}>Registration</div>
            <div className={styles.panelText}>CAC RC {company.rcNumber}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
