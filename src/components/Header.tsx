import Link from "next/link";
import { brand } from "@/config/brand";
import { categoriesIn, departments } from "@/data/categories";
import { formatINR } from "@/lib/format";
import { Logo } from "./Logo";
import { SearchBox } from "./SearchBox";
import { HeaderActions } from "./HeaderActions";
import { MobileMenu } from "./MobileMenu";
import { ChevronDown } from "./icons";

export function Header() {
  return (
    <header className="sticky top-0 z-40">
      <div className="hidden bg-ink-2 text-[13px] text-white/80 md:block">
        <div className="mx-auto flex h-8 max-w-7xl items-center justify-between px-4">
          <p>Free shipping on orders over {formatINR(brand.freeShippingAbove)}. GST invoice on every order.</p>
          <div className="flex items-center gap-5">
            <Link href="/track-order" className="hover:text-white">Track order</Link>
            <Link href="/support" className="hover:text-white">Help & returns</Link>
            <a href={`mailto:${brand.supportEmail}`} className="hover:text-white">{brand.supportEmail}</a>
          </div>
        </div>
      </div>

      <div className="bg-ink text-white">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 md:gap-6">
          <MobileMenu />
          <Logo />
          <div className="hidden flex-1 md:block">
            <SearchBox />
          </div>
          <div className="ml-auto md:ml-0">
            <HeaderActions />
          </div>
        </div>
        <div className="px-4 pb-3 md:hidden">
          <SearchBox />
        </div>
      </div>

      <nav aria-label="Departments" className="hidden border-b border-line bg-white lg:block">
        <ul className="mx-auto flex max-w-7xl items-stretch gap-1 px-4 text-sm">
          {departments.map((d) => (
            <li key={d.slug} className="group relative">
              <Link
                href={`/department/${d.slug}`}
                className="flex h-11 items-center gap-1 whitespace-nowrap px-2.5 font-medium text-ink hover:text-signal-ink group-focus-within:text-signal-ink"
              >
                {d.name}
                <ChevronDown className="text-muted" />
              </Link>
              <div className="invisible absolute left-0 top-full z-50 w-64 rounded-b-md border border-t-0 border-line bg-white p-2 opacity-0 shadow-lg transition-opacity group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                {categoriesIn(d.slug).map((c) => (
                  <Link key={c.slug} href={`/category/${c.slug}`} className="block rounded px-3 py-2 hover:bg-paper">
                    {c.name}
                  </Link>
                ))}
              </div>
            </li>
          ))}
          <li className="ml-auto">
            <Link href="/deals" className="flex h-11 items-center whitespace-nowrap px-2.5 font-semibold text-signal-ink">Hot deals</Link>
          </li>
          <li>
            <Link href="/new" className="flex h-11 items-center whitespace-nowrap px-2.5 font-medium">Just landed</Link>
          </li>
          <li>
            <Link href="/brands" className="flex h-11 items-center px-2.5 font-medium">Brands</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
