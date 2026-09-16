"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "@/app/admin/(dashboard)/dashboard.module.css";

export function SignOutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function signOut() {
    setBusy(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } finally {
      // Head for login regardless: if the request failed the cookie may still
      // be live, and the proxy will decide. Leaving the owner stuck on a
      // dead-looking dashboard is the worse outcome.
      router.replace("/admin/login");
      router.refresh();
    }
  }

  return (
    <button type="button" className={styles.signOut} onClick={signOut} disabled={busy}>
      {busy ? "Signing out…" : "Sign out"}
    </button>
  );
}
