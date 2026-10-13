"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/shop", label: "Dashboard" },
  { href: "/shop/products", label: "Products & stock" },
  { href: "/shop/orders", label: "Orders" },
  { href: "/shop/notifications", label: "Notifications" },
];

export function CrmNav() {
  const path = usePathname();
  const isOn = (href: string) => (href === "/shop" ? path === "/shop" : path.startsWith(href));
  return (
    <nav aria-label="Shop dashboard" className="no-scrollbar flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:px-3 lg:pb-0">
      {items.map((i) => (
        <Link
          key={i.href}
          href={i.href}
          aria-current={isOn(i.href) ? "page" : undefined}
          className={`shrink-0 rounded-md px-3 py-2 text-sm ${isOn(i.href) ? "bg-white/10 font-medium text-white" : "text-white/70 hover:bg-white/5 hover:text-white"}`}
        >
          {i.label}
        </Link>
      ))}
      <a href="/" target="_blank" rel="noopener" className="shrink-0 rounded-md px-3 py-2 text-sm text-signal hover:bg-white/5">
        View store
      </a>
    </nav>
  );
}
