const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function formatINR(n: number) {
  return inr.format(n);
}

/** GST included in a tax-inclusive price at the given rate (18% default for drone parts). */
export function gstIncluded(total: number, rate = 0.18) {
  return Math.round(total - total / (1 + rate));
}

export function discountPct(price: number, mrp?: number) {
  if (!mrp || mrp <= price) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
}
