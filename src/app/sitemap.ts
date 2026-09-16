import type { MetadataRoute } from "next";
import { site } from "@/config/site";
import { getPublishedProducts } from "@/lib/content";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Product pages are the highest-value SEO surface on the site, so they belong
  // in the sitemap the moment the owner publishes one.
  const products = await getPublishedProducts();

  return [
    {
      url: site.url,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: site.url + "/enquiry",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    ...products.map((product) => ({
      url: site.url + "/products/" + product.slug,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.9,
    })),
  ];
}
