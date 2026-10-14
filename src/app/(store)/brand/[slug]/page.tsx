import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { brands, productsByBrand } from "@/lib/catalog";
import { PageHead } from "@/components/PageHead";
import { Listing } from "@/components/Listing";
import { BrandLogo } from "@/components/BrandLogo";

export async function generateStaticParams() {
  return (await brands()).map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: PageProps<"/brand/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const b = (await brands()).find((x) => x.slug === slug);
  return b ? { title: `${b.name} products` } : {};
}

export default async function BrandPage({ params }: PageProps<"/brand/[slug]">) {
  const { slug } = await params;
  const b = (await brands()).find((x) => x.slug === slug);
  if (!b) notFound();
  return (
    <>
      <PageHead title={b.name} blurb={`${b.name} products in stock at EgireRobotics, with a GST invoice on every order.`} crumbs={[{ label: "Brands", href: "/brands" }, { label: b.name }]} />
      {b.logoUrl || b.website ? (
        <div className="mx-auto -mt-2 mb-6 flex max-w-7xl flex-wrap items-center gap-4 px-4">
          {b.logoUrl ? (
            <div className="flex h-24 w-60 items-center justify-center rounded-lg border border-line bg-white px-6">
              <BrandLogo name={b.name} logoUrl={b.logoUrl} width={b.logoWidth} height={b.logoHeight} maxW={180} maxH={56} area={4600} priority />
            </div>
          ) : null}
          {b.website ? (
            <a href={b.website} target="_blank" rel="noopener nofollow" className="text-sm text-signal-ink hover:underline">
              Official {b.name} website
            </a>
          ) : null}
        </div>
      ) : null}
      <div className="mx-auto max-w-7xl px-4">
        <Listing items={await productsByBrand(slug)} />
      </div>
    </>
  );
}
