/**
 * The six commodity groups shown in the Products band.
 *
 * This is the data model the design handoff asks for: the client will add commodities
 * over time, and `slug` is here so per-commodity landing pages (`/products/sesame-seeds`)
 * can be generated from the same source later — that is the highest-value SEO expansion.
 * Move this to a CMS collection or MDX when the client needs to edit it themselves.
 */

export type Product = {
  slug: string;
  title: string;
  description: string;
  commodities: string[];
  image: string;
  /** TODO(client): confirm framing once full-resolution photography is supplied. */
  imagePosition: string;
  alt: string;
};

export const products: Product[] = [
  {
    slug: "spices-and-herbs",
    title: "Spices & Herbs",
    description:
      "Sun-dried and cleaned aromatics from northern Nigeria, sorted for colour, aroma and low foreign matter.",
    commodities: ["Hibiscus Flowers", "Ginger", "Turmeric", "Garlic", "Chili Pepper"],
    image: "/assets/prod-spices.webp",
    imagePosition: "center",
    alt: "Dried hibiscus flowers and spices sorted for export from northern Nigeria",
  },
  {
    slug: "oilseeds-and-grains",
    title: "Oilseeds & Grains",
    description:
      "Bulk staples for crushing and milling, cleaned to agreed purity and moisture before bagging.",
    commodities: ["Sesame Seeds", "Soybeans", "Sorghum", "Millet", "Maize"],
    image: "/assets/prod-oilseeds.webp",
    imagePosition: "center",
    alt: "Cleaned sesame seeds and bulk grains prepared for bagging",
  },
  {
    slug: "nuts-and-oil-crops",
    title: "Nuts & Oil Crops",
    description:
      "Raw cashew, shea and groundnut lots sized and graded for processors and kernel buyers.",
    commodities: ["Cashew Nuts", "Shea Nuts", "Groundnuts"],
    image: "/assets/prod-nuts.webp",
    imagePosition: "center",
    alt: "Raw cashew nuts graded and sized for kernel processors",
  },
  {
    slug: "cocoa-products",
    title: "Cocoa Products",
    description:
      "Fermented beans and processed derivatives from the south-west belt, for confectionery and beverage manufacturers.",
    commodities: ["Cocoa Beans", "Cocoa Powder", "Cocoa Butter", "Cocoa Cake"],
    image: "/assets/prod-cocoa.webp",
    imagePosition: "center",
    alt: "Fermented cocoa beans from south-west Nigeria",
  },
  {
    slug: "palm-products",
    title: "Palm Products",
    description:
      "Crude and kernel oils in drums or flexitanks, with free fatty acid levels confirmed before loading.",
    commodities: ["Crude Palm Oil", "Palm Kernel Oil", "Palm Kernel"],
    image: "/assets/prod-palm.webp",
    imagePosition: "center",
    alt: "Crude palm oil in drums ready for loading",
  },
  {
    slug: "cassava-products",
    title: "Cassava Products",
    description:
      "Flour, starch, garri and high-quality cassava flour milled for food and industrial use.",
    commodities: ["Cassava Flour", "Garri", "Cassava Starch", "HQCF"],
    image: "/assets/prod-cassava.webp",
    imagePosition: "center",
    alt: "Milled cassava flour and starch for food and industrial use",
  },
];
