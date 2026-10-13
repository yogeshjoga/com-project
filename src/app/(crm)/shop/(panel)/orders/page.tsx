import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { requireShopAdmin } from "@/lib/crm/auth";
import { formatINR } from "@/lib/format";
import { PageTitle, Skeleton, StatusPill } from "@/components/crm/ui";

export const metadata: Metadata = { title: "Orders" };

const tabs = [
  { key: "open", label: "To ship", statuses: ["confirmed", "packed"] },
  { key: "shipped", label: "Shipped", statuses: ["shipped"] },
  { key: "delivered", label: "Delivered", statuses: ["delivered"] },
  { key: "cancelled", label: "Cancelled", statuses: ["cancelled"] },
  { key: "all", label: "All", statuses: [] as string[] },
];

export default function OrdersPage({ searchParams }: PageProps<"/shop/orders">) {
  return (
    <>
      <PageTitle title="Orders" sub="Customers get the status you set here on the Track order page." />
      <Suspense fallback={<Skeleton h="h-96" />}>
        <Orders searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function Orders({ searchParams }: { searchParams: PageProps<"/shop/orders">["searchParams"] }) {
  const { sb } = await requireShopAdmin();
  const sp = await searchParams;
  const tab = tabs.find((t) => t.key === sp.status) ?? tabs[0];
  const q = typeof sp.q === "string" ? sp.q.trim() : "";

  let query = sb
    .from("shop_orders")
    .select("id, customer_name, phone, total, status, payment_method, payment_status, created_at, address")
    .order("created_at", { ascending: false })
    .limit(200);
  if (tab.statuses.length) query = query.in("status", tab.statuses);
  if (q) {
    const safe = q.replace(/[%,()]/g, "");
    query = query.or(`id.ilike.%${safe}%,customer_name.ilike.%${safe}%,phone.ilike.%${safe}%,email.ilike.%${safe}%`);
  }
  const { data: orders, error } = await query;
  if (error) return <p className="text-danger">Couldn’t load orders: {error.message}</p>;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <nav className="flex flex-wrap gap-1" aria-label="Order status">
          {tabs.map((t) => (
            <Link
              key={t.key}
              href={`/shop/orders?status=${t.key}`}
              aria-current={t.key === tab.key ? "page" : undefined}
              className={`rounded-full px-3 py-1.5 text-sm ${t.key === tab.key ? "bg-ink text-white" : "bg-white ring-1 ring-line hover:ring-ink"}`}
            >
              {t.label}
            </Link>
          ))}
        </nav>
        <form className="ml-auto flex gap-2" action="/shop/orders">
          <input type="hidden" name="status" value={tab.key} />
          <input name="q" defaultValue={q} placeholder="Order ID, name or phone" aria-label="Search orders" className="h-9 w-56 rounded-md bg-white px-3 text-sm ring-1 ring-line focus:outline-none focus:ring-2 focus:ring-signal" />
          <button type="submit" className="h-9 rounded-md bg-ink px-3 text-sm text-white">Search</button>
        </form>
      </div>

      <div className="overflow-x-auto rounded-lg bg-white ring-1 ring-line">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="border-b border-line text-left text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-3 py-3 font-medium">Customer</th>
              <th className="px-3 py-3 font-medium">Placed</th>
              <th className="px-3 py-3 font-medium">Payment</th>
              <th className="px-3 py-3 font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {(orders ?? []).map((o) => (
              <tr key={o.id} className="hover:bg-paper">
                <td className="px-4 py-3"><Link href={`/shop/orders/${o.id}`} className="font-medium tabular hover:underline">{o.id}</Link></td>
                <td className="px-3 py-3">
                  {o.customer_name}
                  <p className="text-xs text-muted">{(o.address as { city?: string; state?: string })?.city}, {(o.address as { state?: string })?.state}</p>
                </td>
                <td className="px-3 py-3 text-muted tabular">{new Date(o.created_at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}</td>
                <td className="px-3 py-3"><span className="uppercase text-muted">{o.payment_method}</span> <StatusPill status={o.payment_status} /></td>
                <td className="px-3 py-3"><StatusPill status={o.status} /></td>
                <td className="px-4 py-3 text-right font-medium tabular">{formatINR(o.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!orders?.length ? <p className="p-8 text-center text-sm text-muted">{q ? `No orders match “${q}”.` : "No orders in this list."}</p> : null}
      </div>
    </div>
  );
}
