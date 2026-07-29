import type { Metadata, Viewport } from "next";
import { Archivo, Spectral } from "next/font/google";
import { JsonLd } from "@/components/JsonLd";
import { site } from "@/config/site";
import "./globals.css";

/* next/font downloads and self-hosts both families at build time — no requests
   to the Google CDN at runtime, and no layout shift from a late swap. */
const spectral = Spectral({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-spectral",
});

const archivo = Archivo({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-archivo",
});

const description =
  "Dakela Exports Nig. Ltd. supplies international markets with sesame, cocoa, cashew, hibiscus, palm and cassava products — sourced through verified suppliers and inspected before every shipment.";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "Dakela Exports — Nigerian agricultural commodity exporter",
    template: "%s | Dakela Exports",
  },
  description,
  keywords: [
    "Nigeria sesame seed exporter",
    "Nigerian cocoa bean supplier",
    "cashew nut exporter Nigeria",
    "hibiscus flower export",
    "palm kernel oil supplier",
    "cassava flour exporter",
    "agricultural commodity exporter Nigeria",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: site.legalName,
    title: "Dakela Exports — Nigerian agricultural commodity exporter",
    description,
    url: site.url,
    locale: "en_NG",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dakela Exports — Nigerian agricultural commodity exporter",
    description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export const viewport: Viewport = {
  themeColor: "#0F1D18",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${spectral.variable} ${archivo.variable}`}>
      <body>
        {children}
        <JsonLd />
      </body>
    </html>
  );
}
