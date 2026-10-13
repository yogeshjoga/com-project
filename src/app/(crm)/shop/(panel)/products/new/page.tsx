import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { requireShopAdmin } from "@/lib/crm/auth";
import { PageTitle, Skeleton } from "@/components/crm/ui";
import { ProductForm } from "@/components/crm/ProductForm";

export const metadata: Metadata = { title: "Add product" };

export default function NewProductPage() {
  return (
    <>
      <Link href="/shop/products" className="text-sm text-muted hover:text-ink">Products & stock</Link>
      <PageTitle title="Add product" sub="It goes live on the store as soon as you save, unless you untick “Show on the store”." />
      <Suspense fallback={<Skeleton h="h-96" />}>
        <Guarded />
      </Suspense>
    </>
  );
}

async function Guarded() {
  await requireShopAdmin();
  return (
    <ProductForm
      initial={{
        sku: "", slug: "", name: "", brand: "", category: "", price: "", mrp: "", stock: "0", low_stock_at: "5",
        art: "board", tags: ["new"], short: "", highlights: ["", "", ""], specs: [{ key: "", value: "" }], in_box: [],
        image_url: null, weight_g: null, is_published: true, variant_name: "", variants: [],
      }}
    />
  );
}
