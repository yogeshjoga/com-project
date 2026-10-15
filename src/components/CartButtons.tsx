"use client";

import Link from "next/link";
import { useShop } from "@/store/shop";
import { HeartIcon } from "./icons";
import type { ProductSummary } from "@/lib/types";

export function QuickAdd({ p }: { p: ProductSummary }) {
  const add = useShop((s) => s.add);
  if (p.stock <= 0) {
    return (
      <span className="block w-full rounded-md border border-line py-2.5 text-center text-sm text-muted">Out of stock</span>
    );
  }
  if (p.hasVariants) {
    return (
      <Link
        href={`/product/${p.slug}`}
        className="block w-full rounded-md border border-ink py-2.5 text-center text-sm font-medium text-ink hover:bg-ink hover:text-white"
      >
        Choose options
      </Link>
    );
  }
  return (
    <button
      type="button"
      onClick={() =>
        add({
          productId: p.id,
          slug: p.slug,
          name: p.name,
          brand: p.brand,
          price: p.price,
          mrp: p.mrp,
          art: p.art,
          hue: p.hue,
          imageUrl: p.imageUrl,
          maxQty: p.stock,
        })
      }
      className="block w-full rounded-md bg-ink py-2.5 text-center text-sm font-medium text-white hover:bg-ink-2 active:scale-[0.99]"
    >
      Add to cart
    </button>
  );
}

export function WishButton({ slug, className = "" }: { slug: string; className?: string }) {
  const on = useShop((s) => s.wishlist.includes(slug));
  const toggle = useShop((s) => s.toggleWish);
  return (
    <button
      type="button"
      onClick={() => toggle(slug)}
      aria-pressed={on}
      aria-label={on ? "Remove from wishlist" : "Save to wishlist"}
      className={`grid size-10 place-items-center rounded-full bg-white/90 text-ink hover:text-signal ${on ? "text-signal" : ""} ${className}`}
    >
      <HeartIcon filled={on} width={18} height={18} />
    </button>
  );
}
