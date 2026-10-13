import Image from "next/image";
import Link from "next/link";
import { brand } from "@/config/brand";
import lockupWhite from "../../public/brand/egire-lockup-white.png";
import lockupDark from "../../public/brand/egire-lockup-dark.png";

// Official EgireRobotics lockup (mark + wordmark) from the CRM branding bucket.
export function Logo({ inverted = true, className = "h-8 w-auto sm:h-9" }: { inverted?: boolean; className?: string }) {
  return (
    <Link href="/" className="flex shrink-0 items-center" aria-label={`${brand.name} home`}>
      <Image src={inverted ? lockupWhite : lockupDark} alt={brand.name} priority className={className} />
    </Link>
  );
}
