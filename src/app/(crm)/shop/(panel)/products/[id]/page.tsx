import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireShopAdmin } from "@/lib/crm/auth";
import { PageTitle, Skeleton } from "@/components/crm/ui";
import { ProductForm } from "@/components/crm/ProductForm";

export const metadata: Metadata = { title: "Edit product" };

export default function EditProductPage({ params, searchParams }: PageProps<"/shop/products/[id]">) {
  return (
    <>
      <Link href="/shop/products" className="text-sm text-muted hover:text-ink">Products & stock</Link>
      <Suspense fallback={<Skeleton h="h-96" />}>
        <Editor params={params} searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function Editor({ params, searchParams }: Pick<PageProps<"/shop/products/[id]">, "params" | "searchParams">) {
  const { sb } = await requireShopAdmin();
  const { id } = await params;
  const created = (await searchParams).created === "1";
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { data: p } = await sb
    .from("shop_products")
    .select("*, shop_product_variants(id, label, price, mrp, stock, sort)")
    .eq("id", id)
    .maybeSingle();
  if (!p) notFound();

  const variants = [...(p.shop_product_variants ?? [])].sort((a: { sort: number }, b: { sort: number }) => a.sort - b.sort);
  return (
    <>
      <PageTitle
        title={p.name}
        sub={created ? "Product added. It’s live on the store." : `SKU ${p.sku}`}
        action={<a href={`/product/${p.slug}`} target="_blank" rel="noopener" className="rounded-md px-4 py-2.5 text-sm font-medium ring-1 ring-line hover:ring-ink">View on store</a>}
      />
      <ProductForm
        key={p.updated_at}
        initial={{
          id: p.id, sku: p.sku, slug: p.slug, name: p.name, brand: p.brand, category: p.category,
          price: String(p.price), mrp: p.mrp == null ? "" : String(p.mrp), stock: String(p.stock), low_stock_at: String(p.low_stock_at),
          art: p.art, tags: p.tags, short: p.short, highlights: p.highlights.length ? p.highlights : [""],
          specs: Object.entries((p.specs ?? {}) as Record<string, string>).map(([key, value]) => ({ key, value })),
          in_box: p.in_box ?? [], image_url: p.image_url, weight_g: p.weight_g, is_published: p.is_published,
          variant_name: p.variant_name ?? "",
          variants: variants.map((v: { id: string; label: string; price: number; mrp: number | null; stock: number }) => ({
            id: v.id, label: v.label, price: String(v.price), mrp: v.mrp == null ? "" : String(v.mrp), stock: String(v.stock),
          })),
        }}
      />
    </>
  );
}
