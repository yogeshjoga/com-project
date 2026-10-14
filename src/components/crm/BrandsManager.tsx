"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { browserClient } from "@/lib/supabase/browser";
import { BrandLogo } from "@/components/BrandLogo";
import { saveBrand } from "@/app/(crm)/shop/actions";
import { inputCls } from "./ui";

export interface BrandRow {
  slug: string;
  name: string;
  count: number;
  logoUrl: string | null;
  website: string;
}

export function BrandsManager({ rows }: { rows: BrandRow[] }) {
  const missing = rows.filter((r) => !r.logoUrl).length;
  return (
    <div>
      <p className="mb-4 text-sm text-muted">
        {missing ? `${missing} of ${rows.length} brands have no logo yet and show their name instead. They’re listed first.` : `All ${rows.length} brands have a logo.`}
      </p>
      <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {rows.map((r) => <BrandCard key={r.slug} row={r} />)}
      </ul>
    </div>
  );
}

function BrandCard({ row }: { row: BrandRow }) {
  const [logo, setLogo] = useState(row.logoUrl);
  const [website, setWebsite] = useState(row.website);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [pending, start] = useTransition();
  const router = useRouter();
  const dirty = logo !== row.logoUrl || website !== row.website;

  async function upload(file: File) {
    if (!/^image\/(png|webp|jpeg)$/.test(file.type)) return setMsg({ ok: false, text: "Use a PNG, WebP or JPG file (a transparent PNG looks best)." });
    if (file.size > 1024 * 1024) return setMsg({ ok: false, text: "Logo files must be 1 MB or smaller." });
    setUploading(true);
    setMsg(null);
    const ext = file.type.split("/")[1].replace("jpeg", "jpg");
    const path = `shop/brands/${row.slug}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
    const sb = browserClient();
    const { error } = await sb.storage.from("site-media").upload(path, file, { cacheControl: "31536000", contentType: file.type });
    setUploading(false);
    if (error) return setMsg({ ok: false, text: `Upload failed: ${error.message}` });
    setLogo(sb.storage.from("site-media").getPublicUrl(path).data.publicUrl);
  }

  function save() {
    start(async () => {
      const res = await saveBrand({ slug: row.slug, name: row.name, logo_url: logo, website });
      setMsg(res.ok ? { ok: true, text: "Saved. The store updates within seconds." } : { ok: false, text: res.error });
      if (res.ok) router.refresh();
    });
  }

  return (
    <li className="rounded-lg bg-white p-4 ring-1 ring-line">
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-medium">{row.name}</p>
        <p className="text-xs text-muted tabular">{row.count} {row.count === 1 ? "product" : "products"}</p>
      </div>
      <div className="mt-3 flex h-20 items-center rounded-md border border-line bg-white px-4">
        <BrandLogo name={row.name} logoUrl={logo} className="h-11" sizes="280px" />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
        <label className="cursor-pointer rounded-md px-3 py-1.5 font-medium ring-1 ring-line hover:ring-ink">
          {uploading ? "Uploading…" : logo ? "Replace logo" : "Upload logo"}
          <input type="file" accept="image/png,image/webp,image/jpeg" className="sr-only" disabled={uploading}
            onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
        </label>
        {logo ? <button type="button" onClick={() => setLogo(null)} className="text-muted hover:text-danger">Remove logo</button> : null}
      </div>
      <label className="mt-3 block text-sm">
        <span className="font-medium">Official website</span>
        <input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://" className={`${inputCls} mt-1.5`} />
      </label>
      {msg ? <p role={msg.ok ? "status" : "alert"} className={`mt-2 text-sm ${msg.ok ? "text-go" : "text-danger"}`}>{msg.text}</p> : null}
      {dirty ? (
        <button type="button" disabled={pending || uploading} onClick={save}
          className="mt-3 h-9 w-full rounded-md bg-ink text-sm font-medium text-white disabled:opacity-60">
          {pending ? "Saving…" : "Save brand"}
        </button>
      ) : null}
    </li>
  );
}
