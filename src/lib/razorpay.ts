import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

const KEY_ID = process.env.RAZORPAY_KEY_ID ?? "";
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET ?? "";
const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET ?? "";
export const SHOP_SERVER_SECRET = process.env.SHOP_SERVER_SECRET ?? "";

/** Online payment is offered only when Razorpay keys and the shop server secret are configured. */
export const razorpayEnabled = Boolean(KEY_ID && KEY_SECRET && SHOP_SERVER_SECRET);
export const razorpayKeyId = KEY_ID;

function safeEqualHex(a: string, b: string) {
  const x = Buffer.from(a, "utf8");
  const y = Buffer.from(b, "utf8");
  return x.length === y.length && timingSafeEqual(x, y);
}

/** Creates a Razorpay order. Amount is in rupees; Razorpay expects paise. */
export async function createRazorpayOrder(amountRupees: number, receipt: string, notes: Record<string, string>) {
  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${Buffer.from(`${KEY_ID}:${KEY_SECRET}`).toString("base64")}`,
    },
    body: JSON.stringify({ amount: Math.round(amountRupees * 100), currency: "INR", receipt, notes }),
    cache: "no-store",
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: { description?: string } };
    throw new Error(body.error?.description ?? `Razorpay returned ${res.status}`);
  }
  return (await res.json()) as { id: string; amount: number; currency: string };
}

/** Checkout callback signature: HMAC-SHA256(order_id + "|" + payment_id, key_secret). */
export function verifyCheckoutSignature(rzpOrderId: string, paymentId: string, signature: string) {
  if (!KEY_SECRET || !rzpOrderId || !paymentId || !signature) return false;
  const expected = createHmac("sha256", KEY_SECRET).update(`${rzpOrderId}|${paymentId}`).digest("hex");
  return safeEqualHex(expected, signature);
}

/** Webhook signature: HMAC-SHA256(raw request body, webhook secret). */
export function verifyWebhookSignature(rawBody: string, signature: string | null) {
  if (!WEBHOOK_SECRET || !signature) return false;
  const expected = createHmac("sha256", WEBHOOK_SECRET).update(rawBody).digest("hex");
  return safeEqualHex(expected, signature);
}
