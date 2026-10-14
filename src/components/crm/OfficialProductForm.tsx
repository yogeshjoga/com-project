"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { categories, departments } from "@/data/categories";
import type { ArtKind } from "@/lib/types";
import { ProductMedia } from "@/components/ProductMedia";
import { saveOfficialProduct, type OfficialEdit } from "@/app/(crm)/shop/actions";
import { inputCls } from "./ui";

const TAGS = [
  { key: "hot", label: "Hot deal" },
  { key: "new", label: "New arrival" },
  { key: "bestseller", label: "Bestseller" },
  { key: "made-in-india", label: "Made in India" },
];

export interface OfficialProduct {
  id: string;
  name: string;
  brand: string;
  sku: string;
  art: ArtKind;
  images: string[];
  descriptionHtml: string | null;
  sourceUrl: string | null;
  sourcePrice: number | null;
  sourceCurrency: string | null;
  syncedAt: string | null;
  variantName: string | null;
  variants: { id: string; label: string; sku: string | null; price: number; mrp: number | null; stock: number }[];
}

const num = (s: string) => s.replace(/\D/g, "");

export function OfficialProductForm({ product, initial }: { product: OfficialProduct; initial: OfficialEdit }) {
  const router = useRouter();
  const [f, setF] = useState<OfficialEdit>(initial);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();
  const hasVariants = Boolean(product.variants.length);
  const set = <K extends keyof OfficialEdit>(k: K, v: OfficialEdit[K]) => { setMsg(null); setF((x) => ({ ...x, [k]: v })); };
  const setVar = (id: string, patch: Partial<NonNullable<OfficialEdit["variants"]>[number]>) =>
    set("variants", (f.variants ?? []).map((v) => (v.id === id ? { ...v, ...patch } : v)));

  function save(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      const res = await saveOfficialProduct(f);
      setMsg(res.ok ? { ok: true, text: f.is_published ? "Saved. It’s live on the store within seconds." : "Saved as a hidden draft." } : { ok: false, text: res.error });
      if (res.ok) router.refresh();
    });
  }

  const ref = product.sourcePrice ? `${product.sourceCurrency === "INR" ? "₹" : product.sourceCurrency === "USD" ? "$" : ""}${product.sourcePrice} ${product.sourceCurrency ?? ""}` : null;

  return (
    <form onSubmit={save} className="grid gap-4 lg:grid-cols-[1fr_340px]">
      <div className="space-y-4">
        <section className="rounded-lg bg-white p-5 ring-1 ring-line">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-semibold">Price & stock</h2>
            {ref ? <p className="text-sm text-muted">Brand’s list price: <b className="text-ink tabular">{ref}</b></p> : null}
          </div>
          <p className="mt-1 text-sm text-muted">Prices are in ₹ including GST. Options without a price stay hidden from customers.</p>
          {hasVariants ? (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[520px] text-sm">
                <thead className="text-left text-xs text-muted">
                  <tr><th className="pb-2 font-medium">{product.variantName ?? "Option"}</th><th className="pb-2 font-medium">Price ₹</th><th className="pb-2 font-medium">MRP ₹</th><th className="pb-2 font-medium">Stock</th></tr>
                </thead>
                <tbody>
                  {(f.variants ?? []).map((v) => {
                    const meta = product.variants.find((x) => x.id === v.id)!;
                    return (
                      <tr key={v.id} className="border-t border-line">
                        <td className="py-2 pr-3">
                          <span className="block">{meta.label}</span>
                          {meta.sku ? <span className="text-xs text-muted">SKU {meta.sku}</span> : null}
                        </td>
                        <td className="py-2 pr-2"><input aria-label={`Price for ${meta.label}`} inputMode="numeric" value={v.price} onChange={(e) => setVar(v.id, { price: num(e.target.value) })} className={`${inputCls} w-28`} /></td>
                        <td className="py-2 pr-2"><input aria-label={`MRP for ${meta.label}`} inputMode="numeric" value={v.mrp ?? ""} onChange={(e) => setVar(v.id, { mrp: num(e.target.value) })} className={`${inputCls} w-28`} /></td>
                        <td className="py-2"><input aria-label={`Stock for ${meta.label}`} inputMode="numeric" value={v.stock} onChange={(e) => setVar(v.id, { stock: num(e.target.value) })} className={`${inputCls} w-20`} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <label className="block text-sm"><span className="font-medium">Price ₹</span><input inputMode="numeric" value={f.price ?? ""} onChange={(e) => set("price", num(e.target.value))} className={`${inputCls} mt-1.5`} /></label>
              <label className="block text-sm"><span className="font-medium">MRP ₹</span> <span className="text-muted">(optional)</span><input inputMode="numeric" value={f.mrp ?? ""} onChange={(e) => set("mrp", num(e.target.value))} className={`${inputCls} mt-1.5`} /></label>
              <label className="block text-sm"><span className="font-medium">Stock</span><input inputMode="numeric" value={f.stock ?? ""} onChange={(e) => set("stock", num(e.target.value))} className={`${inputCls} mt-1.5`} /></label>
            </div>
          )}
          <label className="mt-4 block max-w-[200px] text-sm"><span className="font-medium">Low-stock alert at</span><input inputMode="numeric" value={f.low_stock_at} onChange={(e) => set("low_stock_at", num(e.target.value))} className={`${inputCls} mt-1.5`} /></label>
        </section>

        <section className="rounded-lg bg-white p-5 ring-1 ring-line">
          <h2 className="font-semibold">Store summary</h2>
          <p className="mt-1 text-sm text-muted">Shown under the product name. Edit it for your customers; the official description below stays as the brand wrote it.</p>
          <textarea value={f.short} onChange={(e) => set("short", e.target.value)} maxLength={300} rows={3} className={`${inputCls} mt-3 h-auto py-2`} />
          <p className="mt-1 text-right text-xs text-muted tabular">{f.short.length}/300</p>
        </section>

        <section className="rounded-lg bg-white p-5 ring-1 ring-line">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-semibold">Official content</h2>
            <span className="rounded bg-[#e8f1fb] px-2 py-0.5 text-xs font-medium text-chart">From {product.brand}, read-only</span>
          </div>
          <p className="mt-1 text-sm text-muted">
            Name, photos, description and options come from the brand and refresh on every sync{product.syncedAt ? ` (last ${new Date(product.syncedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })})` : ""}.
            {product.sourceUrl ? <> <a href={product.sourceUrl} target="_blank" rel="noopener" className="text-signal-ink hover:underline">View on {product.brand}’s site</a></> : null}
          </p>
          {product.images.length ? (
            <ul className="mt-4 flex flex-wrap gap-2">
              {product.images.map((src) => (
                <li key={src} className="size-20 overflow-hidden rounded-md bg-white ring-1 ring-line">
                  <ProductMedia imageUrl={src} art={product.art} hue={210} alt="" sizes="80px" className="size-full p-1" />
                </li>
              ))}
            </ul>
          ) : null}
          {product.descriptionHtml ? (
            <details className="mt-4">
              <summary className="cursor-pointer text-sm font-medium">Show official description</summary>
              <div className="official-desc mt-3 max-h-[480px] overflow-y-auto rounded-md border border-line p-4 text-sm" dangerouslySetInnerHTML={{ __html: product.descriptionHtml }} />
            </details>
          ) : <p className="mt-4 text-sm text-muted">The brand doesn’t publish a description for this product.</p>}
        </section>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
        <section className="rounded-lg bg-white p-5 ring-1 ring-line">
          <label className="block text-sm">
            <span className="font-medium">Category</span>
            <select value={f.category} onChange={(e) => set("category", e.target.value)} className={`${inputCls} mt-1.5`}>
              {departments.map((d) => (
                <optgroup key={d.slug} label={d.name}>
                  {categories.filter((c) => c.department === d.slug).map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
                </optgroup>
              ))}
            </select>
          </label>
          <p className="mt-4 text-sm font-medium">Labels</p>
          <div className="mt-2 space-y-1.5">
            {TAGS.map((t) => (
              <label key={t.key} className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="size-4 accent-signal" checked={f.tags.includes(t.key)}
                  onChange={(e) => set("tags", e.target.checked ? [...f.tags, t.key] : f.tags.filter((x) => x !== t.key))} />
                {t.label}
              </label>
            ))}
          </div>
          <label className="mt-4 flex items-center gap-2 border-t border-line pt-4 text-sm font-medium">
            <input type="checkbox" className="size-4 accent-signal" checked={f.is_published} onChange={(e) => set("is_published", e.target.checked)} />
            Show on the store
          </label>
          <p className="mt-1 text-xs text-muted">Needs a price first.</p>
        </section>
        {msg ? <p role={msg.ok ? "status" : "alert"} className={`rounded-md p-3 text-sm ${msg.ok ? "bg-[#e6f6ef] text-go" : "bg-[#fdecea] text-danger"}`}>{msg.text}</p> : null}
        <button type="submit" disabled={pending} className="h-11 w-full rounded-md bg-signal font-semibold text-ink hover:bg-signal-hover disabled:opacity-60">
          {pending ? "Saving…" : "Save changes"}
        </button>
      </aside>
    </form>
  );
}
