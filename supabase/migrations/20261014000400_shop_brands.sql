-- Brand logos and links for the storefront, editable from the CRM shop dashboard.
-- slug matches brandSlug(name) in src/lib/catalog.ts. Products keep their brand as free text.

create table public.shop_brands (
  slug        text primary key check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name        text not null,
  logo_url    text check (logo_url is null or logo_url ~ '^(/|https://)'),
  website     text check (website is null or website ~ '^https://'),
  logo_source text,  -- where the logo was taken from (official site or Wikimedia Commons)
  updated_at  timestamptz not null default now()
);
comment on table public.shop_brands is 'Storefront brand logos. Public read; writes need has_module_access(''shop'',''write'').';

create trigger trg_shop_brands_updated before update on public.shop_brands
  for each row execute function public.set_updated_at();
create trigger audit_shop_brands after insert or update or delete on public.shop_brands
  for each row execute function public.audit_row();

alter table public.shop_brands enable row level security;
create policy shop_brands_read on public.shop_brands for select to anon, authenticated using (true);
create policy shop_brands_write on public.shop_brands for all to authenticated
  using (public.has_module_access('shop', 'write'))
  with check (public.has_module_access('shop', 'write'));

-- Brand logos uploaded from the CRM go to site-media/shop/brands/ (covered by the shop_media_* storage policies).
