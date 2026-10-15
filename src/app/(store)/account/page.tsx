"use client";

import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";
import { formatINR } from "@/lib/format";
import { PageHead } from "@/components/PageHead";

interface Order { id: string; total: number; items: number; date: string; status: string }

export default function AccountPage() {
  const raw = useSyncExternalStore(
    () => () => {},
    () => localStorage.getItem("eg-orders") ?? "[]",
    () => null,
  );
  const orders = useMemo<Order[] | null>(() => {
    if (raw === null) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }, [raw]);

  return (
    <>
      <PageHead title="Your account" crumbs={[{ label: "Account" }]} />
      <div className="mx-auto grid grid-cols-[minmax(0,1fr)] max-w-7xl gap-6 px-4 lg:grid-cols-[1fr_20rem]">
        <section className="rounded-lg bg-white p-5 ring-1 ring-line">
          <h2 className="font-display text-2xl font-semibold">Orders</h2>
          {orders === null ? (
            <div className="mt-4 h-24 animate-pulse rounded bg-paper" />
          ) : orders.length === 0 ? (
            <p className="mt-3 text-sm text-muted">No orders on this device yet. <Link href="/" className="text-signal-ink hover:underline">Start shopping</Link>.</p>
          ) : (
            <ul className="mt-3 divide-y divide-line text-sm">
              {orders.map((o) => (
                <li key={o.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                  <span>
                    <span className="block font-medium tabular">{o.id}</span>
                    <span className="text-muted">{new Date(o.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}, {o.items} {o.items === 1 ? "item" : "items"}</span>
                  </span>
                  <span className="rounded-full bg-go/10 px-2.5 py-0.5 text-xs font-medium text-go">{o.status}</span>
                  <span className="font-semibold tabular">{formatINR(o.total)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
        <aside className="space-y-3">
          <div className="rounded-lg bg-white p-5 ring-1 ring-line">
            <h2 className="font-display text-2xl font-semibold">Sign in</h2>
            <p className="mt-1 text-sm text-muted">Sign in with your mobile number to sync orders, addresses and your wishlist across devices.</p>
            <button type="button" disabled className="mt-4 w-full rounded-md bg-ink py-2.5 text-sm font-medium text-white opacity-60">Sign in with OTP (coming soon)</button>
          </div>
          <Link href="/wishlist" className="block rounded-lg bg-white p-4 text-sm font-medium ring-1 ring-line hover:ring-ink">Wishlist</Link>
          <Link href="/track-order" className="block rounded-lg bg-white p-4 text-sm font-medium ring-1 ring-line hover:ring-ink">Track an order</Link>
        </aside>
      </div>
    </>
  );
}
