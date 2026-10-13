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
        sub="Edit stock inline and press Enter to save. Changes reach the store within seconds."
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
  const { data, error } = await sb
    .from("shop_products")
    .select("id, sku, slug, name, brand, category, price, stock, low_stock_at, is_published, variant_name, image_url, art, shop_product_variants(id, label, price, stock, sort)")
    .order("updated_at", { ascending: false });
  if (error) return <p className="text-danger">Couldn’t load products: {error.message}</p>;
  const filter = typeof sp.filter === "string" ? sp.filter : "all";
  return <ProductsTable rows={(data ?? []) as unknown as AdminProductRow[]} initialFilter={filter} />;
}
