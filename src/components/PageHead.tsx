import { Breadcrumbs } from "./Section";

export function PageHead({
  title,
  blurb,
  crumbs,
}: {
  title: string;
  blurb?: string;
  crumbs: { label: string; href?: string }[];
}) {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-6 pt-6">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, ...crumbs]} />
      <h1 className="mt-3 font-display text-[40px] font-semibold leading-none md:text-[48px]">{title}</h1>
      {blurb ? <p className="mt-2 max-w-2xl text-muted">{blurb}</p> : null}
    </div>
  );
}
