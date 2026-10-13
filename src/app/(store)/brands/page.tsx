import type { Metadata } from "next";
import Link from "next/link";
import { brands } from "@/lib/catalog";
import { PageHead } from "@/components/PageHead";

export const metadata: Metadata = { title: "Brands" };

export default async function BrandsPage() {
  const list = [...(await brands())].sort((a, b) => a.name.localeCompare(b.name));
  return (
    <>
      <PageHead title="Brands" blurb={`${list.length} brands, all from authorised sources.`} crumbs={[{ label: "Brands" }]} />
      <ul className="mx-auto grid max-w-7xl grid-cols-2 gap-3 px-4 sm:grid-cols-3 lg:grid-cols-5">
        {list.map((b) => (
          <li key={b.slug}>
            <Link href={`/brand/${b.slug}`} className="flex items-baseline justify-between rounded-lg border border-line bg-white px-4 py-4 hover:border-ink">
              <span className="font-display text-xl font-semibold">{b.name}</span>
              <span className="text-xs text-muted tabular">{b.count}</span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
