"use server";

import { updateTag } from "next/cache";
import { publicClient } from "@/lib/supabase/public";
import { supabaseConfigured } from "@/lib/supabase/env";
import { TAG_CATALOG } from "@/lib/catalog";
import { brand } from "@/config/brand";
import {
  SHOP_SERVER_SECRET,
  createRazorpayOrder,
  razorpayEnabled,
  razorpayKeyId,
  verifyCheckoutSignature,
} from "@/lib/razorpay";

export interface OrderInput {
  name: string;
  phone: string;
  email: string;
  address: { line1: string; line2?: string; city: string; state: string; pin: string };
  gstin?: string;
  company?: string;
  payment_method: "online" | "cod";
  items: { product_id: string; variant_id?: string; qty: number }[];
}

/** What the browser needs to open Razorpay Checkout. Contains no secrets. */
export interface PaymentRequest {
  keyId: string;
  rzpOrderId: string;
  amountPaise: number;
  name: string;
  email: string;
  phone: string;
  orderId: string;
}

export type OrderResult =
  | { ok: true; id: string; total: number; payment?: PaymentRequest }
  | { ok: false; error: string };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function placeOrder(input: OrderInput): Promise<OrderResult> {
  if (!supabaseConfigured) return { ok: false, error: "Online ordering isn’t connected yet. Email us to order." };
  if (!Array.isArray(input.items) || input.items.length === 0) return { ok: false, error: "Your cart is empty." };
  if (input.payment_method === "online" && !razorpayEnabled) {
    return { ok: false, error: "Online payment isn’t available right now. Choose cash on delivery." };
  }
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
  if (input.payment_method === "cod") return { ok: true, id: res.id, total: res.total };

  // Online: the order holds its stock for 30 minutes while the customer pays.
  try {
    const rzp = await createRazorpayOrder(res.total, res.id, { shop_order_id: res.id, store: brand.name });
    const { error: attachErr } = await publicClient().rpc("shop_attach_payment", {
      p_secret: SHOP_SERVER_SECRET,
      p_order_id: res.id,
      p_rzp_order_id: rzp.id,
    });
    if (attachErr) throw new Error(attachErr.message);
    return {
      ok: true,
      id: res.id,
      total: res.total,
      payment: {
        keyId: razorpayKeyId,
        rzpOrderId: rzp.id,
        amountPaise: rzp.amount,
        name: input.name,
        email: input.email,
        phone: input.phone,
        orderId: res.id,
      },
    };
  } catch (e) {
    console.error("[razorpay] could not start payment for", res.id, e);
    return {
      ok: false,
      error: `We saved order ${res.id} but couldn’t start the payment. Try again in a minute, or choose cash on delivery. Unpaid orders are released after 30 minutes.`,
    };
  }
}

export type PaymentResult = { ok: true; id: string; late?: boolean } | { ok: false; error: string };

/** Called by Razorpay Checkout's success handler. The signature proves Razorpay authorised the payment. */
export async function confirmPayment(resp: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}): Promise<PaymentResult> {
  if (!verifyCheckoutSignature(resp.razorpay_order_id, resp.razorpay_payment_id, resp.razorpay_signature)) {
    return { ok: false, error: "We couldn’t verify this payment. If money left your account, contact us with your order ID." };
  }
  const { data, error } = await publicClient().rpc("shop_mark_paid", {
    p_secret: SHOP_SERVER_SECRET,
    p_rzp_order_id: resp.razorpay_order_id,
    p_payment_id: resp.razorpay_payment_id,
  });
  if (error) {
    console.error("[razorpay] mark paid failed", resp.razorpay_order_id, error.message);
    return { ok: false, error: "Payment received, but we couldn’t update your order yet. We’ll confirm it shortly by email." };
  }
  const r = data as { id: string; late?: boolean };
  return { ok: true, id: r.id, late: r.late };
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
