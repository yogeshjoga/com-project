"use client";

import Image, { type ImageLoaderProps } from "next/image";

/**
 * Official product photos live on the brands' CDNs. Shopify's CDN resizes on request,
 * so we ask for exactly the width needed; other hosts (already pre-sized at import) are used as-is.
 */
function brandCdnLoader({ src, width }: ImageLoaderProps) {
  if (/cdn\.shopify\.com|\/cdn\/shop\//.test(src)) return `${src}${src.includes("?") ? "&" : "?"}width=${width}`;
  // BigCommerce (SpeedyBee) serves any size from its /stencil/{w}x{h}/ path.
  if (/bigcommerce\.com\/.+\/stencil\/\d+x\d+\//.test(src)) return src.replace(/\/stencil\/\d+x\d+\//, `/stencil/${width}x${width}/`);
  // DJI's CDN serves fixed sizes named in the file (…@large.jpg).
  if (/se-cdn\.djiits\.com\/.+@[a-z_0-9]+\.(jpg|png|webp)$/.test(src)) {
    const size = width <= 160 ? "mini" : width <= 240 ? "small" : width <= 320 ? "medium" : width <= 480 ? "large" : "xlarge";
    return src.replace(/@[a-z_0-9]+\.(jpg|png|webp)$/, `@${size}.$1`);
  }
  return src;
}

export function RemoteImage({ alt, ...props }: { src: string; alt: string; sizes: string; priority?: boolean; className?: string }) {
  return <Image loader={brandCdnLoader} fill alt={alt} {...props} />;
}
