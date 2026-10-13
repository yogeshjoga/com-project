"use client";

import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ArtKind } from "@/lib/types";

export interface CartLine {
  key: string;
  productId: string;
  slug: string;
  name: string;
  brand: string;
  variant?: string;
  variantId?: string;
  imageUrl?: string;
  price: number;
  mrp?: number;
  art: ArtKind;
  hue: number;
  qty: number;
  maxQty: number;
}

interface ShopState {
  cart: CartLine[];
  wishlist: string[];
  drawerOpen: boolean;
  lastAdded?: string;
  add: (line: Omit<CartLine, "key" | "qty">, qty?: number) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  toggleWish: (slug: string) => void;
  openDrawer: (open: boolean) => void;
}

export const useShop = create<ShopState>()(
  persist(
    (set) => ({
      cart: [],
      wishlist: [],
      drawerOpen: false,
      add: (line, qty = 1) =>
        set((s) => {
          const key = `${line.productId}:${line.variant ?? ""}`;
          const existing = s.cart.find((l) => l.key === key);
          const cart = existing
            ? s.cart.map((l) => (l.key === key ? { ...l, qty: Math.min(l.qty + qty, l.maxQty) } : l))
            : [...s.cart, { ...line, key, qty: Math.min(qty, line.maxQty) }];
          return { cart, drawerOpen: true, lastAdded: key };
        }),
      setQty: (key, qty) =>
        set((s) => ({
          cart: s.cart.map((l) => (l.key === key ? { ...l, qty: Math.max(1, Math.min(qty, l.maxQty)) } : l)),
        })),
      remove: (key) => set((s) => ({ cart: s.cart.filter((l) => l.key !== key) })),
      clear: () => set({ cart: [] }),
      toggleWish: (slug) =>
        set((s) => ({
          wishlist: s.wishlist.includes(slug) ? s.wishlist.filter((x) => x !== slug) : [...s.wishlist, slug],
        })),
      openDrawer: (open) => set({ drawerOpen: open }),
    }),
    {
      name: "eg-shop",
      version: 2,
      // v1 carts held sample IDs that the database can't match; keep the wishlist, drop the cart.
      migrate: (persisted) => ({ cart: [], wishlist: (persisted as { wishlist?: string[] })?.wishlist ?? [] }) as unknown as ShopState,
      skipHydration: true,
      partialize: (s) => ({ cart: s.cart, wishlist: s.wishlist }),
    },
  ),
);

export function cartTotals(cart: CartLine[]) {
  let subtotal = 0;
  let mrpTotal = 0;
  let count = 0;
  for (const l of cart) {
    subtotal += l.price * l.qty;
    mrpTotal += (l.mrp ?? l.price) * l.qty;
    count += l.qty;
  }
  return { subtotal, savings: mrpTotal - subtotal, count };
}

/** False until the cart and wishlist have been restored from localStorage. */
export function useHydrated() {
  return useSyncExternalStore(
    (cb) => useShop.persist.onFinishHydration(cb),
    () => useShop.persist.hasHydrated(),
    () => false,
  );
}
