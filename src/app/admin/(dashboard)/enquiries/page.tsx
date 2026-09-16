import Link from "next/link";
import { EnquiryTable } from "@/components/admin/EnquiryTable";
import { getEnquiries, getFormFields } from "@/lib/content";
import ui from "@/styles/admin.module.css";

export const dynamic = "force-dynamic";

export default async function EnquiriesPage() {
  const [enquiries, fields] = await Promise.all([getEnquiries(), getFormFields()]);

  return (
    <>
      <header className={ui.pageHead}>
        <div>
          <h1 className={ui.pageTitle}>Submissions</h1>
          <p className={ui.pageIntro}>
            Everything sent through the enquiry form, newest first. Unread submissions are
            marked in bold.
          </p>
        </div>
        {enquiries.length > 0 && (
          <a href="/api/admin/enquiries/export" className={ui.buttonSecondary} download>
            Export to CSV
          </a>
        )}
      </header>

      {enquiries.length === 0 ? (
        <div className={ui.empty}>
          <h2 className={ui.emptyTitle}>Nothing yet</h2>
          <p className={ui.emptyBody}>
            Submissions from{" "}
            <Link href="/enquiry" target="_blank" rel="noopener">
              the enquiry form
            </Link>{" "}
            appear here as soon as they arrive.
          </p>
        </div>
      ) : (
        <EnquiryTable enquiries={enquiries} fields={fields} />
      )}
    </>
  );
}
