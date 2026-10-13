import Link from "next/link";

export function Section({
  title,
  href,
  linkLabel = "View all",
  children,
  className = "",
}: {
  title: string;
  href?: string;
  linkLabel?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`mx-auto max-w-7xl px-4 pt-12 ${className}`}>
      <div className="mb-4 flex items-end justify-between gap-4">
        <h2 className="font-display text-[28px] font-semibold leading-none md:text-[32px]">{title}</h2>
        {href ? (
          <Link href={href} className="shrink-0 text-sm font-medium text-signal-ink hover:underline">
            {linkLabel}
          </Link>
        ) : null}
      </div>
      {children}
    </section>
  );
}

export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-[13px] text-muted">
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((it, i) => (
          <li key={it.label} className="flex items-center gap-1.5">
            {i > 0 ? <span aria-hidden="true">/</span> : null}
            {it.href ? (
              <Link href={it.href} className="hover:text-ink">{it.label}</Link>
            ) : (
              <span className="text-ink" aria-current="page">{it.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
