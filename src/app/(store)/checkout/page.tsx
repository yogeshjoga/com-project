import type { Metadata } from "next";
import { razorpayEnabled } from "@/lib/razorpay";
import { CheckoutClient } from "./CheckoutClient";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

export default function CheckoutPage() {
  return <CheckoutClient onlineEnabled={razorpayEnabled} />;
}
