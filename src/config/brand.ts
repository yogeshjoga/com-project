// Single source of truth for brand identity (from the EgireRobotics letterhead and CRM org settings).
// Leave a contact field empty to hide it everywhere on the site.
export const brand = {
  name: "EgireRobotics",
  legalName: "EGIREROBOTICS Pvt. Ltd.",
  tagline: "Explore Engineer Excel",
  description:
    "Buy FPV drones, goggles, motors, frames, radios, batteries and electronics from EgireRobotics, Pune. Genuine stock and a GST invoice on every order.",
  supportPhone: "" as string,
  supportEmail: "contact@egirerobotics.com",
  whatsapp: "" as string,
  address: "Pune, Maharashtra, India",
  dispatchCity: "Pune",
  gstin: "" as string,
  crmUrl: "https://crm.egirerobotics.com",
  siteUrl: "https://egirerobotics.com",
  logo: {
    lockupWhite: "/brand/egire-lockup-white.png",
    lockupDark: "/brand/egire-lockup-dark.png",
    full: "/brand/egire-logo.png",
    fullWhite: "/brand/egire-logo-white.png",
    iconDark: "/brand/egire-icon-dark.png",
  },
  freeShippingAbove: 4999,
  shippingFee: 149,
  codFee: 99,
  orderPrefix: "EG",
  currency: "INR",
  locale: "en-IN",
} as const;
