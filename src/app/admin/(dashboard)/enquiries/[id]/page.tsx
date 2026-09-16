import Link from "next/link";
import { notFound } from "next/navigation";
import { EnquiryDetail } from "@/components/admin/EnquiryDetail";
import { getEnquiry, getFormFields } from "@/lib/content";
import ui from "@/styles/admin.module.css";

export const dynamic = "force-dynamic";

export default async function EnquiryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [enquiry, fields] = await Promise.all([getEnquiry(id), getFormFields()]);

  if (!enquiry) notFound();

  return (
    <>
      <header className={ui.pageHead}>
        <div>
          <Link href="/admin/enquiries" className={ui.hint}>
            ← Submissions
          </Link>
          <h1 className={ui.pageTitle}>
            {enquiry.company || enquiry.full_name || "Submission"}
          </h1>
          <p className={ui.pageIntro}>
            {enquiry.type === "buyer" ? "Buyer enquiry" : "Supplier application"} ·{" "}
            {new Date(enquiry.created_at).toLocaleString("en-GB", {
              dateStyle: "long",
              timeStyle: "short",
            })}
          </p>
        </div>
      </header>

      <EnquiryDetail enquiry={enquiry} fields={fields} />
    </>
  );
}
