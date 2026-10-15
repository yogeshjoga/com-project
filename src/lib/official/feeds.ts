import sanitizeHtml from "sanitize-html";
import { SKIP_TYPE, artFor, classify } from "./classify";

// Official brand stores with public product feeds. `accept` filters out other brands that a store resells.
export interface Source {
  brand: string;
  type: "shopify" | "woocommerce";
  base: string;
  currency: string;
  accept?: RegExp;
  /** Vendors the store resells that aren't this brand. */
  reject?: RegExp;
  /** Maps the feed's vendor to our brand name (e.g. Caddx's store also sells Walksnail). */
  brandFor?: (vendor: string) => string;
  /** Category when nothing in the product text matches. */
  fallback?: string;
}

export const SOURCES: Source[] = [
  { brand: "BetaFPV", type: "shopify", base: "https://betafpv.com", currency: "USD", accept: /beta\s?fpv/i },
  { brand: "RadioMaster", type: "shopify", base: "https://radiomasterrc.com", currency: "USD", accept: /radio\s?master/i, fallback: "radios" },
  { brand: "CNHL", type: "shopify", base: "https://chinahobbyline.com", currency: "USD", reject: /hobbywing/i, fallback: "batteries" },
  {
    brand: "Caddx", type: "shopify", base: "https://www.caddxfpv.com", currency: "USD", accept: /caddx|walksnail/i,
    brandFor: (v) => (/walksnail/i.test(v) ? "Walksnail" : "Caddx"), fallback: "fpv-cameras",
  },
  { brand: "HGLRC", type: "shopify", base: "https://www.hglrc.com", currency: "USD", accept: /hglrc/i },
  { brand: "Heewing", type: "shopify", base: "https://www.heewing.com", currency: "USD", accept: /hee\s?wing/i, fallback: "vtol-fixed-wing" },
  { brand: "Holybro", type: "shopify", base: "https://holybro.com", currency: "USD", fallback: "flight-controllers" },
  { brand: "Diatone", type: "shopify", base: "https://www.diatone.us", currency: "USD", accept: /diatone/i },
  { brand: "Zerodrag", type: "shopify", base: "https://zerodrag.in", currency: "INR", accept: /zerodrag/i },
  { brand: "NewBeeDrone", type: "shopify", base: "https://newbeedrone.com", currency: "USD", accept: /newbee/i },
  { brand: "GEPRC", type: "woocommerce", base: "https://geprc.com", currency: "USD" },
  { brand: "ToolkitRC", type: "woocommerce", base: "https://www.toolkitrc.com", currency: "USD", fallback: "chargers" },
  { brand: "Pine64", type: "woocommerce", base: "https://pine64.com", currency: "USD", fallback: "dev-boards" },
];

export interface OfficialItem {
  source: "shopify" | "woocommerce" | "html";
  source_key: string;
  source_url: string;
  sku: string;
  slug: string;
  name: string;
  brand: string;
  category: string;
  art: string;
  short: string;
  highlights: string[];
  specs: Record<string, string>;
  images: string[];
  description_html: string;
  source_price: number | null;
  source_currency: string;
  variant_name: string | null;
  variants: { source_key: string; label: string; sku: string | null; image_url: string | null; sort: number; source_price?: number | null }[];
}

// Brands other stores resell. A title starting with one of these belongs to that brand, not the store.
const KNOWN_BRANDS = [
  "DJI", "Walksnail", "Caddx", "Insta360", "GoPro", "FrSky", "Gemfan", "HQProp", "HQ Prop", "ISDT", "TBS", "Team BlackSheep",
  "Foxeer", "RunCam", "Tattu", "GNB", "Gaoneng", "T-Motor", "TMotor", "Emax", "iFlight", "SpeedyBee", "Matek", "Mateksys",
  "Happymodel", "HDZero", "RadioMaster", "Jumper", "Skystars", "Flywoo", "Axisflying", "Lumenier", "Ethix", "ToolkitRC",
  "Hobbywing", "Holybro", "BetaFPV", "GEPRC", "TrueRC", "Readytosky", "BrotherHobby", "Diatone", "HGLRC", "CNHL", "Fat Shark",
  "Fatshark", "Amass", "SIYI", "Skydroid", "Zerodrag", "NewBeeDrone", "Heewing", "Pine64",
];
const CANON: Record<string, string> = { "hq prop": "HQProp", "team blacksheep": "TBS", tmotor: "T-Motor", mateksys: "Matek", gaoneng: "GNB", fatshark: "Fat Shark" };
const BRAND_RES = KNOWN_BRANDS.map((b) => ({ b, re: new RegExp(`^${b.replace(/[-\s]/g, "[-\\s]?")}\\b`, "i") }));

/** Real brand of a listing: the title's leading brand if it's a different known brand, else the store's. */
export function brandOf(storeBrand: string, title: string) {
  const t = decode(title).trim();
  const hit = BRAND_RES.find(({ re }) => re.test(t));
  if (!hit) return storeBrand;
  const canon = CANON[hit.b.toLowerCase()] ?? hit.b;
  return canon.toLowerCase() === storeBrand.toLowerCase() ? storeBrand : canon;
}

export const UA = { "user-agent": "EgireShopCatalogSync/1.0 (+https://egirerobotics.com; contact@egirerobotics.com)" };
const SKIP = /gift ?card|e-?gift|insurance|shipping|deposit|coupon|voucher|custom payment|payment link|donation|price difference|extra fee|test product|sample order|warranty service|repair service|\bservice\b/i;
export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const slugify = (s: string) =>
  s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 90).replace(/-$/, "");
export const clip = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1).trimEnd() + "…" : s);
export const decode = (s: string) =>
  s.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#0?39;|&#8217;|&rsquo;/g, "’").replace(/&#8243;/g, "″")
    .replace(/&#8211;|&ndash;/g, "–").replace(/&#8212;|&mdash;/g, "—").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;|&#160;/g, " ");

/** Official description, reduced to safe structural HTML (no scripts, styles, iframes, images or outbound links). */
export function cleanDescription(html: string) {
  return sanitizeHtml(html ?? "", {
    allowedTags: ["p", "br", "ul", "ol", "li", "strong", "b", "em", "i", "h2", "h3", "h4", "h5", "table", "thead", "tbody", "tr", "th", "td", "blockquote"],
    allowedAttributes: {},
    transformTags: { h1: "h2", b: "strong", i: "em", div: "p" },
    exclusiveFilter: (frame) => !frame.text.trim() && !["br", "td", "th"].includes(frame.tag),
  })
    .replace(/(<br \/>\s*){3,}/g, "<br /><br />")
    .trim()
    .slice(0, 60000)
    // Store platforms' untouched placeholder text is not a description.
    .replace(/^(<p>)?\s*type a description for this product here\.*\s*(<\/p>)?$/i, "");
}

const textOf = (html: string) => decode(sanitizeHtml(html ?? "", { allowedTags: [], allowedAttributes: {} })).replace(/\s+/g, " ").trim();

// Boilerplate that makes a poor product summary.
const BOILERPLATE = /^(summary|description|overview|features?|specifications?|country of origin|warranty|download|note|attention|package|what'?s in the box)\b/i;

export function summary(descHtml: string, shortHtml?: string) {
  const s = textOf(shortHtml ?? "").replace(/^summary\s*/i, "");
  if (s.length >= 20 && !BOILERPLATE.test(s)) return clip(s, 280);
  // First real sentences from the description, skipping headings and boilerplate lines.
  const lines = (descHtml.match(/<(p|li)>([\s\S]*?)<\/\1>/g) ?? []).map(textOf).filter((l) => l.length > 25 && !BOILERPLATE.test(l));
  const text = lines.join(" ");
  const first = text.split(/(?<=[.!?])\s+/).slice(0, 2).join(" ");
  return clip(first || text, 280);
}

export function displayName(brand: string, title: string) {
  const t = decode(title).replace(/\s+/g, " ").trim();
  return clip(new RegExp(`^${brand}\\b`, "i").test(t) ? t : `${brand} ${t}`, 200);
}

async function getJson(url: string) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch(url, { headers: { ...UA, accept: "application/json" }, signal: AbortSignal.timeout(45000) });
    if (res.status === 429 || res.status >= 500) { await sleep(3000 * (attempt + 1)); continue; }
    if (!res.ok) throw new Error(`${url} → HTTP ${res.status}`);
    return res.json();
  }
  throw new Error(`${url} → gave up after retries`);
}

// ───────────────────────── Shopify (/products.json)

interface ShopifyProduct {
  id: number; title: string; handle: string; body_html: string; vendor: string; product_type: string; tags: string[] | string;
  options: { name: string }[];
  variants: { id: number; title: string; sku: string | null; price: string; featured_image?: { src: string } | null }[];
  images: { src: string }[];
}

async function shopify(src: Source, log: (m: string) => void): Promise<OfficialItem[]> {
  const host = new URL(src.base).host.replace(/^www\./, "");
  const out: OfficialItem[] = [];
  let skipped = 0;
  for (let page = 1; page <= 40; page++) {
    const j = (await getJson(`${src.base}/products.json?limit=250&page=${page}`)) as { products: ShopifyProduct[] };
    for (const p of j.products) {
      const tags = Array.isArray(p.tags) ? p.tags : String(p.tags ?? "").split(",");
      if (
        SKIP.test(`${p.title} ${p.product_type}`) || SKIP_TYPE.test(p.product_type ?? "") || !p.images?.length ||
        (src.accept && !src.accept.test(p.vendor || src.brand)) || (src.reject && src.reject.test(p.vendor ?? ""))
      ) { skipped++; continue; }
      const brand = brandOf(src.brandFor ? src.brandFor(p.vendor) : src.brand, p.title);
      const single = p.variants.length === 1 && /^default title$/i.test(p.variants[0].title);
      const prices = p.variants.map((v) => Number(v.price)).filter((n) => n > 0);
      const desc = cleanDescription(p.body_html);
      const seen = new Set<string>();
      // Title first; store tags (often broad like "FPV Drone Parts") only when the title gives no clue.
      const category = classify(p.product_type ?? "", p.title, "") || classify("", tags.join(" "), src.fallback);
      out.push({
        source: "shopify",
        source_key: `${host}:shopify:${p.id}`,
        source_url: `${src.base}/products/${p.handle}`,
        sku: (single && p.variants[0].sku) || `${slugify(brand).toUpperCase()}-${p.id}`,
        slug: slugify(displayName(brand, p.title)),
        name: displayName(brand, p.title),
        brand,
        category,
        art: artFor(category),
        short: summary(desc),
        highlights: [],
        specs: {},
        images: [...new Set(p.images.map((i) => i.src.split("?")[0]))].slice(0, 8),
        description_html: desc,
        source_price: prices.length ? Math.min(...prices) : null,
        source_currency: src.currency,
        variant_name: single ? null : clip(p.options.map((o) => o.name).join(" / "), 80),
        variants: single ? [] : p.variants.map((v, i) => {
          let label = clip(decode(v.title), 80);
          if (seen.has(label.toLowerCase())) label = `${clip(decode(v.title), 60)} (${String(v.sku || v.id).slice(0, 16)})`;
          seen.add(label.toLowerCase());
          return { source_key: `${host}:shopify:v:${v.id}`, label, sku: v.sku || null, image_url: v.featured_image?.src?.split("?")[0] ?? null, sort: i, source_price: Number(v.price) > 0 ? Number(v.price) : null };
        }),
      });
    }
    if (j.products.length < 250) break;
    await sleep(800);
  }
  log(`${src.brand}: ${out.length} products (${skipped} skipped: other brands, gift cards, services or no photos)`);
  return out;
}

// ───────────────────────── WooCommerce (Store API)

/** WordPress pre-generates resized copies; pick the one closest to 800px wide instead of the 2000px original. */
function wooSized(img: { src: string; srcset?: string }) {
  const options = (img.srcset ?? "")
    .split(",")
    .map((s) => s.trim().split(/\s+/))
    .map(([url, w]) => ({ url, w: parseInt(w, 10) }))
    .filter((o) => o.url && o.w >= 600);
  if (!options.length) return img.src;
  return options.sort((a, b) => Math.abs(a.w - 800) - Math.abs(b.w - 800))[0].url;
}

interface WooProduct {
  id: number; name: string; slug: string; permalink: string; sku: string; type: string;
  description: string; short_description: string;
  prices: { price: string; currency_code: string; currency_minor_unit: number };
  images: { src: string; srcset?: string }[]; categories: { name: string }[]; tags: { name: string }[];
  attributes: { name: string; has_variations?: boolean }[];
  variations: { id: number; attributes: { name: string; value: string }[] }[];
}

async function woocommerce(src: Source, log: (m: string) => void): Promise<OfficialItem[]> {
  const host = new URL(src.base).host.replace(/^www\./, "");
  const out: OfficialItem[] = [];
  let skipped = 0;
  for (let page = 1; page <= 60; page++) {
    const list = (await getJson(`${src.base}/wp-json/wc/store/v1/products?per_page=100&page=${page}`)) as WooProduct[];
    for (const p of list) {
      const name = decode(p.name);
      const cats = p.categories.map((c) => decode(c.name));
      if (SKIP.test(name) || cats.some((c) => SKIP_TYPE.test(c)) || !p.images?.length) { skipped++; continue; }
      const desc = cleanDescription(p.description);
      const price = Number(p.prices?.price) / 10 ** (p.prices?.currency_minor_unit ?? 2);
      const varAttrs = p.attributes.filter((a) => a.has_variations !== false).map((a) => a.name);
      const seen = new Set<string>();
      // Most specific store category wins (e.g. "Motors" over "Drones" for a motor listed in both).
      const category = [...cats].reverse().map((c) => classify(c, name, "")).find(Boolean) || classify("", name, src.fallback);
      const brand = brandOf(src.brand, name);
      out.push({
        source: "woocommerce",
        source_key: `${host}:woocommerce:${p.id}`,
        source_url: p.permalink,
        sku: p.sku || `${slugify(brand).toUpperCase()}-${p.id}`,
        slug: slugify(displayName(brand, name)),
        name: displayName(brand, name),
        brand,
        category,
        art: artFor(category),
        short: summary(desc, p.short_description),
        highlights: [],
        specs: {},
        images: [...new Set(p.images.map((i) => wooSized(i)))].slice(0, 8),
        description_html: desc,
        source_price: price > 0 ? Math.round(price * 100) / 100 : null,
        source_currency: p.prices?.currency_code || src.currency,
        variant_name: p.type === "variable" && p.variations.length ? clip(varAttrs.join(" / ") || "Option", 80) : null,
        variants: p.type === "variable" ? p.variations.map((v, i) => {
          let label = clip(decode(v.attributes.map((a) => a.value).join(" / ") || `Option ${i + 1}`), 80);
          if (seen.has(label.toLowerCase())) label = `${clip(label, 66)} (${v.id})`;
          seen.add(label.toLowerCase());
          return { source_key: `${host}:woocommerce:v:${v.id}`, label, sku: null, image_url: null, sort: i };
        }) : [],
      });
    }
    if (list.length < 100) break;
    await sleep(800);
  }
  log(`${src.brand}: ${out.length} products (${skipped} skipped)`);
  return out;
}

export async function fetchSource(src: Source, log: (m: string) => void = () => {}) {
  return src.type === "shopify" ? shopify(src, log) : woocommerce(src, log);
}
