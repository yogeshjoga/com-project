"use client";

import Link from "next/link";
import { cartTotals, useShop } from "@/store/shop";
import { CartIcon, HeartIcon, UserIcon } from "./icons";

function Badge({ n }: { n: number }) {
  if (!n) return null;
  return (
    <span className="absolute -right-1.5 -top-1 grid min-w-[18px] place-items-center rounded-full bg-signal px-1 text-[11px] font-semibold leading-[18px] text-ink tabular">
      {n > 99 ? "99+" : n}
    </span>
  );
}

export function HeaderActions() {
  const count = useShop((s) => cartTotals(s.cart).count);
  const wish = useShop((s) => s.wishlist.length);
  const openDrawer = useShop((s) => s.openDrawer);
  return (
    <div className="flex items-center gap-1 sm:gap-3">
      <Link href="/account" className="hidden items-center gap-1.5 rounded px-2 py-1.5 text-sm hover:text-signal sm:flex">
        <UserIcon /> <span className="hidden lg:inline">Account</span>
      </Link>
      <Link href="/wishlist" className="relative rounded p-1.5 hover:text-signal" aria-label={`Wishlist, ${wish} items`}>
        <HeartIcon />
        <Badge n={wish} />
      </Link>
      <button
        type="button"
        onClick={() => openDrawer(true)}
        className="relative flex items-center gap-1.5 rounded p-1.5 hover:text-signal"
        aria-label={`Cart, ${count} items`}
      >
        <CartIcon />
        <Badge n={count} />
        <span className="hidden text-sm lg:inline">Cart</span>
      </button>
    </div>
  );
}
