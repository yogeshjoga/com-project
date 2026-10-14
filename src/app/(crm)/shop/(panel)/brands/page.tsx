import type { Metadata } from "next";
import { Suspense } from "react";
import { requireShopAdmin } from "@/lib/crm/auth";
import { brandSlug } from "@/lib/catalog";
import { PageTitle, Skeleton } from "@/components/crm/ui";
import { BrandsManager, type BrandRow } from "@/components/crm/BrandsManager";

export const metadata: Metadata = { title: "Brands" };

export default function BrandsAdminPage() {
  return (
    <>
      <PageTitle title="Brands" sub="Logos appear on the Brands page, brand pages, product pages and the home page. Use official logo files, ideally a transparent PNG." />
      <Suspense fallback={<Skeleton h="h-96" />}>
        <Brands />
      </Suspense>
    </>
  );
}

async function Brands() {
  const { sb } = await requireShopAdmin();
  const [{ data: products }, { data: saved }] = await Promise.all([
    sb.from("shop_products").select("brand"),
    sb.from("shop_brands").select("slug, name, logo_url, website"),
  ]);
  const counts = new Map<string, { name: string; count: number }>();
  for (const p of products ?? []) {
    const slug = brandSlug(p.brand);
    const cur = counts.get(slug);
    counts.set(slug, { name: cur?.name ?? p.brand, count: (cur?.count ?? 0) + 1 });
  }
  const bySlug = new Map((saved ?? []).map((b) => [b.slug, b]));
  const rows: BrandRow[] = [...counts.entries()]
    .map(([slug, { name, count }]) => ({
      slug,
      name,
      count,
      logoUrl: bySlug.get(slug)?.logo_url ?? null,
      website: bySlug.get(slug)?.website ?? "",
    }))
    .sort((a, b) => Number(Boolean(a.logoUrl)) - Number(Boolean(b.logoUrl)) || a.name.localeCompare(b.name));
  return <BrandsManager rows={rows} />;
}
