"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { Product } from "@/lib/types";
import { brand } from "@/config/brand";
import { formatINR } from "@/lib/format";
import { useShop } from "@/store/shop";
import { Price } from "./Price";
import { QtyStepper } from "./QtyStepper";
import { WishButton } from "./CartButtons";
import { StockNote } from "./ProductCard";
import { TruckIcon } from "./icons";

type Buyable = Pick<Product, "id" | "slug" | "name" | "brand" | "price" | "mrp" | "stock" | "art" | "hue" | "variant" | "imageUrl">;

export function BuyBox({ p }: { p: Buyable }) {
  const opts = p.variant?.options;
  const firstAvailable = opts ? Math.max(0, opts.findIndex((o) => o.stock > 0)) : 0;
  const [vi, setVi] = useState(firstAvailable);
  const [qty, setQty] = useState(1);
  const add = useShop((s) => s.add);
  const router = useRouter();

  const actionsRef = useRef<HTMLDivElement>(null);
  const [barOn, setBarOn] = useState(false);

  // On phones the buy buttons scroll away; a bar pinned to the bottom keeps the price and
  // "Add to cart" in reach until they're back in view.
  useEffect(() => {
    const el = actionsRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => setBarOn(!e.isIntersecting), { rootMargin: "0px 0px -64px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    document.body.toggleAttribute("data-sticky-bar", barOn);
    return () => document.body.removeAttribute("data-sticky-bar");
  }, [barOn]);

  const opt = opts?.[vi];
  const price = opt?.price ?? p.price;
  const mrp = opt ? opt.mrp : p.mrp;
  const stock = opt?.stock ?? p.stock;

  function addToCart(buyNow = false) {
    add(
      {
        productId: p.id,
        slug: p.slug,
        name: p.name,
        brand: p.brand,
        variant: opt?.label,
        variantId: opt?.id,
        imageUrl: p.imageUrl,
        price,
        mrp,
        art: p.art,
        hue: p.hue,
        maxQty: stock,
      },
      qty,
    );
    if (buyNow) {
      useShop.getState().openDrawer(false);
      router.push("/checkout");
    }
  }

  return (
    <div className="space-y-5">
      <Price price={price} mrp={mrp} size="lg" />

      {opts && p.variant ? (
        <fieldset>
          <legend className="mb-2 text-sm font-semibold">
            {p.variant.name}: <span className="font-normal">{opt?.label}</span>
          </legend>
          <div className="flex flex-wrap gap-2">
            {opts.map((o, i) => (
              <button
                key={o.label}
                type="button"
                onClick={() => { setVi(i); setQty(1); }}
                aria-pressed={i === vi}
                disabled={o.stock <= 0}
                className={`rounded-md px-3.5 py-2 text-left text-sm ring-1 disabled:cursor-not-allowed disabled:opacity-40 ${
                  i === vi ? "bg-ink text-white ring-ink" : "bg-white ring-line hover:ring-ink"
                }`}
              >
                <span className="block font-medium">{o.label}</span>
                <span className={`block text-xs tabular ${i === vi ? "text-white/70" : "text-muted"}`}>
                  {o.stock > 0 ? formatINR(o.price) : "Out of stock"}
                </span>
              </button>
            ))}
          </div>
        </fieldset>
      ) : null}

      <StockNote stock={stock} />

      {stock > 0 ? (
        <div ref={actionsRef} className="flex flex-wrap items-center gap-3">
          <QtyStepper value={qty} max={stock} onChange={setQty} />
          <button type="button" onClick={() => addToCart()} className="h-11 min-w-[8.5rem] flex-1 whitespace-nowrap rounded-md bg-ink px-6 font-medium text-white hover:bg-ink-2">
            Add to cart
          </button>
          <button type="button" onClick={() => addToCart(true)} className="h-11 min-w-[8.5rem] flex-1 whitespace-nowrap rounded-md bg-signal px-6 font-semibold text-ink hover:bg-signal-hover">
            Buy now
          </button>
          <WishButton slug={p.slug} className="ring-1 ring-line" />
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <a
            href={
              brand.whatsapp
                ? `https://wa.me/${brand.whatsapp}?text=${encodeURIComponent(`Please notify me when ${p.name} is back in stock.`)}`
                : `mailto:${brand.supportEmail}?subject=${encodeURIComponent(`Restock request: ${p.name}`)}`
            }
            target="_blank"
            rel="noopener"
            className="h-11 flex-1 rounded-md bg-ink px-6 text-center font-medium leading-[44px] text-white"
          >
            Notify me when it’s back
          </a>
          <WishButton slug={p.slug} className="ring-1 ring-line" />
        </div>
      )}

      <DeliveryCheck />

      {stock > 0 && barOn ? (
        <div className="fixed inset-x-0 bottom-0 z-30 flex items-center gap-3 border-t border-line bg-white px-4 pb-[calc(0.625rem+env(safe-area-inset-bottom))] pt-2.5 shadow-[0_-4px_16px_rgba(14,42,73,0.08)] md:hidden">
          <div className="min-w-0 flex-1 leading-tight">
            <p className="text-lg font-semibold tabular">{formatINR(price)}</p>
            {opt ? <p className="truncate text-xs text-muted">{opt.label}</p> : null}
          </div>
          <button
            type="button"
            onClick={() => (opts ? actionsRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }) : addToCart())}
            className="h-11 shrink-0 rounded-md bg-ink px-6 font-medium text-white active:bg-ink-2"
          >
            {opts ? "Choose option" : "Add to cart"}
          </button>
        </div>
      ) : null}
    </div>
  );
}

function DeliveryCheck() {
  const [pin, setPin] = useState("");
  const [result, setResult] = useState<string | null>(null);

  function check(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[1-9]\d{5}$/.test(pin)) {
      setResult("Enter a valid 6-digit PIN code.");
      return;
    }
    // Rough zone estimate from the first PIN digit; replace with a courier serviceability API.
    const days = { "4": 2, "1": 4, "7": 5, "9": 5 }[pin[0]] ?? 3;
    const eta = new Date(Date.now() + (days + 1) * 86400000);
    setResult(`Delivery by ${eta.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}. Cash on delivery available.`);
  }

  return (
    <form onSubmit={check} className="rounded-md bg-paper p-4">
      <label htmlFor="pin" className="flex items-center gap-2 text-sm font-semibold">
        <TruckIcon width={18} height={18} /> Check delivery
      </label>
      <div className="mt-2 flex gap-2">
        <input
          id="pin"
          inputMode="numeric"
          maxLength={6}
          value={pin}
          onChange={(e) => { setPin(e.target.value.replace(/\D/g, "")); setResult(null); }}
          placeholder="PIN code"
          className="h-10 w-36 rounded-md bg-white px-3 text-sm ring-1 ring-line focus:ring-2 focus:ring-signal focus:outline-none"
        />
        <button type="submit" className="h-10 rounded-md px-4 text-sm font-medium ring-1 ring-ink hover:bg-ink hover:text-white">Check</button>
      </div>
      {result ? <p className="mt-2 text-sm" aria-live="polite">{result}</p> : null}
    </form>
  );
}
