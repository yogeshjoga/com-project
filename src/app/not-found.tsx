import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="font-display text-[3rem] font-semibold leading-none">Signal lost</h1>
      <p className="mt-3 text-ink-2">This page doesn’t exist or the product has been removed. Search for it or head back to the shop.</p>
      <Link href="/" className="mt-6 inline-block rounded-md bg-ink px-5 py-2.5 font-medium text-white">Back to the shop</Link>
    </div>
  );
}
