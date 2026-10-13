"use client";

import { useState } from "react";
import { formatINR } from "@/lib/format";

interface Day {
  day: string;
  revenue: number;
  orders: number;
}

const fmtDay = (d: string) => new Date(d + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" });
const compact = (n: number) =>
  n >= 1e7 ? `₹${(n / 1e7).toFixed(1)}Cr` : n >= 1e5 ? `₹${(n / 1e5).toFixed(1)}L` : n >= 1e3 ? `₹${(n / 1e3).toFixed(0)}k` : `₹${n}`;

/** Single-series daily revenue. One hue, so the title names it and no legend is needed. */
export function RevenueChart({ days }: { days: Day[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...days.map((d) => d.revenue));
  // Round the axis top to a friendly number.
  const step = 10 ** Math.floor(Math.log10(max));
  const top = Math.ceil(max / step) * step;
  const ticks = [0, top / 2, top];
  const h = 180;
  const n = days.length;
  const active = hover !== null ? days[hover] : null;

  return (
    <figure className="rounded-lg bg-white p-5 ring-1 ring-line">
      <figcaption className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-semibold">Revenue, last 30 days</h2>
        <p className="text-sm text-muted" aria-live="polite">
          {active ? (
            <>
              {fmtDay(active.day)}: <b className="text-ink tabular">{formatINR(active.revenue)}</b> from {active.orders} {active.orders === 1 ? "order" : "orders"}
            </>
          ) : (
            "Hover a bar for the day’s total. Cancelled orders are excluded."
          )}
        </p>
      </figcaption>

      <div className="mt-4 flex gap-2">
        <div className="relative w-10 shrink-0 text-right text-[11px] text-muted tabular" style={{ height: h }} aria-hidden="true">
          {ticks.map((t) => (
            <span key={t} className="absolute right-0 -translate-y-1/2" style={{ top: h - (t / top) * h }}>
              {compact(t)}
            </span>
          ))}
        </div>
        <div className="relative min-w-0 flex-1" style={{ height: h }} onMouseLeave={() => setHover(null)}>
          {ticks.slice(1).map((t) => (
            <div key={t} className="absolute inset-x-0 border-t border-line" style={{ top: h - (t / top) * h }} aria-hidden="true" />
          ))}
          <div className="absolute inset-x-0 bottom-0 border-t border-ink/40" aria-hidden="true" />
          <div className="absolute inset-0 flex items-end" style={{ gap: 2 }}>
            {days.map((d, i) => (
              <button
                key={d.day}
                type="button"
                onMouseEnter={() => setHover(i)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
                aria-label={`${fmtDay(d.day)}: ${formatINR(d.revenue)}, ${d.orders} orders`}
                className="group relative flex h-full flex-1 items-end"
              >
                <span
                  className={`block w-full rounded-t-[4px] ${hover === null || hover === i ? "bg-chart" : "bg-chart/40"}`}
                  style={{ height: d.revenue ? Math.max(2, (d.revenue / top) * h) : 0 }}
                />
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="ml-12 mt-2 flex justify-between text-[11px] text-muted" aria-hidden="true">
        <span>{n ? fmtDay(days[0].day) : ""}</span>
        <span>{n ? fmtDay(days[Math.floor(n / 2)].day) : ""}</span>
        <span>{n ? fmtDay(days[n - 1].day) : ""}</span>
      </div>

      <details className="mt-4 text-sm">
        <summary className="cursor-pointer text-muted hover:text-ink">Show as table</summary>
        <table className="mt-2 w-full tabular">
          <thead>
            <tr className="text-left text-muted"><th className="py-1 font-medium">Day</th><th className="py-1 text-right font-medium">Orders</th><th className="py-1 text-right font-medium">Revenue</th></tr>
          </thead>
          <tbody>
            {days.map((d) => (
              <tr key={d.day} className="border-t border-line"><td className="py-1">{fmtDay(d.day)}</td><td className="py-1 text-right">{d.orders}</td><td className="py-1 text-right">{formatINR(d.revenue)}</td></tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}
