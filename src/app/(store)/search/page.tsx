import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchResults } from "./SearchResults";

export const metadata: Metadata = { title: "Search" };

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-4 py-10 text-muted">Searching…</div>}>
      <SearchResults />
    </Suspense>
  );
}
