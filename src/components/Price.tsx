import { discountPct, formatINR } from "@/lib/format";

export function Price({
  price,
  mrp,
  maxPrice,
  size = "md",
}: {
  price: number;
  mrp?: number;
  maxPrice?: number;
  size?: "md" | "lg";
}) {
  const off = discountPct(price, mrp);
  const big = size === "lg";
  return (
    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 tabular">
      <span className={`font-semibold text-ink ${big ? "text-3xl" : "text-[17px]"}`}>
        {formatINR(price)}
        {maxPrice ? <span className="font-normal text-muted"> – {formatINR(maxPrice)}</span> : null}
      </span>
      {off > 0 && !maxPrice ? (
        <>
          <s className={`text-muted ${big ? "text-base" : "text-[13px]"}`} aria-label={`MRP ${formatINR(mrp!)}`}>
            {formatINR(mrp!)}
          </s>
          <span className={`font-semibold text-signal-ink ${big ? "text-base" : "text-[13px]"}`}>{off}% off</span>
        </>
      ) : null}
      {big ? <span className="basis-full text-sm text-muted">Inclusive of 18% GST. GST invoice provided.</span> : null}
    </div>
  );
}
