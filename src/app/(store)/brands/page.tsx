import type { Metadata } from "next";
import Link from "next/link";
import { brands } from "@/lib/catalog";
import { PageHead } from "@/components/PageHead";
import { BrandWall } from "@/components/BrandWall";

export const metadata: Metadata = { title: "Brands" };

export default async function BrandsPage() {
  const all = await brands();
  const featured = all.filter((b) => b.logoUrl); // already ordered by product count
  const az = [...all].sort((a, b) => a.name.localeCompare(b.name));
  const groups = new Map<string, typeof az>();
  for (const b of az) {
    const k = /[a-z]/i.test(b.name[0]) ? b.name[0].toUpperCase() : "#";
    groups.set(k, [...(groups.get(k) ?? []), b]);
  }
  const letters = [...groups.keys()];

  return (
    <>
      <PageHead title="Brands" blurb={`${all.length} brands we stock, from FPV gear to lab equipment.`} crumbs={[{ label: "Brands" }]} />

      <div className="mx-auto max-w-7xl px-4">
        <section aria-labelledby="featured-brands">
          <h2 id="featured-brands" className="mb-4 font-display text-[28px] font-semibold leading-none">Featured brands</h2>
          <BrandWall items={featured} />
        </section>

        <section aria-labelledby="all-brands" className="mt-14">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-4">
            <h2 id="all-brands" className="font-display text-[28px] font-semibold leading-none">All brands A–Z</h2>
            <nav aria-label="Jump to letter" className="flex flex-wrap gap-1">
              {letters.map((l) => (
                <a key={l} href={`#letter-${l}`} className="grid size-8 place-items-center rounded text-sm font-medium text-ink-2 hover:bg-white hover:text-ink">
                  {l}
                </a>
              ))}
            </nav>
          </div>
          <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
            {[...groups.entries()].map(([letter, list]) => (
              <div key={letter} id={`letter-${letter}`} className="scroll-mt-40">
                <h3 className="font-display text-2xl font-semibold text-signal-ink">{letter}</h3>
                <ul className="mt-2 space-y-1">
                  {list.map((b) => (
                    <li key={b.slug}>
                      <Link href={`/brand/${b.slug}`} className="flex items-baseline justify-between gap-3 rounded px-1 py-1 text-[15px] hover:bg-white">
                        <span>{b.name}</span>
                        <span className="text-xs text-muted tabular">{b.count}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
