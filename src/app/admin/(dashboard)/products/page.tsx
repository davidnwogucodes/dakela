import Link from "next/link";
import { ProductList } from "@/components/admin/ProductList";
import { getAllProducts, productImageUrl } from "@/lib/content";
import ui from "@/styles/admin.module.css";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  let products: Awaited<ReturnType<typeof getAllProducts>> = [];
  let loadError: string | null = null;

  try {
    products = await getAllProducts();
  } catch (error) {
    loadError = error instanceof Error ? error.message : "Unknown error";
  }

  // Resolve image URLs on the server: productImageUrl reads SUPABASE_URL, which
  // is not available to client components.
  const rows = products.map((product) => ({
    ...product,
    imageUrl: productImageUrl(product.image_path),
  }));

  return (
    <>
      <header className={ui.pageHead}>
        <div>
          <h1 className={ui.pageTitle}>Products</h1>
          <p className={ui.pageIntro}>
            The commodity groups shown on the home page, in the order they appear. Hidden
            products stay here but do not show on the site.
          </p>
        </div>
        <Link href="/admin/products/new" className={ui.buttonPrimary}>
          Add a product
        </Link>
      </header>

      {loadError ? (
        <>
          <p className={ui.noticeError}>
            Could not load products. If this is a fresh project, run{" "}
            <code>supabase/schema.sql</code> then <code>supabase/seed.sql</code> in the
            Supabase SQL Editor.
          </p>
          <p className={ui.hint}>{loadError}</p>
        </>
      ) : rows.length === 0 ? (
        <div className={ui.empty}>
          <h2 className={ui.emptyTitle}>No products yet</h2>
          <p className={ui.emptyBody}>
            Add your first commodity group, or run <code>supabase/seed.sql</code> to load
            the six that were originally on the site.
          </p>
          <Link href="/admin/products/new" className={ui.buttonPrimary}>
            Add a product
          </Link>
        </div>
      ) : (
        <ProductList products={rows} />
      )}
    </>
  );
}
