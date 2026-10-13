import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { brand } from "@/config/brand";
import { categoryBySlug, departmentBySlug } from "@/data/categories";
import { brandSlug, getProduct, getProducts, related } from "@/lib/catalog";
import { ProductMedia } from "@/components/ProductMedia";
import { BuyBox } from "@/components/BuyBox";
import { Breadcrumbs, Section } from "@/components/Section";
import { ProductRail } from "@/components/ProductCard";
import { ReceiptIcon, ShieldIcon, TruckIcon } from "@/components/icons";
import Link from "next/link";

export async function generateStaticParams() {
  return (await getProducts()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/product/[slug]">): Promise<Metadata> {
  const p = await getProduct((await params).slug);
  return p ? { title: p.name, description: p.short } : {};
}

export default async function ProductPage({ params }: PageProps<"/product/[slug]">) {
  const { slug } = await params;
  const p = await getProduct(slug);
  if (!p) notFound();
  const c = categoryBySlug.get(p.category)!;
  const d = departmentBySlug.get(c.department)!;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    brand: { "@type": "Brand", name: p.brand },
    description: p.short,
    sku: p.sku,
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: p.price,
      availability: p.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: { "@type": "Organization", name: brand.name },
    },
  };

  const buyable = { id: p.id, slug: p.slug, name: p.name, brand: p.brand, price: p.price, mrp: p.mrp, stock: p.stock, art: p.art, hue: p.hue, variant: p.variant, imageUrl: p.imageUrl };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <div className="mx-auto max-w-7xl px-4 pt-6">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: d.name, href: `/department/${d.slug}` },
            { label: c.name, href: `/category/${c.slug}` },
            { label: p.name },
          ]}
        />

        <div className="mt-5 grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-12">
          <div className="lg:sticky lg:top-40 lg:self-start">
            <div className="aspect-[16/10] overflow-hidden rounded-lg bg-white ring-1 ring-line sm:aspect-[4/3]">
              <ProductMedia imageUrl={p.imageUrl} art={p.art} hue={p.hue} alt={p.name} priority className="size-full p-[8%]" />
            </div>
          </div>

          <div>
            <Link href={`/brand/${brandSlug(p.brand)}`} className="text-sm font-medium text-signal-ink hover:underline">{p.brand}</Link>
            <h1 className="mt-1 font-display text-[34px] font-semibold leading-[1.02] md:text-[42px]">{p.name}</h1>
            <p className="mt-3 text-[16px] text-ink-2">{p.short}</p>
            <ul className="mt-4 space-y-1.5 text-sm">
              {p.highlights.map((h) => (
                <li key={h} className="flex gap-2"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-signal" aria-hidden="true" />{h}</li>
              ))}
            </ul>

            <div className="mt-6 border-t border-line pt-6">
              <BuyBox p={buyable} />
            </div>

            <ul className="mt-6 grid grid-cols-3 gap-2 text-center text-xs text-muted">
              <li className="rounded-md bg-white p-3 ring-1 ring-line"><TruckIcon className="mx-auto mb-1 text-ink" />Ships in 24 h</li>
              <li className="rounded-md bg-white p-3 ring-1 ring-line"><ShieldIcon className="mx-auto mb-1 text-ink" />Genuine, with warranty</li>
              <li className="rounded-md bg-white p-3 ring-1 ring-line"><ReceiptIcon className="mx-auto mb-1 text-ink" />GST invoice</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <section>
            <h2 className="font-display text-[28px] font-semibold">Specifications</h2>
            <dl className="mt-3 divide-y divide-line overflow-hidden rounded-lg bg-white ring-1 ring-line">
              {Object.entries({ Brand: p.brand, Category: c.name, ...p.specs, SKU: p.sku }).map(([k, v]) => (
                <div key={k} className="grid grid-cols-[minmax(120px,40%)_1fr] gap-4 px-4 py-2.5 text-sm">
                  <dt className="text-muted">{k}</dt>
                  <dd className="font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          </section>
          <div className="space-y-8">
            {p.inBox ? (
              <section>
                <h2 className="font-display text-[28px] font-semibold">In the box</h2>
                <ul className="mt-3 space-y-1.5 rounded-lg bg-white p-4 text-sm ring-1 ring-line">
                  {p.inBox.map((x) => <li key={x}>{x}</li>)}
                </ul>
              </section>
            ) : null}
            <section>
              <h2 className="font-display text-[28px] font-semibold">Shipping & returns</h2>
              <div className="mt-3 space-y-2 rounded-lg bg-white p-4 text-sm text-ink-2 ring-1 ring-line">
                <p>Orders placed before 3 pm ship the same working day from {brand.dispatchCity}.</p>
                <p>Free shipping above ₹{brand.freeShippingAbove.toLocaleString("en-IN")}. Cash on delivery available for most PIN codes.</p>
                <p>Report damage in transit within 48 hours with an unboxing video. Manufacturer warranty applies where offered.</p>
              </div>
            </section>
          </div>
        </div>
      </div>

      <Section title="You might also need" href={`/category/${c.slug}`} linkLabel={`More ${c.name.toLowerCase()}`}>
        <ProductRail items={await related(p, 10)} />
      </Section>
    </>
  );
}
