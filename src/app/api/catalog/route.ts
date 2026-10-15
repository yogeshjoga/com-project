import { categories } from "@/data/categories";
import { getSummaries } from "@/lib/catalog";

const categoryNames = Object.fromEntries(categories.map((c) => [c.slug, c.name]));

// The search index for the header search, search page and wishlist. Fetched only when a shopper
// starts searching, so product pages don't carry the whole catalog in their HTML.
export async function GET() {
  const items = await getSummaries();
  return Response.json(
    { items, categoryNames },
    { headers: { "Cache-Control": "public, max-age=60, s-maxage=60, stale-while-revalidate=600" } },
  );
}
