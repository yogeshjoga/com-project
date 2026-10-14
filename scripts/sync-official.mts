// Imports/refreshes official products from brand stores into the CRM database as hidden drafts.
// Re-running is safe: existing products only get their official content refreshed; price, stock,
// summary, category, labels and publishing set by admins are never touched.
//
//   npx tsx --env-file=.env.local scripts/sync-official.mts            # all sources
//   npx tsx --env-file=.env.local scripts/sync-official.mts BetaFPV    # one brand
//   add --dry to fetch and report without writing
import { createClient } from "@supabase/supabase-js";
import { SOURCES, fetchSource, type OfficialItem } from "../src/lib/official/feeds";

const args = process.argv.slice(2);
const dry = args.includes("--dry");
const only = args.filter((a) => !a.startsWith("--")).map((a) => a.toLowerCase());
const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
const secret = process.env.SHOP_SERVER_SECRET!;
if (!url || !key || !secret) throw new Error("Set NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY and SHOP_SERVER_SECRET.");
const sb = createClient(url, key, { auth: { persistSession: false } });

function dedupeSlugs(items: OfficialItem[], taken: Set<string>) {
  for (const it of items) {
    let s = it.slug || "product";
    for (let n = 2; taken.has(s); n++) s = `${it.slug}-${n}`;
    it.slug = s;
    taken.add(s);
  }
}

const sources = SOURCES.filter((s) => !only.length || only.includes(s.brand.toLowerCase()));
const takenSlugs = new Set<string>();
const totals = { inserted: 0, updated: 0, products: 0 };
const byCategory: Record<string, number> = {};

for (const src of sources) {
  let items: OfficialItem[];
  try {
    items = await fetchSource(src, (m) => console.log(m));
  } catch (e) {
    console.error(`${src.brand}: FAILED to fetch (${(e as Error).message}). Skipping.`);
    continue;
  }
  dedupeSlugs(items, takenSlugs);
  for (const it of items) byCategory[it.category] = (byCategory[it.category] ?? 0) + 1;
  totals.products += items.length;
  if (dry) continue;
  for (let i = 0; i < items.length; i += 40) {
    const batch = items.slice(i, i + 40);
    const { data, error } = await sb.rpc("shop_sync_official", { p_secret: secret, p_items: batch });
    if (error) {
      // A batch failing (e.g. a slug taken by a sample product) is retried one by one so one bad row can't block the rest.
      console.warn(`${src.brand}: batch ${i / 40 + 1} failed (${error.message}); retrying individually`);
      for (const one of batch) {
        let r = await sb.rpc("shop_sync_official", { p_secret: secret, p_items: [one] });
        // Brands sometimes reuse a SKU or title across listings: make ours unique with the listing ID.
        for (let tries = 0; r.error && tries < 2; tries++) {
          const id = one.source_key.split(":").pop();
          if (/slug/.test(r.error.message)) one.slug = `${one.slug}-${id}`.slice(0, 100);
          else if (/sku/.test(r.error.message)) one.sku = `${one.sku}-${id}`;
          else break;
          r = await sb.rpc("shop_sync_official", { p_secret: secret, p_items: [one] });
        }
        if (r.error) console.error(`  ✗ ${one.name}: ${r.error.message}`);
        else { totals.inserted += r.data.inserted; totals.updated += r.data.updated; }
      }
      continue;
    }
    totals.inserted += data.inserted;
    totals.updated += data.updated;
  }
  console.log(`${src.brand}: synced`);
}

console.log("\nBy category:", Object.entries(byCategory).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(", "));
console.log(dry ? `DRY RUN: ${totals.products} products fetched, nothing written.` : `Done: ${totals.inserted} new, ${totals.updated} refreshed (${totals.products} fetched).`);
