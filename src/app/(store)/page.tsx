import Link from "next/link";
import { categoryBySlug } from "@/data/categories";
import { bestsellers, brands, categoryCounts, getProduct, getSummaries, hotDeals, justLanded, productsInDepartment } from "@/lib/catalog";
import { Hero } from "@/components/Hero";
import { Section } from "@/components/Section";
import { ProductGrid, ProductRail } from "@/components/ProductCard";
import { CategoryTile } from "@/components/CategoryTile";

const featuredCats = [
  "fpv-drones", "whoops-micro", "camera-drones", "goggles", "air-units", "frames",
  "motors", "flight-controllers", "radios", "receivers", "batteries", "chargers",
  "propellers", "gimbal-cameras", "dev-boards", "soldering",
];

// A 5 inch build really is an ordered process, so the steps are numbered.
const buildSteps = [
  { cat: "frames", note: "Pick a 5 inch freestyle or deadcat frame" },
  { cat: "motors", note: "Four 2207 motors, 1950KV for 6S" },
  { cat: "flight-controllers", note: "F4 / F7 stack with 4-in-1 ESC" },
  { cat: "air-units", note: "Digital O4 or analog VTX + camera" },
  { cat: "receivers", note: "ELRS receiver to match your radio" },
  { cat: "batteries", note: "6S 1100–1400 mAh packs" },
];

export default async function Home() {
  const [featuredPick, electronicsAll, counts, deals, fresh, best, brandList, all] = await Promise.all([
    getProduct("geprc-mark5-o4-pro-5-inch-freestyle-drone-elrs-bnf"),
    productsInDepartment("electronics"),
    categoryCounts(),
    hotDeals(12),
    justLanded(12),
    bestsellers(10),
    brands(),
    getSummaries(),
  ]);
  // Featured hero product: the pinned flagship, else the newest in-stock drone.
  const featured = featuredPick ?? (await getProduct(all.find((p) => p.category === "fpv-drones" && p.stock > 0)?.slug ?? all[0]?.slug ?? ""));
  const electronics = electronicsAll.slice(0, 5);

  return (
    <>
      {featured ? <Hero featured={featured} /> : null}

      <Section title="Shop by category" href="/categories" linkLabel="All categories">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {featuredCats.map((slug) => {
            const c = categoryBySlug.get(slug)!;
            return <CategoryTile key={slug} c={c} count={counts[slug] ?? 0} />;
          })}
        </div>
      </Section>

      <Section title="Hot deals" href="/deals">
        <ProductRail items={deals} />
      </Section>

      <Section title="Just landed" href="/new">
        <ProductRail items={fresh} />
      </Section>

      <section className="mx-auto mt-12 max-w-7xl px-4">
        <div className="rounded-lg bg-white p-6 ring-1 ring-line md:p-8">
          <div className="max-w-2xl">
            <h2 className="font-display text-[32px] font-semibold leading-none">Building your first 5 inch?</h2>
            <p className="mt-2 text-muted">These are the parts a freestyle quad needs, in the order most pilots buy them. Each step opens a filtered list.</p>
          </div>
          <ol className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {buildSteps.map((s, i) => (
              <li key={s.cat}>
                <Link href={`/category/${s.cat}`} className="flex h-full gap-3 rounded-md border border-line p-4 hover:border-signal">
                  <span className="font-display text-3xl font-semibold leading-none text-signal tabular">{i + 1}</span>
                  <span>
                    <span className="block font-medium">{categoryBySlug.get(s.cat)!.name}</span>
                    <span className="block text-sm text-muted">{s.note}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <Section title="Pilots keep reordering" href="/search?q=bestseller">
        <ProductGrid items={best} />
      </Section>

      <Section title="Electronics bench" href="/department/electronics">
        <ProductGrid items={electronics} />
      </Section>

      <Section title="Brands we stock" href="/brands" linkLabel="All brands">
        <ul className="flex flex-wrap gap-2">
          {brandList.slice(0, 24).map((b) => (
            <li key={b.slug}>
              <Link href={`/brand/${b.slug}`} className="block rounded-md border border-line bg-white px-4 py-2.5 font-display text-lg font-semibold hover:border-ink">
                {b.name}
              </Link>
            </li>
          ))}
        </ul>
      </Section>

    </>
  );
}
