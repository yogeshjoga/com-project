import Link from "next/link";
import type { Announcement } from "@/lib/types";

const tones = {
  info: "bg-ink-2 text-white",
  deal: "bg-signal text-ink",
  alert: "bg-[#b42318] text-white",
} as const;

// Storefront notifications managed from the CRM shop dashboard.
export function AnnouncementBar({ items }: { items: Announcement[] }) {
  if (!items.length) return null;
  const a = items[0];
  const text = <span className="font-medium">{a.message}</span>;
  return (
    <div role="status" className={`${tones[a.tone]} text-center text-sm`}>
      <div className="mx-auto max-w-[1760px] px-4 lg:px-6 py-2">
        {a.link ? (
          <Link href={a.link} className="underline-offset-4 hover:underline">
            {text}
          </Link>
        ) : (
          text
        )}
      </div>
    </div>
  );
}
