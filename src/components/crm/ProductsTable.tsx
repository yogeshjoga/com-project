"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { categories, categoryBySlug } from "@/data/categories";
import { formatINR } from "@/lib/format";
import { deleteProduct, setPublished, setStock } from "@/app/(crm)/shop/actions";
import { inputCls } from "./ui";

export interface AdminProductRow {
  id: string;
  sku: string;
  slug: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  stock: number;
  low_stock_at: number;
  is_published: boolean;
  variant_name: string | null;
  image_url: string | null;
  shop_product_variants: { id: string; label: string; price: number; stock: number; sort: number }[];
}

const totalStock = (r: AdminProductRow) =>
  r.variant_name ? r.shop_product_variants.reduce((n, v) => n + v.stock, 0) : r.stock;

const filters = [
  { key: "all", label: "All" },
  { key: "low", label: "Low stock" },
  { key: "out", label: "Out of stock" },
  { key: "hidden", label: "Hidden" },
];

export function ProductsTable({ rows, initialFilter }: { rows: AdminProductRow[]; initialFilter: string }) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState(filters.some((f) => f.key === initialFilter) ? initialFilter : "all");
  const [cat, setCat] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const shown = useMemo(() => {
    const words = q.toLowerCase().split(/\s+/).filter(Boolean);
    return rows.filter((r) => {
      const hay = `${r.name} ${r.brand} ${r.sku}`.toLowerCase();
      if (words.some((w) => !hay.includes(w))) return false;
      if (cat && r.category !== cat) return false;
      const s = totalStock(r);
      if (filter === "low") return r.is_published && s <= r.low_stock_at;
      if (filter === "out") return s === 0;
      if (filter === "hidden") return !r.is_published;
      return true;
    });
  }, [rows, q, cat, filter]);

  function notify(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2500);
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, brand or SKU" aria-label="Search products" className={`${inputCls} max-w-xs`} />
        <select value={cat} onChange={(e) => setCat(e.target.value)} aria-label="Category" className={`${inputCls} w-auto`}>
          <option value="">All categories</option>
          {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
        </select>
        <div className="flex gap-1" role="group" aria-label="Filter">
          {filters.map((f) => (
            <button
              key={f.key}
              type="button"
              aria-pressed={filter === f.key}
              onClick={() => setFilter(f.key)}
              className={`rounded-full px-3 py-1.5 text-sm ${filter === f.key ? "bg-ink text-white" : "bg-white ring-1 ring-line hover:ring-ink"}`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <span className="ml-auto text-sm text-muted tabular">{shown.length} of {rows.length}</span>
      </div>

      <div className="overflow-x-auto rounded-lg bg-white ring-1 ring-line">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="border-b border-line text-left text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-3 py-3 font-medium">Category</th>
              <th className="px-3 py-3 text-right font-medium">Price</th>
              <th className="px-3 py-3 font-medium">Stock</th>
              <th className="px-3 py-3 font-medium">On store</th>
              <th className="px-4 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {shown.map((r) => <Row key={r.id} r={r} notify={notify} />)}
          </tbody>
        </table>
        {shown.length === 0 ? <p className="p-8 text-center text-sm text-muted">No products match. Clear the search or pick another filter.</p> : null}
      </div>

      {toast ? (
        <div role="status" className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-md bg-ink px-4 py-2.5 text-sm text-white shadow-lg">{toast}</div>
      ) : null}
    </div>
  );
}

function Row({ r, notify }: { r: AdminProductRow; notify: (m: string) => void }) {
  const [pending, start] = useTransition();
  const router = useRouter();
  const variants = r.variant_name ? [...r.shop_product_variants].sort((a, b) => a.sort - b.sort) : [];
  const s = totalStock(r);

  function run(fn: () => Promise<{ ok: boolean; error?: string }>, okMsg: string) {
    start(async () => {
      const res = await fn();
      if (!res.ok) notify(res.error ?? "Something went wrong.");
      else {
        notify(okMsg);
        router.refresh();
      }
    });
  }

  return (
    <tr className={`align-top ${pending ? "opacity-60" : ""}`}>
      <td className="px-4 py-3">
        <Link href={`/shop/products/${r.id}`} className="font-medium hover:underline">{r.name}</Link>
        <p className="text-xs text-muted">{r.brand}, SKU {r.sku}</p>
      </td>
      <td className="px-3 py-3 text-muted">{categoryBySlug.get(r.category)?.name ?? r.category}</td>
      <td className="px-3 py-3 text-right tabular">{formatINR(variants.length ? Math.min(...variants.map((v) => v.price)) : r.price)}</td>
      <td className="px-3 py-3">
        {variants.length ? (
          <div className="space-y-1.5">
            {variants.map((v) => (
              <StockInput key={v.id} label={v.label} value={v.stock} low={r.low_stock_at}
                onSave={(n) => run(() => setStock({ variantId: v.id }, n), `${r.name} (${v.label}): stock set to ${n}`)} />
            ))}
          </div>
        ) : (
          <StockInput value={r.stock} low={r.low_stock_at} onSave={(n) => run(() => setStock({ productId: r.id }, n), `${r.name}: stock set to ${n}`)} />
        )}
        {s === 0 ? <p className="mt-1 text-xs font-medium text-danger">Out of stock</p> : s <= r.low_stock_at ? <p className="mt-1 text-xs font-medium text-warn">Low stock</p> : null}
      </td>
      <td className="px-3 py-3">
        <label className="inline-flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            className="peer sr-only"
            checked={r.is_published}
            onChange={(e) => run(() => setPublished(r.id, e.target.checked), e.target.checked ? `${r.name} is live on the store` : `${r.name} is hidden from the store`)}
          />
          <span className="relative h-5 w-9 rounded-full bg-line transition-colors after:absolute after:left-0.5 after:top-0.5 after:size-4 after:rounded-full after:bg-white after:transition-transform peer-checked:bg-go peer-checked:after:translate-x-4 peer-focus-visible:outline-2 peer-focus-visible:outline-signal" />
          <span className="text-xs text-muted">{r.is_published ? "Live" : "Hidden"}</span>
        </label>
      </td>
      <td className="whitespace-nowrap px-4 py-3 text-right">
        <Link href={`/shop/products/${r.id}`} className="text-signal-ink hover:underline">Edit</Link>
        <a href={`/product/${r.slug}`} target="_blank" rel="noopener" className="ml-3 text-muted hover:text-ink">View</a>
        <button
          type="button"
          onClick={() => {
            if (window.confirm(`Delete “${r.name}” permanently? Past orders keep their line items. To take it off the store for now, use the On store switch instead.`)) {
              run(() => deleteProduct(r.id), `${r.name} deleted`);
            }
          }}
          className="ml-3 text-danger hover:underline"
        >
          Delete
        </button>
      </td>
    </tr>
  );
}

function StockInput({ value, low, label, onSave }: { value: number; low: number; label?: string; onSave: (n: number) => void }) {
  const [v, setV] = useState(String(value));
  const dirty = v !== String(value);
  const save = () => {
    const n = Number(v);
    if (!dirty) return;
    if (!Number.isInteger(n) || n < 0) {
      setV(String(value));
      return;
    }
    onSave(n);
  };
  return (
    <label className="flex items-center gap-2">
      <input
        value={v}
        inputMode="numeric"
        onChange={(e) => setV(e.target.value.replace(/\D/g, ""))}
        onBlur={save}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
          if (e.key === "Escape") setV(String(value));
        }}
        aria-label={label ? `Stock for ${label}` : "Stock"}
        className={`h-8 w-16 rounded-md px-2 text-right tabular ring-1 focus:outline-none focus:ring-2 focus:ring-signal ${dirty ? "bg-[#fdf6e3] ring-signal" : value <= low ? "ring-warn/60" : "ring-line"}`}
      />
      {label ? <span className="text-xs text-muted">{label}</span> : null}
    </label>
  );
}
