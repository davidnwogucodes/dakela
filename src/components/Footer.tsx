import { LogoMark } from "./Logo";
import { site } from "@/config/site";
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
        <div>© {year} {site.name}</div>
      </div>
    </footer>
  );
}
