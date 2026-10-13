import Link from "next/link";
import type { Category } from "@/lib/types";
import { ProductArt } from "./ProductArt";

export function CategoryTile({ c, count }: { c: Category; count: number }) {
  return (
    <Link
      href={`/category/${c.slug}`}
      className="group flex items-center gap-3 rounded-lg border border-line bg-white p-3 hover:border-ink/40"
    >
      <ProductArt kind={c.art} hue={210} className="size-14 shrink-0 rounded-md bg-paper p-1 transition-transform group-hover:scale-105" />
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium">{c.name}</span>
        <span className="block text-xs text-muted tabular">{count} products</span>
      </span>
    </Link>
  );
}
