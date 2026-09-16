"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "@/app/admin/(dashboard)/dashboard.module.css";

const items = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/form", label: "Enquiry form" },
  { href: "/admin/enquiries", label: "Submissions" },
  { href: "/admin/appearance", label: "Appearance" },
] as const;

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className={styles.nav} aria-label="Dashboard">
      {items.map((item) => {
        // "/admin" would otherwise match every child route, so it needs an
        // exact comparison while the rest match their whole subtree.
        const active =
          item.href === "/admin"
            ? pathname === "/admin"
            : pathname === item.href || pathname.startsWith(item.href + "/");

        return (
          <Link
            key={item.href}
            href={item.href}
            className={active ? styles.navLinkActive : styles.navLink}
            aria-current={active ? "page" : undefined}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
