import type { Metadata } from "next";
import { brands } from "@/lib/catalog";
import { PageHead } from "@/components/PageHead";
import { BrandWall } from "@/components/BrandWall";

export const metadata: Metadata = { title: "Brands" };

export default async function BrandsPage() {
  const all = await brands();
  const featured = all.filter((b) => b.logoUrl); // already ordered by product count

  return (
    <>
      <PageHead title="Brands" blurb={`${all.length} brands we stock, from FPV gear to lab equipment.`} crumbs={[{ label: "Brands" }]} />
      <div className="mx-auto max-w-[110rem] px-4 lg:px-6">
        <BrandWall items={featured} />
      </div>
    </>
  );
}
