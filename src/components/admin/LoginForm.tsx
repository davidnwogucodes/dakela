"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "@/app/admin/login/login.module.css";

/**
 * Username + password sign-in.
 *
 * The credentials go to /api/admin/login, which checks them against a hash and
 * sets an HttpOnly session cookie. Nothing is stored in the browser by this
 * component — an HttpOnly cookie is deliberately unreadable from JavaScript, so
 * a script injected into the page cannot steal the session.
 */
export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  /** Only ever redirect to a path on this site — never to an absolute URL an
   *  attacker could put in ?next= to bounce the owner somewhere else. */
  function safeNext(): string {
    const next = params.get("next");
    if (!next || !next.startsWith("/admin") || next.startsWith("//")) return "/admin";
    return next;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setBusy(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? "That username and password do not match.");
        setBusy(false);
        return;
      }

      // refresh() so the server re-reads the freshly set cookie before the
      // dashboard renders, otherwise the first paint can still look signed out.
      router.replace(safeNext());
      router.refresh();
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
      setBusy(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.field}>
        <label htmlFor="username" className={styles.label}>
          Username
        </label>
        <input
          id="username"
          autoComplete="username"
          autoCapitalize="none"
          autoCorrect="off"
          className={styles.input}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="password" className={styles.label}>
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          className={styles.input}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      <button type="submit" className={styles.submit} disabled={busy}>
        {busy ? "Signing in…" : "Sign in"}
      </button>

      <p className={styles.footnote}>
        Signed-in sessions last eight hours. Changing the password means changing it
        in the site&rsquo;s environment settings and redeploying.
      </p>
    </form>
  );
}
