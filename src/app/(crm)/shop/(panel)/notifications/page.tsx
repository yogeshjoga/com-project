import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { requireShopAdmin } from "@/lib/crm/auth";
import { Card, PageTitle, Skeleton } from "@/components/crm/ui";
import { AnnouncementForm, AnnouncementRow, MarkReadButton } from "@/components/crm/Announcements";

export const metadata: Metadata = { title: "Notifications" };

export default function NotificationsPage() {
  return (
    <>
      <PageTitle title="Notifications" sub="Send a message to every store visitor, and see the alerts the shop sends you." />
      <Suspense fallback={<Skeleton h="h-96" />}>
        <Content />
      </Suspense>
    </>
  );
}

async function Content() {
  const { sb, admin } = await requireShopAdmin();
  const [{ data: items }, { data: alerts }] = await Promise.all([
    sb.from("shop_announcements").select("id, message, link, tone, is_active, starts_at, ends_at, created_at").order("created_at", { ascending: false }).limit(50),
    sb.from("notifications").select("id, title, body, link, kind, read_at, created_at").eq("recipient_id", admin.id).in("kind", ["shop_order", "shop_stock"]).order("created_at", { ascending: false }).limit(30),
  ]);
  const unread = (alerts ?? []).filter((a) => !a.read_at).length;

  return (
    <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
      <div className="space-y-4">
        <Card title="Send a store announcement">
          <p className="mb-4 text-sm text-muted">Shows as a bar at the top of every store page until it ends or you switch it off. Use it for sales, restocks, holidays and shipping delays.</p>
          <AnnouncementForm />
        </Card>
        <Card title="Announcements">
          {items?.length ? (
            <ul className="divide-y divide-line">
              {items.map((a) => <AnnouncementRow key={a.id} a={a} />)}
            </ul>
          ) : (
            <p className="text-sm text-muted">No announcements yet.</p>
          )}
        </Card>
      </div>

      <Card title={`Shop alerts${unread ? ` (${unread} new)` : ""}`} action={unread ? <MarkReadButton /> : null}>
        <p className="mb-3 text-sm text-muted">New orders and low stock. These also appear in your CRM notification bell.</p>
        {alerts?.length ? (
          <ul className="space-y-1">
            {alerts.map((n) => (
              <li key={n.id}>
                <Link href={n.link ?? "/shop"} className={`block rounded-md p-2.5 text-sm hover:bg-paper ${n.read_at ? "" : "bg-[#fdf6e3]"}`}>
                  <span className="flex items-baseline justify-between gap-3">
                    <span className="font-medium">{n.title}</span>
                    <span className="shrink-0 text-xs text-muted">{new Date(n.created_at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}</span>
                  </span>
                  <span className="text-muted">{n.body}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted">No alerts yet. You’ll get one for every new order and when a product drops to its low-stock level.</p>
        )}
      </Card>
    </div>
  );
}
