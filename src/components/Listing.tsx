"use client";

import { useMemo, useState } from "react";
import type { ProductSummary } from "@/lib/types";
import { discountPct } from "@/lib/format";
import { ProductGrid } from "./ProductCard";
import { CloseIcon, FilterIcon } from "./icons";

const PAGE = 48;

type Sort = "featured" | "price-asc" | "price-desc" | "discount" | "newest";

const sorts: { value: Sort; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "discount", label: "Biggest discount" },
  { value: "newest", label: "Newest first" },
];

const priceBands = [
  { label: "Under ₹1,000", min: 0, max: 999 },
  { label: "₹1,000 – ₹5,000", min: 1000, max: 5000 },
  { label: "₹5,000 – ₹20,000", min: 5000, max: 20000 },
  { label: "₹20,000 – ₹50,000", min: 20000, max: 50000 },
  { label: "Over ₹50,000", min: 50000, max: Infinity },
];

export function Listing({
  items,
  groups,
  emptyText = "No products in this list yet.",
}: {
  items: ProductSummary[];
  groups?: { key: string; label: string }[];
  emptyText?: string;
}) {
  const [sort, setSort] = useState<Sort>("featured");
  const [brandSel, setBrandSel] = useState<string[]>([]);
  const [bands, setBands] = useState<number[]>([]);
  const [inStock, setInStock] = useState(false);
  const [onSale, setOnSale] = useState(false);
  const [group, setGroup] = useState<string | null>(null);
  const [panel, setPanel] = useState(false);
  // Big categories hold hundreds of products: render a page at a time, restarting when filters change.
  const filterKey = JSON.stringify([sort, brandSel, bands, inStock, onSale, group]);
  const [paging, setPaging] = useState({ key: filterKey, count: PAGE });
  const count = paging.key === filterKey ? paging.count : PAGE;

  const brandCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of items) m.set(p.brand, (m.get(p.brand) ?? 0) + 1);
    return [...m.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  }, [items]);

  const shown = useMemo(() => {
    const out = items.filter(
      (p) =>
        (!group || p.category === group) &&
        (brandSel.length === 0 || brandSel.includes(p.brand)) &&
        (bands.length === 0 || bands.some((i) => p.price >= priceBands[i].min && p.price <= priceBands[i].max)) &&
        (!inStock || p.stock > 0) &&
        (!onSale || discountPct(p.price, p.mrp) > 0),
    );
    const stockFirst = (a: ProductSummary, b: ProductSummary) => Number(b.stock > 0) - Number(a.stock > 0);
    switch (sort) {
      case "price-asc": return out.sort((a, b) => a.price - b.price);
      case "price-desc": return out.sort((a, b) => b.price - a.price);
      case "discount": return out.sort((a, b) => discountPct(b.price, b.mrp) - discountPct(a.price, a.mrp));
      case "newest": return out.sort((a, b) => a.addedOrder - b.addedOrder);
      default: return out.sort(stockFirst);
    }
  }, [items, group, brandSel, bands, inStock, onSale, sort]);

  const active = brandSel.length + bands.length + Number(inStock) + Number(onSale);
  const reset = () => { setBrandSel([]); setBands([]); setInStock(false); setOnSale(false); };
  const toggle = <T,>(arr: T[], v: T) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const filters = (
    <div className="space-y-6 text-sm">
      <fieldset>
        <legend className="mb-2 font-semibold">Availability</legend>
        <label className="flex items-center gap-2 py-1"><input type="checkbox" className="accent-signal size-4" checked={inStock} onChange={(e) => setInStock(e.target.checked)} /> In stock only</label>
        <label className="flex items-center gap-2 py-1"><input type="checkbox" className="accent-signal size-4" checked={onSale} onChange={(e) => setOnSale(e.target.checked)} /> On sale</label>
      </fieldset>
      <fieldset>
        <legend className="mb-2 font-semibold">Price</legend>
        {priceBands.map((b, i) => (
          <label key={b.label} className="flex items-center gap-2 py-1">
            <input type="checkbox" className="accent-signal size-4" checked={bands.includes(i)} onChange={() => setBands((x) => toggle(x, i))} />
            {b.label}
          </label>
        ))}
      </fieldset>
      {brandCounts.length > 1 ? (
        <fieldset>
          <legend className="mb-2 font-semibold">Brand</legend>
          <div className="max-h-72 overflow-y-auto pr-1">
            {brandCounts.map(([b, n]) => (
              <label key={b} className="flex items-center gap-2 py-1">
                <input type="checkbox" className="accent-signal size-4" checked={brandSel.includes(b)} onChange={() => setBrandSel((x) => toggle(x, b))} />
                <span className="flex-1">{b}</span>
                <span className="text-xs text-muted tabular">{n}</span>
              </label>
            ))}
          </div>
        </fieldset>
      ) : null}
      {active > 0 ? (
        <button type="button" onClick={reset} className="font-medium text-signal-ink hover:underline">Clear all filters</button>
      ) : null}
    </div>
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
      <aside className="hidden lg:block">{filters}</aside>

      <div className="min-w-0">
        {groups && groups.length > 1 ? (
          <div className="no-scrollbar -mx-4 mb-4 flex gap-2 overflow-x-auto px-4">
            <Chip on={!group} onClick={() => setGroup(null)}>All</Chip>
            {groups.map((g) => (
              <Chip key={g.key} on={group === g.key} onClick={() => setGroup(g.key)}>{g.label}</Chip>
            ))}
          </div>
        ) : null}

        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="text-sm text-muted tabular">{shown.length} {shown.length === 1 ? "product" : "products"}</p>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setPanel(true)} className="flex h-9 items-center gap-1.5 rounded-md bg-white px-3 text-sm ring-1 ring-line lg:hidden">
              <FilterIcon /> Filters{active ? ` (${active})` : ""}
            </button>
            <label className="sr-only" htmlFor="sort">Sort by</label>
            <select id="sort" value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="h-9 rounded-md bg-white px-2 text-sm ring-1 ring-line">
              {sorts.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
        </div>

        {shown.length ? (
          <>
            <ProductGrid items={shown.slice(0, count)} layout="sidebar" />
            {shown.length > count ? (
              <div className="mt-6 text-center">
                <p className="text-sm text-muted tabular">Showing {count} of {shown.length}</p>
                <button
                  type="button"
                  onClick={() => setPaging({ key: filterKey, count: count + PAGE })}
                  className="mt-3 rounded-md bg-white px-5 py-2.5 text-sm font-medium ring-1 ring-line hover:ring-ink"
                >
                  Show {Math.min(PAGE, shown.length - count)} more
                </button>
              </div>
            ) : null}
          </>
        ) : (
          <div className="rounded-lg border border-dashed border-line bg-white p-10 text-center">
            <p className="font-medium">{items.length ? "Nothing matches these filters." : emptyText}</p>
            {active ? <button type="button" onClick={reset} className="mt-3 text-sm font-medium text-signal-ink hover:underline">Clear filters</button> : null}
          </div>
        )}
      </div>

      {panel ? (
        <div className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true" aria-label="Filters">
          <button type="button" aria-label="Close filters" className="absolute inset-0 bg-ink/50" onClick={() => setPanel(false)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-xl bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-2xl font-semibold">Filters</h2>
              <button type="button" onClick={() => setPanel(false)} aria-label="Close filters"><CloseIcon /></button>
            </div>
            {filters}
            <button type="button" onClick={() => setPanel(false)} className="mt-6 w-full rounded-md bg-ink py-3 font-medium text-white">
              Show {shown.length} products
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm ${on ? "bg-ink text-white" : "bg-white text-ink ring-1 ring-line hover:ring-ink"}`}
    >
      {children}
    </button>
  );
}
