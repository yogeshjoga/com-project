import Link from "next/link";

export function PageTitle({ title, sub, action }: { title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-[36px] font-semibold leading-none">{title}</h1>
        {sub ? <p className="mt-2 text-sm text-muted">{sub}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function StatTile({ label, value, note, href }: { label: string; value: string; note?: string; href?: string }) {
  const body = (
    <>
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular">{value}</p>
      {note ? <p className="mt-0.5 text-xs text-muted">{note}</p> : null}
    </>
  );
  return href ? (
    <Link href={href} className="block rounded-lg bg-white p-4 ring-1 ring-line hover:ring-ink/40">{body}</Link>
  ) : (
    <div className="rounded-lg bg-white p-4 ring-1 ring-line">{body}</div>
  );
}

const statusStyle: Record<string, string> = {
  confirmed: "bg-[#eef3f7] text-ink-2",
  packed: "bg-[#fdf6e3] text-signal-ink",
  shipped: "bg-[#e8f1fb] text-chart",
  delivered: "bg-[#e6f6ef] text-go",
  cancelled: "bg-[#fdecea] text-danger",
  pending: "bg-[#fdf6e3] text-signal-ink",
  paid: "bg-[#e6f6ef] text-go",
  refunded: "bg-[#eef3f7] text-muted",
};

export const statusLabel: Record<string, string> = {
  confirmed: "Confirmed", packed: "Packed", shipped: "Shipped", delivered: "Delivered", cancelled: "Cancelled",
  pending: "Payment pending", paid: "Paid", refunded: "Refunded",
};

export function StatusPill({ status }: { status: string }) {
  return (
    <span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyle[status] ?? "bg-paper"}`}>
      {statusLabel[status] ?? status}
    </span>
  );
}

export function Card({ title, action, children, className = "" }: { title?: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-lg bg-white p-5 ring-1 ring-line ${className}`}>
      {title ? (
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <h2 className="font-semibold">{title}</h2>
          {action}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export const inputCls = "h-10 w-full rounded-md bg-white px-3 text-sm ring-1 ring-line focus:outline-none focus:ring-2 focus:ring-signal";

export function Skeleton({ h = "h-40" }: { h?: string }) {
  return <div className={`${h} animate-pulse rounded-lg bg-white ring-1 ring-line`} />;
}
