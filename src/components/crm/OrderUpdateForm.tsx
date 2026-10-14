"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { updateOrder } from "@/app/(crm)/shop/actions";
import { inputCls } from "./ui";

type Patch = { status: string; payment_status: string; courier: string; tracking_number: string; staff_notes: string };

export function OrderUpdateForm({ id, initial, paymentMethod }: { id: string; initial: Patch; paymentMethod: string }) {
  const [f, setF] = useState(initial);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();
  const locked = initial.status === "cancelled";

  function save(e: React.FormEvent) {
    e.preventDefault();
    if (f.status === "cancelled" && initial.status !== "cancelled" &&
        !window.confirm("Cancel this order? Its items go back into stock, and it can’t be reopened.")) return;
    if (f.status === "shipped" && !f.tracking_number.trim() &&
        !window.confirm("Mark as shipped without a tracking number? The customer won’t be able to track the parcel.")) return;
    start(async () => {
      const res = await updateOrder(id, f);
      setMsg(res.ok ? { ok: true, text: "Order updated. The customer sees the new status on Track order." } : { ok: false, text: res.error });
      if (res.ok) router.refresh();
    });
  }

  const set = (k: keyof Patch) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setMsg(null);
    setF((x) => ({ ...x, [k]: e.target.value }));
  };

  return (
    <form onSubmit={save} className="space-y-4 rounded-lg bg-white p-5 ring-1 ring-line lg:self-start">
      <h2 className="font-semibold">Fulfilment</h2>
      {locked ? <p className="text-sm text-muted">This order was cancelled and its stock was returned. It can’t be changed.</p> : null}
      <label className="block text-sm">
        <span className="font-medium">Order status</span>
        <select value={f.status} onChange={set("status")} disabled={locked} className={`${inputCls} mt-1.5`}>
          {initial.status === "awaiting_payment" ? <option value="awaiting_payment">Awaiting payment</option> : null}
          <option value="confirmed">Confirmed</option>
          <option value="packed">Packed</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled (returns stock)</option>
        </select>
      </label>
      <label className="block text-sm">
        <span className="font-medium">Payment</span> <span className="text-muted">({paymentMethod === "cod" ? "cash on delivery" : "online, Razorpay"})</span>
        <select value={f.payment_status} onChange={set("payment_status")} disabled={locked} className={`${inputCls} mt-1.5`}>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="refunded">Refunded</option>
        </select>
      </label>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        <label className="block text-sm">
          <span className="font-medium">Courier</span>
          <input value={f.courier} onChange={set("courier")} disabled={locked} placeholder="e.g. Delhivery" className={`${inputCls} mt-1.5`} />
        </label>
        <label className="block text-sm">
          <span className="font-medium">Tracking number</span>
          <input value={f.tracking_number} onChange={set("tracking_number")} disabled={locked} className={`${inputCls} mt-1.5`} />
        </label>
      </div>
      <label className="block text-sm">
        <span className="font-medium">Staff notes</span> <span className="text-muted">(not shown to the customer)</span>
        <textarea value={f.staff_notes} onChange={set("staff_notes")} disabled={locked} rows={3} className={`${inputCls} mt-1.5 h-auto py-2`} />
      </label>
      {msg ? <p role={msg.ok ? "status" : "alert"} className={`rounded-md p-3 text-sm ${msg.ok ? "bg-[#e6f6ef] text-go" : "bg-[#fdecea] text-danger"}`}>{msg.text}</p> : null}
      {!locked ? (
        <button type="submit" disabled={pending} className="h-11 w-full rounded-md bg-ink font-medium text-white disabled:opacity-60">
          {pending ? "Saving…" : "Save order"}
        </button>
      ) : null}
    </form>
  );
}
