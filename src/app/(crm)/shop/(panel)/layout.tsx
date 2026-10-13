import type { Metadata } from "next";
import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import logo from "../../../../../public/brand/egire-lockup-white.png";
import { requireShopAdmin } from "@/lib/crm/auth";
import { CrmNav } from "@/components/crm/CrmNav";
import { signOut } from "../actions";

export const metadata: Metadata = {
  title: { default: "Shop dashboard", template: "%s | Shop dashboard" },
  robots: { index: false, follow: false },
};

async function Who() {
  const { admin } = await requireShopAdmin();
  return (
    <div className="text-sm">
      <p className="truncate font-medium text-white">{admin.name}</p>
      <p className="text-white/60">{admin.role === "super_admin" ? "Super admin" : "Admin"}</p>
      <form action={signOut} className="mt-2">
        <button type="submit" className="text-white/70 underline-offset-4 hover:text-white hover:underline">Sign out</button>
      </form>
    </div>
  );
}

export default function PanelLayout({ children }: LayoutProps<"/shop">) {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[232px_1fr]">
      <aside className="bg-ink text-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col">
        <div className="flex items-center justify-between gap-4 px-5 py-4 lg:block lg:py-6">
          <Link href="/shop" aria-label="Shop dashboard home">
            <Image src={logo} alt="EgireRobotics" priority className="h-8 w-auto" />
          </Link>
          <p className="text-xs text-white/60 lg:mt-2">E-commerce dashboard</p>
        </div>
        <Suspense fallback={<div className="h-10 lg:h-44" />}>
          <CrmNav />
        </Suspense>
        <div className="hidden border-t border-white/10 px-5 py-4 lg:mt-auto lg:block">
          <Suspense fallback={<div className="h-14" />}>
            <Who />
          </Suspense>
        </div>
      </aside>
      <div className="min-w-0 bg-paper">
        <div className="mx-auto max-w-6xl px-4 py-6 lg:px-8 lg:py-8">{children}</div>
      </div>
    </div>
  );
}
