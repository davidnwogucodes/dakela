import { CompanyEditor } from "@/components/admin/CompanyEditor";
import { site } from "@/config/site";
import { getCompanyRecord } from "@/lib/content";
import ui from "@/styles/admin.module.css";

export const dynamic = "force-dynamic";

export default async function CompanyPage() {
  const record = await getCompanyRecord({ fresh: true });

  return (
    <>
      <header className={ui.pageHead}>
        <div>
          <h1 className={ui.pageTitle}>Company details</h1>
          <p className={ui.pageIntro}>
            Your email, telephone, registered office and CAC number. These appear in the
            contact panel, the hero, the enquiry page and the structured data search
            engines read — changing one here changes all of them.
          </p>
        </div>
      </header>

      <CompanyEditor
        record={record}
        fallbacks={{
          email: site.email,
          phone: site.phoneDisplay,
          rcNumber: site.rcNumber,
          country: site.address.country,
        }}
      />
    </>
  );
}
