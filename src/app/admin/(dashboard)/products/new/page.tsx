import Link from "next/link";
import { ProductEditor } from "@/components/admin/ProductEditor";
import { getAllProducts } from "@/lib/content";
import ui from "@/styles/admin.module.css";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const siblings = (await getAllProducts()).map((p) => ({ slug: p.slug, title: p.title }));

  return (
    <>
      <header className={ui.pageHead}>
        <div>
          <Link href="/admin/products" className={ui.hint}>
            ← Products
          </Link>
          <h1 className={ui.pageTitle}>Add a product</h1>
          <p className={ui.pageIntro}>
            A new commodity group for the home page. It goes to the end of the list; you
            can move it once it is saved.
          </p>
        </div>
      </header>

      <ProductEditor product={null} imageUrl={null} siblings={siblings} />
    </>
  );
}
