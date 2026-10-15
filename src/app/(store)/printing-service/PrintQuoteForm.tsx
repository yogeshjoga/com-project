"use client";

import { useState } from "react";
import { brand } from "@/config/brand";
import { inputCls } from "@/components/crm/ui";

const PARTS = ["GPS support", "Battery support", "Prop guards", "Ball frame print", "Case or enclosure", "Something else"];
export const MATERIALS = ["Not sure, advise me", "PLA", "PETG", "ABS / ASA", "TPU (flexible)", "Nylon", "Carbon-fibre filled"];

function Field({ label, children, wide }: { label: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <label className={`block text-sm ${wide ? "sm:col-span-2" : ""}`}>
      <span className="font-medium">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

/** Opens the visitor's email app with the request filled in; they attach their file and send it. */
export function PrintQuoteForm({ preset }: { preset?: string }) {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const v = (k: string) => String(f.get(k) ?? "").trim();
    const phone = v("phone").replace(/\D/g, "").slice(-10);
    if (!v("name")) return setError("Enter your name.");
    if (!v("phone") && !v("email")) return setError("Add a phone number or an email so we can reply with the quote.");
    if (v("phone") && !/^[6-9]\d{9}$/.test(phone)) return setError("Enter a 10-digit Indian mobile number.");
    setError(null);
    const lines = [
      `Name: ${v("name")}`,
      phone ? `Phone: ${phone}` : "",
      v("email") ? `Email: ${v("email")}` : "",
      "",
      `Part: ${v("part")}`,
      `Material: ${v("material")}`,
      `Quantity: ${v("qty") || "1"}`,
      "",
      v("details") || "(Details and file link or attachment to follow.)",
    ];
    const body = lines.filter((l, i) => l !== "" || (i > 0 && lines[i - 1] !== "")).join("\n");
    window.location.href = `mailto:${brand.supportEmail}?subject=${encodeURIComponent(`3D printing quote: ${v("part")}`)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  }

  return (
    <form onSubmit={submit} className="grid grid-cols-[minmax(0,1fr)] gap-4 sm:grid-cols-2" noValidate>
      <Field label="Your name">
        <input name="name" autoComplete="name" className={inputCls} />
      </Field>
      <Field label="Mobile number">
        <input name="phone" inputMode="tel" autoComplete="tel" placeholder="10-digit number" className={inputCls} />
      </Field>
      <Field label="Email" wide>
        <input name="email" type="email" autoComplete="email" className={inputCls} />
      </Field>
      <Field label="What do you need?">
        <select name="part" defaultValue={preset ?? PARTS[0]} className={inputCls}>
          {PARTS.map((p) => <option key={p}>{p}</option>)}
        </select>
      </Field>
      <Field label="Material">
        <select name="material" className={inputCls}>
          {MATERIALS.map((m) => <option key={m}>{m}</option>)}
        </select>
      </Field>
      <Field label="Quantity">
        <input name="qty" type="number" min={1} defaultValue={1} inputMode="numeric" className={inputCls} />
      </Field>
      <Field label="Details" wide>
        <textarea
          name="details"
          rows={4}
          placeholder="Frame or drone model, size, colour, and a link to your STL, STEP or 3MF file if you have one."
          className={`${inputCls} h-auto py-2`}
        />
      </Field>
      <div className="sm:col-span-2">
        {error ? <p role="alert" className="mb-3 rounded-md bg-[#fdecea] p-3 text-sm text-danger">{error}</p> : null}
        {sent ? (
          <p role="status" className="mb-3 rounded-md bg-[#e6f6ef] p-3 text-sm text-go">
            Your email app should open with the request filled in. Attach your file or sketch and send it to {brand.supportEmail}. If nothing opened, email us directly.
          </p>
        ) : null}
        <button type="submit" className="h-11 rounded-md bg-signal px-6 font-semibold text-ink hover:bg-signal-hover">Request a quote</button>
        <p className="mt-2 text-xs text-muted">We reply with the price and timing before anything is printed.</p>
      </div>
    </form>
  );
}
