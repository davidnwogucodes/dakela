import { site } from "@/config/site";
import { getCompany } from "@/lib/content";

/**
 * Organization + LocalBusiness structured data.
 *
 * Deliberately conservative: no certifications, volumes, founding date or
 * review data is asserted, because none of it exists yet. The postal address
 * is omitted entirely until the client supplies a real one — publishing a
 * placeholder address as structured data is worse than publishing none.
 */
export async function JsonLd() {
  const company = await getCompany();

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
    telephone: company.phone,
    email: company.email,
    address: {
      "@type": "PostalAddress",
      addressCountry: site.address.countryCode,
      ...(company.hasAddress && {
        streetAddress: company.street,
        addressLocality: company.city,
        addressRegion: company.state,
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
      telephone: company.phone,
      email: company.email,
      availableLanguage: "English",
      areaServed: "Worldwide",
    },
  };

  return (
    <script
      type="application/ld+json"
      // Values come from the dashboard, so JSON.stringify is doing the
      // escaping here — never build this string by concatenation.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }}
    />
  );
}
