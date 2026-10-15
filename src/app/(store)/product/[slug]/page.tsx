import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { brand } from "@/config/brand";
import { categoryBySlug, departmentBySlug } from "@/data/categories";
import { brandSlug, getBrandInfo, getProduct, getProductDescription, getProducts, related } from "@/lib/catalog";
import { BrandLogo } from "@/components/BrandLogo";
import { ProductGallery } from "@/components/ProductGallery";
import { BuyBox } from "@/components/BuyBox";
import { Breadcrumbs, Section } from "@/components/Section";
import { ProductRail } from "@/components/ProductCard";
import { ReceiptIcon, ShieldIcon, TruckIcon } from "@/components/icons";
import Link from "next/link";

export async function generateStaticParams() {
  // Prebuild the newest products; the rest of the catalog renders on first visit and is then cached.
  return (await getProducts()).slice(0, 100).map((p) => ({ slug: p.slug }));
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
  const brandInfo = (await getBrandInfo())[brandSlug(p.brand)];
  const brandLogo = brandInfo?.logoUrl;
  const d = departmentBySlug.get(c.department)!;
  const description = await getProductDescription(p.slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    brand: { "@type": "Brand", name: p.brand },
    description: p.short,
    sku: p.sku,
    image: p.images.length ? p.images.slice(0, 4) : undefined,
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
      <div className="mx-auto max-w-[1760px] px-4 lg:px-6 pt-6">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: d.name, href: `/department/${d.slug}` },
            { label: c.name, href: `/category/${c.slug}` },
            { label: p.name },
          ]}
        />

        {/* Gallery | details | buy box on wide screens; the buy box drops under the details below xl. */}
        <div className="mt-5 grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-10 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_340px]">
          <div className="lg:sticky lg:top-40 lg:row-span-2 lg:self-start xl:row-span-1">
            <ProductGallery images={p.images} name={p.name} art={p.art} hue={p.hue} />
          </div>

          <div>
            <Link href={`/brand/${brandSlug(p.brand)}`} className="inline-flex items-center gap-2 text-sm font-medium text-signal-ink hover:underline">
              {brandLogo ? (
                <BrandLogo name={p.brand} logoUrl={brandLogo} width={brandInfo?.logoWidth} height={brandInfo?.logoHeight} maxW={110} maxH={30} area={1500} />
              ) : null}
              <span className={brandLogo ? "sr-only" : ""}>{p.brand}</span>
            </Link>
            <h1 className="mt-1 font-display text-[34px] font-semibold leading-[1.02] md:text-[42px]">{p.name}</h1>
            {p.short ? <p className="mt-3 text-[16px] text-ink-2">{p.short}</p> : null}
            <ul className="mt-4 space-y-1.5 text-sm">
              {p.highlights.map((h) => (
                <li key={h} className="flex gap-2"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-signal" aria-hidden="true" />{h}</li>
              ))}
            </ul>
          </div>

          <div className="lg:col-start-2 xl:sticky xl:top-40 xl:col-start-3 xl:row-start-1 xl:self-start">
            <div className="border-t border-line pt-6 xl:rounded-lg xl:border-t-0 xl:bg-white xl:p-5 xl:ring-1 xl:ring-line">
              <BuyBox p={buyable} />
            </div>

            <ul className="mt-4 grid grid-cols-3 gap-2 text-center text-xs text-muted">
              <li className="rounded-md bg-white p-3 ring-1 ring-line"><TruckIcon className="mx-auto mb-1 text-ink" />Ships in 24 h</li>
              <li className="rounded-md bg-white p-3 ring-1 ring-line"><ShieldIcon className="mx-auto mb-1 text-ink" />Genuine, with warranty</li>
              <li className="rounded-md bg-white p-3 ring-1 ring-line"><ReceiptIcon className="mx-auto mb-1 text-ink" />GST invoice</li>
            </ul>
          </div>
        </div>

        {description ? (
          <section className="mt-12" aria-labelledby="product-description">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2 id="product-description" className="font-display text-[28px] font-semibold">Description</h2>
              {p.sourceUrl ? (
                <a href={p.sourceUrl} target="_blank" rel="noopener nofollow" className="text-sm text-signal-ink hover:underline">
                  Official {p.brand} product page
                </a>
              ) : null}
            </div>
            {/* Official description from the brand, sanitised at import (structural tags only). */}
            <div className="official-desc mt-3 rounded-lg bg-white p-5 ring-1 ring-line md:p-8 [&>*]:max-w-[100ch]" dangerouslySetInnerHTML={{ __html: description }} />
          </section>
        ) : null}

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
