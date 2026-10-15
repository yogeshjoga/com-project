import type { Metadata } from "next";
import { hotDeals } from "@/lib/catalog";
import { PageHead } from "@/components/PageHead";
import { Listing } from "@/components/Listing";

export const metadata: Metadata = { title: "Hot deals" };

export default async function DealsPage() {
  return (
    <>
      <PageHead title="Hot deals" blurb="Marked-down drones, gear and parts that are in stock and ready to ship." crumbs={[{ label: "Hot deals" }]} />
      <div className="mx-auto max-w-[1760px] px-4 lg:px-6">
        <Listing items={await hotDeals(500)} />
      </div>
    </>
  );
}
