"use client";

import Link from "next/link";
import { useEffect } from "react";
import { brand } from "@/config/brand";
import { formatINR } from "@/lib/format";
import { cartTotals, useShop } from "@/store/shop";
import { ProductMedia } from "./ProductMedia";
import { QtyStepper } from "./QtyStepper";
import { CloseIcon, TrashIcon } from "./icons";

export function FreeShippingMeter({ subtotal }: { subtotal: number }) {
  const left = brand.freeShippingAbove - subtotal;
  const pct = Math.min(100, (subtotal / brand.freeShippingAbove) * 100);
  return (
    <div>
      <p className="text-sm">
        {left > 0 ? (
          <>Add <b className="tabular">{formatINR(left)}</b> more for free shipping.</>
        ) : (
          <span className="font-medium text-go">Your order ships free.</span>
        )}
      </p>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-line" aria-hidden="true">
        <div className={`h-full rounded-full ${left > 0 ? "bg-signal" : "bg-go"}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function CartDrawer() {
  const { cart, drawerOpen, openDrawer, setQty, remove, lastAdded } = useShop();
  const { subtotal, count } = cartTotals(cart);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && openDrawer(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen, openDrawer]);

  if (!drawerOpen) return null;
  const close = () => openDrawer(false);

  return (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label="Cart">
      <button type="button" aria-label="Close cart" className="absolute inset-0 bg-ink/50" onClick={close} />
      <aside className="drawer-in absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="font-display text-2xl font-semibold">Your cart <span className="text-muted tabular">({count})</span></h2>
          <button type="button" onClick={close} aria-label="Close cart" className="rounded p-1 hover:bg-paper"><CloseIcon /></button>
        </div>

        {cart.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <p className="font-medium">Your cart is empty.</p>
            <p className="text-sm text-muted">Start with hot deals or search for a part.</p>
            <Link href="/deals" onNavigate={close} className="mt-2 rounded-md bg-ink px-5 py-2.5 text-sm font-medium text-white">Browse hot deals</Link>
          </div>
        ) : (
          <>
            <div className="border-b border-line px-5 py-3">
              <FreeShippingMeter subtotal={subtotal} />
            </div>
            <ul className="flex-1 divide-y divide-line overflow-y-auto px-5">
              {cart.map((l) => (
                <li key={l.key} className={`flex gap-3 py-4 ${l.key === lastAdded ? "bg-paper/60" : ""}`}>
                  <Link href={`/product/${l.slug}`} onNavigate={close} className="shrink-0">
                    <ProductMedia imageUrl={l.imageUrl} art={l.art} hue={l.hue} alt={l.name} sizes="80px" className="size-20 rounded-md bg-paper p-1.5" />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link href={`/product/${l.slug}`} onNavigate={close} className="line-clamp-2 text-sm font-medium hover:text-signal-ink">
                      {l.name}
                    </Link>
                    {l.variant ? <p className="text-xs text-muted">{l.variant}</p> : null}
                    <div className="mt-2 flex items-center justify-between">
                      <QtyStepper value={l.qty} max={l.maxQty} onChange={(n) => setQty(l.key, n)} small />
                      <span className="text-sm font-semibold tabular">{formatINR(l.price * l.qty)}</span>
                    </div>
                  </div>
                  <button type="button" onClick={() => remove(l.key)} aria-label={`Remove ${l.name}`} className="self-start rounded p-1 text-muted hover:text-signal-ink">
                    <TrashIcon />
                  </button>
                </li>
              ))}
            </ul>
            <div className="border-t border-line px-5 py-4">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-muted">Subtotal (inc. GST)</span>
                <span className="text-xl font-semibold tabular">{formatINR(subtotal)}</span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Link href="/cart" onNavigate={close} className="rounded-md border border-ink py-3 text-center text-sm font-medium">View cart</Link>
                <Link href="/checkout" onNavigate={close} className="rounded-md bg-signal py-3 text-center text-sm font-semibold text-ink hover:bg-signal-hover">Checkout</Link>
              </div>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
