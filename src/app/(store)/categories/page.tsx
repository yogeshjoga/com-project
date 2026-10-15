import type { Metadata } from "next";
import Link from "next/link";
import { categoriesIn, departments } from "@/data/categories";
import { categoryCounts } from "@/lib/catalog";
import { PageHead } from "@/components/PageHead";
import { CategoryTile } from "@/components/CategoryTile";

export const metadata: Metadata = { title: "All categories" };

export default async function CategoriesPage() {
  const counts = await categoryCounts();
  return (
    <>
      <PageHead title="All categories" crumbs={[{ label: "All categories" }]} />
      <div className="mx-auto max-w-[110rem] space-y-10 px-4 lg:px-6">
        {departments.map((d) => (
          <section key={d.slug}>
            <h2 className="mb-3 font-display text-2xl font-semibold">
              <Link href={`/department/${d.slug}`} className="hover:text-signal-ink">{d.name}</Link>
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {categoriesIn(d.slug).map((c) => <CategoryTile key={c.slug} c={c} count={counts[c.slug] ?? 0} />)}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
