import Link from "next/link";
import type { ProductSummary } from "@/lib/types";
import { ProductMedia } from "./ProductMedia";

export interface DepartmentTile {
  category: { slug: string; name: string };
  product: ProductSummary;
}

/** A department at a glance: four of its categories, each shown by a real product photo. */
export function DepartmentCard({ title, href, tiles }: { title: string; href: string; tiles: DepartmentTile[] }) {
  return (
    <section className="flex h-full flex-col rounded-lg bg-white p-4 ring-1 ring-line">
      <h2 className="text-lg font-semibold leading-tight">{title}</h2>
      <ul className="mt-3 grid flex-1 grid-cols-2 gap-x-3 gap-y-2">
        {tiles.map((t) => (
          <li key={t.category.slug}>
            <Link href={`/category/${t.category.slug}`} className="group block">
              <span className="block aspect-square overflow-hidden rounded-md bg-paper">
                <ProductMedia
                  imageUrl={t.product.imageUrl}
                  art={t.product.art}
                  hue={t.product.hue}
                  alt=""
                  sizes="(min-width: 1700px) 160px, (min-width: 1024px) 12vw, 45vw"
                  className="size-full p-2 transition-transform duration-300 group-hover:scale-[1.04]"
                />
              </span>
              <span className="mt-1 block truncate text-[0.8125rem] group-hover:text-signal-ink">{t.category.name}</span>
            </Link>
          </li>
        ))}
      </ul>
      <Link href={href} className="-mb-1 mt-2 inline-block py-2 text-sm font-medium text-signal-ink hover:underline">
        Shop all {title.toLowerCase()}
      </Link>
    </section>
  );
}
