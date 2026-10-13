import type { Metadata } from "next";
import { brand } from "@/config/brand";
import { formatINR } from "@/lib/format";
import { PageHead } from "@/components/PageHead";

export const metadata: Metadata = { title: "Help & returns" };

const faqs = [
  { id: "shipping", q: "How fast do you ship?", a: `Orders placed before 3 pm on working days ship the same day. Most metros receive orders in 2–4 days. Shipping is free above ${formatINR(brand.freeShippingAbove)}, otherwise ${formatINR(brand.shippingFee)}.` },
  { id: "payments", q: "Which payment methods do you accept?", a: `UPI, cards, net banking and cash on delivery. Cash on delivery has a ${formatINR(brand.codFee)} handling fee. LiPo batteries above 100 Wh may be excluded from COD.` },
  { id: "returns", q: "What if my order arrives damaged?", a: "Report it within 48 hours with an unboxing video and we'll replace it or refund you. Electronics that have been soldered or flown can't be returned, but manufacturer warranty still applies where offered." },
  { id: "gst", q: "Do I get a GST invoice?", a: "Yes. Every order includes a GST invoice. Add your GSTIN at checkout to claim input tax credit." },
  { id: "legal", q: "Do I need permission to fly a drone in India?", a: "Nano drones under 250 g don't need a remote pilot certificate for non-commercial use. Heavier drones must be registered on Digital Sky and flown according to the Drone Rules, 2021. Always check the airspace map before you fly." },
  { id: "build", q: "Can you help with my build?", a: `Yes. Email ${brand.supportEmail} with photos of your wiring and Betaflight configuration and we'll help you get it flying.` },
];

export default function SupportPage() {
  return (
    <>
      <PageHead title="Help & returns" crumbs={[{ label: "Help & returns" }]} />
      <div className="mx-auto max-w-3xl space-y-3 px-4">
        {faqs.map((f) => (
          <details key={f.id} id={f.id} className="group rounded-lg bg-white p-5 ring-1 ring-line" open={f.id === "shipping"}>
            <summary className="cursor-pointer list-none font-medium">{f.q}</summary>
            <p className="mt-3 text-ink-2">{f.a}</p>
          </details>
        ))}
        <p className="pt-4 text-sm text-muted">
          Still stuck? Email {brand.supportEmail}, Monday to Saturday, 10 am to 7 pm.
        </p>
      </div>
    </>
  );
}
