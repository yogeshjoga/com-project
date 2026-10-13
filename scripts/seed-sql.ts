// Prints SQL that seeds shop_products / shop_product_variants from src/data/products.ts.
// Usage: npx tsx scripts/seed-sql.ts > seed.sql
import { products } from "../src/data/products";

const q = (v: unknown) =>
  v === null || v === undefined ? "null" : typeof v === "number" ? String(v) : `'${String(v).replace(/'/g, "''")}'`;
const arr = (a?: string[]) => (a ? `array[${a.map(q).join(",")}]::text[]` : "null");

const out: string[] = ["begin;"];
products.forEach((p, i) => {
  const sku = `EG-${String(i + 1).padStart(4, "0")}`;
  const hasVar = Boolean(p.variant && p.variant.options.length > 0);
  out.push(
    `insert into public.shop_products (sku, slug, name, brand, category, price, mrp, stock, art, tags, short, highlights, specs, in_box, variant_name, weight_g, sort) values (` +
      [q(sku), q(p.slug), q(p.name), q(p.brand), q(p.category), p.price, q(p.mrp ?? null), hasVar ? 0 : p.stock, q(p.art),
       `array[${p.tags.map(q).join(",")}]::text[]`, q(p.short), arr(p.highlights), `${q(JSON.stringify(p.specs))}::jsonb`,
       arr(p.inBox), q(hasVar ? p.variant!.name : null), q(p.weightG ?? null), p.addedOrder].join(", ") +
      `) on conflict (slug) do nothing;`,
  );
  if (hasVar) {
    p.variant!.options.forEach((o, j) =>
      out.push(
        `insert into public.shop_product_variants (product_id, label, price, mrp, stock, sort) select id, ${q(o.label)}, ${o.price}, ${q(o.mrp ?? null)}, ${o.stock}, ${j} from public.shop_products where slug = ${q(p.slug)} on conflict do nothing;`,
      ),
    );
  }
});
out.push("commit;");
console.log(out.join("\n"));
