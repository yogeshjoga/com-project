import { Suspense } from "react";
import Link from "next/link";
import { requireShopAdmin } from "@/lib/crm/auth";
import { formatINR } from "@/lib/format";
import { RevenueChart } from "@/components/crm/RevenueChart";
import { Card, PageTitle, Skeleton, StatTile, StatusPill } from "@/components/crm/ui";

interface Stats {
  revenue_today: number;
  revenue_30d: number;
  orders_30d: number;
  to_ship: number;
  awaiting_payment: number;
  products: number;
  low_stock: number;
  daily: { day: string; revenue: number; orders: number }[];
  top_products: { name: string; qty: number; revenue: number }[];
}

export default function DashboardPage() {
  return (
    <>
      <PageTitle title="E-commerce dashboard" sub="Live numbers from the EgireRobotics store." />
      <Suspense
        fallback={
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} h="h-24" />)}</div>
            <Skeleton h="h-72" />
          </div>
        }
      >
        <Dashboard />
      </Suspense>
    </>
  );
}

async function Dashboard() {
  const { sb } = await requireShopAdmin();
  await sb.rpc("shop_expire_unpaid"); // release stock from abandoned online payments
  const [{ data: stats }, { data: recent }, { data: lowProducts }, { data: lowVariants }] = await Promise.all([
    sb.rpc("shop_dashboard_stats"),
    sb.from("shop_orders").select("id, customer_name, total, status, payment_method, created_at").order("created_at", { ascending: false }).limit(8),
    sb.from("shop_products").select("id, name, stock, low_stock_at").is("variant_name", null).eq("is_published", true).order("stock").limit(50),
    sb.from("shop_product_variants").select("id, label, stock, product_id, shop_products!inner(id, name, low_stock_at, is_published)").eq("shop_products.is_published", true).order("stock").limit(50),
  ]);
  const s = (stats ?? {}) as Stats;

  type LowRow = { key: string; productId: string; name: string; stock: number };
  const low: LowRow[] = [
    ...(lowProducts ?? []).filter((p) => p.stock <= p.low_stock_at).map((p) => ({ key: p.id, productId: p.id, name: p.name, stock: p.stock })),
    ...((lowVariants ?? []) as unknown as { id: string; label: string; stock: number; shop_products: { id: string; name: string; low_stock_at: number } }[])
      .filter((v) => v.stock <= v.shop_products.low_stock_at)
      .map((v) => ({ key: v.id, productId: v.shop_products.id, name: `${v.shop_products.name} (${v.label})`, stock: v.stock })),
  ].sort((a, b) => a.stock - b.stock);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Revenue today" value={formatINR(s.revenue_today ?? 0)} />
        <StatTile label="Revenue, 30 days" value={formatINR(s.revenue_30d ?? 0)} note={`${s.orders_30d ?? 0} orders`} />
        <StatTile label="Orders to ship" value={String(s.to_ship ?? 0)} note={s.awaiting_payment ? `${s.awaiting_payment} more awaiting payment` : "Confirmed or packed"} href="/shop/orders?status=open" />
        <StatTile label="Low or out of stock" value={String(low.length)} note={`of ${s.products ?? 0} live products`} href="/shop/products?filter=low" />
      </div>

      <RevenueChart days={s.daily ?? []} />

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card title="Recent orders" action={<Link href="/shop/orders" className="text-sm text-signal-ink hover:underline">All orders</Link>}>
          {recent?.length ? (
            <ul className="divide-y divide-line text-sm">
              {recent.map((o) => (
                <li key={o.id}>
                  <Link href={`/shop/orders/${o.id}`} className="flex items-center gap-3 py-2.5 hover:bg-paper">
                    <span className="w-28 shrink-0 font-medium tabular">{o.id}</span>
                    <span className="min-w-0 flex-1 truncate">{o.customer_name}</span>
                    <StatusPill status={o.status} />
                    <span className="w-24 shrink-0 text-right font-medium tabular">{formatINR(o.total)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">No orders yet. They appear here the moment a customer checks out.</p>
          )}
        </Card>

        <div className="space-y-4">
          <Card title="Needs restocking" action={<Link href="/shop/products?filter=low" className="text-sm text-signal-ink hover:underline">Update stock</Link>}>
            {low.length ? (
              <ul className="space-y-2 text-sm">
                {low.slice(0, 8).map((r) => (
                  <li key={r.key} className="flex items-center justify-between gap-3">
                    <Link href={`/shop/products/${r.productId}`} className="min-w-0 truncate hover:underline">{r.name}</Link>
                    <span className={`shrink-0 font-medium tabular ${r.stock === 0 ? "text-danger" : "text-warn"}`}>{r.stock === 0 ? "Out" : `${r.stock} left`}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted">Everything is above its low-stock level.</p>
            )}
          </Card>

          <Card title="Top sellers, 30 days">
            {s.top_products?.length ? (
              <ul className="space-y-2 text-sm">
                {s.top_products.map((t) => (
                  <li key={t.name} className="flex items-center justify-between gap-3">
                    <span className="min-w-0 truncate">{t.name}</span>
                    <span className="shrink-0 text-muted tabular">{t.qty} sold, {formatINR(t.revenue)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted">Best sellers show up after the first orders.</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
