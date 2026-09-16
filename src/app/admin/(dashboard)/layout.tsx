import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";
import { SignOutButton } from "@/components/admin/SignOutButton";
import { checkAdmin } from "@/lib/auth";
import styles from "./dashboard.module.css";

/**
 * Wraps every signed-in dashboard page.
 *
 * The proxy has already established that *a* session exists. This layout
 * establishes that the session belongs to someone on the allowlist — the check
 * the proxy cannot safely do, since it would need the service key to look
 * anything up. Route handlers repeat the check independently; a layout guard
 * protects the pages, not the API.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const check = await checkAdmin();

  if (!check.ok) {
    if (check.reason === "unauthenticated") redirect("/admin/login");

    // Signed in, but not an owner — or the server has no allowlist at all.
    return (
      <main className={styles.denied}>
        <div className={styles.deniedCard}>
          <h1 className={styles.deniedTitle}>
            Dashboard not configured
          </h1>
          <p className={styles.deniedBody}>
            <>
              The sign-in details are not configured on the server. Set{" "}
              <code>ADMIN_USERNAME</code>, <code>ADMIN_PASSWORD_HASH</code> and{" "}
              <code>AUTH_SECRET</code> in <code>.env.local</code> and in the Vercel
              environment variables, then redeploy.
            </>
          </p>
          <div className={styles.deniedActions}>
            <SignOutButton />
            <Link href="/" className={styles.deniedLink}>
              Back to the site
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <Link href="/admin" className={styles.brandLink}>
            Dakela
          </Link>
          <span className={styles.brandTag}>Dashboard</span>
        </div>

        <AdminNav />

        <div className={styles.sidebarFoot}>
          <p className={styles.account} title={check.username}>
            {check.username}
          </p>
          <div className={styles.footActions}>
            <Link href="/" className={styles.footLink} target="_blank" rel="noopener">
              View site ↗
            </Link>
            <SignOutButton />
          </div>
        </div>
      </aside>

      <main className={styles.content}>
        <div className={styles.contentInner}>{children}</div>
      </main>
    </div>
  );
}
