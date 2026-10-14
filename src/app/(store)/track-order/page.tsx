"use client";

import { useState, useTransition } from "react";
import { PageHead } from "@/components/PageHead";
import { formatINR } from "@/lib/format";
import { trackOrder, type TrackResult } from "../checkout/actions";

const stages = ["confirmed", "packed", "shipped", "delivered"] as const;
const label: Record<string, string> = { awaiting_payment: "Awaiting payment", confirmed: "Confirmed", packed: "Packed", shipped: "Shipped", delivered: "Delivered", cancelled: "Cancelled" };
const field = "h-11 w-full rounded-md bg-white px-3 ring-1 ring-line focus:outline-none focus:ring-2 focus:ring-signal";

export default function TrackOrderPage() {
  const [result, setResult] = useState<TrackResult | null>(null);
  const [pending, start] = useTransition();

  function track(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    start(async () => setResult(await trackOrder(String(f.get("id")), String(f.get("phone")))));
  }

  const order = result?.ok ? result.order : null;
  const at = order ? stages.indexOf(order.status as (typeof stages)[number]) : -1;

  return (
    <>
      <PageHead title="Track your order" blurb="Enter the order ID from your confirmation and the mobile number you ordered with." crumbs={[{ label: "Track order" }]} />
      <div className="mx-auto max-w-2xl px-4">
        <form onSubmit={track} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
          <label className="text-sm"><span className="sr-only">Order ID</span><input name="id" placeholder="Order ID, e.g. EG261000001" required className={`${field} uppercase`} /></label>
          <label className="text-sm"><span className="sr-only">Mobile number</span><input name="phone" inputMode="numeric" maxLength={10} placeholder="Mobile number" required className={field} /></label>
          <button type="submit" disabled={pending} className="h-11 rounded-md bg-ink px-5 font-medium text-white disabled:opacity-60">{pending ? "Checking…" : "Track"}</button>
        </form>

        {result && !result.ok ? <p role="alert" className="mt-4 text-sm text-signal-ink">{result.error}</p> : null}
        {result?.ok && !order ? (
          <p role="alert" className="mt-4 text-sm text-signal-ink">No order matches that ID and mobile number. Check both and try again.</p>
        ) : null}

        {order ? (
          <div className="mt-8 rounded-lg bg-white p-5 ring-1 ring-line">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-semibold tabular">{order.id}</p>
              <p className="text-sm text-muted tabular">{formatINR(order.total)}</p>
            </div>
            {order.status === "awaiting_payment" ? (
              <p className="mt-4 font-medium text-signal-ink">We haven’t received the payment yet. Unpaid orders are released after 30 minutes.</p>
            ) : order.status === "cancelled" ? (
              <p className="mt-4 font-medium text-signal-ink">This order was cancelled.</p>
            ) : (
              <ol className="mt-5 space-y-4">
                {stages.map((s, i) => (
                  <li key={s} className="flex items-center gap-3">
                    <span className={`size-3 rounded-full ${i <= at ? "bg-go" : "bg-line"}`} />
                    <span className={i <= at ? "font-medium" : "text-muted"}>{label[s]}</span>
                  </li>
                ))}
              </ol>
            )}
            {order.tracking_number ? (
              <p className="mt-5 text-sm">Courier: <b>{order.courier ?? "—"}</b>, tracking number <b className="tabular">{order.tracking_number}</b></p>
            ) : null}
          </div>
        ) : null}
      </div>
    </>
  );
}
