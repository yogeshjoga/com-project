"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useHydrated, useShop } from "@/store/shop";
import { formatINR } from "@/lib/format";
import { OrderSummary, orderTotals } from "@/components/OrderSummary";
import { PageHead } from "@/components/PageHead";
import { ProductMedia } from "@/components/ProductMedia";
import { placeOrder as placeOrderAction } from "./actions";
import { CheckIcon } from "@/components/icons";

const states = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chandigarh", "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir",
  "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
  "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
];

const payments = [
  { id: "upi", label: "UPI", note: "Google Pay, PhonePe, Paytm or any UPI app" },
  { id: "card", label: "Credit or debit card", note: "Visa, Mastercard, RuPay, Amex" },
  { id: "netbanking", label: "Net banking", note: "All major Indian banks" },
  { id: "cod", label: "Cash on delivery", note: "Pay when it arrives" },
] as const;

type PayId = (typeof payments)[number]["id"];

const field = "h-11 w-full rounded-md bg-white px-3 text-[15px] ring-1 ring-line focus:outline-none focus:ring-2 focus:ring-signal";

export default function CheckoutPage() {
  const { cart, clear } = useShop();
  const ready = useHydrated();
  const [pay, setPay] = useState<PayId>("upi");
  const [business, setBusiness] = useState(false);
  const [placed, setPlaced] = useState<{ id: string; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function placeOrder(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    if (!/^[6-9]\d{9}$/.test(String(form.get("phone")))) return setError("Enter a 10-digit Indian mobile number.");
    if (!/^[1-9]\d{5}$/.test(String(form.get("pin")))) return setError("Enter a valid 6-digit PIN code.");
    const gstin = String(form.get("gstin") ?? "").toUpperCase();
    if (business && !/^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(gstin)) return setError("Enter a valid 15-character GSTIN.");
    setError(null);

    const str = (k: string) => String(form.get(k) ?? "").trim();
    startTransition(async () => {
      // The database recomputes prices and checks stock. Online payment (Razorpay / Cashfree) plugs in here.
      const res = await placeOrderAction({
        name: str("name"),
        phone: str("phone"),
        email: str("email"),
        address: { line1: str("line1"), line2: str("line2"), city: str("city"), state: str("state"), pin: str("pin") },
        gstin: business ? gstin : undefined,
        company: business ? str("company") : undefined,
        payment_method: pay,
        items: cart.map((l) => ({ product_id: l.productId, variant_id: l.variantId, qty: l.qty })),
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      try {
        const prev = JSON.parse(localStorage.getItem("eg-orders") ?? "[]");
        localStorage.setItem("eg-orders", JSON.stringify([{ id: res.id, total: res.total, items: cart.length, date: new Date().toISOString(), status: "Confirmed" }, ...prev]));
      } catch {}
      clear();
      setPlaced({ id: res.id, total: res.total });
      window.scrollTo({ top: 0 });
    });
  }

  if (placed) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-go text-white"><CheckIcon width={28} height={28} /></span>
        <h1 className="mt-5 font-display text-[40px] font-semibold leading-none">Order placed</h1>
        <p className="mt-3 text-ink-2">
          Order <b className="tabular">{placed.id}</b> for <b className="tabular">{formatINR(placed.total)}</b> is confirmed. We’ll send tracking details by SMS and email once it ships.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/account" className="rounded-md bg-ink px-5 py-2.5 text-sm font-medium text-white">View orders</Link>
          <Link href="/" className="rounded-md px-5 py-2.5 text-sm font-medium ring-1 ring-line">Continue shopping</Link>
        </div>
      </div>
    );
  }

  if (!ready) {
    return <div className="mx-auto mt-24 h-96 max-w-7xl animate-pulse rounded-lg bg-white px-4 ring-1 ring-line" />;
  }

  if (cart.length === 0) {
    return (
      <>
        <PageHead title="Checkout" crumbs={[{ label: "Cart", href: "/cart" }, { label: "Checkout" }]} />
        <div className="mx-auto max-w-7xl px-4">
          <div className="rounded-lg bg-white p-10 text-center ring-1 ring-line">
            <p className="font-medium">Your cart is empty, so there’s nothing to check out.</p>
            <Link href="/" className="mt-4 inline-block rounded-md bg-ink px-5 py-2.5 text-sm font-medium text-white">Start shopping</Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHead title="Checkout" crumbs={[{ label: "Cart", href: "/cart" }, { label: "Checkout" }]} />
      <form onSubmit={placeOrder} className="mx-auto grid max-w-7xl gap-6 px-4 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <fieldset className="rounded-lg bg-white p-5 ring-1 ring-line">
            <legend className="sr-only">Contact</legend>
            <h2 className="mb-4 font-display text-2xl font-semibold">Contact</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <L label="Mobile number"><input name="phone" required inputMode="numeric" maxLength={10} autoComplete="tel-national" className={field} /></L>
              <L label="Email"><input name="email" type="email" required autoComplete="email" className={field} /></L>
            </div>
          </fieldset>

          <fieldset className="rounded-lg bg-white p-5 ring-1 ring-line">
            <legend className="sr-only">Delivery address</legend>
            <h2 className="mb-4 font-display text-2xl font-semibold">Delivery address</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <L label="Full name" wide><input name="name" required autoComplete="name" className={field} /></L>
              <L label="House, building, street" wide><input name="line1" required autoComplete="address-line1" className={field} /></L>
              <L label="Area, landmark (optional)" wide><input name="line2" autoComplete="address-line2" className={field} /></L>
              <L label="City"><input name="city" required autoComplete="address-level2" className={field} /></L>
              <L label="PIN code"><input name="pin" required inputMode="numeric" maxLength={6} autoComplete="postal-code" className={field} /></L>
              <L label="State" wide>
                <select name="state" required defaultValue="" className={field}>
                  <option value="" disabled>Select state</option>
                  {states.map((s) => <option key={s}>{s}</option>)}
                </select>
              </L>
            </div>
            <label className="mt-4 flex items-center gap-2 text-sm">
              <input type="checkbox" className="accent-signal size-4" checked={business} onChange={(e) => setBusiness(e.target.checked)} />
              Buying for a business? Add GSTIN for input tax credit
            </label>
            {business ? (
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <L label="GSTIN"><input name="gstin" required maxLength={15} className={`${field} uppercase`} /></L>
                <L label="Business name"><input name="company" required autoComplete="organization" className={field} /></L>
              </div>
            ) : null}
          </fieldset>

          <fieldset className="rounded-lg bg-white p-5 ring-1 ring-line">
            <legend className="sr-only">Payment</legend>
            <h2 className="mb-4 font-display text-2xl font-semibold">Payment</h2>
            <div className="space-y-2">
              {payments.map((m) => (
                <label key={m.id} className={`flex cursor-pointer items-center gap-3 rounded-md p-3.5 ring-1 ${pay === m.id ? "bg-paper ring-ink" : "ring-line"}`}>
                  <input type="radio" name="pay" value={m.id} checked={pay === m.id} onChange={() => setPay(m.id)} className="accent-signal size-4" />
                  <span>
                    <span className="block font-medium">{m.label}</span>
                    <span className="block text-sm text-muted">{m.note}</span>
                  </span>
                </label>
              ))}
            </div>
            {pay !== "cod" ? (
              <p className="mt-3 text-sm text-muted">After you place the order we’ll send a secure payment link to your mobile and email. Your items are reserved for 24 hours.</p>
            ) : null}
          </fieldset>
        </div>

        <div className="space-y-4 lg:sticky lg:top-40 lg:self-start">
          <ul className="space-y-3 rounded-lg bg-white p-4 ring-1 ring-line">
            {cart.map((l) => (
              <li key={l.key} className="flex items-center gap-3 text-sm">
                <ProductMedia imageUrl={l.imageUrl} art={l.art} hue={l.hue} alt="" sizes="48px" className="size-12 shrink-0 rounded bg-paper p-1" />
                <span className="min-w-0 flex-1">
                  <span className="line-clamp-1">{l.name}</span>
                  <span className="text-xs text-muted">{l.variant ? `${l.variant}, ` : ""}qty {l.qty}</span>
                </span>
                <span className="font-medium tabular">{formatINR(l.price * l.qty)}</span>
              </li>
            ))}
          </ul>
          <OrderSummary cart={cart} cod={pay === "cod"}>
            {error ? <p role="alert" className="mt-4 rounded-md bg-signal/10 p-3 text-sm text-signal-ink">{error}</p> : null}
            <button type="submit" disabled={pending} className="mt-5 w-full rounded-md bg-signal py-3 font-semibold text-ink hover:bg-signal-hover disabled:opacity-60">
              {pending ? "Placing order…" : pay === "cod" ? "Place order" : `Place order (${formatINR(orderTotals(cart, false).total)})`}
            </button>
            <p className="mt-3 text-center text-xs text-muted">By placing the order you agree to our shipping and returns policy.</p>
          </OrderSummary>
        </div>
      </form>
    </>
  );
}

function L({ label, wide = false, children }: { label: string; wide?: boolean; children: React.ReactNode }) {
  return (
    <label className={`block text-sm ${wide ? "sm:col-span-2" : ""}`}>
      <span className="mb-1.5 block font-medium">{label}</span>
      {children}
    </label>
  );
}
