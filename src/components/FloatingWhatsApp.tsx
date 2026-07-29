import { WhatsAppIcon } from "./WhatsAppIcon";
import { site } from "@/config/site";
import styles from "./FloatingWhatsApp.module.css";

/** Persistent WhatsApp shortcut. Collapses to an icon-only square on mobile. */
export function FloatingWhatsApp() {
  return (
    <div className={styles.wrapper}>
      <a
        href={site.whatsappHref}
        target="_blank"
        rel="noopener"
        className={styles.button}
        aria-label="Enquire now on WhatsApp"
      >
        <WhatsAppIcon color="var(--accent)" />
        <span className={styles.label}>Enquire now</span>
      </a>
    </div>
  );
}
