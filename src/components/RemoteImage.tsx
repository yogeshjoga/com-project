"use client";

import Image, { type ImageLoaderProps } from "next/image";

/**
 * Official product photos live on the brands' CDNs. Shopify's CDN resizes on request,
 * so we ask for exactly the width needed; other hosts (already pre-sized at import) are used as-is.
 */
function brandCdnLoader({ src, width }: ImageLoaderProps) {
  if (/cdn\.shopify\.com|\/cdn\/shop\//.test(src)) return `${src}${src.includes("?") ? "&" : "?"}width=${width}`;
  return src;
}

export function RemoteImage({ alt, ...props }: { src: string; alt: string; sizes: string; priority?: boolean; className?: string }) {
  return <Image loader={brandCdnLoader} fill alt={alt} {...props} />;
}
