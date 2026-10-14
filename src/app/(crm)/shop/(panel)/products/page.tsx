import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { requireShopAdmin } from "@/lib/crm/auth";
import { PageTitle, Skeleton } from "@/components/crm/ui";
import { ProductsTable, type AdminProductRow } from "@/components/crm/ProductsTable";

export const metadata: Metadata = { title: "Products & stock" };

export default function ProductsPage({ searchParams }: PageProps<"/shop/products">) {
  return (
    <>
      <PageTitle
        title="Products & stock"
        sub="Official products come from each brand with their photos and descriptions. Set the price and stock, then switch them on."
        action={<Link href="/shop/products/new" className="rounded-md bg-signal px-4 py-2.5 text-sm font-semibold text-ink hover:bg-signal-hover">Add product</Link>}
      />
      <Suspense fallback={<Skeleton h="h-96" />}>
        <Products searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function Products({ searchParams }: { searchParams: PageProps<"/shop/products">["searchParams"] }) {
  const { sb } = await requireShopAdmin();
  const sp = await searchParams;
  // The API caps responses at 1,000 rows, so page through the whole catalog.
  const rows: AdminProductRow[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await sb
      .from("shop_products")
      .select("id, sku, slug, name, brand, category, price, stock, low_stock_at, is_published, variant_name, source, shop_product_variants(id, label, price, stock, sort)")
      .order("is_published", { ascending: false })
      .order("updated_at", { ascending: false })
      .order("id")
      .range(from, from + 999);
    if (error) return <p className="text-danger">Couldn’t load products: {error.message}</p>;
    rows.push(...((data ?? []) as unknown as AdminProductRow[]));
    if (!data || data.length < 1000) break;
  }
  const filter = typeof sp.filter === "string" ? sp.filter : "all";
  return <ProductsTable rows={rows} initialFilter={filter} />;
}
