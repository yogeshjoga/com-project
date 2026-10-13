import Image from "next/image";
import type { ArtKind } from "@/lib/types";
import { ProductArt } from "./ProductArt";

/** Product photo uploaded from the CRM, or the built-in line art when there is none. */
export function ProductMedia({
  imageUrl,
  art,
  hue,
  alt,
  className,
  sizes = "(min-width: 1024px) 20vw, 45vw",
  priority = false,
}: {
  imageUrl?: string;
  art: ArtKind;
  hue: number;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  if (!imageUrl) return <ProductArt kind={art} hue={hue} className={className} />;
  return (
    <div className={className}>
      <div className="relative size-full">
        <Image src={imageUrl} alt={alt} fill sizes={sizes} priority={priority} className="object-contain" />
      </div>
    </div>
  );
}
