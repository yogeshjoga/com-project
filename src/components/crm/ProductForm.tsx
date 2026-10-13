"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { categories, departments } from "@/data/categories";
import { browserClient } from "@/lib/supabase/browser";
import type { ArtKind } from "@/lib/types";
import { ProductMedia } from "@/components/ProductMedia";
import { saveProduct, type ProductInput } from "@/app/(crm)/shop/actions";
import { inputCls } from "./ui";

const ARTS: ArtKind[] = ["quad", "whoop", "wing", "camdrone", "goggles", "airunit", "fpvcam", "antenna", "frame", "motor", "esc", "board", "prop", "gps", "radio", "receiver", "battery", "charger", "cable", "actioncam", "gimbal", "meter", "iron", "tool", "bag"];
const TAGS = [
  { key: "hot", label: "Hot deal" },
  { key: "new", label: "New arrival" },
  { key: "bestseller", label: "Bestseller" },
  { key: "made-in-india", label: "Made in India" },
];

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);

export function ProductForm({ initial }: { initial: ProductInput }) {
  const router = useRouter();
  const [p, setP] = useState<ProductInput>(initial);
  const [slugTouched, setSlugTouched] = useState(Boolean(initial.id));
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pending, start] = useTransition();
  const hasVariants = Boolean(p.variant_name?.trim());

  const set = <K extends keyof ProductInput>(k: K, v: ProductInput[K]) => {
    setSaved(false);
    setP((x) => ({ ...x, [k]: v }));
  };

  async function upload(file: File) {
    if (!/^image\/(png|jpe?g|webp)$/.test(file.type)) return setError("Upload a PNG, JPG or WebP image.");
    if (file.size > 3 * 1024 * 1024) return setError("Images must be 3 MB or smaller.");
    setUploading(true);
    setError(null);
    const ext = file.type.split("/")[1].replace("jpeg", "jpg");
    const path = `shop/${crypto.randomUUID()}.${ext}`;
    const sb = browserClient();
    const { error } = await sb.storage.from("site-media").upload(path, file, { cacheControl: "31536000", contentType: file.type });
    setUploading(false);
    if (error) return setError(`Upload failed: ${error.message}`);
    set("image_url", sb.storage.from("site-media").getPublicUrl(path).data.publicUrl);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    start(async () => {
      const res = await saveProduct(p);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setSaved(true);
      if (!p.id && res.id) router.replace(`/shop/products/${res.id}?created=1`);
      else router.refresh();
    });
  }

  const L = ({ label, hint, children, wide }: { label: string; hint?: string; children: React.ReactNode; wide?: boolean }) => (
    <label className={`block text-sm ${wide ? "sm:col-span-2" : ""}`}>
      <span className="font-medium">{label}</span>
      {hint ? <span className="ml-1 text-muted">{hint}</span> : null}
      <div className="mt-1.5">{children}</div>
    </label>
  );

  return (
    <form onSubmit={submit} className="grid gap-4 lg:grid-cols-[1fr_320px]">
      <div className="space-y-4">
        <section className="grid gap-4 rounded-lg bg-white p-5 ring-1 ring-line sm:grid-cols-2">
          <h2 className="font-semibold sm:col-span-2">Basics</h2>
          {L({ label: "Product name", wide: true, children: (
            <input required value={p.name} className={inputCls} onChange={(e) => { set("name", e.target.value); if (!slugTouched) set("slug", slugify(e.target.value)); }} />
          ) })}
          {L({ label: "Brand", children: <input required value={p.brand} className={inputCls} onChange={(e) => set("brand", e.target.value)} /> })}
          {L({ label: "Category", children: (
            <select required value={p.category} className={inputCls} onChange={(e) => set("category", e.target.value)}>
              <option value="" disabled>Choose a category</option>
              {departments.map((d) => (
                <optgroup key={d.slug} label={d.name}>
                  {categories.filter((c) => c.department === d.slug).map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
                </optgroup>
              ))}
            </select>
          ) })}
          {L({ label: "SKU", hint: "(blank = auto)", children: <input value={p.sku} className={inputCls} onChange={(e) => set("sku", e.target.value)} /> })}
          {L({ label: "URL slug", hint: "/product/…", children: (
            <input required value={p.slug} pattern="[a-z0-9]+(-[a-z0-9]+)*" title="Lowercase letters, numbers and dashes" className={inputCls}
              onChange={(e) => { setSlugTouched(true); set("slug", slugify(e.target.value)); }} />
          ) })}
          {L({ label: "Short description", hint: "(shown under the title)", wide: true, children: (
            <textarea value={p.short} rows={2} maxLength={300} className={`${inputCls} h-auto py-2`} onChange={(e) => set("short", e.target.value)} />
          ) })}
        </section>

        <section className="grid gap-4 rounded-lg bg-white p-5 ring-1 ring-line sm:grid-cols-3">
          <h2 className="font-semibold sm:col-span-3">Price & stock</h2>
          {!hasVariants ? (
            <>
              {L({ label: "Price (₹, inc. GST)", children: <input required inputMode="numeric" value={p.price} className={inputCls} onChange={(e) => set("price", e.target.value.replace(/\D/g, ""))} /> })}
              {L({ label: "MRP (₹)", hint: "(optional)", children: <input inputMode="numeric" value={p.mrp ?? ""} className={inputCls} onChange={(e) => set("mrp", e.target.value.replace(/\D/g, ""))} /> })}
              {L({ label: "Stock", children: <input required inputMode="numeric" value={p.stock} className={inputCls} onChange={(e) => set("stock", e.target.value.replace(/\D/g, ""))} /> })}
            </>
          ) : (
            <p className="text-sm text-muted sm:col-span-2">Price and stock are set per option below. The store shows the lowest option price.</p>
          )}
          {L({ label: "Low-stock alert at", children: <input required inputMode="numeric" value={p.low_stock_at} className={inputCls} onChange={(e) => set("low_stock_at", e.target.value.replace(/\D/g, ""))} /> })}
        </section>

        <section className="rounded-lg bg-white p-5 ring-1 ring-line">
          <h2 className="font-semibold">Options</h2>
          <p className="mt-1 text-sm text-muted">For products sold in versions (KV, colour, kit, RAM). Leave the option name blank for a simple product.</p>
          <div className="mt-3 max-w-xs">
            {L({ label: "Option name", hint: "e.g. KV, Colour, Bundle", children: <input value={p.variant_name ?? ""} className={inputCls} onChange={(e) => set("variant_name", e.target.value)} /> })}
          </div>
          {hasVariants ? (
            <div className="mt-4 space-y-2">
              <div className="grid grid-cols-[1fr_100px_100px_80px_32px] gap-2 text-xs text-muted">
                <span>Option</span><span>Price ₹</span><span>MRP ₹</span><span>Stock</span><span />
              </div>
              {p.variants.map((v, i) => {
                const upd = (patch: Partial<typeof v>) => set("variants", p.variants.map((x, j) => (j === i ? { ...x, ...patch } : x)));
                return (
                  <div key={v.id ?? `new-${i}`} className="grid grid-cols-[1fr_100px_100px_80px_32px] gap-2">
                    <input aria-label="Option" required value={v.label} className={inputCls} onChange={(e) => upd({ label: e.target.value })} />
                    <input aria-label="Price" required inputMode="numeric" value={v.price} className={inputCls} onChange={(e) => upd({ price: e.target.value.replace(/\D/g, "") })} />
                    <input aria-label="MRP" inputMode="numeric" value={v.mrp ?? ""} className={inputCls} onChange={(e) => upd({ mrp: e.target.value.replace(/\D/g, "") })} />
                    <input aria-label="Stock" required inputMode="numeric" value={v.stock} className={inputCls} onChange={(e) => upd({ stock: e.target.value.replace(/\D/g, "") })} />
                    <button type="button" aria-label={`Remove ${v.label || "option"}`} className="text-muted hover:text-danger" onClick={() => set("variants", p.variants.filter((_, j) => j !== i))}>×</button>
                  </div>
                );
              })}
              <button type="button" className="text-sm font-medium text-signal-ink hover:underline" onClick={() => set("variants", [...p.variants, { label: "", price: "", mrp: "", stock: "0" }])}>
                Add option
              </button>
            </div>
          ) : null}
        </section>

        <section className="rounded-lg bg-white p-5 ring-1 ring-line">
          <h2 className="font-semibold">Details</h2>
          <ListEditor label="Highlights" hint="3–5 short bullet points" items={p.highlights} onChange={(v) => set("highlights", v)} />
          <div className="mt-5">
            <p className="text-sm font-medium">Specifications</p>
            <div className="mt-2 space-y-2">
              {p.specs.map((s, i) => (
                <div key={i} className="grid grid-cols-[1fr_1.4fr_32px] gap-2">
                  <input aria-label="Spec name" placeholder="e.g. Weight" value={s.key} className={inputCls} onChange={(e) => set("specs", p.specs.map((x, j) => (j === i ? { ...x, key: e.target.value } : x)))} />
                  <input aria-label="Spec value" placeholder="e.g. 420 g" value={s.value} className={inputCls} onChange={(e) => set("specs", p.specs.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)))} />
                  <button type="button" aria-label="Remove spec" className="text-muted hover:text-danger" onClick={() => set("specs", p.specs.filter((_, j) => j !== i))}>×</button>
                </div>
              ))}
              <button type="button" className="text-sm font-medium text-signal-ink hover:underline" onClick={() => set("specs", [...p.specs, { key: "", value: "" }])}>Add specification</button>
            </div>
          </div>
          <div className="mt-5">
            <ListEditor label="In the box" hint="(optional)" items={p.in_box} onChange={(v) => set("in_box", v)} />
          </div>
        </section>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
        <section className="rounded-lg bg-white p-5 ring-1 ring-line">
          <h2 className="font-semibold">Photo</h2>
          <div className="mt-3 aspect-[4/3] overflow-hidden rounded-md bg-paper">
            <ProductMedia imageUrl={p.image_url ?? undefined} art={p.art as ArtKind} hue={210} alt={p.name} sizes="320px" className="size-full p-3" />
          </div>
          <label className="mt-3 block cursor-pointer rounded-md py-2 text-center text-sm font-medium ring-1 ring-line hover:ring-ink">
            {uploading ? "Uploading…" : p.image_url ? "Replace photo" : "Upload photo"}
            <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" disabled={uploading} onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
          </label>
          {p.image_url ? (
            <button type="button" className="mt-2 w-full text-sm text-muted hover:text-danger" onClick={() => set("image_url", null)}>Remove photo</button>
          ) : (
            <div className="mt-3">
              {L({ label: "Illustration when there’s no photo", children: (
                <select value={p.art} className={inputCls} onChange={(e) => set("art", e.target.value)}>
                  {ARTS.map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
              ) })}
            </div>
          )}
        </section>

        <section className="rounded-lg bg-white p-5 ring-1 ring-line">
          <h2 className="font-semibold">Labels</h2>
          <div className="mt-2 space-y-1.5">
            {TAGS.map((t) => (
              <label key={t.key} className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="size-4 accent-signal" checked={p.tags.includes(t.key)}
                  onChange={(e) => set("tags", e.target.checked ? [...p.tags, t.key] : p.tags.filter((x) => x !== t.key))} />
                {t.label}
              </label>
            ))}
          </div>
          <label className="mt-4 flex items-center gap-2 border-t border-line pt-4 text-sm font-medium">
            <input type="checkbox" className="size-4 accent-signal" checked={p.is_published} onChange={(e) => set("is_published", e.target.checked)} />
            Show on the store
          </label>
        </section>

        {error ? <p role="alert" className="rounded-md bg-[#fdecea] p-3 text-sm text-danger">{error}</p> : null}
        {saved ? <p role="status" className="rounded-md bg-[#e6f6ef] p-3 text-sm text-go">Saved. The store updates within seconds.</p> : null}
        <button type="submit" disabled={pending || uploading} className="h-11 w-full rounded-md bg-signal font-semibold text-ink hover:bg-signal-hover disabled:opacity-60">
          {pending ? "Saving…" : p.id ? "Save changes" : "Add product"}
        </button>
      </aside>
    </form>
  );
}

function ListEditor({ label, hint, items, onChange }: { label: string; hint?: string; items: string[]; onChange: (v: string[]) => void }) {
  return (
    <div className="mt-3">
      <p className="text-sm font-medium">{label} {hint ? <span className="font-normal text-muted">{hint}</span> : null}</p>
      <div className="mt-2 space-y-2">
        {items.map((h, i) => (
          <div key={i} className="grid grid-cols-[1fr_32px] gap-2">
            <input aria-label={`${label} ${i + 1}`} value={h} className={inputCls} onChange={(e) => onChange(items.map((x, j) => (j === i ? e.target.value : x)))} />
            <button type="button" aria-label="Remove" className="text-muted hover:text-danger" onClick={() => onChange(items.filter((_, j) => j !== i))}>×</button>
          </div>
        ))}
        <button type="button" className="text-sm font-medium text-signal-ink hover:underline" onClick={() => onChange([...items, ""])}>Add line</button>
      </div>
    </div>
  );
}
