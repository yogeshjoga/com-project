"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { createAnnouncement, deleteAnnouncement, markAlertsRead, setAnnouncementActive } from "@/app/(crm)/shop/actions";
import { inputCls } from "./ui";

const tones = [
  { key: "info", label: "Info", cls: "bg-ink-2 text-white" },
  { key: "deal", label: "Deal", cls: "bg-signal text-ink" },
  { key: "alert", label: "Alert", cls: "bg-danger text-white" },
] as const;

export function AnnouncementForm() {
  const [tone, setTone] = useState<(typeof tones)[number]["key"]>("deal");
  const [message, setMessage] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();
  const form = useRef<HTMLFormElement>(null);
  const router = useRouter();

  function send(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    start(async () => {
      const res = await createAnnouncement({ message, link: String(f.get("link") ?? ""), tone, ends_at: String(f.get("ends_at") ?? "") });
      if (!res.ok) return setMsg({ ok: false, text: res.error });
      setMsg({ ok: true, text: "Published. It’s live on the store now." });
      setMessage("");
      form.current?.reset();
      router.refresh();
    });
  }

  const style = tones.find((t) => t.key === tone)!.cls;
  return (
    <form ref={form} onSubmit={send} className="space-y-3">
      <label className="block text-sm">
        <span className="font-medium">Message</span> <span className="text-muted tabular">({message.length}/200)</span>
        <input value={message} onChange={(e) => { setMessage(e.target.value); setMsg(null); }} maxLength={200} required
          placeholder="e.g. DJI O4 Pro back in stock. Ships today." className={`${inputCls} mt-1.5`} />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="font-medium">Link</span> <span className="text-muted">(optional)</span>
          <input name="link" placeholder="/deals or https://…" className={`${inputCls} mt-1.5`} />
        </label>
        <label className="block text-sm">
          <span className="font-medium">Ends</span> <span className="text-muted">(optional)</span>
          <input name="ends_at" type="datetime-local" className={`${inputCls} mt-1.5`} />
        </label>
      </div>
      <fieldset className="flex items-center gap-2 text-sm">
        <legend className="sr-only">Style</legend>
        {tones.map((t) => (
          <button key={t.key} type="button" aria-pressed={tone === t.key} onClick={() => setTone(t.key)}
            className={`rounded-full px-3 py-1 ${tone === t.key ? "bg-ink text-white" : "ring-1 ring-line hover:ring-ink"}`}>
            {t.label}
          </button>
        ))}
      </fieldset>
      <div className={`rounded-md px-3 py-2 text-center text-sm font-medium ${style}`} aria-label="Preview">
        {message || "Preview of the store bar"}
      </div>
      {msg ? <p role={msg.ok ? "status" : "alert"} className={`text-sm ${msg.ok ? "text-go" : "text-danger"}`}>{msg.text}</p> : null}
      <button type="submit" disabled={pending} className="h-10 rounded-md bg-signal px-5 text-sm font-semibold text-ink hover:bg-signal-hover disabled:opacity-60">
        {pending ? "Publishing…" : "Publish to store"}
      </button>
    </form>
  );
}

export function AnnouncementRow({
  a,
}: {
  a: { id: string; message: string; link: string | null; tone: string; is_active: boolean; starts_at: string; ends_at: string | null };
}) {
  const [pending, start] = useTransition();
  const router = useRouter();
  const expired = a.ends_at ? new Date(a.ends_at) < new Date() : false;
  const live = a.is_active && !expired;
  const run = (fn: () => Promise<unknown>) => start(async () => { await fn(); router.refresh(); });

  return (
    <li className={`flex flex-wrap items-center gap-3 py-3 text-sm ${pending ? "opacity-60" : ""}`}>
      <span className={`size-2.5 shrink-0 rounded-full ${live ? "bg-go" : "bg-line"}`} aria-hidden="true" />
      <span className="min-w-0 flex-1">
        <span className="block">{a.message}</span>
        <span className="text-xs text-muted">
          {live ? "Live" : expired ? "Ended" : "Off"}
          {a.ends_at ? `, ends ${new Date(a.ends_at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}` : ""}
          {a.link ? `, links to ${a.link}` : ""}
        </span>
      </span>
      {!expired ? (
        <button type="button" onClick={() => run(() => setAnnouncementActive(a.id, !a.is_active))} className="text-signal-ink hover:underline">
          {a.is_active ? "Switch off" : "Switch on"}
        </button>
      ) : null}
      <button type="button" onClick={() => window.confirm("Delete this announcement?") && run(() => deleteAnnouncement(a.id))} className="text-danger hover:underline">
        Delete
      </button>
    </li>
  );
}

export function MarkReadButton() {
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <button type="button" disabled={pending} onClick={() => start(async () => { await markAlertsRead(); router.refresh(); })} className="text-sm text-signal-ink hover:underline disabled:opacity-60">
      Mark all read
    </button>
  );
}
