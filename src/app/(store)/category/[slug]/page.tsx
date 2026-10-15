import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { categories, categoryBySlug, departmentBySlug } from "@/data/categories";
import { productsInCategory } from "@/lib/catalog";
import { PageHead } from "@/components/PageHead";
import { Listing } from "@/components/Listing";
import { PrintingCta, PrintingEmptyAction } from "@/components/PrintingCta";

export function generateStaticParams() {
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/category/[slug]">): Promise<Metadata> {
  const c = categoryBySlug.get((await params).slug);
  return c ? { title: `Buy ${c.name} online`, description: c.blurb } : {};
}

export default async function CategoryPage({ params }: PageProps<"/category/[slug]">) {
  const { slug } = await params;
  const c = categoryBySlug.get(slug);
  if (!c) notFound();
  const d = departmentBySlug.get(c.department)!;
  return (
    <>
      <PageHead title={c.name} blurb={c.blurb} crumbs={[{ label: d.name, href: `/department/${d.slug}` }, { label: c.name }]} />
      <div className="mx-auto max-w-[110rem] px-4 lg:px-6">
        {d.slug === "printing" ? <PrintingCta /> : null}
        <Listing
          items={await productsInCategory(slug)}
          emptyText={d.slug === "printing" ? "These are printed to order. Tell us what you need and we’ll quote it." : "We're restocking this category. Check back soon."}
          emptyAction={d.slug === "printing" ? <PrintingEmptyAction /> : undefined}
        />
      </div>
    </>
  );
}
