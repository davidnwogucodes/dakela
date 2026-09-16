import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  // The dashboard must never appear in search results, and a crawler that
  // finds a link should not follow it further into the admin.
  robots: { index: false, follow: false, nocache: true },
};

/**
 * Applies to every /admin route, login included. The nav shell lives one level
 * down in (dashboard)/layout.tsx so the login page renders without it.
 */
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
