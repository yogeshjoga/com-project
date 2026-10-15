"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ProductSummary } from "@/lib/types";
import { useShop } from "@/store/shop";

interface Catalog {
  items: ProductSummary[];
  categoryNames: Record<string, string>;
  /** False until the search index has arrived. */
  loaded: boolean;
  /** Starts fetching the search index (once). */
  load: () => void;
}

const Ctx = createContext<Catalog>({ items: [], categoryNames: {}, loaded: false, load: () => {} });

export function CatalogProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<{ items: ProductSummary[]; categoryNames: Record<string, string> } | null>(null);
  const started = useRef(false);

  // Cart and wishlist are restored from localStorage after hydration to keep SSR markup stable.
  useEffect(() => {
    void useShop.persist.rehydrate();
  }, []);

  const load = useCallback(() => {
    if (started.current) return;
    started.current = true;
    fetch("/api/catalog")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then(setData)
      .catch(() => {
        started.current = false; // let the next search try again
      });
  }, []);

  const value = useMemo(
    () => ({ items: data?.items ?? [], categoryNames: data?.categoryNames ?? {}, loaded: Boolean(data), load }),
    [data, load],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/** The catalog without fetching it; call `load()` when the shopper shows intent (e.g. focuses search). */
export const useCatalog = () => useContext(Ctx);

/** The catalog, fetched as soon as the calling component mounts. */
export function useCatalogNow() {
  const c = useContext(Ctx);
  useEffect(() => c.load(), [c]);
  return c;
}
