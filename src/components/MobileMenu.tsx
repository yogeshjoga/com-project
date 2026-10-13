"use client";

import Link from "next/link";
import { useLayoutEffect, useState } from "react";
import { categories, departments } from "@/data/categories";
import { CloseIcon, MenuIcon } from "./icons";

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  useLayoutEffect(() => () => setOpen(false), []);
  const close = () => setOpen(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="-ml-1 rounded p-1.5 lg:hidden" aria-label="Open menu">
        <MenuIcon />
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <button type="button" className="absolute inset-0 bg-ink/50" aria-label="Close menu" onClick={close} />
          <div className="absolute inset-y-0 left-0 flex w-[86%] max-w-sm flex-col overflow-y-auto bg-white text-ink">
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <span className="font-display text-xl font-semibold">Shop by department</span>
              <button type="button" onClick={close} aria-label="Close menu" className="rounded p-1"><CloseIcon /></button>
            </div>
            <div className="flex gap-2 px-4 py-3">
              <Link onNavigate={close} href="/deals" className="rounded-full bg-signal px-3 py-1.5 text-sm font-semibold text-ink">Hot deals</Link>
              <Link onNavigate={close} href="/new" className="rounded-full bg-paper px-3 py-1.5 text-sm font-medium">Just landed</Link>
              <Link onNavigate={close} href="/brands" className="rounded-full bg-paper px-3 py-1.5 text-sm font-medium">Brands</Link>
            </div>
            {departments.map((d) => (
              <details key={d.slug} className="border-t border-line">
                <summary className="cursor-pointer list-none px-4 py-3 font-medium">{d.name}</summary>
                <div className="pb-2">
                  <Link onNavigate={close} href={`/department/${d.slug}`} className="block px-6 py-2 text-sm font-medium text-signal-ink">
                    All {d.name.toLowerCase()}
                  </Link>
                  {categories.filter((c) => c.department === d.slug).map((c) => (
                    <Link onNavigate={close} key={c.slug} href={`/category/${c.slug}`} className="block px-6 py-2 text-sm">
                      {c.name}
                    </Link>
                  ))}
                </div>
              </details>
            ))}
            <div className="mt-auto border-t border-line px-4 py-4 text-sm">
              <Link onNavigate={close} href="/account" className="block py-1.5">Account</Link>
              <Link onNavigate={close} href="/track-order" className="block py-1.5">Track order</Link>
              <Link onNavigate={close} href="/support" className="block py-1.5">Help & returns</Link>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
