import { publicClient } from "@/lib/supabase/public";
import { SHOP_SERVER_SECRET, verifyWebhookSignature } from "@/lib/razorpay";

// Razorpay webhook (Dashboard > Webhooks): https://shop.egirerobotics.com/api/razorpay/webhook
// Events: payment.captured, order.paid. Confirms orders even if the customer closed the tab after paying.
export async function POST(request: Request) {
  const raw = await request.text();
  if (!verifyWebhookSignature(raw, request.headers.get("x-razorpay-signature"))) {
    return Response.json({ error: "invalid signature" }, { status: 400 });
  }

  let event: {
    event?: string;
    payload?: { payment?: { entity?: { id?: string; order_id?: string; status?: string } } };
  };
  try {
    event = JSON.parse(raw);
  } catch {
    return Response.json({ error: "invalid body" }, { status: 400 });
  }

  const payment = event.payload?.payment?.entity;
  if ((event.event === "payment.captured" || event.event === "order.paid") && payment?.id && payment.order_id) {
    const { error } = await publicClient().rpc("shop_mark_paid", {
      p_secret: SHOP_SERVER_SECRET,
      p_rzp_order_id: payment.order_id,
      p_payment_id: payment.id,
    });
    // Orders not created by this shop (e.g. payment links) are acknowledged so Razorpay stops retrying.
    if (error && !/Unknown Razorpay order/.test(error.message)) {
      console.error("[razorpay webhook] mark paid failed", payment.order_id, error.message);
      return Response.json({ error: "retry" }, { status: 500 }); // Razorpay retries non-2xx
    }
  }
  return Response.json({ ok: true });
}
