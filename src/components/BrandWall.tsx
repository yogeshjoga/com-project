import Link from "next/link";
import { BrandLogo } from "./BrandLogo";

export interface WallBrand {
  slug: string;
  name: string;
  count: number;
  logoUrl: string | null;
  logoWidth: number | null;
  logoHeight: number | null;
}

/** Seamless hairline grid of optically sized, greyscale-until-hover brand logos. */
export function BrandWall({ items, showMeta = true }: { items: WallBrand[]; showMeta?: boolean }) {
  return (
    <ul className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
      {items.map((b) => (
        <li key={b.slug} className="bg-white">
          <Link
            href={`/brand/${b.slug}`}
            className="group relative flex h-32 flex-col items-center justify-center px-5 outline-offset-[-2px]"
            aria-label={`${b.name}, ${b.count} ${b.count === 1 ? "product" : "products"}`}
          >
            <BrandLogo name={b.name} logoUrl={b.logoUrl} width={b.logoWidth} height={b.logoHeight} maxW={160} maxH={64} area={5600} muted />
            {showMeta ? (
              <span className="absolute inset-x-0 bottom-2.5 text-center text-xs text-muted opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 [@media(hover:none)]:opacity-100">
                {b.name}, {b.count} {b.count === 1 ? "product" : "products"}
              </span>
            ) : null}
          </Link>
        </li>
      ))}
    </ul>
  );
}
