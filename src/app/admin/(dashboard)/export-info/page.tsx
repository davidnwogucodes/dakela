import Link from "next/link";
import { ExportInfoEditor } from "@/components/admin/ExportInfoEditor";
import { getSettings } from "@/lib/content";
import ui from "@/styles/admin.module.css";

export const dynamic = "force-dynamic";

export default async function ExportInfoPage() {
  const settings = await getSettings();

  return (
    <>
      <header className={ui.pageHead}>
        <div>
          <h1 className={ui.pageTitle}>Export info</h1>
          <p className={ui.pageIntro}>
            The blocks that appear on <strong>every</strong> product page — packaging,
            ports, quality control, documentation, Incoterms. Edit them once here rather
            than on each product. A commodity that genuinely differs can override any
            block from its own <Link href="/admin/products">product editor</Link>.
          </p>
        </div>
      </header>

      <ExportInfoEditor settings={settings} />
    </>
  );
}
