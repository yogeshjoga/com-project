import Image from "next/image";

/**
 * Sizes a logo by visual area instead of fixed height, so wide wordmarks and compact marks
 * carry the same weight. Falls back to the brand name when there's no logo.
 */
export function BrandLogo({
  name,
  logoUrl,
  width,
  height,
  maxW = 150,
  maxH = 48,
  area = 3400,
  muted = false,
  priority = false,
}: {
  name: string;
  logoUrl?: string | null;
  width?: number | null;
  height?: number | null;
  /** Largest box the logo may occupy, in CSS px. */
  maxW?: number;
  maxH?: number;
  /** Target visual area in CSS px². */
  area?: number;
  /** Greyscale until hover/focus on devices that can hover (see .logo-muted). */
  muted?: boolean;
  priority?: boolean;
}) {
  if (!logoUrl) {
    return <span className="font-display text-lg font-semibold leading-none text-ink">{name}</span>;
  }
  const ratio = width && height ? width / height : 3;
  let h = Math.sqrt(area / ratio);
  let w = h * ratio;
  if (h > maxH) { h = maxH; w = h * ratio; }
  if (w > maxW) { w = maxW; h = w / ratio; }
  w = Math.round(w);
  h = Math.round(h);
  return (
    <Image
      src={logoUrl}
      alt={`${name} logo`}
      width={w * 2}
      height={h * 2}
      style={{ width: `${w / 16}rem`, height: `${h / 16}rem` }}
      sizes={`${w}px`}
      priority={priority}
      className={`object-contain ${muted ? "logo-muted" : ""}`}
    />
  );
}
