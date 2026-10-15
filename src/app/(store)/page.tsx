import Link from "next/link";
import { categories, categoryBySlug, departments } from "@/data/categories";
import { bestsellers, brands, categoryCounts, getProduct, getSummaries, hotDeals, justLanded, productsInDepartment } from "@/lib/catalog";
import { Hero } from "@/components/Hero";
import { Section } from "@/components/Section";
import { ProductGrid, ProductRail } from "@/components/ProductCard";
import { CategoryTile } from "@/components/CategoryTile";
import { BrandWall } from "@/components/BrandWall";
import { DepartmentCard, type DepartmentTile } from "@/components/DepartmentCard";

// In order of preference; empty categories are skipped and the first 16 are shown.
const featuredCats = [
  "fpv-drones", "whoops-micro", "camera-drones", "goggles", "air-units", "frames",
  "motors", "flight-controllers", "radios", "receivers", "batteries", "chargers",
  "propellers", "fpv-cameras", "antennas", "dev-boards", "gimbal-cameras", "soldering",
  "industrial-drones", "vtol-fixed-wing",
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
    getProduct("geprc-mark5-o4-pro-dc-fpv-drone"),
    productsInDepartment("electronics"),
    categoryCounts(),
    hotDeals(16),
    justLanded(16),
    bestsellers(16),
    brands(),
    getSummaries(),
  ]);
  // Featured hero product: the pinned flagship, else the newest in-stock drone that has a photo.
  const heroPick = all.find((p) => p.category === "fpv-drones" && p.stock > 0 && p.imageUrl) ?? all.find((p) => p.stock > 0 && p.imageUrl) ?? all[0];
  const featured = featuredPick ?? (heroPick ? await getProduct(heroPick.slug) : undefined);
  const electronics = electronicsAll.filter((p) => p.imageUrl).slice(0, 16);

  // Each department shows four of its categories, each by an in-stock product with a photo.
  const deptCards = departments
    .map((d) => {
      const tiles: DepartmentTile[] = [];
      for (const c of categories.filter((x) => x.department === d.slug)) {
        const product = all.find((p) => p.category === c.slug && p.stock > 0 && p.imageUrl);
        if (product) tiles.push({ category: { slug: c.slug, name: c.name }, product });
        if (tiles.length === 4) break;
      }
      return { d, tiles };
    })
    .filter((x) => x.tiles.length === 4);

  return (
    <>
      {featured ? <Hero featured={featured} /> : null}

      {deptCards.length ? (
        <div className="relative z-10 mx-auto -mt-10 max-w-[110rem] px-4 lg:px-6">
          <div className="grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {/* Phones get the first four departments; the rest are one tap away in the menu. */}
            {deptCards.map(({ d, tiles }, i) => (
              <div key={d.slug} className={i >= 4 ? "hidden sm:block" : undefined}>
                <DepartmentCard title={d.name} href={`/department/${d.slug}`} tiles={tiles} />
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <Section title="Shop by category" href="/categories" linkLabel="All categories">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 wide:grid-cols-8">
          {featuredCats.filter((slug) => counts[slug]).slice(0, 16).map((slug) => {
            const c = categoryBySlug.get(slug)!;
            return <CategoryTile key={slug} c={c} count={counts[slug] ?? 0} />;
          })}
        </div>
      </Section>

      {deals.length ? (
        <Section title="Hot deals" href="/deals">
          <ProductRail items={deals} />
        </Section>
      ) : null}

      <Section title="Just landed" href="/new">
        <ProductRail items={fresh} />
      </Section>

      <section className="mx-auto mt-12 max-w-[110rem] px-4 lg:px-6">
        <div className="rounded-lg bg-white p-6 ring-1 ring-line md:p-8">
          <div className="max-w-2xl">
            <h2 className="font-display text-[2rem] font-semibold leading-none">Building your first 5 inch?</h2>
            <p className="mt-2 text-muted">These are the parts a freestyle quad needs, in the order most pilots buy them. Each step opens a filtered list.</p>
          </div>
          <ol className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-2 lg:grid-cols-3 wide:grid-cols-6">
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

      {best.length ? (
        <Section title="Pilots keep reordering" href="/search?q=bestseller">
          <ProductGrid items={best} />
        </Section>
      ) : null}

      <Section title="Electronics bench" href="/department/electronics">
        <ProductGrid items={electronics} />
      </Section>

      <Section title="Brands we stock" href="/brands" linkLabel="All brands">
        <BrandWall items={brandList.filter((b) => b.logoUrl).slice(0, 18)} />
      </Section>

    </>
  );
}
