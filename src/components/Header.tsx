"use client";

import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import Link from "next/link";
import { ENQUIRY_PATH, features, nav } from "@/config/site";
import shared from "@/styles/shared.module.css";
import styles from "./Header.module.css";

const links = nav.filter(
  (link) => link.href !== "#suppliers" || features.showSuppliers,
);

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);

  // Close the mobile menu on Escape, and whenever the viewport grows past the
  // breakpoint where the menu no longer exists.
  useEffect(() => {
    if (!menuOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    const wide = window.matchMedia("(min-width: 1024px)");
    const onChange = () => {
      if (wide.matches) setMenuOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    wide.addEventListener("change", onChange);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      wide.removeEventListener("change", onChange);
    };
  }, [menuOpen]);

  // Scroll-spy: highlight the nav link for whichever section owns the band of
  // viewport just below the sticky header.
  useEffect(() => {
    const sections = links
      .map((link) => document.querySelector<HTMLElement>(link.href))
      .filter((el): el is HTMLElement => el !== null);

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActive(`#${visible.target.id}`);
      },
      // Watch a thin band under the header so one section is active at a time.
      { rootMargin: "-76px 0px -70% 0px", threshold: 0 },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <header className={styles.header}>
      <div className={`${shared.container} ${styles.row}`}>
        <Logo />

        <div className={styles.navGroup}>
          <nav className={styles.desktopNav} aria-label="Primary">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={styles.navLink}
                aria-current={active === link.href ? "true" : undefined}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* The enquiry CTA stays outside the collapsed menu, so the one action
              worth taking is reachable at every width without opening anything. */}
          <Link href={ENQUIRY_PATH} className={styles.cta}>
            Make an enquiry
          </Link>

          <button
            type="button"
            className={styles.menuButton}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className={styles.menuIcon} data-open={menuOpen} aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
          </button>
        </div>
      </div>

      <nav
        id="mobile-nav"
        className={styles.mobileNav}
        data-open={menuOpen}
        aria-label="Primary, mobile"
        hidden={!menuOpen}
      >
        <div className={shared.container}>
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={styles.mobileLink}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}

          <Link
            href={ENQUIRY_PATH}
            className={styles.mobileCta}
            onClick={() => setMenuOpen(false)}
          >
            Make an enquiry →
          </Link>
        </div>
      </nav>
    </header>
  );
}
