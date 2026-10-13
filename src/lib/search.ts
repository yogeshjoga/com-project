import type { ProductSummary } from "./types";

const norm = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9.]+/g, " ").trim();

export interface Indexed {
  p: ProductSummary;
  hay: string;
  name: string;
}

export function buildIndex(items: ProductSummary[], categoryNames: Record<string, string>): Indexed[] {
  return items.map((p) => ({
    p,
    name: norm(p.name),
    hay: norm(`${p.name} ${p.brand} ${categoryNames[p.category] ?? ""} ${p.tags.join(" ")}`),
  }));
}

/** Every query word must match; names that start with the query rank first, then in-stock items. */
export function searchIndex(index: Indexed[], query: string, limit = 50) {
  const q = norm(query);
  if (!q) return [];
  const words = q.split(" ");
  const out: { p: ProductSummary; score: number }[] = [];
  for (const it of index) {
    let score = 0;
    let ok = true;
    for (const w of words) {
      const at = it.hay.indexOf(w);
      if (at < 0) { ok = false; break; }
      score += it.name.includes(w) ? 3 : 1;
      if (at === 0 || it.hay[at - 1] === " ") score += 1;
    }
    if (!ok) continue;
    if (it.name.startsWith(q)) score += 5;
    if (it.p.stock > 0) score += 1;
    out.push({ p: it.p, score });
  }
  return out.sort((a, b) => b.score - a.score).slice(0, limit).map((r) => r.p);
}
