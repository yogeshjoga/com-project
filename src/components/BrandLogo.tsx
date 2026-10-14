import Image from "next/image";

/** Brand logo when one is set in the CRM, otherwise a clean wordmark. */
export function BrandLogo({
  name,
  logoUrl,
  className = "h-10",
  sizes = "160px",
}: {
  name: string;
  logoUrl?: string | null;
  className?: string;
  sizes?: string;
}) {
  if (!logoUrl) {
    return (
      <span className={`flex items-center justify-center font-display text-xl font-semibold leading-none text-ink ${className}`}>
        {name}
      </span>
    );
  }
  return (
    <span className={`relative block w-full ${className}`}>
      <Image src={logoUrl} alt={`${name} logo`} fill sizes={sizes} className="object-contain" />
    </span>
  );
}
