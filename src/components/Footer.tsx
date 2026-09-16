import Link from "next/link";
import { LogoMark } from "./Logo";
import { ENQUIRY_PATH, site } from "@/config/site";
import shared from "@/styles/shared.module.css";
import styles from "./Footer.module.css";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={`${shared.container} ${styles.row}`}>
        <div className={styles.brand}>
          <LogoMark size={20} muted />
          <span>{site.legalName}</span>
        </div>
        <div>{site.tagline}</div>
        <Link href={ENQUIRY_PATH} className={styles.link}>
          Make an enquiry
        </Link>
        <div>© {year} {site.name}</div>
      </div>
    </footer>
  );
}
