"use server";

import { updateTag } from "next/cache";
import { publicClient } from "@/lib/supabase/public";
import { supabaseConfigured } from "@/lib/supabase/env";
import { TAG_CATALOG } from "@/lib/catalog";

export interface OrderInput {
  name: string;
  phone: string;
  email: string;
  address: { line1: string; line2?: string; city: string; state: string; pin: string };
  gstin?: string;
  company?: string;
  payment_method: "upi" | "card" | "netbanking" | "cod";
  items: { product_id: string; variant_id?: string; qty: number }[];
}

export type OrderResult = { ok: true; id: string; total: number } | { ok: false; error: string };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function placeOrder(input: OrderInput): Promise<OrderResult> {
  if (!supabaseConfigured) return { ok: false, error: "Online ordering isn’t connected yet. Email us to order." };
  if (!Array.isArray(input.items) || input.items.length === 0) return { ok: false, error: "Your cart is empty." };
  if (input.items.some((i) => !UUID.test(i.product_id) || (i.variant_id && !UUID.test(i.variant_id)))) {
    return { ok: false, error: "Your cart has items from an older version of the store. Remove them and add them again." };
  }

  // Prices, stock and totals are computed inside the database function, never trusted from the browser.
  const { data, error } = await publicClient().rpc("shop_place_order", { p: input });
  if (error) {
    // P0001 = messages raised on purpose by shop_place_order (stock, validation, rate limits).
    return { ok: false, error: error.code === "P0001" ? error.message : "We couldn’t place the order. Refresh the page and try again." };
  }
  updateTag(TAG_CATALOG); // stock changed
  const res = data as { id: string; total: number };
  return { ok: true, id: res.id, total: res.total };
}

export type TrackResult =
  | { ok: true; order: { id: string; status: string; created_at: string; total: number; courier: string | null; tracking_number: string | null } | null }
  | { ok: false; error: string };

export async function trackOrder(id: string, phone: string): Promise<TrackResult> {
  if (!supabaseConfigured) return { ok: true, order: null };
  if (!/^[A-Za-z0-9]{4,20}$/.test(id.trim()) || !/^[6-9]\d{9}$/.test(phone.trim())) {
    return { ok: false, error: "Enter the order ID and the 10-digit mobile number used at checkout." };
  }
  const { data, error } = await publicClient().rpc("shop_track_order", { p_id: id.trim(), p_phone: phone.trim() });
  if (error) return { ok: false, error: error.code === "P0001" ? error.message : "Tracking is unavailable right now. Try again shortly." };
  return { ok: true, order: data };
}
