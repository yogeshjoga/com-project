"use client";

import { useState } from "react";
import type { ArtKind } from "@/lib/types";
import { ProductMedia } from "./ProductMedia";

/** Official photo gallery: large image plus thumbnails. */
export function ProductGallery({ images, name, art, hue }: { images: string[]; name: string; art: ArtKind; hue: number }) {
  const [active, setActive] = useState(0);
  const main = images[active] ?? images[0];
  return (
    <div>
      <div className="aspect-[16/10] overflow-hidden rounded-lg bg-white ring-1 ring-line sm:aspect-[4/3]">
        <ProductMedia imageUrl={main} art={art} hue={hue} alt={name} priority sizes="(min-width: 1024px) 55vw, 100vw" className="size-full p-[5%]" />
      </div>
      {images.length > 1 ? (
        <ul className="no-scrollbar mt-3 flex gap-2 overflow-x-auto" aria-label="Product photos">
          {images.map((src, i) => (
            <li key={src} className="shrink-0">
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Show photo ${i + 1} of ${images.length}`}
                aria-current={i === active}
                className={`block size-16 overflow-hidden rounded-md bg-white ring-1 sm:size-20 ${i === active ? "ring-2 ring-ink" : "ring-line hover:ring-ink/40"}`}
              >
                <ProductMedia imageUrl={src} art={art} hue={hue} alt="" sizes="80px" className="size-full p-1" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
