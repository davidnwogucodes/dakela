import { Suspense } from "react";
import { LoginForm } from "@/components/admin/LoginForm";
import { isAuthConfigured } from "@/lib/auth";
import styles from "./login.module.css";

export default function LoginPage() {
  // Rendered server-side so the setup warning cannot be missed: with no
  // credentials configured, no sign-in can succeed at all.
  const configured = isAuthConfigured();

  return (
    <main className={styles.screen}>
      <div className={styles.card}>
        <p className={styles.eyebrow}>Dakela Exports</p>
        <h1 className={styles.heading}>Dashboard</h1>
        <p className={styles.body}>
          Sign in to manage products, the enquiry form and the look of the site.
        </p>

        {!configured && (
          <p className={styles.warn}>
            <strong>Not configured.</strong> The sign-in details are not set on the
            server, so nobody can sign in yet. Set <code>ADMIN_USERNAME</code>,{" "}
            <code>ADMIN_PASSWORD_HASH</code> and <code>AUTH_SECRET</code>.
          </p>
        )}

        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
