"use client";

import Link from "next/link";
import { useHydrated, useShop } from "@/store/shop";
import { useCatalogNow } from "@/components/CatalogProvider";
import { PageHead } from "@/components/PageHead";
import { ProductGrid } from "@/components/ProductCard";

export default function WishlistPage() {
  const wishlist = useShop((s) => s.wishlist);
  const ready = useHydrated();
  const { items, loaded } = useCatalogNow();
  const saved = items.filter((p) => wishlist.includes(p.slug));

  return (
    <>
      <PageHead title="Wishlist" crumbs={[{ label: "Wishlist" }]} />
      <div className="mx-auto max-w-[110rem] px-4 lg:px-6">
        {!ready || (wishlist.length > 0 && !loaded) ? (
          <div className="h-64 animate-pulse rounded-lg bg-white ring-1 ring-line" />
        ) : saved.length ? (
          <ProductGrid items={saved} />
        ) : (
          <div className="rounded-lg bg-white p-10 text-center ring-1 ring-line">
            <p className="font-medium">Nothing saved yet.</p>
            <p className="mt-1 text-sm text-muted">Tap the heart on any product to keep it here.</p>
            <Link href="/new" className="mt-4 inline-block rounded-md bg-ink px-5 py-2.5 text-sm font-medium text-white">See what just landed</Link>
          </div>
        )}
      </div>
    </>
  );
}
