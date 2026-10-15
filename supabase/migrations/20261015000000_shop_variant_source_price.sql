-- Each official option keeps the brand's own list price, so options (battery sizes, KV, kits)
-- can be priced individually instead of all inheriting the product's lowest price.
alter table public.shop_product_variants add column source_price numeric(10, 2);

create or replace function public.shop_sync_official(p_secret text, p_items jsonb)
 returns jsonb
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
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

    -- Options: add new ones (price 0, stock 0), refresh labels/SKU/image/brand price, remove ones the brand dropped.
    keep := '{}';
    for v in select * from jsonb_array_elements(coalesce(it -> 'variants', '[]'::jsonb)) loop
      keep := keep || (v ->> 'source_key');
      insert into public.shop_product_variants (product_id, label, price, stock, sort, source_key, sku, image_url, source_price)
      values (pid, v ->> 'label', 0, 0, coalesce((v ->> 'sort')::int, 0), v ->> 'source_key', v ->> 'sku', v ->> 'image_url',
              nullif(v ->> 'source_price', '')::numeric)
      on conflict (source_key) do update set
        label = excluded.label, sku = excluded.sku, image_url = excluded.image_url, sort = excluded.sort,
        source_price = excluded.source_price;
    end loop;
    delete from public.shop_product_variants
     where product_id = pid and source_key is not null and not (source_key = any (keep));
  end loop;

  return jsonb_build_object('inserted', n_new, 'updated', n_upd);
end $function$;
