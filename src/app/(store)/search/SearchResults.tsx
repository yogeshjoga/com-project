"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { buildIndex, searchIndex } from "@/lib/search";
import { useCatalogNow } from "@/components/CatalogProvider";
import { PageHead } from "@/components/PageHead";
import { Listing } from "@/components/Listing";

const suggestions = ["ELRS receiver", "6S LiPo", "O4", "Goggles", "ESP32", "Soldering iron"];

export function SearchResults() {
  const q = useSearchParams().get("q")?.trim() ?? "";
  const { items, categoryNames, loaded } = useCatalogNow();
  const index = useMemo(() => buildIndex(items, categoryNames), [items, categoryNames]);
  const results = useMemo(() => searchIndex(index, q, 500), [index, q]);

  return (
    <>
      <PageHead title={q ? `Results for “${q}”` : "Search"} crumbs={[{ label: "Search" }]} />
      <div className="mx-auto max-w-7xl px-4">
        {q && !loaded ? (
          <div className="h-64 animate-pulse rounded-lg bg-white ring-1 ring-line" aria-label="Searching" />
        ) : q && results.length ? (
          <Listing key={q} items={results} />
        ) : (
          <div className="rounded-lg bg-white p-8 ring-1 ring-line">
            <p className="font-medium">{q ? `No products match “${q}”.` : "Type a product, brand or part in the search bar."}</p>
            <p className="mt-1 text-sm text-muted">Try one of these:</p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <li key={s}>
                  <Link href={`/search?q=${encodeURIComponent(s)}`} className="block rounded-full bg-paper px-3.5 py-1.5 text-sm hover:bg-line">{s}</Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </>
  );
}
