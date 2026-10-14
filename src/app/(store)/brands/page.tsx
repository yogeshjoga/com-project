import type { Metadata } from "next";
import Link from "next/link";
import { brands } from "@/lib/catalog";
import { PageHead } from "@/components/PageHead";
import { BrandLogo } from "@/components/BrandLogo";

export const metadata: Metadata = { title: "Brands" };

export default async function BrandsPage() {
  const list = [...(await brands())].sort((a, b) => a.name.localeCompare(b.name));
  return (
    <>
      <PageHead title="Brands" blurb={`${list.length} brands we stock, from FPV gear to lab equipment.`} crumbs={[{ label: "Brands" }]} />
      <ul className="mx-auto grid max-w-7xl grid-cols-2 gap-3 px-4 sm:grid-cols-3 lg:grid-cols-5">
        {list.map((b) => (
          <li key={b.slug}>
            <Link
              href={`/brand/${b.slug}`}
              className="group flex h-full flex-col rounded-lg border border-line bg-white px-4 pb-3 pt-5 transition-colors hover:border-ink/40"
            >
              <BrandLogo name={b.name} logoUrl={b.logoUrl} className="h-12" sizes="(min-width: 1024px) 200px, 45vw" />
              <span className="mt-4 flex items-baseline justify-between gap-2 border-t border-line pt-2.5">
                <span className="truncate text-sm font-medium">{b.name}</span>
                <span className="shrink-0 text-xs text-muted tabular">{b.count} {b.count === 1 ? "product" : "products"}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
