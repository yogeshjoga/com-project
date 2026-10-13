import Link from "next/link";
import type { ProductSummary } from "@/lib/types";
import { discountPct } from "@/lib/format";
import { ProductMedia } from "./ProductMedia";
import { Price } from "./Price";
import { QuickAdd, WishButton } from "./CartButtons";

export function StockNote({ stock }: { stock: number }) {
  if (stock <= 0) return <span className="text-[13px] text-muted">Out of stock</span>;
  if (stock <= 5) return <span className="text-[13px] font-medium text-warn">Only {stock} left</span>;
  return <span className="text-[13px] text-go">In stock</span>;
}

export function ProductCard({ p }: { p: ProductSummary }) {
  const off = discountPct(p.price, p.mrp);
  return (
    <article className="group relative flex h-full flex-col rounded-lg border border-line bg-surface p-3 transition-colors hover:border-ink/40">
      <div className="relative mb-3 aspect-[4/3] overflow-hidden rounded-md bg-paper">
        <Link href={`/product/${p.slug}`} tabIndex={-1} aria-hidden="true">
          <ProductMedia imageUrl={p.imageUrl} art={p.art} hue={p.hue} alt={p.name} className="size-full p-3 transition-transform duration-300 group-hover:scale-[1.04]" />
        </Link>
        <div className="absolute left-2 top-2 flex flex-col items-start gap-1">
          {off >= 5 && !p.maxPrice ? (
            <span className="rounded bg-signal px-1.5 py-0.5 text-xs font-semibold text-ink">−{off}%</span>
          ) : null}
          {p.tags.includes("new") ? (
            <span className="rounded bg-ink px-1.5 py-0.5 text-xs font-medium text-white">New</span>
          ) : null}
          {p.tags.includes("made-in-india") ? (
            <span className="rounded bg-white px-1.5 py-0.5 text-xs font-medium text-ink ring-1 ring-line">Made in India</span>
          ) : null}
        </div>
        <WishButton slug={p.slug} className="absolute right-2 top-2" />
      </div>
      <p className="text-xs text-muted">{p.brand}</p>
      <h3 className="mt-0.5 line-clamp-2 min-h-[2.6em] text-sm font-medium leading-snug">
        <Link href={`/product/${p.slug}`} className="hover:text-signal-ink">
          {p.name}
        </Link>
      </h3>
      <div className="mt-2">
        <Price price={p.price} mrp={p.mrp} maxPrice={p.maxPrice} />
      </div>
      <div className="mb-3 mt-1">
        <StockNote stock={p.stock} />
      </div>
      <div className="mt-auto">
        <QuickAdd p={p} />
      </div>
    </article>
  );
}

export function ProductGrid({ items }: { items: ProductSummary[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {items.map((p) => (
        <ProductCard key={p.id} p={p} />
      ))}
    </div>
  );
}

export function ProductRail({ items }: { items: ProductSummary[] }) {
  return (
    <div className="no-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2">
      {items.map((p) => (
        <div key={p.id} className="w-[46%] shrink-0 snap-start sm:w-[30%] lg:w-[19%]">
          <ProductCard p={p} />
        </div>
      ))}
    </div>
  );
}
