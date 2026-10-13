import Link from "next/link";
import { brand } from "@/config/brand";
import { departments } from "@/data/categories";
import { Logo } from "./Logo";
import { ReceiptIcon, ShieldIcon, TruckIcon, WrenchIcon } from "./icons";

const promises = [
  { icon: TruckIcon, title: "Ships in 24 hours", body: "Orders before 3 pm leave the same day." },
  { icon: ShieldIcon, title: "Genuine stock", body: "Sourced from brands and authorised distributors." },
  { icon: ReceiptIcon, title: "GST invoice", body: "Claim input credit on business orders." },
  { icon: WrenchIcon, title: "Build support", body: "Help with wiring, binding and tuning." },
];

export function TrustBar() {
  return (
    <section className="border-y border-line bg-white">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-x-4 gap-y-5 px-4 py-6 lg:grid-cols-4">
        {promises.map(({ icon: Icon, title, body }) => (
          <div key={title} className="flex gap-3">
            <Icon className="mt-0.5 shrink-0 text-signal" />
            <div>
              <p className="text-sm font-semibold">{title}</p>
              <p className="text-[13px] text-muted">{body}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="mt-16 bg-ink text-white/75">
      <TrustBar />
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo className="h-10 w-auto" />
          <p className="mt-3 text-sm tracking-[0.2em] text-white/60">{brand.tagline}</p>
          <p className="mt-4 text-sm">{brand.legalName}</p>
          <p className="text-sm">{brand.address}</p>
          {brand.gstin ? <p className="text-sm">GSTIN {brand.gstin}</p> : null}
        </div>
        <div>
          <h2 className="mb-3 text-sm font-semibold text-white">Shop</h2>
          <ul className="space-y-2 text-sm">
            {departments.map((d) => (
              <li key={d.slug}><Link href={`/department/${d.slug}`} className="hover:text-white">{d.name}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="mb-3 text-sm font-semibold text-white">Help</h2>
          <ul className="space-y-2 text-sm">
            <li><Link href="/track-order" className="hover:text-white">Track your order</Link></li>
            <li><Link href="/support" className="hover:text-white">Shipping & delivery</Link></li>
            <li><Link href="/support#returns" className="hover:text-white">Returns & warranty</Link></li>
            <li><Link href="/support#payments" className="hover:text-white">Payments & COD</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="mb-3 text-sm font-semibold text-white">Talk to us</h2>
          <ul className="space-y-2 text-sm">
            {brand.supportPhone ? <li><a href={`tel:${brand.supportPhone.replace(/\s/g, "")}`} className="hover:text-white">{brand.supportPhone}</a></li> : null}
            <li><a href={`mailto:${brand.supportEmail}`} className="hover:text-white">{brand.supportEmail}</a></li>
            {brand.whatsapp ? <li><a href={`https://wa.me/${brand.whatsapp}`} className="hover:text-white" rel="noopener" target="_blank">WhatsApp</a></li> : null}
            <li><a href={brand.siteUrl} className="hover:text-white">FPV workshops</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto max-w-7xl px-4 py-5 text-xs text-white/50">
          © {brand.legalName}. Prices include GST. Flying drones in India is governed by the Drone Rules, 2021. Check the Digital Sky airspace map before you fly.
        </p>
      </div>
    </footer>
  );
}
