import Link from "next/link";
import { AppearanceEditor } from "@/components/admin/AppearanceEditor";
import { getSettings } from "@/lib/content";
import ui from "@/styles/admin.module.css";

export const dynamic = "force-dynamic";

export default async function AppearancePage() {
  const settings = await getSettings();

  return (
    <>
      <header className={ui.pageHead}>
        <div>
          <h1 className={ui.pageTitle}>Appearance</h1>
          <p className={ui.pageIntro}>
            The palette and wording of the public site. Changes apply everywhere as soon
            as you save —{" "}
            <Link href="/" target="_blank" rel="noopener">
              open the site
            </Link>{" "}
            in another tab to see them.
          </p>
        </div>
      </header>

      <AppearanceEditor settings={settings} />
    </>
  );
}
