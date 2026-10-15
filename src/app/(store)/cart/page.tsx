"use client";

import Link from "next/link";
import { useHydrated, useShop } from "@/store/shop";
import { formatINR } from "@/lib/format";
import { ProductMedia } from "@/components/ProductMedia";
import { QtyStepper } from "@/components/QtyStepper";
import { OrderSummary } from "@/components/OrderSummary";
import { FreeShippingMeter } from "@/components/CartDrawer";
import { PageHead } from "@/components/PageHead";

export default function CartPage() {
  const { cart, setQty, remove, toggleWish } = useShop();
  const ready = useHydrated();

  return (
    <>
      <PageHead title="Cart" crumbs={[{ label: "Cart" }]} />
      <div className="mx-auto max-w-[110rem] px-4 lg:px-6">
        {!ready ? (
          <div className="h-64 animate-pulse rounded-lg bg-white ring-1 ring-line" />
        ) : cart.length === 0 ? (
          <div className="rounded-lg bg-white p-10 text-center ring-1 ring-line">
            <p className="font-medium">Your cart is empty.</p>
            <Link href="/deals" className="mt-4 inline-block rounded-md bg-ink px-5 py-2.5 text-sm font-medium text-white">Browse hot deals</Link>
          </div>
        ) : (
          <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[1fr_22.5rem]">
            <div className="space-y-4">
              <div className="rounded-lg bg-white p-4 ring-1 ring-line">
                <FreeShippingMeter subtotal={cart.reduce((n, l) => n + l.price * l.qty, 0)} />
              </div>
              <ul className="divide-y divide-line rounded-lg bg-white ring-1 ring-line">
                {cart.map((l) => (
                  <li key={l.key} className="flex gap-4 p-4">
                    <Link href={`/product/${l.slug}`} className="shrink-0">
                      <ProductMedia imageUrl={l.imageUrl} art={l.art} hue={l.hue} alt={l.name} sizes="96px" className="size-24 rounded-md bg-paper p-2" />
                    </Link>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-muted">{l.brand}</p>
                      <Link href={`/product/${l.slug}`} className="font-medium hover:text-signal-ink">{l.name}</Link>
                      {l.variant ? <p className="text-sm text-muted">{l.variant}</p> : null}
                      <p className="mt-1 text-sm tabular">{formatINR(l.price)} each</p>
                      <div className="mt-3 flex flex-wrap items-center gap-4">
                        <QtyStepper value={l.qty} max={l.maxQty} onChange={(n) => setQty(l.key, n)} small />
                        <button type="button" onClick={() => { toggleWish(l.slug); remove(l.key); }} className="py-2 text-sm text-muted hover:text-ink">Save for later</button>
                        <button type="button" onClick={() => remove(l.key)} className="py-2 text-sm text-muted hover:text-signal-ink">Remove</button>
                      </div>
                    </div>
                    <p className="shrink-0 font-semibold tabular">{formatINR(l.price * l.qty)}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div className="lg:sticky lg:top-40 lg:self-start">
              <OrderSummary cart={cart}>
                <Link href="/checkout" className="mt-5 block rounded-md bg-signal py-3 text-center font-semibold text-ink hover:bg-signal-hover">
                  Checkout
                </Link>
                <Link href="/" className="mt-2 block py-2 text-center text-sm text-muted hover:text-ink">Continue shopping</Link>
              </OrderSummary>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
