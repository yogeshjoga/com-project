import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { brands, productsByBrand } from "@/lib/catalog";
import { PageHead } from "@/components/PageHead";
import { Listing } from "@/components/Listing";

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
      <PageHead title={b.name} blurb={`Genuine ${b.name} products with GST invoice.`} crumbs={[{ label: "Brands", href: "/brands" }, { label: b.name }]} />
      <div className="mx-auto max-w-7xl px-4">
        <Listing items={await productsByBrand(slug)} />
      </div>
    </>
  );
}
