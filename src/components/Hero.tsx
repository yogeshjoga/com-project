import Link from "next/link";
import type { Product } from "@/lib/types";
import { formatINR } from "@/lib/format";
import { ProductArt } from "./ProductArt";
import { ProductMedia } from "./ProductMedia";

const quick = [
  { label: "FPV drones", href: "/category/fpv-drones" },
  { label: "Goggles", href: "/category/goggles" },
  { label: "Motors", href: "/category/motors" },
  { label: "Radios", href: "/category/radios" },
  { label: "6S batteries", href: "/search?q=6S" },
  { label: "ESP32 & Pi", href: "/category/dev-boards" },
];

export function Hero({ featured }: { featured: Product }) {
  const s = featured.specs;
  return (
    <section className="bg-ink text-white">
      <div className="mx-auto grid max-w-[1760px] items-center gap-10 px-4 lg:px-6 pb-20 pt-8 md:grid-cols-[1fr_1.1fr] md:pb-24 md:pt-10 xl:grid-cols-[1fr_1fr]">
        <div>
          <h1 className="font-display text-[44px] font-semibold leading-[0.95] sm:text-[60px] lg:text-[72px]">
            Every part for the way you fly.
          </h1>
          <p className="mt-4 max-w-md text-[17px] text-white/75">
            Ready-to-fly quads, goggles, motors and the electronics bench behind them. Genuine stock, priced with GST, shipped across India.
          </p>
          <ul className="mt-6 flex flex-wrap gap-2">
            {quick.map((q) => (
              <li key={q.href}>
                <Link href={q.href} className="block rounded-full border border-white/25 px-3.5 py-1.5 text-sm hover:border-signal hover:text-signal">
                  {q.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {featured.imageUrl ? (
          // Official product photos are shot on white, so they get a white stage with a caption bar.
          <Link href={`/product/${featured.slug}`} className="group flex aspect-[4/3] flex-col overflow-hidden rounded-lg bg-white ring-1 ring-white/10 xl:aspect-[16/9]">
            <div className="relative min-h-0 flex-1">
              <ProductMedia imageUrl={featured.imageUrl} art={featured.art} hue={88} alt={featured.name} priority sizes="(min-width: 1280px) 45vw, 90vw" className="size-full p-6 transition-transform duration-500 group-hover:scale-105" />
            </div>
            <div className="flex items-center justify-between gap-4 bg-ink-2 px-5 py-3">
              <p className="min-w-0 truncate text-sm font-medium text-white sm:text-base">{featured.name}</p>
              <p className="shrink-0 rounded bg-signal px-2.5 py-1 font-semibold tabular text-ink">{formatINR(featured.price)}</p>
            </div>
          </Link>
        ) : (
          // OSD frame for illustrated products: reads like a pilot's goggle view of the featured quad.
          <Link href={`/product/${featured.slug}`} className="group relative block aspect-[4/3] overflow-hidden rounded-lg bg-[#0d1830] ring-1 ring-white/10 xl:aspect-[16/9]">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(124,240,200,.06)_1px,transparent_1px),linear-gradient(90deg,rgba(124,240,200,.06)_1px,transparent_1px)] bg-[size:32px_32px]" />
            <div className="osd-scan pointer-events-none absolute inset-x-0 h-1/3 bg-gradient-to-b from-transparent via-hud/10 to-transparent" />
            <span className="osd-corner left-4 top-4 border-l-2 border-t-2" />
            <span className="osd-corner right-4 top-4 border-r-2 border-t-2" />
            <span className="osd-corner bottom-4 left-4 border-b-2 border-l-2" />
            <span className="osd-corner bottom-4 right-4 border-b-2 border-r-2" />
  
            <div className="absolute inset-[14%]">
              <ProductArt kind={featured.art} hue={88} color="#e8eefb" className="size-full transition-transform duration-500 group-hover:scale-105" />
            </div>
  
            <dl className="absolute left-7 top-7 font-mono text-[12px] leading-5 text-hud sm:text-[13px]">
              <div className="flex gap-2"><dt className="opacity-60">BAT</dt><dd>{s["Battery"]?.split(" ")[0] ?? "6S"}</dd></div>
              <div className="flex gap-2"><dt className="opacity-60">VTX</dt><dd>{s["Video"] ?? "Digital"}</dd></div>
            </dl>
            <dl className="absolute right-7 top-7 text-right font-mono text-[12px] leading-5 text-hud sm:text-[13px]">
              {s["Wheelbase"] ? <div className="flex justify-end gap-2"><dt className="opacity-60">WB</dt><dd>{s["Wheelbase"]}</dd></div> : null}
              {s["Dry weight"] ? <div className="flex justify-end gap-2"><dt className="opacity-60">AUW</dt><dd>{s["Dry weight"]}</dd></div> : null}
            </dl>
            <div className="absolute inset-x-7 bottom-7 flex items-end justify-between gap-4">
              <p className="max-w-[60%] text-sm font-medium leading-snug text-white sm:text-base">{featured.name}</p>
              <p className="shrink-0 rounded bg-signal px-2.5 py-1 font-semibold tabular text-ink">{formatINR(featured.price)}</p>
            </div>
            <span className="absolute left-1/2 top-1/2 size-6 -translate-x-1/2 -translate-y-1/2 rounded-full border border-hud/50" aria-hidden="true" />
          </Link>
        )}
      </div>
    </section>
  );
}
