import Link from "next/link";
import { FormBuilder } from "@/components/admin/FormBuilder";
import { getFormFields } from "@/lib/content";
import ui from "@/styles/admin.module.css";

export const dynamic = "force-dynamic";

export default async function FormPage() {
  const fields = await getFormFields();

  return (
    <>
      <header className={ui.pageHead}>
        <div>
          <h1 className={ui.pageTitle}>Enquiry form</h1>
          <p className={ui.pageIntro}>
            The questions asked at{" "}
            <Link href="/enquiry" target="_blank" rel="noopener">
              /enquiry
            </Link>
            . Rename them, reorder them, hide the ones you do not need, or add your own.
            Changes go live as soon as you save.
          </p>
        </div>
      </header>

      {fields.length === 0 ? (
        <div className={ui.empty}>
          <h2 className={ui.emptyTitle}>No questions yet</h2>
          <p className={ui.emptyBody}>
            Run <code>supabase/seed.sql</code> in the Supabase SQL Editor to install the
            default form, or add your first question below.
          </p>
        </div>
      ) : (
        <p className={ui.notice}>
          The commodity rows — what someone wants to buy or can supply, with volumes — are
          always on the form and are built from your{" "}
          <Link href="/admin/products">products</Link>. Adding a product adds its
          commodities to the dropdown automatically.
        </p>
      )}

      <FormBuilder fields={fields} />
    </>
  );
}
