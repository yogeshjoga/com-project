// Importers for brands without a product feed: product lists from sitemaps / category pages
// (robots.txt-allowed URLs only), product content from structured data and the page's own
// description section. Polite: 2 requests at a time with a pause, identified by user agent.
import { parse, type HTMLElement } from "node-html-parser";
import { artFor, classify } from "./classify";
import { UA, brandOf, clip, cleanDescription, decode, displayName, sleep, slugify, summary, type OfficialItem } from "./feeds";

export interface HtmlSource {
  brand: string;
  base: string;
  list: (log: (m: string) => void) => Promise<{ url: string; hint?: string }[]>;
  parse: (url: string, doc: HTMLElement, raw: string, hint?: string) => OfficialItem | null;
  /** Import products even without photos (for brands whose image CDN blocks other sites). */
  allowNoImages?: boolean;
}

async function text(url: string) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch(url, { headers: { ...UA, accept: "text/html,application/xml" }, signal: AbortSignal.timeout(45000) });
    if (res.status === 429 || res.status >= 500) { await sleep(4000 * (attempt + 1)); continue; }
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.text();
  }
  throw new Error("gave up after retries");
}

const locs = (xml: string) => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => decode(m[1]).trim());
const abs = (u: string, base: string) => new URL(u, base).href;
const jsonLd = (raw: string) =>
  [...raw.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/g)]
    .map((m) => { try { return JSON.parse(m[1]); } catch { return null; } })
    .flatMap((j) => (j?.["@graph"] ?? [j]))
    .filter(Boolean) as Record<string, unknown>[];
const price = (s?: string | null) => {
  const n = Number(String(s ?? "").replace(/[^0-9.]/g, ""));
  return n > 0 ? Math.round(n * 100) / 100 : null;
};

// ───────────────────────── iFlight (OpenCart): sitemap → product JSON-LD + description tab

// iFlight's image CDN only serves its own site (hotlink protection), so photos would break for our
// customers. We import the rest and admins add photos from iFlight's dealer media kit in the CRM.
const iflight: HtmlSource = {
  brand: "iFlight",
  base: "https://shop.iflight.com",
  allowNoImages: true,
  async list() {
    const urls = locs(await text("https://shop.iflight.com/sitemap.xml")).filter((u) => /-Pro\d+$/.test(u));
    return [...new Set(urls)].map((url) => ({ url }));
  },
  parse(url, doc, raw) {
    const p = jsonLd(raw).find((x) => x["@type"] === "Product") as
      | { name?: string; image?: string[] | string; sku?: string; offers?: { price?: string; priceCurrency?: string } }
      | undefined;
    if (!p?.name) return null;
    const title = decode(p.name).trim();
    const id = url.match(/-Pro(\d+)$/)![1];
    const descEl = doc.querySelector("#tab-description");
    const heading = descEl?.querySelector("h1,h2,h3");
    if (heading?.text.trim().toLowerCase() === "description") heading.remove();
    const desc = cleanDescription(descEl?.innerHTML ?? "");
    const category = classify("", title, "accessories");
    return {
      source: "html", source_key: `shop.iflight.com:html:${id}`, source_url: url,
      sku: p.sku ? String(p.sku) : `IFLIGHT-${id}`, slug: slugify(displayName("iFlight", title)),
      name: displayName("iFlight", title), brand: "iFlight", category, art: artFor(category),
      short: summary(desc), highlights: [], specs: {}, images: [], description_html: desc,
      source_price: price(p.offers?.price), source_currency: p.offers?.priceCurrency ?? "USD",
      variant_name: null, variants: [],
    };
  },
};

// ───────────────────────── SpeedyBee (BigCommerce): product sitemap → page HTML

const speedybee: HtmlSource = {
  brand: "SpeedyBee",
  base: "https://www.speedybee.com",
  async list() {
    const urls: string[] = [];
    for (let page = 1; page <= 10; page++) {
      const batch = locs(await text(`https://www.speedybee.com/xmlsitemap.php?type=products&page=${page}`));
      urls.push(...batch);
      if (batch.length < 100) break;
    }
    return [...new Set(urls)].map((url) => ({ url }));
  },
  parse(url, doc) {
    const title = decode(doc.querySelector('meta[property="og:title"]')?.getAttribute("content") ?? doc.querySelector("h1")?.text ?? "").trim();
    if (!title) return null;
    const id = doc.querySelector('input[name="product_id"]')?.getAttribute("value") ?? slugify(new URL(url).pathname);
    const crumbs = doc.querySelectorAll(".breadcrumbs li").map((li) => li.text.trim()).filter(Boolean);
    const type = crumbs.length >= 3 ? crumbs[crumbs.length - 2] : "";
    const imgs = doc.querySelectorAll("[data-image-gallery-zoom-image-url]").map((e) => e.getAttribute("data-image-gallery-zoom-image-url")!.split("?")[0]);
    const desc = cleanDescription(doc.querySelector("#tab-description")?.innerHTML ?? "");
    // One option group (e.g. "Version") becomes our options; multi-group combos need SKUs we can't see.
    const groups = doc.querySelectorAll("[data-product-attribute]").filter((g) => g.querySelectorAll("option[value], input[type=radio]").length);
    let variant_name: string | null = null;
    let variants: OfficialItem["variants"] = [];
    if (groups.length === 1) {
      const g = groups[0];
      variant_name = clip(decode(g.querySelector("label")?.text.replace(/[:*]|Required/gi, "").trim() || "Option"), 80);
      const labels = [
        ...g.querySelectorAll("option[value]").filter((o) => o.getAttribute("value")).map((o) => ({ v: o.getAttribute("value")!, l: o.text })),
        ...g.querySelectorAll("input[type=radio]").map((i) => ({ v: i.getAttribute("value")!, l: g.querySelector(`label[for="${i.id}"]`)?.text ?? i.getAttribute("value")! })),
      ];
      const seen = new Set<string>();
      variants = labels
        .map(({ v, l }, i) => ({ source_key: `speedybee.com:html:v:${id}:${v}`, label: clip(decode(l).replace(/\s+/g, " ").trim(), 80), sku: null, image_url: null, sort: i }))
        .filter((x) => x.label && !seen.has(x.label.toLowerCase()) && seen.add(x.label.toLowerCase()));
      if (variants.length < 2) { variant_name = null; variants = []; }
    }
    const category = classify(type, title, "accessories");
    const brand = brandOf("SpeedyBee", title); // SpeedyBee also resells e.g. Amass connectors
    return {
      source: "html", source_key: `speedybee.com:html:${id}`, source_url: url,
      sku: doc.querySelector("[data-product-sku]")?.text.trim() || `SPEEDYBEE-${id}`,
      slug: slugify(displayName(brand, title)), name: displayName(brand, title), brand,
      category, art: artFor(category), short: summary(desc), highlights: [], specs: {},
      images: [...new Set(imgs)].slice(0, 8), description_html: desc,
      source_price: price(doc.querySelector("[data-product-price-without-tax]")?.text), source_currency: "USD",
      variant_name, variants,
    };
  },
};

// ───────────────────────── T-Motor (UAV store): category pages → product pages

const TMOTOR_CATEGORY: [RegExp, string][] = [
  [/adapter/, "accessories"],
  [/esc/, "escs"],
  [/propeller|carbon-fiber|polymer/, "propellers"],
  [/motor|propulsion|power|combo|gimbal-motor|manned/, "motors"],
];

const tmotor: HtmlSource = {
  brand: "T-Motor",
  base: "https://store.tmotor.com",
  async list(log) {
    const home = await text("https://store.tmotor.com/");
    const cats = [...new Set([...home.matchAll(/href="(?:https:\/\/store\.tmotor\.com\/)?(categorys\/[a-z0-9-]+)"/gi)].map((m) => m[1]))];
    const found = new Map<string, string>();
    for (const c of cats) {
      const html = await text(`https://store.tmotor.com/${c}`);
      for (const m of html.matchAll(/href="(?:https:\/\/store\.tmotor\.com\/)?(product\/[^"?#]+\.html)"/g)) {
        found.set(m[1], c); // the menu lists parents before sub-categories, so the last (most specific) wins
      }
      await sleep(500);
    }
    log(`T-Motor: ${found.size} product pages across ${cats.length} categories`);
    return [...found.entries()].map(([path, cat]) => ({ url: `https://store.tmotor.com/${path}`, hint: cat }));
  },
  parse(url, doc, raw, hint) {
    const title = decode(doc.querySelector("h1")?.text ?? "").replace(/\s+/g, " ").trim();
    if (!title) return null;
    const ld = jsonLd(raw).find((x) => x["@type"] === "Product") as
      | { sku?: string; description?: string; offers?: { price?: string; priceCurrency?: string } }
      | undefined;
    const imgs = doc.querySelectorAll("img").map((i) => i.getAttribute("src") || "").filter((s) => /goods_img/.test(s)).map((s) => encodeURI(decodeURI(abs(s, "https://store.tmotor.com/"))));
    const descEl = doc.querySelector(".goods_desc_txt");
    descEl?.querySelectorAll("img, p.p2").forEach((e) => e.remove());
    // Some pages publish their description only as images; then use the structured-data description.
    const desc = cleanDescription(descEl?.innerHTML || (ld?.description ? `<p>${ld.description}</p>` : ""));
    // Spec table rows are "key, value, key, value".
    const specs: Record<string, string> = {};
    for (const row of doc.querySelectorAll(".basicParameterBox tr")) {
      const cells = row.querySelectorAll("td,th").map((c) => c.text.replace(/\s+/g, " ").trim());
      for (let i = 0; i + 1 < cells.length; i += 2) if (cells[i] && cells[i + 1] && Object.keys(specs).length < 30) specs[clip(cells[i], 60)] = clip(cells[i + 1], 120);
    }
    const slug = url.match(/product\/([^/]+)\.html$/)![1];
    const cat = TMOTOR_CATEGORY.find(([re]) => re.test(hint ?? ""))?.[1] ?? classify("", title, "motors");
    const category = /prop/i.test(title) && cat === "motors" ? "propellers" : cat;
    return {
      source: "html", source_key: `store.tmotor.com:html:${slug.toLowerCase()}`, source_url: url,
      sku: ld?.sku || `TMOTOR-${slugify(slug).toUpperCase()}`.slice(0, 60), slug: slugify(displayName("T-Motor", title)),
      name: displayName("T-Motor", title), brand: "T-Motor", category, art: artFor(category),
      short: summary(desc), highlights: [], specs, images: [...new Set(imgs)].slice(0, 8), description_html: desc,
      source_price: price(ld?.offers?.price), source_currency: ld?.offers?.priceCurrency ?? "USD",
      variant_name: null, variants: [],
    };
  },
};

// ───────────────────────── DJI (official store): product sitemap → page state (window.__PRELOADED_STATE__)

const DJI_DRONE = /^dji-(mini|air|mavic|avata|neo|flip|fpv|inspire|matrice|agras|phantom|lito)/;
const DJI_NOT_DRONE =
  /refurbished|battery|propell|charg|filter|case|bag|strap|cable|hub|guard|lens|cover|mount|adapter|holder|sticker|landing|antenna|care|frame|protector|parachute|storage|screen|hood|module|motor|arm|shell|badge|t-shirt|license|damper|connector|controller$|remote|goggles|light|speaker|spotlight|-tw$|-sb(-\d+)?$/;
/** DJI's CDN serves fixed sizes; keep the 640px one (the store's loader picks smaller ones by width). */
const djiImg = (u: string) => `https:${u.replace(/^https?:/, "")}`.split("?")[0].replace(/@[a-z_0-9]+\.(jpg|png|webp)$/, "@xlarge.$1");
const djiSeen = new Set<string>();

const dji: HtmlSource = {
  brand: "DJI",
  base: "https://store.dji.com",
  async list(log) {
    const urls = locs(await text("https://assets.djicdn.com/sitemap/store/store-us.xml"))
      .filter((u) => /\/product\//.test(u))
      .filter((u) => {
        const slug = u.split("/product/")[1] ?? "";
        return DJI_DRONE.test(slug) && !DJI_NOT_DRONE.test(slug);
      });
    log(`DJI: ${urls.length} candidate drone pages`);
    return [...new Set(urls)].map((url) => ({ url }));
  },
  parse(url, _doc, raw) {
    const at = raw.indexOf("window.__PRELOADED_STATE__");
    if (at < 0) return null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let st: any;
    try {
      const body = raw.slice(raw.indexOf("=", at) + 1).trimStart();
      // The state is followed by other statements in the same script tag.
      const end = body.search(/;\s*window\.|<\/script>/);
      st = JSON.parse(body.slice(0, end).trim().replace(/;$/, ""));
    } catch {
      return null;
    }
    const meta = st?.shoppingFlow?.meta;
    const slug = url.split("/product/")[1];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const v = (st?.products?.variants ?? []).find((x: any) => x.slug === slug) ?? (st?.products?.variants ?? []).find((x: any) => x.id === meta?.selectedVariant);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const p = (st?.products?.products ?? []).find((x: any) => x.id === v?.productId);
    const crumbs: string[] = (meta?.breadcrumbs ?? []).map((b: { title?: string }) => b.title ?? "");
    // Only main products (DJI Care-eligible) with a price, in DJI's drone categories. Newer pages
    // (Neo, Flip) carry no breadcrumbs; the drone-name filter on the slug already applies to them.
    const inDroneCategory = crumbs.filter(Boolean).length === 0 || crumbs.some((c) => /drone|fpv|enterprise|agricultur/i.test(c));
    if (!v || v.variantCategory !== "dji_care_main" || !(v.price > 0) || !inDroneCategory) return null;
    const title = decode(v.title).replace(/\s+/g, " ").trim();
    if (djiSeen.has(title.toLowerCase())) return null; // regional duplicates of the same kit
    djiSeen.add(title.toLowerCase());

    const images = [v.cover?.large ?? v.cover?.origin, ...(v.carousels ?? []).map((c: { large?: string; origin?: string }) => c.large ?? c.origin)]
      .filter(Boolean)
      .map(djiImg);
    const points = [...String(v.coreSpecs ?? "").matchAll(/<p>(.*?)<\/p>/g)].map((m) => decode(m[1].replace(/<[^>]+>/g, "")).trim()).filter(Boolean);
    const inBox = (p?.inTheBoxes ?? []).map((b: { name?: string; quantity?: number }) => `${b.name}${b.quantity && b.quantity > 1 ? ` × ${b.quantity}` : ""}`).filter((x: string) => x && !x.startsWith("undefined"));
    const short = decode(String(v.shortSummary || p?.description || "")).trim();
    const desc = cleanDescription(
      `${short ? `<p>${short}</p>` : ""}` +
        (points.length ? `<h3>Highlights</h3><ul>${points.map((x) => `<li>${x}</li>`).join("")}</ul>` : "") +
        (inBox.length ? `<h3>In the box</h3><ul>${inBox.map((x: string) => `<li>${x}</li>`).join("")}</ul>` : ""),
    );
    const category = "camera-drones"; // every DJI drone is listed under Camera drones
    return {
      source: "html", source_key: `store.dji.com:html:${v.id}`, source_url: url,
      sku: v.ean ? String(v.ean) : `DJI-${v.id}`, slug: slugify(displayName("DJI", title)),
      name: displayName("DJI", title), brand: "DJI", category, art: artFor(category),
      short: clip(short, 280), highlights: points.slice(0, 6).map((x) => clip(x, 120)), specs: {},
      images: [...new Set(images)].slice(0, 8), description_html: desc,
      source_price: Math.round(Number(v.price) * 100) / 100, source_currency: "USD",
      variant_name: null, variants: [],
    };
  },
};

export const HTML_SOURCES: HtmlSource[] = [iflight, speedybee, tmotor, dji];

export async function fetchHtmlSource(src: HtmlSource, log: (m: string) => void = () => {}, limit = Infinity) {
  const pages = (await src.list(log)).slice(0, limit);
  const out: OfficialItem[] = [];
  let failed = 0, skipped = 0;
  for (let i = 0; i < pages.length; i += 2) {
    const results = await Promise.all(pages.slice(i, i + 2).map(async ({ url, hint }) => {
      try {
        const raw = await text(url);
        return src.parse(url, parse(raw), raw, hint);
      } catch { failed++; return null; }
    }));
    for (const r of results) {
      if (!r || (!src.allowNoImages && !r.images.length) || /gift ?card|insurance|shipping|deposit|coupon/i.test(r.name)) { skipped++; continue; }
      out.push(r);
    }
    if ((i / 2) % 50 === 0 && i) log(`${src.brand}: ${i}/${pages.length} pages read`);
    await sleep(400);
  }
  log(`${src.brand}: ${out.length} products (${skipped} skipped, ${failed} pages failed)`);
  return out;
}
