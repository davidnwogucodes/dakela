/**
 * Single source of truth for company details, outbound links and build-time flags.
 *
 * Items marked TODO(client) are placeholders carried over from the design handoff.
 * See CLIENT-TODO.md — the site must not launch while any of them are unresolved.
 */

/** Phone number in E.164 without the leading "+", used to build the tel: link. */
const PHONE_E164 = "2349162694790";

export const site = {
  name: "Dakela Exports Nig. Ltd.",
  legalName: "Dakela Exports Nigeria Limited",
  shortName: "Dakela",
  descriptor: "Exports Nigeria Ltd",
  tagline: "Agricultural commodity exports · Nigeria",

  /** The live domain. Drives canonical URLs, the sitemap, Open Graph tags and
   *  the JSON-LD organisation id — all of which search engines treat as
   *  identity, so it must match where the site actually serves from. */
  url: "https://dakela.com.ng",

  phoneDisplay: "+234 916 269 4790",
  phoneHref: `tel:+${PHONE_E164}`,

  /**
   * Fallbacks only. The live values are edited under Company details in the
   * dashboard and stored on the settings row; these are what renders if that
   * column is blank, so the site never shows an empty address or a mailto:
   * with nothing after it.
   */
  email: "info@dakela.com.ng",

  rcNumber: "9113189",

  /** Office address is unconfirmed; an empty street makes JSON-LD omit the
   *  postal address rather than publish a partial one. Editable in the
   *  dashboard under Company details. */
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

/**
 * Build-time content flags carried over from the prototype.
 * Flip a flag here rather than editing markup; each one is read in exactly one place.
 */
export const features = {
  /** Show the commodity chip lists inside the product cards. */
  showCommodityLists: true,
  /** Show the whole "For local suppliers" section. */
  showSuppliers: true,
  /** Show the floating "Make an enquiry" button. */
  showStickyBar: true,
} as const;

/**
 * Header navigation. These are in-page anchors in the order the sections appear,
 * so the nav doubles as a map of the page. The enquiry call to action is not in
 * here — it is a button beside the nav, because it leads to a different page and
 * should not read as one more section to scroll to.
 */
export const nav = [
  { label: "About", href: "#about" },
  { label: "Products", href: "#products" },
  { label: "Process", href: "#process" },
  { label: "Markets", href: "#reach" },
  { label: "Suppliers", href: "#suppliers" },
  { label: "Contact", href: "#contact" },
] as const;

/** The enquiry form. Every call to action on the site points here. */
export const ENQUIRY_PATH = "/enquiry";
