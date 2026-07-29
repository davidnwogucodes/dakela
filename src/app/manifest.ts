import type { MetadataRoute } from "next";
import { site } from "@/config/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.legalName,
    short_name: site.shortName,
    description: "Nigerian agricultural commodity exporter",
    start_url: "/",
    display: "browser",
    background_color: "#0F1D18",
    theme_color: "#0F1D18",
    icons: [
      // Vector mark on ink — scales to the 512px app icon and every size below it.
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
