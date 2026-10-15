import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchResults } from "./SearchResults";

export const metadata: Metadata = { title: "Search" };

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-[1760px] px-4 lg:px-6 py-10 text-muted">Searching…</div>}>
      <SearchResults />
    </Suspense>
  );
}
