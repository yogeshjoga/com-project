"use client";

import { MinusIcon, PlusIcon } from "./icons";

export function QtyStepper({
  value,
  max,
  onChange,
  small = false,
}: {
  value: number;
  max: number;
  onChange: (n: number) => void;
  small?: boolean;
}) {
  const h = small ? "h-8" : "h-11";
  return (
    <div className={`inline-flex items-center rounded-md ring-1 ring-line ${h}`}>
      <button type="button" aria-label="Decrease quantity" disabled={value <= 1} onClick={() => onChange(value - 1)} className="grid h-full w-8 place-items-center disabled:opacity-30">
        <MinusIcon />
      </button>
      <span className="w-8 text-center text-sm font-medium tabular" aria-live="polite">{value}</span>
      <button type="button" aria-label="Increase quantity" disabled={value >= max} onClick={() => onChange(value + 1)} className="grid h-full w-8 place-items-center disabled:opacity-30">
        <PlusIcon />
      </button>
    </div>
  );
}
