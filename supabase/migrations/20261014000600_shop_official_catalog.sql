-- Official catalog import: products synced from brands' own stores (Shopify / WooCommerce feeds).
-- Official content (name, brand, photos, description, specs, option names) is locked: only the sync
-- may change it. Admins set price, stock, short summary, category, labels and publishing.
-- Imported products start as hidden drafts and can't be published without a price.

alter table public.shop_products
  add column source text not null default 'manual' check (source in ('manual', 'shopify', 'woocommerce')),
  add column source_key text unique,
  add column source_url text check (source_url is null or source_url ~ '^https://'),
  add column images text[] not null default '{}',
  add column description_html text,
  add column source_price numeric(12, 2),
  add column source_currency text,
  add column source_synced_at timestamptz;

alter table public.shop_product_variants
  add column source_key text unique,
  add column sku text,
  add column image_url text;

-- Nothing goes live without a price, and nothing holds stock without a price.
alter table public.shop_products
  add constraint shop_products_publish_needs_price check (not is_published or price > 0),
  add constraint shop_products_price_before_stock check (price > 0 or stock = 0 or variant_name is not null);
alter table public.shop_product_variants
  add constraint shop_variants_price_before_stock check (price > 0 or stock = 0);

-- Sync flag: set only inside shop_sync_official() for its own transaction.
create or replace function public.shop_official_lock()
returns trigger
language plpgsql
set search_path to 'public'
as $$
begin
  if old.source <> 'manual' and coalesce(current_setting('shop.official_sync', true), '') <> 'on' then
    if new.name is distinct from old.name
       or new.brand is distinct from old.brand
       or new.images is distinct from old.images
       or new.description_html is distinct from old.description_html
       or new.specs is distinct from old.specs
       or new.source_url is distinct from old.source_url
       or new.source_key is distinct from old.source_key
       or new.source is distinct from old.source
       or new.variant_name is distinct from old.variant_name then
      raise exception 'Official product details come from the brand and can only change through the official sync.';
    end if;
  end if;
  return new;
end $$;

create trigger shop_products_official_lock before update on public.shop_products
  for each row execute function public.shop_official_lock();

create or replace function public.shop_variant_official_lock()
returns trigger
language plpgsql
set search_path to 'public'
as $$
begin
  if coalesce(current_setting('shop.official_sync', true), '') <> 'on' then
    if tg_op = 'UPDATE' and old.source_key is not null
       and (new.label is distinct from old.label or new.sku is distinct from old.sku or new.source_key is distinct from old.source_key) then
      raise exception 'Official options come from the brand and can only change through the official sync.';
    end if;
    if tg_op = 'DELETE' and old.source_key is not null then
      raise exception 'Official options can only be removed by the official sync.';
    end if;
  end if;
  return case when tg_op = 'DELETE' then old else new end;
end $$;

create trigger shop_variants_official_lock before update or delete on public.shop_product_variants
  for each row execute function public.shop_variant_official_lock();

-- Upserts a batch of official products. Callable by shop admins, or by the server with the shop secret.
-- Never touches admin-owned fields on existing products: price, mrp, stock, low_stock_at, short,
-- tags, category (after first import), is_published.
create or replace function public.shop_sync_official(p_secret text, p_items jsonb)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  it jsonb;
  v jsonb;
  pid uuid;
  n_new integer := 0;
  n_upd integer := 0;
  keep text[];
begin
  if not (public.shop_server_ok(p_secret) or public.has_module_access('shop', 'write')) then
    raise exception 'Not allowed.';
  end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) > 200 then
    raise exception 'Send 1 to 200 products per batch.';
  end if;
  perform set_config('shop.official_sync', 'on', true);

  for it in select * from jsonb_array_elements(p_items) loop
    select id into pid from public.shop_products where source_key = it ->> 'source_key';
    if pid is null then
      insert into public.shop_products (
        sku, slug, name, brand, category, price, mrp, stock, art, tags, short, highlights, specs,
        variant_name, is_published, source, source_key, source_url, images, description_html,
        source_price, source_currency, source_synced_at, created_by)
      values (
        it ->> 'sku', it ->> 'slug', it ->> 'name', it ->> 'brand', it ->> 'category', 0, null, 0,
        coalesce(it ->> 'art', 'board'), '{}', coalesce(it ->> 'short', ''),
        coalesce((select array_agg(x) from jsonb_array_elements_text(it -> 'highlights') x), '{}'),
        coalesce(it -> 'specs', '{}'::jsonb), nullif(it ->> 'variant_name', ''), false,
        it ->> 'source', it ->> 'source_key', it ->> 'source_url',
        coalesce((select array_agg(x) from jsonb_array_elements_text(it -> 'images') x), '{}'),
        it ->> 'description_html', (it ->> 'source_price')::numeric, it ->> 'source_currency', now(), null)
      returning id into pid;
      n_new := n_new + 1;
    else
      update public.shop_products set
        name = it ->> 'name',
        brand = it ->> 'brand',
        images = coalesce((select array_agg(x) from jsonb_array_elements_text(it -> 'images') x), '{}'),
        description_html = it ->> 'description_html',
        specs = coalesce(it -> 'specs', '{}'::jsonb),
        variant_name = nullif(it ->> 'variant_name', ''),
        source_url = it ->> 'source_url',
        source_price = (it ->> 'source_price')::numeric,
        source_currency = it ->> 'source_currency',
        source_synced_at = now()
      where id = pid;
      n_upd := n_upd + 1;
    end if;

    -- Options: add new ones (price 0, stock 0), refresh labels/SKU/image, remove ones the brand dropped.
    keep := '{}';
    for v in select * from jsonb_array_elements(coalesce(it -> 'variants', '[]'::jsonb)) loop
      keep := keep || (v ->> 'source_key');
      insert into public.shop_product_variants (product_id, label, price, stock, sort, source_key, sku, image_url)
      values (pid, v ->> 'label', 0, 0, coalesce((v ->> 'sort')::int, 0), v ->> 'source_key', v ->> 'sku', v ->> 'image_url')
      on conflict (source_key) do update set
        label = excluded.label, sku = excluded.sku, image_url = excluded.image_url, sort = excluded.sort;
    end loop;
    delete from public.shop_product_variants
     where product_id = pid and source_key is not null and not (source_key = any (keep));
  end loop;

  return jsonb_build_object('inserted', n_new, 'updated', n_upd);
end $$;

revoke all on function public.shop_sync_official(text, jsonb) from public;
grant execute on function public.shop_sync_official(text, jsonb) to anon, authenticated;
revoke all on function public.shop_official_lock() from public, anon, authenticated;
revoke all on function public.shop_variant_official_lock() from public, anon, authenticated;
