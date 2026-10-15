import Link from "next/link";

/** Printed parts are made to order, so printing pages point to the quote form from the top. */
export function PrintingCta() {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-lg bg-ink px-5 py-4 text-white">
      <div>
        <p className="font-display text-2xl font-semibold leading-tight">Need something printed to order?</p>
        <p className="text-sm text-white/75">Send us your part or idea. We print in PLA, PETG, ABS/ASA, TPU, nylon and carbon-fibre-filled materials.</p>
      </div>
      <Link href="/printing-service" className="inline-flex h-11 items-center rounded-md bg-signal px-5 font-semibold text-ink hover:bg-signal-hover">
        Get a printing quote
      </Link>
    </div>
  );
}

export function PrintingEmptyAction() {
  return (
    <Link href="/printing-service" className="mt-4 inline-flex h-11 items-center rounded-md bg-ink px-5 text-sm font-medium text-white hover:bg-ink-2">
      Request a custom print
    </Link>
  );
}
