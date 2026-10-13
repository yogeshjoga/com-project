"use client";

import { brand } from "@/config/brand";
import { formatINR, gstIncluded } from "@/lib/format";
import { cartTotals, type CartLine } from "@/store/shop";

export function orderTotals(cart: CartLine[], cod = false) {
  const t = cartTotals(cart);
  const shipping = t.subtotal === 0 || t.subtotal >= brand.freeShippingAbove ? 0 : brand.shippingFee;
  const codFee = cod ? brand.codFee : 0;
  const total = t.subtotal + shipping + codFee;
  return { ...t, shipping, codFee, total, gst: gstIncluded(t.subtotal) };
}

export function OrderSummary({ cart, cod = false, children }: { cart: CartLine[]; cod?: boolean; children?: React.ReactNode }) {
  const t = orderTotals(cart, cod);
  return (
    <div className="rounded-lg bg-white p-5 ring-1 ring-line">
      <h2 className="font-display text-2xl font-semibold">Order summary</h2>
      <dl className="mt-4 space-y-2 text-sm tabular">
        <Row k={`Items (${t.count})`} v={formatINR(t.subtotal + t.savings)} />
        {t.savings > 0 ? <Row k="Discount" v={`− ${formatINR(t.savings)}`} className="text-go" /> : null}
        <Row k="Shipping" v={t.shipping ? formatINR(t.shipping) : "Free"} />
        {cod ? <Row k="Cash on delivery fee" v={formatINR(t.codFee)} /> : null}
        <div className="flex justify-between border-t border-line pt-3 text-base font-semibold">
          <dt>Total</dt>
          <dd>{formatINR(t.total)}</dd>
        </div>
        <Row k="Includes GST" v={formatINR(t.gst)} className="text-muted" />
      </dl>
      {children}
    </div>
  );
}

function Row({ k, v, className = "" }: { k: string; v: string; className?: string }) {
  return (
    <div className={`flex justify-between ${className}`}>
      <dt>{k}</dt>
      <dd>{v}</dd>
    </div>
  );
}
