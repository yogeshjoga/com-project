-- EgireRobotics e-commerce module ("shop") for the CRM database.
-- Additive only: new shop_* tables, functions and policies. No existing table is altered.
-- Access follows CRM conventions: is_super_admin(), has_module_access('shop', level), mfa_ok() via is_staff().

-- ───────────────────────── Tables

create table public.shop_products (
  id            uuid primary key default gen_random_uuid(),
  sku           text not null unique,
  slug          text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name          text not null check (char_length(name) between 2 and 200),
  brand         text not null check (char_length(brand) between 1 and 80),
  category      text not null check (category ~ '^[a-z0-9-]+$'),
  price         integer not null check (price >= 0),
  mrp           integer check (mrp is null or mrp >= 0),
  stock         integer not null default 0 check (stock >= 0),
  low_stock_at  integer not null default 5 check (low_stock_at >= 0),
  art           text not null default 'board',
  tags          text[] not null default '{}',
  short         text not null default '',
  highlights    text[] not null default '{}',
  specs         jsonb not null default '{}'::jsonb,
  in_box        text[],
  variant_name  text,
  image_url     text,
  weight_g      integer check (weight_g is null or weight_g >= 0),
  sort          integer not null default 0,
  is_published  boolean not null default true,
  created_by    uuid default auth.uid() references public.profiles(id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index shop_products_category_idx on public.shop_products (category) where is_published;
comment on table public.shop_products is 'Storefront catalog. Public can read published rows; writes need has_module_access(''shop'',''write'').';

create table public.shop_product_variants (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.shop_products(id) on delete cascade,
  label       text not null check (char_length(label) between 1 and 80),
  price       integer not null check (price >= 0),
  mrp         integer check (mrp is null or mrp >= 0),
  stock       integer not null default 0 check (stock >= 0),
  sort        integer not null default 0,
  unique (product_id, label)
);
create index shop_product_variants_product_idx on public.shop_product_variants (product_id);

create sequence public.shop_order_seq;

create table public.shop_orders (
  id               text primary key,
  status           text not null default 'confirmed'
                   check (status in ('confirmed', 'packed', 'shipped', 'delivered', 'cancelled')),
  payment_method   text not null check (payment_method in ('upi', 'card', 'netbanking', 'cod')),
  payment_status   text not null default 'pending' check (payment_status in ('pending', 'paid', 'refunded')),
  customer_name    text not null,
  phone            text not null,
  email            text not null,
  address          jsonb not null,
  gstin            text,
  company          text,
  subtotal         integer not null,
  savings          integer not null default 0,
  shipping         integer not null default 0,
  cod_fee          integer not null default 0,
  total            integer not null,
  tracking_number  text,
  courier          text,
  staff_notes      text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index shop_orders_created_idx on public.shop_orders (created_at desc);
create index shop_orders_status_idx on public.shop_orders (status);
comment on table public.shop_orders is 'Created only through shop_place_order(). Staff read with has_module_access(''shop'',''read'').';

create table public.shop_order_items (
  id             bigint generated always as identity primary key,
  order_id       text not null references public.shop_orders(id) on delete cascade,
  product_id     uuid references public.shop_products(id) on delete set null,
  variant_id     uuid references public.shop_product_variants(id) on delete set null,
  name           text not null,
  variant_label  text,
  unit_price     integer not null,
  mrp            integer,
  qty            integer not null check (qty between 1 and 99)
);
create index shop_order_items_order_idx on public.shop_order_items (order_id);
create index shop_order_items_product_idx on public.shop_order_items (product_id);

create table public.shop_announcements (
  id          uuid primary key default gen_random_uuid(),
  message     text not null check (char_length(message) between 3 and 200),
  link        text check (link is null or link ~ '^(/|https://)'),
  tone        text not null default 'info' check (tone in ('info', 'deal', 'alert')),
  starts_at   timestamptz not null default now(),
  ends_at     timestamptz,
  is_active   boolean not null default true,
  created_by  uuid default auth.uid() references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now(),
  check (ends_at is null or ends_at > starts_at)
);
comment on table public.shop_announcements is 'Storefront notification bar, managed from the CRM shop dashboard.';

-- ───────────────────────── updated_at + audit (existing CRM helpers)

create trigger trg_shop_products_updated before update on public.shop_products
  for each row execute function public.set_updated_at();
create trigger trg_shop_orders_updated before update on public.shop_orders
  for each row execute function public.set_updated_at();

create trigger audit_shop_products after insert or update or delete on public.shop_products
  for each row execute function public.audit_row();
create trigger audit_shop_product_variants after insert or update or delete on public.shop_product_variants
  for each row execute function public.audit_row();
create trigger audit_shop_orders after update or delete on public.shop_orders
  for each row execute function public.audit_row();
create trigger audit_shop_announcements after insert or update or delete on public.shop_announcements
  for each row execute function public.audit_row();

-- ───────────────────────── CRM notifications (bell) for admins and super admins

create or replace function public.shop_notify_admins(p_title text, p_body text, p_kind text, p_link text)
returns void
language sql
security definer
set search_path to 'public'
as $$
  insert into public.notifications (recipient_id, title, body, kind, link)
  select p.id, p_title, p_body, p_kind, p_link
    from public.profiles p
   where p.role in ('admin', 'super_admin')
     and p.status = 'active'
     and p.archived_at is null;
$$;
revoke all on function public.shop_notify_admins(text, text, text, text) from public, anon, authenticated;

create or replace function public.shop_low_stock_alert()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_name text;
  v_threshold integer;
  v_product uuid;
begin
  if tg_table_name = 'shop_products' then
    if new.variant_name is not null then return new; end if; -- stock lives on variants
    v_name := new.name; v_threshold := new.low_stock_at; v_product := new.id;
  else
    select p.name || ' (' || new.label || ')', p.low_stock_at, p.id
      into v_name, v_threshold, v_product
      from public.shop_products p where p.id = new.product_id;
  end if;

  if new.stock <= v_threshold and old.stock > v_threshold then
    perform public.shop_notify_admins(
      case when new.stock = 0 then 'Out of stock: ' else 'Low stock: ' end || v_name,
      new.stock || ' left. Restock or unpublish it from the shop dashboard.',
      'shop_stock',
      '/shop/products/' || v_product);
  end if;
  return new;
end $$;

create trigger shop_products_low_stock after update of stock on public.shop_products
  for each row execute function public.shop_low_stock_alert();
create trigger shop_variants_low_stock after update of stock on public.shop_product_variants
  for each row execute function public.shop_low_stock_alert();

-- Cancelling an order puts its stock back.
create or replace function public.shop_restock_on_cancel()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  if new.status = 'cancelled' and old.status <> 'cancelled' then
    update public.shop_product_variants v set stock = v.stock + i.qty
      from public.shop_order_items i
     where i.order_id = new.id and i.variant_id = v.id;
    update public.shop_products p set stock = p.stock + i.qty
      from public.shop_order_items i
     where i.order_id = new.id and i.variant_id is null and i.product_id = p.id;
  elsif old.status = 'cancelled' and new.status <> 'cancelled' then
    raise exception 'A cancelled order cannot be reopened. Ask the customer to order again.';
  end if;
  return new;
end $$;

create trigger shop_orders_restock before update of status on public.shop_orders
  for each row execute function public.shop_restock_on_cancel();

-- ───────────────────────── Public RPCs (storefront)

-- Places an order atomically. Prices and stock come from the database, never from the client.
create or replace function public.shop_place_order(p jsonb)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_line      jsonb;
  v_prod      public.shop_products;
  v_var       public.shop_product_variants;
  v_qty       integer;
  v_price     integer;
  v_mrp       integer;
  v_sub       integer := 0;
  v_mrp_total integer := 0;
  v_ship      integer;
  v_cod       integer;
  v_id        text;
  v_pay       text := p ->> 'payment_method';
  v_phone     text := btrim(coalesce(p ->> 'phone', ''));
  v_email     text := lower(btrim(coalesce(p ->> 'email', '')));
  v_name      text := btrim(coalesce(p ->> 'name', ''));
  v_addr      jsonb := coalesce(p -> 'address', '{}'::jsonb);
  v_gstin     text := nullif(upper(btrim(coalesce(p ->> 'gstin', ''))), '');
  v_items     jsonb := p -> 'items';
  v_rows      jsonb := '[]'::jsonb;
begin
  -- Validation
  if v_phone !~ '^[6-9][0-9]{9}$' then raise exception 'Enter a 10-digit Indian mobile number.'; end if;
  if v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' or char_length(v_email) > 254 then raise exception 'Enter a valid email address.'; end if;
  if char_length(v_name) not between 2 and 120 then raise exception 'Enter your full name.'; end if;
  if coalesce(v_addr ->> 'pin', '') !~ '^[1-9][0-9]{5}$' then raise exception 'Enter a valid 6-digit PIN code.'; end if;
  if char_length(coalesce(v_addr ->> 'line1', '')) not between 3 and 200
     or char_length(coalesce(v_addr ->> 'city', '')) not between 2 and 80
     or char_length(coalesce(v_addr ->> 'state', '')) not between 2 and 80 then
    raise exception 'Complete the delivery address.';
  end if;
  if v_gstin is not null and v_gstin !~ '^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$' then
    raise exception 'Enter a valid 15-character GSTIN.';
  end if;
  if v_pay is null or v_pay not in ('upi', 'card', 'netbanking', 'cod') then raise exception 'Choose a payment method.'; end if;
  if jsonb_typeof(v_items) <> 'array' or jsonb_array_length(v_items) not between 1 and 30 then
    raise exception 'Your cart is empty.';
  end if;

  -- Abuse limits: per phone and store-wide.
  if not public.rate_limit_hit('shop_order:' || v_phone, 5, 3600) then
    raise exception 'Too many orders from this number. Try again in an hour or contact support.';
  end if;
  if not public.rate_limit_hit('shop_order:all', 300, 3600) then
    raise exception 'We are receiving a lot of orders right now. Try again in a few minutes.';
  end if;

  -- Lines: lock, check stock, take price from the database.
  for v_line in select * from jsonb_array_elements(v_items) loop
    v_qty := (v_line ->> 'qty')::integer;
    if v_qty is null or v_qty not between 1 and 99 then raise exception 'Invalid quantity.'; end if;

    select * into v_prod from public.shop_products
     where id = (v_line ->> 'product_id')::uuid and is_published
     for update;
    if not found then raise exception 'A product in your cart is no longer available.'; end if;

    if v_prod.variant_name is not null then
      select * into v_var from public.shop_product_variants
       where id = (v_line ->> 'variant_id')::uuid and product_id = v_prod.id
       for update;
      if not found then raise exception 'Choose an option for %.', v_prod.name; end if;
      if v_var.stock < v_qty then
        raise exception 'Only % left of % (%).', v_var.stock, v_prod.name, v_var.label;
      end if;
      update public.shop_product_variants set stock = stock - v_qty where id = v_var.id;
      v_price := v_var.price; v_mrp := coalesce(v_var.mrp, v_var.price);
    else
      v_var := null;
      if v_prod.stock < v_qty then raise exception 'Only % left of %.', v_prod.stock, v_prod.name; end if;
      update public.shop_products set stock = stock - v_qty where id = v_prod.id;
      v_price := v_prod.price; v_mrp := coalesce(v_prod.mrp, v_prod.price);
    end if;

    v_sub := v_sub + v_price * v_qty;
    v_mrp_total := v_mrp_total + greatest(v_mrp, v_price) * v_qty;
    v_rows := v_rows || jsonb_build_object(
      'product_id', v_prod.id, 'variant_id', v_var.id, 'name', v_prod.name,
      'variant_label', v_var.label, 'unit_price', v_price, 'mrp', v_mrp, 'qty', v_qty);
  end loop;

  -- Same rules as src/config/brand.ts
  v_ship := case when v_sub >= 4999 then 0 else 149 end;
  v_cod := case when v_pay = 'cod' then 99 else 0 end;
  v_id := 'EG' || to_char(now() at time zone 'Asia/Kolkata', 'YYMM') || lpad(nextval('public.shop_order_seq')::text, 5, '0');

  insert into public.shop_orders (id, payment_method, customer_name, phone, email, address, gstin, company,
                                  subtotal, savings, shipping, cod_fee, total)
  values (v_id, v_pay, v_name, v_phone, v_email,
          jsonb_build_object('line1', v_addr ->> 'line1', 'line2', v_addr ->> 'line2', 'city', v_addr ->> 'city',
                             'state', v_addr ->> 'state', 'pin', v_addr ->> 'pin'),
          v_gstin, nullif(btrim(coalesce(p ->> 'company', '')), ''),
          v_sub, v_mrp_total - v_sub, v_ship, v_cod, v_sub + v_ship + v_cod);

  insert into public.shop_order_items (order_id, product_id, variant_id, name, variant_label, unit_price, mrp, qty)
  select v_id, (r ->> 'product_id')::uuid, (r ->> 'variant_id')::uuid, r ->> 'name', r ->> 'variant_label',
         (r ->> 'unit_price')::integer, (r ->> 'mrp')::integer, (r ->> 'qty')::integer
    from jsonb_array_elements(v_rows) r;

  perform public.shop_notify_admins(
    'New order ' || v_id,
    v_name || ' · ₹' || to_char(v_sub + v_ship + v_cod, 'FM99,99,99,999') || ' · ' || upper(v_pay),
    'shop_order',
    '/shop/orders/' || v_id);

  return jsonb_build_object('id', v_id, 'total', v_sub + v_ship + v_cod);
end $$;

-- Lets a customer check status with order ID + phone (no account needed).
create or replace function public.shop_track_order(p_id text, p_phone text)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  o public.shop_orders;
begin
  if not public.rate_limit_hit('shop_track:' || coalesce(p_phone, ''), 30, 3600) then
    raise exception 'Too many lookups. Try again later.';
  end if;
  select * into o from public.shop_orders where id = upper(btrim(p_id)) and phone = btrim(p_phone);
  if not found then return null; end if;
  return jsonb_build_object('id', o.id, 'status', o.status, 'created_at', o.created_at, 'total', o.total,
                            'courier', o.courier, 'tracking_number', o.tracking_number);
end $$;

revoke all on function public.shop_place_order(jsonb) from public;
revoke all on function public.shop_track_order(text, text) from public;
grant execute on function public.shop_place_order(jsonb) to anon, authenticated;
grant execute on function public.shop_track_order(text, text) to anon, authenticated;

-- Dashboard numbers. SECURITY INVOKER, so RLS limits it to shop staff.
create or replace function public.shop_dashboard_stats()
returns jsonb
language sql
stable
set search_path to 'public'
as $$
  with o as (select * from public.shop_orders where status <> 'cancelled'),
  day as (
    select d::date as day,
           coalesce(sum(o.total), 0)::integer as revenue,
           count(o.id)::integer as orders
      from generate_series((now() at time zone 'Asia/Kolkata')::date - 29, (now() at time zone 'Asia/Kolkata')::date, '1 day') d
      left join o on (o.created_at at time zone 'Asia/Kolkata')::date = d::date
     group by 1 order by 1)
  select jsonb_build_object(
    'revenue_today', coalesce((select sum(total) from o where created_at >= date_trunc('day', now() at time zone 'Asia/Kolkata') at time zone 'Asia/Kolkata'), 0),
    'revenue_30d',   coalesce((select sum(total) from o where created_at >= now() - interval '30 days'), 0),
    'orders_30d',    (select count(*) from o where created_at >= now() - interval '30 days'),
    'to_ship',       (select count(*) from public.shop_orders where status in ('confirmed', 'packed')),
    'products',      (select count(*) from public.shop_products where is_published),
    'low_stock',     (select count(*) from public.shop_products p
                       where p.is_published and (
                         (p.variant_name is null and p.stock <= p.low_stock_at)
                         or (p.variant_name is not null and (select coalesce(sum(v.stock), 0) from public.shop_product_variants v where v.product_id = p.id) <= p.low_stock_at))),
    'by_status',     (select coalesce(jsonb_object_agg(status, n), '{}'::jsonb) from (select status, count(*) n from public.shop_orders group by status) s),
    'daily',         (select jsonb_agg(jsonb_build_object('day', day, 'revenue', revenue, 'orders', orders)) from day),
    'top_products',  (select coalesce(jsonb_agg(t), '[]'::jsonb) from (
                        select i.name, sum(i.qty)::integer as qty, sum(i.qty * i.unit_price)::integer as revenue
                          from public.shop_order_items i join o on o.id = i.order_id
                         where o.created_at >= now() - interval '30 days'
                         group by i.name order by revenue desc limit 5) t)
  );
$$;
revoke all on function public.shop_dashboard_stats() from public, anon;
grant execute on function public.shop_dashboard_stats() to authenticated;

-- ───────────────────────── Row level security

alter table public.shop_products enable row level security;
alter table public.shop_product_variants enable row level security;
alter table public.shop_orders enable row level security;
alter table public.shop_order_items enable row level security;
alter table public.shop_announcements enable row level security;

create policy shop_products_read on public.shop_products for select
  using (is_published or public.has_module_access('shop', 'read'));
create policy shop_products_write on public.shop_products for all
  using (public.has_module_access('shop', 'write'))
  with check (public.has_module_access('shop', 'write'));

create policy shop_variants_read on public.shop_product_variants for select
  using (exists (select 1 from public.shop_products p
                  where p.id = product_id and (p.is_published or public.has_module_access('shop', 'read'))));
create policy shop_variants_write on public.shop_product_variants for all
  using (public.has_module_access('shop', 'write'))
  with check (public.has_module_access('shop', 'write'));

create policy shop_orders_read on public.shop_orders for select
  using (public.has_module_access('shop', 'read'));
create policy shop_orders_update on public.shop_orders for update
  using (public.has_module_access('shop', 'write'))
  with check (public.has_module_access('shop', 'write'));
create policy shop_orders_delete on public.shop_orders for delete
  using (public.is_super_admin());

create policy shop_order_items_read on public.shop_order_items for select
  using (public.has_module_access('shop', 'read'));

create policy shop_announcements_read on public.shop_announcements for select
  using ((is_active and starts_at <= now() and (ends_at is null or ends_at > now()))
         or public.has_module_access('shop', 'read'));
create policy shop_announcements_write on public.shop_announcements for all
  using (public.has_module_access('shop', 'write'))
  with check (public.has_module_access('shop', 'write'));

-- Product photos go to the existing public site-media bucket under shop/.
create policy shop_media_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'site-media' and name like 'shop/%' and public.has_module_access('shop', 'write'));
create policy shop_media_update on storage.objects for update to authenticated
  using (bucket_id = 'site-media' and name like 'shop/%' and public.has_module_access('shop', 'write'));
create policy shop_media_delete on storage.objects for delete to authenticated
  using (bucket_id = 'site-media' and name like 'shop/%' and public.has_module_access('shop', 'write'));

-- ───────────────────────── Module access: only admin (write) and super_admin (always).
-- has_module_access() grants staff read when no row exists, so other staff roles are set to none explicitly.

insert into public.role_module_access (role, module_key, access_level) values
  ('admin', 'shop', 'write'),
  ('coordinator', 'shop', 'none'),
  ('instructor', 'shop', 'none')
on conflict (role, module_key) do update set access_level = excluded.access_level, updated_at = now();
