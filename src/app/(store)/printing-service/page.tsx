import type { Metadata } from "next";
import Link from "next/link";
import { brand } from "@/config/brand";
import { categoriesIn } from "@/data/categories";
import { PageHead } from "@/components/PageHead";
import { ProductArt } from "@/components/ProductArt";
import { PrintQuoteForm } from "./PrintQuoteForm";

export const metadata: Metadata = {
  title: "3D printing service",
  description: "Custom 3D printed drone parts made to order: GPS supports, battery supports, prop guards, ball frame prints and cases, in every common material.",
};

const materials = [
  { name: "PLA", note: "Stiff and easy to print. Good for prototypes, fit checks and indoor parts. Softens in a hot car." },
  { name: "PETG", note: "Tougher than PLA with better heat and moisture resistance. A good all-round choice for mounts and cases." },
  { name: "ABS / ASA", note: "Heat resistant. ASA adds UV stability for parts that live in the sun." },
  { name: "TPU (flexible)", note: "Rubber-like and impact absorbing. Used for GPS and camera mounts, bumpers and vibration pads." },
  { name: "Nylon", note: "Strong, wear resistant and slightly flexible. Good for parts that take repeated load." },
  { name: "Carbon-fibre filled", note: "Very stiff and light. Used where a part must not flex, like arms, masts and brackets." },
];

const steps = [
  { title: "Send your part", body: "Tell us what you need and email your STL, STEP or 3MF file, or a sketch with measurements." },
  { title: "We confirm and quote", body: "We check the design, suggest a material and reply with the price and timing before anything is printed." },
  { title: "We print and ship", body: "Your parts are printed, cleaned up and shipped across India." },
];

export default function PrintingServicePage() {
  const cats = categoriesIn("printing");
  return (
    <>
      <PageHead
        title="3D printing service"
        blurb="Custom printed drone parts, made to order in all common materials."
        crumbs={[{ label: "Printing service" }]}
      />
      <div className="mx-auto max-w-[110rem] space-y-12 px-4 lg:px-6">
        <section aria-labelledby="what">
          <h2 id="what" className="font-display text-[1.75rem] font-semibold">What we print</h2>
          <ul className="mt-4 grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-2 lg:grid-cols-3 wide:grid-cols-5">
            {cats.map((c) => (
              <li key={c.slug}>
                <Link href={`/category/${c.slug}`} className="group flex h-full gap-3 rounded-lg border border-line bg-white p-4 hover:border-ink/40">
                  <ProductArt kind={c.art} hue={210} className="size-16 shrink-0 rounded-md bg-paper p-1.5" />
                  <span className="min-w-0">
                    <span className="block font-medium group-hover:text-signal-ink">{c.name}</span>
                    <span className="mt-0.5 block text-sm text-muted">{c.blurb}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm text-muted">Need something that isn’t listed? We print custom parts from your own file too.</p>
        </section>

        <section aria-labelledby="materials">
          <h2 id="materials" className="font-display text-[1.75rem] font-semibold">Materials</h2>
          <p className="mt-1 max-w-2xl text-muted">Not sure which to pick? Choose “Not sure” in the form and we’ll recommend one for the part and how you fly.</p>
          <dl className="mt-4 grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {materials.map((m) => (
              <div key={m.name} className="rounded-lg border border-line bg-white p-4">
                <dt className="font-semibold">{m.name}</dt>
                <dd className="mt-1 text-sm text-muted">{m.note}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section aria-labelledby="how">
          <h2 id="how" className="font-display text-[1.75rem] font-semibold">How it works</h2>
          <ol className="mt-4 grid grid-cols-[minmax(0,1fr)] gap-3 md:grid-cols-3">
            {steps.map((s, i) => (
              <li key={s.title} className="flex gap-3 rounded-lg border border-line bg-white p-4">
                <span className="font-display text-3xl font-semibold leading-none text-signal tabular">{i + 1}</span>
                <span>
                  <span className="block font-medium">{s.title}</span>
                  <span className="block text-sm text-muted">{s.body}</span>
                </span>
              </li>
            ))}
          </ol>
        </section>

        <section id="quote" aria-labelledby="quote-title" className="scroll-mt-40 rounded-lg bg-white p-5 ring-1 ring-line md:p-8">
          <h2 id="quote-title" className="font-display text-[1.75rem] font-semibold">Get a quote</h2>
          <p className="mt-1 text-muted">
            Prefer email? Write to{" "}
            <a href={`mailto:${brand.supportEmail}`} className="font-medium text-signal-ink hover:underline">{brand.supportEmail}</a>
            {brand.whatsapp ? (
              <>
                {" "}or{" "}
                <a href={`https://wa.me/${brand.whatsapp}`} target="_blank" rel="noopener" className="font-medium text-signal-ink hover:underline">message us on WhatsApp</a>
              </>
            ) : null}
            .
          </p>
          <div className="mt-5 max-w-3xl">
            <PrintQuoteForm />
          </div>
        </section>
      </div>
    </>
  );
}
