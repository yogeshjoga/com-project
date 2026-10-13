import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireShopAdmin } from "@/lib/crm/auth";
import { formatINR, gstIncluded } from "@/lib/format";
import { Card, PageTitle, Skeleton, StatusPill } from "@/components/crm/ui";
import { OrderUpdateForm } from "@/components/crm/OrderUpdateForm";

export const metadata: Metadata = { title: "Order" };

export default function OrderPage({ params }: PageProps<"/shop/orders/[id]">) {
  return (
    <>
      <Link href="/shop/orders" className="text-sm text-muted hover:text-ink">Orders</Link>
      <Suspense fallback={<Skeleton h="h-96" />}>
        <Order params={params} />
      </Suspense>
    </>
  );
}

async function Order({ params }: Pick<PageProps<"/shop/orders/[id]">, "params">) {
  const { sb } = await requireShopAdmin();
  const { id } = await params;
  const { data: o } = await sb.from("shop_orders").select("*, shop_order_items(*)").eq("id", id).maybeSingle();
  if (!o) notFound();
  const a = o.address as { line1: string; line2?: string; city: string; state: string; pin: string };
  const items = o.shop_order_items as { id: number; name: string; variant_label: string | null; unit_price: number; qty: number; product_id: string | null }[];

  return (
    <>
      <PageTitle
        title={`Order ${o.id}`}
        sub={`Placed ${new Date(o.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}`}
        action={<div className="flex gap-2"><StatusPill status={o.status} /><StatusPill status={o.payment_status} /></div>}
      />
      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-4">
          <Card title="Items">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-line">
                {items.map((i) => (
                  <tr key={i.id}>
                    <td className="py-2.5 pr-3">
                      {i.product_id ? <Link href={`/shop/products/${i.product_id}`} className="hover:underline">{i.name}</Link> : i.name}
                      {i.variant_label ? <p className="text-xs text-muted">{i.variant_label}</p> : null}
                    </td>
                    <td className="py-2.5 text-right text-muted tabular">{i.qty} × {formatINR(i.unit_price)}</td>
                    <td className="py-2.5 pl-3 text-right font-medium tabular">{formatINR(i.qty * i.unit_price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <dl className="mt-3 space-y-1 border-t border-line pt-3 text-sm tabular">
              <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd>{formatINR(o.subtotal)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted">Shipping</dt><dd>{o.shipping ? formatINR(o.shipping) : "Free"}</dd></div>
              {o.cod_fee ? <div className="flex justify-between"><dt className="text-muted">COD fee</dt><dd>{formatINR(o.cod_fee)}</dd></div> : null}
              <div className="flex justify-between text-base font-semibold"><dt>Total</dt><dd>{formatINR(o.total)}</dd></div>
              <div className="flex justify-between text-muted"><dt>Includes GST (18%)</dt><dd>{formatINR(gstIncluded(o.subtotal))}</dd></div>
            </dl>
          </Card>

          <Card title="Customer">
            <div className="grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <p className="font-medium">{o.customer_name}</p>
                <p><a href={`tel:+91${o.phone}`} className="hover:underline">+91 {o.phone}</a></p>
                <p><a href={`mailto:${o.email}`} className="hover:underline">{o.email}</a></p>
                {o.gstin ? <p className="mt-2">GSTIN {o.gstin}{o.company ? `, ${o.company}` : ""}</p> : null}
              </div>
              <address className="not-italic">
                {a.line1}<br />
                {a.line2 ? <>{a.line2}<br /></> : null}
                {a.city}, {a.state} {a.pin}
              </address>
            </div>
          </Card>
        </div>

        <OrderUpdateForm
          id={o.id}
          initial={{
            status: o.status,
            payment_status: o.payment_status,
            courier: o.courier ?? "",
            tracking_number: o.tracking_number ?? "",
            staff_notes: o.staff_notes ?? "",
          }}
          paymentMethod={o.payment_method}
        />
      </div>
    </>
  );
}
