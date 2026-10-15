import type { ProductSummary } from "./types";

export interface HeroCta {
  label: string;
  href: string;
}

export type HeroSlide =
  | {
      kind: "banner";
      id: string;
      eyebrow: string;
      title: string;
      text: string;
      /** Lowest in-stock price among the products this slide sells. */
      from: number | null;
      cta: HeroCta;
      image: { src: string; alt: string; position?: string };
    }
  | {
      kind: "products";
      id: string;
      eyebrow: string;
      title: string;
      text: string;
      from: number | null;
      cta: HeroCta;
      items: ProductSummary[];
    };

interface Def {
  id: string;
  eyebrow: string;
  title: string;
  text: string;
  cta: HeroCta;
  /** Which products the slide is about. Only in-stock products with a photo are considered. */
  match: (p: ProductSummary) => boolean;
  /** Preferred products to show, in order. The rest are filled from across the price range. */
  picks?: RegExp[];
  banner?: { src: string; alt: string; position?: string };
}

const radio = (re: RegExp) => (p: ProductSummary) => p.brand === "RadioMaster" && p.category === "radios" && re.test(p.name);
const notPart = /antenna|cable|adapter|mount|strap|velcro|prop(eller)?s?\b|connector|case|bag|screw|plug|pigtail|cover|filter|foam|lens/i;

// Ten slides: RadioMaster's own banners for its radios and receivers, and product shelves for the rest.
// Nothing here is a discount claim; each slide says what it sells and the lowest price today.
const DEFS: Def[] = [
  {
    id: "radiomaster-gx15",
    eyebrow: "RadioMaster",
    title: "GX15 radio controllers",
    text: "The new flagship ExpressLRS transmitter in six colours.",
    cta: { label: "Shop the GX15", href: "/search?q=gx15" },
    match: radio(/gx15/i),
    banner: { src: "/banners/radiomaster-gx15.webp", alt: "RadioMaster GX15 radio controllers in several colours", position: "50% 60%" },
  },
  {
    id: "radiomaster-boxer",
    eyebrow: "RadioMaster",
    title: "Boxer radio controller",
    text: "Hall-gimbal ELRS radio that fits in one hand. Standard and transparent editions.",
    cta: { label: "Shop the Boxer", href: "/search?q=boxer" },
    match: radio(/boxer/i),
    banner: { src: "/banners/radiomaster-boxer.webp", alt: "A pilot holding the RadioMaster Boxer radio", position: "50% 40%" },
  },
  {
    id: "radiomaster-tx15",
    eyebrow: "RadioMaster",
    title: "TX15 carbon-fibre radios",
    text: "Full-size multi-protocol transmitters with a bright colour screen.",
    cta: { label: "Shop the TX15", href: "/search?q=tx15" },
    match: radio(/tx15/i),
    banner: { src: "/banners/radiomaster-tx15.webp", alt: "Three RadioMaster TX15 radios", position: "50% 45%" },
  },
  {
    id: "radiomaster-receivers",
    eyebrow: "RadioMaster",
    title: "ExpressLRS receivers",
    text: "From tiny whoop receivers to long-range dual-band, matched to your radio.",
    cta: { label: "Shop receivers", href: "/search?q=radiomaster receiver" },
    match: (p) => p.brand === "RadioMaster" && p.category === "receivers",
    banner: { src: "/banners/radiomaster-elrs-receivers.webp", alt: "RadioMaster ExpressLRS receivers", position: "50% 55%" },
  },
  {
    id: "dji",
    eyebrow: "DJI camera drones",
    title: "Fly DJI, from Neo to Mavic",
    text: "Pocket-size Mini, Air 3S, Avata FPV and the Mavic 3 line, with official specs and what’s in the box.",
    cta: { label: "Shop DJI drones", href: "/category/camera-drones" },
    match: (p) => p.brand === "DJI" && p.category === "camera-drones",
    picks: [/Mini 4 Pro \(DJI RC 2\)/i, /Air 3S \(DJI RC-N3\)/i, /Avata 2 Fly More Combo \(Three/i],
  },
  {
    id: "fpv-drones",
    eyebrow: "FPV drones",
    title: "Ready-to-fly FPV drones",
    text: "PNP, BNF and RTF quads from GEPRC, BetaFPV, HGLRC, SpeedyBee and more.",
    cta: { label: "Shop FPV drones", href: "/category/fpv-drones" },
    match: (p) => p.category === "fpv-drones" && p.price >= 8000 && !notPart.test(p.name),
    picks: [/MARK5 O4 Pro DC FPV Drone/i],
  },
  {
    id: "goggles",
    eyebrow: "Goggles & HD video",
    title: "See it in HD",
    text: "Digital goggles and air units for DJI O4, Walksnail and analogue builds.",
    cta: { label: "Shop goggles", href: "/category/goggles" },
    match: (p) => (p.category === "goggles" || p.category === "air-units") && p.price >= 4000 && !notPart.test(p.name) && /goggle|air unit|vista|\bo[34]\b|walksnail|moonlight|vtx/i.test(p.name),
    picks: [/Goggles 3/i, /O4 Air Unit Pro/i],
  },
  {
    id: "power",
    eyebrow: "Batteries & chargers",
    title: "Power for every flight",
    text: "LiPo packs from 1S to 6S and smart chargers from CNHL, ToolkitRC, ISDT and more.",
    cta: { label: "Shop batteries", href: "/category/batteries" },
    match: (p) => (p.category === "batteries" || p.category === "chargers") && p.price >= 500 && !notPart.test(p.name) && /lipo|li-ion|mah|charger/i.test(p.name),
  },
  {
    id: "industrial",
    eyebrow: "Industrial & survey",
    title: "Enterprise drones",
    text: "DJI Matrice and Mavic 3 enterprise platforms, plus open-source PX4 development kits.",
    cta: { label: "Shop industrial drones", href: "/category/industrial-drones" },
    match: (p) => p.category === "industrial-drones" && p.price >= 20000,
    picks: [/Matrice 4T/i, /Matrice 4E/i, /Mavic 3 Thermal/i],
  },
  {
    id: "electronics",
    eyebrow: "Electronics bench",
    title: "Build your own",
    text: "Single-board computers, modules and dev kits for robotics and IoT projects.",
    cta: { label: "Shop dev boards", href: "/category/dev-boards" },
    match: (p) => p.category === "dev-boards" && p.price >= 1500 && !notPart.test(p.name),
    picks: [/A64\+? .*Single Board/i],
  },
];

/** Three products spread across the price range, after the preferred ones. */
function choose(pool: ProductSummary[], picks: RegExp[] = [], n = 3) {
  const out: ProductSummary[] = [];
  for (const re of picks) {
    const hit = pool.find((p) => re.test(p.name) && !out.includes(p));
    if (hit) out.push(hit);
  }
  const rest = [...pool].sort((a, b) => a.price - b.price).filter((p) => !out.includes(p));
  for (let i = 0; out.length < n && rest.length; i++) {
    const at = Math.min(rest.length - 1, Math.floor(((i + 1) / (n + 1)) * rest.length));
    out.push(rest.splice(at, 1)[0]);
  }
  return out.slice(0, n);
}

export function heroSlides(all: ProductSummary[]): HeroSlide[] {
  const live = all.filter((p) => p.stock > 0 && p.imageUrl);
  const slides: HeroSlide[] = [];
  for (const d of DEFS) {
    const pool = live.filter(d.match);
    if (!pool.length) continue; // never show a slide with nothing to buy
    const from = Math.min(...pool.map((p) => p.price));
    const base = { id: d.id, eyebrow: d.eyebrow, title: d.title, text: d.text, from, cta: d.cta };
    if (d.banner) slides.push({ ...base, kind: "banner", image: d.banner });
    else slides.push({ ...base, kind: "products", items: choose(pool, d.picks) });
  }
  return slides;
}
