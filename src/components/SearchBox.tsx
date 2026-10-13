"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { buildIndex, searchIndex } from "@/lib/search";
import { formatINR } from "@/lib/format";
import type { ProductSummary } from "@/lib/types";
import { ProductMedia } from "./ProductMedia";
import { SearchIcon } from "./icons";
import { useCatalog } from "./CatalogProvider";

export function SearchBox({ autoFocus = false, onDone }: { autoFocus?: boolean; onDone?: () => void }) {
  const { items, categoryNames } = useCatalog();
  const index = useMemo(() => buildIndex(items, categoryNames), [items, categoryNames]);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const router = useRouter();
  const listId = useId();
  const wrap = useRef<HTMLDivElement>(null);
  // True once the user arrows through results; Enter then opens that product instead of the results page.
  const [touched, setTouched] = useState(false);

  const results: ProductSummary[] = useMemo(() => searchIndex(index, q, 8), [index, q]);

  // Close the dropdown when the page holding it is hidden by a navigation.
  useLayoutEffect(() => () => setOpen(false), []);

  function go(href: string) {
    setOpen(false);
    setQ("");
    onDone?.();
    router.push(href);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (open && touched && results[active]) {
      go(`/product/${results[active].slug}`);
      return;
    }
    if (q.trim()) go(`/search?q=${encodeURIComponent(q.trim())}`);
  }

  return (
    <div ref={wrap} className="relative w-full" onBlur={(e) => !wrap.current?.contains(e.relatedTarget) && setOpen(false)}>
      <form role="search" onSubmit={submit} className="flex h-11 items-center rounded-md bg-white ring-1 ring-line focus-within:ring-2 focus-within:ring-signal">
        <SearchIcon className="ml-3 shrink-0 text-muted" width={18} height={18} />
        <input
          type="search"
          value={q}
          autoFocus={autoFocus}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
            setActive(0);
            setTouched(false);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") { e.preventDefault(); setTouched(true); setActive((a) => Math.min(a + 1, results.length - 1)); }
            if (e.key === "ArrowUp") { e.preventDefault(); setTouched(true); setActive((a) => Math.max(a - 1, 0)); }
            if (e.key === "Escape") setOpen(false);
          }}
          placeholder="Search goggles, motors, ESP32, 6S LiPo…"
          aria-label="Search products"
          role="combobox"
          aria-expanded={open && results.length > 0}
          aria-controls={listId}
          aria-autocomplete="list"
          className="h-full w-full min-w-0 bg-transparent px-2.5 text-[15px] text-ink outline-none placeholder:text-muted"
        />
        <button type="submit" className="mr-1 h-9 shrink-0 rounded bg-signal px-4 text-sm font-semibold text-ink hover:bg-signal-hover">
          Search
        </button>
      </form>

      {open && q.trim() ? (
        <div id={listId} role="listbox" className="absolute inset-x-0 top-full z-50 mt-1 overflow-hidden rounded-md bg-white text-ink shadow-xl ring-1 ring-line">
          {results.length === 0 ? (
            <p className="px-4 py-3 text-sm text-muted">No products match “{q}”. Try a brand or part type, like “ELRS receiver”.</p>
          ) : (
            <>
              {results.map((p, i) => (
                <Link
                  key={p.id}
                  href={`/product/${p.slug}`}
                  role="option"
                  aria-selected={i === active && touched}
                  onClick={(e) => { e.preventDefault(); go(`/product/${p.slug}`); }}
                  onMouseEnter={() => setActive(i)}
                  className={`flex items-center gap-3 px-3 py-2 ${i === active ? "bg-paper" : ""}`}
                >
                  <ProductMedia imageUrl={p.imageUrl} art={p.art} hue={p.hue} alt="" sizes="44px" className="size-11 shrink-0 rounded bg-paper p-1" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm">{p.name}</span>
                    <span className="block text-xs text-muted">{p.brand}</span>
                  </span>
                  <span className="shrink-0 text-sm font-semibold tabular">{formatINR(p.price)}</span>
                </Link>
              ))}
              <button
                type="button"
                onClick={() => go(`/search?q=${encodeURIComponent(q.trim())}`)}
                className="block w-full border-t border-line px-3 py-2.5 text-left text-sm font-medium text-signal-ink hover:bg-paper"
              >
                See all results for “{q.trim()}”
              </button>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
