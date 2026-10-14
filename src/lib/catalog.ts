import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { products as sampleProducts } from "@/data/products";
import { categories } from "@/data/categories";
import { publicClient } from "./supabase/public";
import { supabaseConfigured } from "./supabase/env";
import { discountPct } from "./format";
import type { Announcement, ArtKind, Product, ProductSummary, Tag } from "./types";

export { discountPct };

/** Cache tags. CRM server actions and checkout call updateTag() with these. */
export const TAG_CATALOG = "shop-catalog";
export const TAG_ANNOUNCEMENTS = "shop-announcements";
export const TAG_BRANDS = "shop-brands";

const ART: ArtKind[] = ["quad", "whoop", "wing", "camdrone", "goggles", "airunit", "fpvcam", "antenna", "frame", "motor", "esc", "board", "prop", "gps", "radio", "receiver", "battery", "charger", "cable", "actioncam", "gimbal", "meter", "iron", "tool", "bag"];
const TAGS: Tag[] = ["hot", "new", "bestseller", "made-in-india"];

function hashHue(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 360;
  return h;
}

interface Row {
  id: string; sku: string; slug: string; name: string; brand: string; category: string;
  price: number; mrp: number | null; stock: number; low_stock_at: number; art: string; tags: string[];
  short: string; highlights: string[]; specs: Record<string, string>; in_box: string[] | null;
  variant_name: string | null; image_url: string | null; weight_g: number | null; sort: number; created_at: string;
  images: string[]; description_html?: string | null; source_url: string | null;
  shop_product_variants: { id: string; label: string; price: number; mrp: number | null; stock: number; sort: number }[];
}

function fromRow(r: Row, addedOrder: number): Product {
  // Only options an admin has priced are offered.
  const opts = r.variant_name
    ? [...r.shop_product_variants].filter((v) => v.price > 0).sort((a, b) => a.sort - b.sort).map((v) => ({
        id: v.id, label: v.label, price: v.price, mrp: v.mrp ?? undefined, stock: v.stock,
      }))
    : undefined;
  const hasOpts = Boolean(opts && opts.length);
  const price = hasOpts ? Math.min(...opts!.map((o) => o.price)) : r.price;
  const cheapest = hasOpts ? opts!.find((o) => o.price === price) : undefined;
  return {
    id: r.id,
    sku: r.sku,
    slug: r.slug,
    name: r.name,
    brand: r.brand,
    category: r.category,
    price,
    mrp: hasOpts ? cheapest?.mrp : r.mrp ?? undefined,
    stock: hasOpts ? opts!.reduce((n, o) => n + o.stock, 0) : r.stock,
    lowStockAt: r.low_stock_at,
    art: (ART as string[]).includes(r.art) ? (r.art as ArtKind) : "board",
    hue: hashHue(r.brand),
    tags: r.tags.filter((t): t is Tag => (TAGS as string[]).includes(t)),
    short: r.short,
    highlights: r.highlights,
    specs: r.specs ?? {},
    inBox: r.in_box ?? undefined,
    variant: hasOpts ? { name: r.variant_name!, options: opts! } : undefined,
    weightG: r.weight_g ?? undefined,
    imageUrl: r.images?.[0] ?? r.image_url ?? undefined,
    images: r.images?.length ? r.images : r.image_url ? [r.image_url] : [],
    descriptionHtml: r.description_html ?? undefined,
    sourceUrl: r.source_url ?? undefined,
    addedOrder,
  };
}

/** Published catalog. Cached and prerendered; refreshed every minute and instantly via updateTag(TAG_CATALOG). */
export async function getProducts(): Promise<Product[]> {
  "use cache";
  cacheTag(TAG_CATALOG);
  cacheLife("minutes");
  if (!supabaseConfigured) return sampleProducts;

  // The API returns at most 1,000 rows per request, so page through the published catalog.
  // Descriptions are loaded per product page (getProductDescription) to keep this cache entry small.
  const rows: Row[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await publicClient()
      .from("shop_products")
      .select("id, sku, slug, name, brand, category, price, mrp, stock, low_stock_at, art, tags, short, highlights, specs, in_box, variant_name, image_url, images, source_url, weight_g, sort, created_at, shop_product_variants(id, label, price, mrp, stock, sort)")
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .order("sort", { ascending: true })
      .order("id", { ascending: true })
      .range(from, from + 999);
    // Fail loudly: serving sample data would show wrong stock and break checkout.
    // The previous cached catalog keeps serving while this retries.
    if (error) throw new Error(`Catalog read failed: ${error.message}`);
    rows.push(...(data as unknown as Row[]));
    if (!data || data.length < 1000) break;
  }
  return rows.map((r, i) => fromRow(r, i));
}

/** Official description for one product (sanitised HTML at import time). */
export async function getProductDescription(slug: string): Promise<string | null> {
  "use cache";
  cacheTag(TAG_CATALOG, `product-${slug}`);
  cacheLife("minutes");
  if (!supabaseConfigured) return null;
  const { data, error } = await publicClient()
    .from("shop_products")
    .select("description_html")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();
  if (error) throw new Error(`Description read failed: ${error.message}`);
  return data?.description_html ?? null;
}

export async function getAnnouncements(): Promise<Announcement[]> {
  "use cache";
  cacheTag(TAG_ANNOUNCEMENTS);
  cacheLife("minutes");
  if (!supabaseConfigured) return [];
  const { data, error } = await publicClient()
    .from("shop_announcements")
    .select("id, message, link, tone")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(3);
  if (error) return [];
  return data as Announcement[];
}

export function toSummary(p: Product): ProductSummary {
  const opts = p.variant?.options;
  const maxPrice = opts ? Math.max(...opts.map((o) => o.price)) : undefined;
  return {
    id: p.id, slug: p.slug, name: p.name, brand: p.brand, category: p.category,
    price: p.price, mrp: p.mrp,
    maxPrice: maxPrice && maxPrice !== p.price ? maxPrice : undefined,
    stock: p.stock, art: p.art, hue: p.hue, tags: p.tags,
    hasVariants: Boolean(opts && opts.length > 1),
    imageUrl: p.imageUrl,
    addedOrder: p.addedOrder,
  };
}

export async function getSummaries() {
  return (await getProducts()).map(toSummary);
}

export async function getProduct(slug: string) {
  return (await getProducts()).find((p) => p.slug === slug);
}

export async function productsInCategory(slug: string) {
  return (await getSummaries()).filter((p) => p.category === slug);
}

export async function productsInDepartment(dept: string) {
  const cats = new Set(categories.filter((c) => c.department === dept).map((c) => c.slug));
  return (await getSummaries()).filter((p) => cats.has(p.category));
}

export async function hotDeals(limit = 12) {
  return (await getSummaries())
    .filter((p) => p.stock > 0 && (p.tags.includes("hot") || discountPct(p.price, p.mrp) >= 10))
    .sort((a, b) => discountPct(b.price, b.mrp) - discountPct(a.price, a.mrp))
    .slice(0, limit);
}

export async function justLanded(limit = 12) {
  return [...(await getSummaries())]
    .sort((a, b) => Number(b.tags.includes("new")) - Number(a.tags.includes("new")) || a.addedOrder - b.addedOrder)
    .slice(0, limit);
}

export async function bestsellers(limit = 8) {
  return (await getSummaries()).filter((p) => p.tags.includes("bestseller")).slice(0, limit);
}

export async function related(p: Product, limit = 8) {
  const all = await getSummaries();
  const same = all.filter((s) => s.category === p.category && s.id !== p.id);
  const brand = all.filter((s) => s.brand === p.brand && s.category !== p.category);
  return [...same, ...brand].slice(0, limit);
}

export function brandSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export interface BrandInfo {
  slug: string;
  name: string;
  logoUrl: string | null;
  logoWidth: number | null;
  logoHeight: number | null;
  website: string | null;
}

/** Brand logos and links managed from the CRM (shop_brands). */
export async function getBrandInfo(): Promise<Record<string, BrandInfo>> {
  "use cache";
  cacheTag(TAG_BRANDS);
  cacheLife("minutes");
  if (!supabaseConfigured) return {};
  const { data, error } = await publicClient().from("shop_brands").select("slug, name, logo_url, logo_width, logo_height, website");
  if (error) throw new Error(`Brand read failed: ${error.message}`);
  return Object.fromEntries(
    (data ?? []).map((b) => [
      b.slug,
      { slug: b.slug, name: b.name, logoUrl: b.logo_url, logoWidth: b.logo_width, logoHeight: b.logo_height, website: b.website },
    ]),
  );
}

export async function brands() {
  const [summaries, info] = await Promise.all([getSummaries(), getBrandInfo()]);
  const counts = new Map<string, number>();
  for (const p of summaries) counts.set(p.brand, (counts.get(p.brand) ?? 0) + 1);
  return [...counts.entries()]
    .map(([name, count]) => {
      const slug = brandSlug(name);
      const i = info[slug];
      return {
        name, slug, count,
        logoUrl: i?.logoUrl ?? null, logoWidth: i?.logoWidth ?? null, logoHeight: i?.logoHeight ?? null,
        website: i?.website ?? null,
      };
    })
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export async function productsByBrand(slug: string) {
  return (await getSummaries()).filter((p) => brandSlug(p.brand) === slug);
}

export async function categoryCounts() {
  const counts: Record<string, number> = {};
  for (const p of await getSummaries()) counts[p.category] = (counts[p.category] ?? 0) + 1;
  return counts;
}
