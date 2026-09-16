import Link from "next/link";
import { getCounts } from "@/lib/content";
import { isConfigured } from "@/lib/supabase/server";
import ui from "@/styles/admin.module.css";
import styles from "./overview.module.css";

// Counts change on every submission, so never serve a cached copy.
export const dynamic = "force-dynamic";

export default async function OverviewPage() {
  if (!isConfigured()) {
    return (
      <>
        <header className={ui.pageHead}>
          <div>
            <h1 className={ui.pageTitle}>Overview</h1>
          </div>
        </header>
        <p className={ui.noticeError}>
          The server has no Supabase credentials. Set <code>SUPABASE_URL</code> and{" "}
          <code>SUPABASE_SERVICE_ROLE_KEY</code> in <code>.env.local</code> and in the
          Vercel environment variables.
        </p>
      </>
    );
  }

  let counts: Awaited<ReturnType<typeof getCounts>> | null = null;
  let loadError: string | null = null;

  try {
    counts = await getCounts();
  } catch (error) {
    // Almost always means schema.sql has not been run yet, so say that rather
    // than showing a raw Postgres error.
    loadError = error instanceof Error ? error.message : "Unknown error";
  }

  if (loadError || !counts) {
    return (
      <>
        <header className={ui.pageHead}>
          <div>
            <h1 className={ui.pageTitle}>Overview</h1>
          </div>
        </header>
        <p className={ui.noticeError}>
          Could not read the database. If this is a fresh project, run{" "}
          <code>supabase/schema.sql</code> and then <code>supabase/seed.sql</code> in the
          Supabase SQL Editor.
        </p>
        <p className={ui.hint}>{loadError}</p>
      </>
    );
  }

  const cards = [
    {
      href: "/admin/products",
      label: "Products",
      value: counts.products,
      note: "commodity groups on the home page",
    },
    {
      href: "/admin/form",
      label: "Form fields",
      value: counts.fields,
      note: "questions across both sides of the form",
    },
    {
      href: "/admin/enquiries",
      label: "Submissions",
      value: counts.enquiries,
      note: counts.unread > 0 ? counts.unread + " not yet read" : "all read",
      highlight: counts.unread > 0,
    },
  ];

  return (
    <>
      <header className={ui.pageHead}>
        <div>
          <h1 className={ui.pageTitle}>Overview</h1>
          <p className={ui.pageIntro}>
            Everything on the public site that you can change without a developer.
          </p>
        </div>
      </header>

      <div className={styles.cards}>
        {cards.map((card) => (
          <Link key={card.href} href={card.href} className={styles.card}>
            <span className={styles.cardLabel}>{card.label}</span>
            <span className={styles.cardValue}>{card.value}</span>
            <span className={card.highlight ? styles.cardNoteAlert : styles.cardNote}>
              {card.note}
            </span>
          </Link>
        ))}
      </div>

      <section className={styles.guide}>
        <h2 className={ui.panelTitle}>What you can do here</h2>
        <dl className={styles.guideList}>
          <div className={styles.guideItem}>
            <dt className={styles.guideTerm}>
              <Link href="/admin/products">Products</Link>
            </dt>
            <dd className={styles.guideDef}>
              Add, edit, reorder, hide or delete the commodity groups. Upload a photo for
              each, and fill in the origin, uses and nutrition shown when a visitor hovers
              the card.
            </dd>
          </div>
          <div className={styles.guideItem}>
            <dt className={styles.guideTerm}>
              <Link href="/admin/form">Enquiry form</Link>
            </dt>
            <dd className={styles.guideDef}>
              Rename questions, reorder them, mark them required, hide the ones you do not
              need, edit dropdown choices, and add your own questions — separately for
              buyers and for suppliers.
            </dd>
          </div>
          <div className={styles.guideItem}>
            <dt className={styles.guideTerm}>
              <Link href="/admin/enquiries">Submissions</Link>
            </dt>
            <dd className={styles.guideDef}>
              Read what people have sent, mark them as contacted or closed, and export the
              lot to a spreadsheet.
            </dd>
          </div>
          <div className={styles.guideItem}>
            <dt className={styles.guideTerm}>
              <Link href="/admin/appearance">Appearance</Link>
            </dt>
            <dd className={styles.guideDef}>
              Switch the site&rsquo;s colour palette and pick an accent colour. Changes are
              previewed before they go live.
            </dd>
          </div>
        </dl>
      </section>
    </>
  );
}
