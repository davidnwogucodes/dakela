import Image from "next/image";
import { WhatsAppIcon } from "./WhatsAppIcon";
import { site, site_email_href } from "@/config/site";
import shared from "@/styles/shared.module.css";
import styles from "./Hero.module.css";

export function Hero() {
  return (
    <section id="top" className={styles.hero}>
      <div className={`${shared.container} ${styles.grid}`}>
        <div className={styles.copy}>
          <div className={styles.eyebrowRow}>
            <span className={styles.rule} aria-hidden="true" />
            <span className={styles.eyebrowText}>
              Agricultural commodity exporter · Nigeria
            </span>
          </div>

          <h1 className={styles.h1}>
            Nigerian agricultural commodities, delivered to specification.
          </h1>

          <p className={styles.lead}>
            Dakela Exports Nig. Ltd. supplies international markets with sesame,
            cocoa, cashew, hibiscus, palm and cassava products — sourced through
            verified suppliers and inspected before every shipment.
          </p>

          <div className={shared.buttonRow}>
            <a
              href={site.whatsappHref}
              target="_blank"
              rel="noopener"
              className={shared.btnPrimary}
            >
              <WhatsAppIcon />
              WhatsApp: {site.phoneDisplay}
            </a>
            <a href={site_email_href} className={shared.btnSecondary}>
              Email the trade desk
            </a>
          </div>
        </div>

        <div className={styles.media}>
          <Image
            src="/assets/hero-photo.webp"
            alt="Sacks of Nigerian agricultural commodities staged for export loading"
            fill
            priority
            sizes="(max-width: 1023px) 100vw, 48vw"
            className={shared.frameImage}
          />
        </div>
      </div>
    </section>
  );
}
