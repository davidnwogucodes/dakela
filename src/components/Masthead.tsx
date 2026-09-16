import Link from "next/link";
import { Logo } from "./Logo";
import { ENQUIRY_PATH } from "@/config/site";
import shared from "@/styles/shared.module.css";
import styles from "./Masthead.module.css";

/**
 * Header for pages that are not the home page.
 *
 * The site header is a scroll-spy over same-page anchors, which have no targets
 * anywhere but the home page — following one from here would land the visitor
 * on a dead link. This is the plain equivalent: the mark home, a way back, and
 * the one action worth keeping in reach.
 */
export function Masthead({
  backHref = "/",
  backLabel = "Back to site",
  showEnquiry = true,
}: {
  backHref?: string;
  backLabel?: string;
  showEnquiry?: boolean;
}) {
  return (
    <header className={styles.masthead}>
      <div className={shared.container + " " + styles.inner}>
        <Logo href="/" />

        <div className={styles.actions}>
          <Link href={backHref} className={styles.back}>
            ← {backLabel}
          </Link>
          {showEnquiry && (
            <Link href={ENQUIRY_PATH} className={styles.cta}>
              Make an enquiry
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
