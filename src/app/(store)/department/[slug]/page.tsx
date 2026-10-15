import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { categoriesIn, departmentBySlug, departments } from "@/data/categories";
import { productsInDepartment } from "@/lib/catalog";
import { PageHead } from "@/components/PageHead";
import { Listing } from "@/components/Listing";
import { PrintingCta, PrintingEmptyAction } from "@/components/PrintingCta";

export function generateStaticParams() {
  return departments.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: PageProps<"/department/[slug]">): Promise<Metadata> {
  const d = departmentBySlug.get((await params).slug);
  return d ? { title: d.name } : {};
}

export default async function DepartmentPage({ params }: PageProps<"/department/[slug]">) {
  const { slug } = await params;
  const d = departmentBySlug.get(slug);
  if (!d) notFound();
  const cats = categoriesIn(slug);
  return (
    <>
      <PageHead title={d.name} blurb={cats.map((c) => c.name).join(", ")} crumbs={[{ label: d.name }]} />
      <div className="mx-auto max-w-[110rem] px-4 lg:px-6">
        {slug === "printing" ? <PrintingCta /> : null}
        <Listing
          items={await productsInDepartment(slug)}
          groups={cats.map((c) => ({ key: c.slug, label: c.name }))}
          emptyText={slug === "printing" ? "These are printed to order. Tell us what you need and we’ll quote it." : undefined}
          emptyAction={slug === "printing" ? <PrintingEmptyAction /> : undefined}
        />
      </div>
    </>
  );
}
