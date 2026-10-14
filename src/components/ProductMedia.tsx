import Image from "next/image";
import type { ArtKind } from "@/lib/types";
import { ProductArt } from "./ProductArt";
import { RemoteImage } from "./RemoteImage";

/** Product photo (official brand image or CRM upload), or the built-in line art when there is none. */
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
  // Photos uploaded in the CRM (our Supabase storage) go through Next's optimiser; brand CDN photos load directly.
  const ours = imageUrl.includes(".supabase.co/storage/");
  return (
    <div className={className}>
      <div className="relative size-full">
        {ours ? (
          <Image src={imageUrl} alt={alt} fill sizes={sizes} priority={priority} className="object-contain" />
        ) : (
          <RemoteImage src={imageUrl} alt={alt} sizes={sizes} priority={priority} className="object-contain" />
        )}
      </div>
    </div>
  );
}
