/**
 * Single source of truth for company details, outbound links and build-time flags.
 *
 * Items marked TODO(client) are placeholders carried over from the design handoff.
 * See CLIENT-TODO.md — the site must not launch while any of them are unresolved.
 */

/** WhatsApp number in E.164 without the leading "+", used to build wa.me links. */
const WHATSAPP_E164 = "2349162694790";

export const site = {
  name: "Dakela Exports Nig. Ltd.",
  legalName: "Dakela Exports Nigeria Limited",
  shortName: "Dakela",
  descriptor: "Exports Nigeria Ltd",
  tagline: "Agricultural commodity exports · Nigeria",

  /** TODO(client): confirm the production domain before launch. */
  url: "https://dakelaexports.com",

  phoneDisplay: "+234 916 269 4790",
  phoneHref: `tel:+${WHATSAPP_E164}`,
  whatsappHref: `https://wa.me/${WHATSAPP_E164}`,

  /** TODO(client): email domain is assumed, not confirmed. */
  email: "info@dakelaexports.com",

  /** TODO(client): real CAC RC number. Appears in the credibility strip and contact panel. */
  rcNumber: "0000000",

  /** TODO(client): real street, city and state. `street` empty => JSON-LD omits the postal address. */
  address: {
    street: "",
    city: "",
    state: "",
    country: "Nigeria",
    countryCode: "NG",
    /** Shown in the contact panel until a real address is supplied. */
    placeholderLines: ["Add street, city and state", "Nigeria"],
  },
} as const;

export const site_email_href = `mailto:${site.email}`;

/**
 * Build-time content flags carried over from the prototype.
 * Flip a flag here rather than editing markup; each one is read in exactly one place.
 */
export const features = {
  /** Show the commodity chip lists inside the product cards. */
  showCommodityLists: true,
  /** Show the whole "For local suppliers" section. */
  showSuppliers: true,
  /** Show the floating WhatsApp button. */
  showStickyBar: true,
} as const;

export const nav = [
  { label: "About", href: "#about" },
  { label: "Products", href: "#products" },
  { label: "Process", href: "#process" },
  { label: "Markets", href: "#reach" },
  { label: "Suppliers", href: "#suppliers" },
] as const;
