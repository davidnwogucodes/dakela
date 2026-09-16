import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductEditor } from "@/components/admin/ProductEditor";
import { getAllProducts, getProduct, productImageUrl } from "@/lib/content";
import ui from "@/styles/admin.module.css";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, all] = await Promise.all([getProduct(id), getAllProducts()]);

  if (!product) notFound();

  // A product cannot be related to itself.
  const siblings = all
    .filter((p) => p.id !== product.id)
    .map((p) => ({ slug: p.slug, title: p.title }));

  return (
    <>
      <header className={ui.pageHead}>
        <div>
          <Link href="/admin/products" className={ui.hint}>
            ← Products
          </Link>
          <h1 className={ui.pageTitle}>{product.title}</h1>
          <p className={ui.pageIntro}>
            Changes go live on the site as soon as you save.
          </p>
        </div>
      </header>

      <ProductEditor
        product={product}
        imageUrl={productImageUrl(product.image_path)}
        siblings={siblings}
      />
    </>
  );
}
