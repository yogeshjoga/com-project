"use client";

import { createContext, useContext, useEffect } from "react";
import type { ProductSummary } from "@/lib/types";
import { useShop } from "@/store/shop";

interface Catalog {
  items: ProductSummary[];
  categoryNames: Record<string, string>;
}

const Ctx = createContext<Catalog>({ items: [], categoryNames: {} });

export function CatalogProvider({ value, children }: { value: Catalog; children: React.ReactNode }) {
  // Cart and wishlist are restored from localStorage after hydration to keep SSR markup stable.
  useEffect(() => {
    void useShop.persist.rehydrate();
  }, []);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useCatalog = () => useContext(Ctx);
