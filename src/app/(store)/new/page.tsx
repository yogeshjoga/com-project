import type { Metadata } from "next";
import { justLanded } from "@/lib/catalog";
import { PageHead } from "@/components/PageHead";
import { Listing } from "@/components/Listing";

export const metadata: Metadata = { title: "Just landed" };

export default async function NewPage() {
  return (
    <>
      <PageHead title="Just landed" blurb="The latest arrivals across drones, FPV and electronics." crumbs={[{ label: "Just landed" }]} />
      <div className="mx-auto max-w-7xl px-4">
        <Listing items={await justLanded(40)} />
      </div>
    </>
  );
}
