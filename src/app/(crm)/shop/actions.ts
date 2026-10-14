"use server";

import { redirect } from "next/navigation";
import { updateTag } from "next/cache";
import { assertShopAdmin } from "@/lib/crm/auth";
import { TAG_ANNOUNCEMENTS, TAG_BRANDS, TAG_CATALOG } from "@/lib/catalog";
import { categoryBySlug } from "@/data/categories";

export type ActionResult = { ok: true; id?: string } | { ok: false; error: string };

function fail(e: unknown): ActionResult {
  const msg = e instanceof Error ? e.message : ((e as { message?: string })?.message ?? String(e));
  if (/duplicate key.*slug/i.test(msg)) return { ok: false, error: "Another product already uses this URL slug. Change the slug." };
  if (/duplicate key.*sku/i.test(msg)) return { ok: false, error: "Another product already uses this SKU." };
  if (/row-level security|permission denied/i.test(msg)) return { ok: false, error: "You don’t have permission to change the shop." };
  if (/publish_needs_price/.test(msg)) return { ok: false, error: "Set a price before showing this product on the store." };
  if (/price_before_stock/.test(msg)) return { ok: false, error: "Set a price before adding stock." };
  if (/official sync/i.test(msg)) return { ok: false, error: "Official product details come from the brand and can’t be edited here." };
  return { ok: false, error: msg };
}

const int = (v: unknown, min = 0) => {
  const n = Math.round(Number(v));
  if (!Number.isFinite(n) || n < min) throw new Error("Prices and stock must be whole numbers of 0 or more.");
  return n;
};
const optInt = (v: unknown) => (v === "" || v === null || v === undefined ? null : int(v));
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);

// ───────────────────────── Products

export interface ProductInput {
  id?: string;
  sku: string;
  slug: string;
  name: string;
  brand: string;
  category: string;
  price: number | string;
  mrp?: number | string | null;
  stock: number | string;
  low_stock_at: number | string;
  art: string;
  tags: string[];
  short: string;
  highlights: string[];
  specs: { key: string; value: string }[];
  in_box: string[];
  image_url?: string | null;
  weight_g?: number | string | null;
  is_published: boolean;
  variant_name?: string | null;
  variants: { id?: string; label: string; price: number | string; mrp?: number | string | null; stock: number | string }[];
}

export async function saveProduct(input: ProductInput): Promise<ActionResult> {
  try {
    const { sb } = await assertShopAdmin();
    const name = input.name.trim();
    if (name.length < 2) throw new Error("Enter a product name.");
    if (!categoryBySlug.has(input.category)) throw new Error("Choose a category.");
    const variants = (input.variant_name?.trim() ? input.variants : []).filter((v) => v.label.trim());
    if (input.variant_name?.trim() && variants.length === 0) throw new Error("Add at least one option, or clear the option name.");
    if (new Set(variants.map((v) => v.label.trim().toLowerCase())).size !== variants.length) throw new Error("Option names must be unique.");

    const row = {
      sku: input.sku.trim() || `EG-${Date.now().toString().slice(-6)}`,
      slug: slugify(input.slug || name),
      name,
      brand: input.brand.trim(),
      category: input.category,
      price: variants.length ? Math.min(...variants.map((v) => int(v.price))) : int(input.price),
      mrp: optInt(input.mrp),
      stock: variants.length ? 0 : int(input.stock),
      low_stock_at: int(input.low_stock_at),
      art: input.art,
      tags: input.tags,
      short: input.short.trim(),
      highlights: input.highlights.map((h) => h.trim()).filter(Boolean),
      specs: Object.fromEntries(input.specs.filter((s) => s.key.trim() && s.value.trim()).map((s) => [s.key.trim(), s.value.trim()])),
      in_box: input.in_box.map((h) => h.trim()).filter(Boolean),
      image_url: input.image_url?.trim() || null,
      weight_g: optInt(input.weight_g),
      is_published: input.is_published,
      variant_name: variants.length ? input.variant_name!.trim() : null,
    };
    if (!row.brand) throw new Error("Enter the brand.");

    let id = input.id;
    if (id) {
      const { error } = await sb.from("shop_products").update(row).eq("id", id);
      if (error) throw error;
    } else {
      const { data, error } = await sb.from("shop_products").insert(row).select("id").single();
      if (error) throw error;
      id = data.id as string;
    }

    // Variants: update kept ones, insert new ones, delete removed ones.
    const { data: existing, error: exErr } = await sb.from("shop_product_variants").select("id").eq("product_id", id);
    if (exErr) throw exErr;
    const keep = new Set(variants.filter((v) => v.id).map((v) => v.id));
    const removed = (existing ?? []).map((v) => v.id as string).filter((vid) => !keep.has(vid));
    if (removed.length) {
      const { error } = await sb.from("shop_product_variants").delete().in("id", removed);
      if (error) throw error;
    }
    for (const [i, v] of variants.entries()) {
      const vrow = { product_id: id, label: v.label.trim(), price: int(v.price), mrp: optInt(v.mrp), stock: int(v.stock), sort: i };
      const { error } = v.id
        ? await sb.from("shop_product_variants").update(vrow).eq("id", v.id)
        : await sb.from("shop_product_variants").insert(vrow);
      if (error) throw error;
    }

    updateTag(TAG_CATALOG);
    return { ok: true, id };
  } catch (e) {
    return fail(e);
  }
}

// ───────────────────────── Official (brand-synced) products: admins edit commercial fields only.

export interface OfficialEdit {
  id: string;
  category: string;
  short: string;
  tags: string[];
  low_stock_at: number | string;
  is_published: boolean;
  /** Simple product (no options). */
  price?: number | string;
  mrp?: number | string | null;
  stock?: number | string;
  /** Per-option commercial fields; labels and SKUs stay official. */
  variants?: { id: string; price: number | string; mrp?: number | string | null; stock: number | string }[];
}

export async function saveOfficialProduct(input: OfficialEdit): Promise<ActionResult> {
  try {
    const { sb } = await assertShopAdmin();
    if (!categoryBySlug.has(input.category)) throw new Error("Choose a category.");
    const variants = input.variants ?? [];
    for (const v of variants) {
      const price = int(v.price);
      const stock = int(v.stock);
      if (price === 0 && stock > 0) throw new Error("Set a price before adding stock.");
      const { error } = await sb.from("shop_product_variants").update({ price, mrp: optInt(v.mrp), stock }).eq("id", v.id);
      if (error) throw error;
    }
    const priced = variants.map((v) => int(v.price)).filter((n) => n > 0);
    const row: Record<string, unknown> = {
      category: input.category,
      short: input.short.trim().slice(0, 300),
      tags: input.tags,
      low_stock_at: int(input.low_stock_at),
    };
    if (variants.length) {
      row.price = priced.length ? Math.min(...priced) : 0;
    } else {
      row.price = int(input.price);
      row.mrp = optInt(input.mrp);
      row.stock = int(input.stock);
      if (row.price === 0 && (row.stock as number) > 0) throw new Error("Set a price before adding stock.");
    }
    if (input.is_published && !(row.price as number)) throw new Error("Set a price before showing this product on the store.");
    row.is_published = input.is_published;
    const { error } = await sb.from("shop_products").update(row).eq("id", input.id);
    if (error) throw error;
    updateTag(TAG_CATALOG);
    return { ok: true, id: input.id };
  } catch (e) {
    return fail(e);
  }
}

export async function setStock(target: { productId?: string; variantId?: string }, stock: number): Promise<ActionResult> {
  try {
    const { sb } = await assertShopAdmin();
    const n = int(stock);
    const q = target.variantId
      ? sb.from("shop_product_variants").update({ stock: n }).eq("id", target.variantId)
      : sb.from("shop_products").update({ stock: n }).eq("id", target.productId!);
    const { error } = await q;
    if (error) throw error;
    updateTag(TAG_CATALOG);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function setPublished(id: string, published: boolean): Promise<ActionResult> {
  try {
    const { sb } = await assertShopAdmin();
    const { error } = await sb.from("shop_products").update({ is_published: published }).eq("id", id);
    if (error) throw error;
    updateTag(TAG_CATALOG);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  try {
    const { sb } = await assertShopAdmin();
    const { error } = await sb.from("shop_products").delete().eq("id", id);
    if (error) throw error;
    updateTag(TAG_CATALOG);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

// ───────────────────────── Orders

const STATUSES = ["awaiting_payment", "confirmed", "packed", "shipped", "delivered", "cancelled"] as const;
const PAYMENT = ["pending", "paid", "refunded"] as const;

export async function updateOrder(
  id: string,
  patch: { status: string; payment_status: string; courier: string; tracking_number: string; staff_notes: string },
): Promise<ActionResult> {
  try {
    const { sb } = await assertShopAdmin();
    if (!(STATUSES as readonly string[]).includes(patch.status)) throw new Error("Unknown order status.");
    if (!(PAYMENT as readonly string[]).includes(patch.payment_status)) throw new Error("Unknown payment status.");
    const { error } = await sb
      .from("shop_orders")
      .update({
        status: patch.status,
        payment_status: patch.payment_status,
        courier: patch.courier.trim() || null,
        tracking_number: patch.tracking_number.trim() || null,
        staff_notes: patch.staff_notes.trim() || null,
      })
      .eq("id", id);
    if (error) throw error;
    if (patch.status === "cancelled") updateTag(TAG_CATALOG); // stock went back on the shelf
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

// ───────────────────────── Storefront notifications

export async function createAnnouncement(input: {
  message: string;
  link: string;
  tone: "info" | "deal" | "alert";
  ends_at: string;
}): Promise<ActionResult> {
  try {
    const { sb } = await assertShopAdmin();
    const message = input.message.trim();
    if (message.length < 3 || message.length > 200) throw new Error("Keep the message between 3 and 200 characters.");
    const link = input.link.trim();
    if (link && !/^(\/|https:\/\/)/.test(link)) throw new Error("Links must start with / or https://");
    const { error } = await sb.from("shop_announcements").insert({
      message,
      link: link || null,
      tone: input.tone,
      ends_at: input.ends_at ? new Date(input.ends_at).toISOString() : null,
    });
    if (error) throw error;
    updateTag(TAG_ANNOUNCEMENTS);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function setAnnouncementActive(id: string, active: boolean): Promise<ActionResult> {
  try {
    const { sb } = await assertShopAdmin();
    const { error } = await sb.from("shop_announcements").update({ is_active: active }).eq("id", id);
    if (error) throw error;
    updateTag(TAG_ANNOUNCEMENTS);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function deleteAnnouncement(id: string): Promise<ActionResult> {
  try {
    const { sb } = await assertShopAdmin();
    const { error } = await sb.from("shop_announcements").delete().eq("id", id);
    if (error) throw error;
    updateTag(TAG_ANNOUNCEMENTS);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function markAlertsRead(): Promise<ActionResult> {
  try {
    const { sb, admin } = await assertShopAdmin();
    const { error } = await sb
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("recipient_id", admin.id)
      .in("kind", ["shop_order", "shop_stock"])
      .is("read_at", null);
    if (error) throw error;
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function signOut() {
  const { serverClient } = await import("@/lib/supabase/server");
  const sb = await serverClient();
  await sb.auth.signOut();
  redirect("/shop/login");
}

// ───────────────────────── Brands

export async function saveBrand(input: {
  slug: string;
  name: string;
  logo_url: string | null;
  logo_width: number | null;
  logo_height: number | null;
  website: string;
}): Promise<ActionResult> {
  try {
    const { sb } = await assertShopAdmin();
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(input.slug)) throw new Error("Invalid brand.");
    const website = input.website.trim();
    if (website && !/^https:\/\//.test(website)) throw new Error("The website must start with https://");
    const logo = input.logo_url?.trim() || null;
    if (logo && !/^(\/|https:\/\/)/.test(logo)) throw new Error("Invalid logo URL.");
    const { error } = await sb.from("shop_brands").upsert(
      {
        slug: input.slug,
        name: input.name.trim(),
        logo_url: logo,
        logo_width: logo && input.logo_width && input.logo_width > 0 ? Math.round(input.logo_width) : null,
        logo_height: logo && input.logo_height && input.logo_height > 0 ? Math.round(input.logo_height) : null,
        website: website || null,
        logo_source: logo?.startsWith("https://") ? "Uploaded in CRM" : undefined,
      },
      { onConflict: "slug" },
    );
    if (error) throw error;
    updateTag(TAG_BRANDS);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}
