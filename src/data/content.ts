/** Repeated content blocks, kept out of the markup so copy edits never touch layout. */

export const credibilityClaims = (rcNumber: string) => [
  `Registered in Nigeria · CAC RC ${rcNumber}`,
  "Verified supplier network",
  "Pre-shipment quality inspection",
  "Full export documentation",
];

export const values = [
  {
    title: "Reliability",
    body: "Committed volumes shipped on the agreed schedule, with the same specification every time.",
  },
  {
    title: "Quality",
    body: "Goods graded and inspected at origin before loading, against your written specification.",
  },
  {
    title: "Integrity",
    body: "Transparent pricing and documentation, and direct communication with one accountable team.",
  },
];

export const processSteps = [
  {
    numeral: "01",
    title: "Sourcing",
    body: "We match your specification and volume to verified suppliers and confirm availability at origin.",
  },
  {
    numeral: "02",
    title: "Quality inspection",
    body: "Lots are graded and sampled before purchase; third-party inspection arranged on request.",
  },
  {
    numeral: "03",
    title: "Packaging",
    body: "Jute, PP or vacuum packing and container stuffing to your marking and labelling requirements.",
  },
  {
    numeral: "04",
    title: "Documentation",
    body: "Invoice, packing list, certificate of origin, phytosanitary and NXP paperwork prepared in full.",
  },
  {
    numeral: "05",
    title: "Shipment",
    body: "Booking, haulage to port and vessel updates until documents reach your bank.",
  },
];

export const marketFacts = [
  { label: "Incoterms", value: "FOB · CFR · CIF" },
  { label: "Load ports", value: "Lagos · Onne" },
  { label: "Shipment", value: "FCL · LCL · Bulk" },
  { label: "Enquiry reply", value: "Within 24 hours" },
];

export const supplierBlocks = [
  {
    title: "What we look for",
    body: "Repeatable grade, honest moisture readings, capacity to fill containers.",
  },
  {
    title: "What you get",
    body: "Standing orders, clear specifications and prompt settlement on accepted lots.",
  },
];
