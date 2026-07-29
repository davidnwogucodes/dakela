import { site } from "@/config/site";

/**
 * Organization + LocalBusiness structured data.
 *
 * Deliberately conservative: no certifications, volumes, founding date or
 * review data is asserted, because none of it exists yet. The postal address
 * is omitted entirely until the client supplies a real one — publishing a
 * placeholder address as structured data is worse than publishing none.
 */
export function JsonLd() {
  const hasAddress = site.address.street.length > 0;

  const organization = {
    "@context": "https://schema.org",
    "@type": ["Organization", "LocalBusiness"],
    "@id": `${site.url}/#organization`,
    name: site.legalName,
    alternateName: site.name,
    url: site.url,
    logo: `${site.url}/icon.svg`,
    image: `${site.url}/assets/hero-photo.webp`,
    description:
      "Nigerian exporter of agricultural commodities — sesame, cocoa, cashew, hibiscus, palm and cassava products — supplied to international buyers on FOB, CFR and CIF terms.",
    telephone: site.phoneDisplay,
    email: site.email,
    address: {
      "@type": "PostalAddress",
      addressCountry: site.address.countryCode,
      ...(hasAddress && {
        streetAddress: site.address.street,
        addressLocality: site.address.city,
        addressRegion: site.address.state,
      }),
    },
    areaServed: "Worldwide",
    knowsAbout: [
      "Sesame seed export",
      "Cocoa bean export",
      "Cashew nut export",
      "Hibiscus flower export",
      "Palm oil export",
      "Cassava products export",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "sales",
      telephone: site.phoneDisplay,
      email: site.email,
      availableLanguage: "English",
      areaServed: "Worldwide",
    },
  };

  return (
    <script
      type="application/ld+json"
      // Structured data is a static literal — no user input is interpolated.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }}
    />
  );
}
