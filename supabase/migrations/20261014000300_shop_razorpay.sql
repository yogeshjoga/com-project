-- Razorpay online payments for the shop.
-- Online orders start as 'awaiting_payment' (stock reserved), become 'confirmed' when Razorpay
-- confirms payment, and are auto-cancelled (stock released) if unpaid after 30 minutes.
-- Payment-state changes require the app's server secret, so the public API can't mark orders paid.

alter table public.shop_orders
  add column razorpay_order_id text unique,
  add column razorpay_payment_id text unique,
  add column paid_at timestamptz;

alter table public.shop_orders drop constraint shop_orders_status_check;
alter table public.shop_orders add constraint shop_orders_status_check
  check (status in ('awaiting_payment', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled'));

alter table public.shop_orders drop constraint shop_orders_payment_method_check;
alter table public.shop_orders add constraint shop_orders_payment_method_check
  check (payment_method in ('online', 'upi', 'card', 'netbanking', 'cod'));

-- Server-only settings. RLS on with no policies: only SECURITY DEFINER functions can read it.
create table public.shop_private (
  key   text primary key,
  value text not null
);
alter table public.shop_private enable row level security;
comment on table public.shop_private is 'Service-only. Holds the SHA-256 of the shop server secret. Never client-accessible.';

create or replace function public.shop_server_ok(p_secret text)
returns boolean
language sql
stable
security definer
set search_path to 'public', 'extensions'
as $$
  select exists (
    select 1 from public.shop_private
     where key = 'server_secret_sha256'
       and value = encode(extensions.digest(coalesce(p_secret, ''), 'sha256'), 'hex'));
$$;
revoke all on function public.shop_server_ok(text) from public, anon, authenticated;

-- Releases stock held by online orders that were never paid.
create or replace function public.shop_expire_unpaid()
returns integer
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  n integer;
begin
  update public.shop_orders
     set status = 'cancelled',
         staff_notes = concat_ws(E'\n', staff_notes, 'Auto-cancelled: online payment not completed within 30 minutes.')
   where status = 'awaiting_payment'
     and created_at < now() - interval '30 minutes';
  get diagnostics n = row_count;
  return n;
end $$;
revoke all on function public.shop_expire_unpaid() from public;
grant execute on function public.shop_expire_unpaid() to anon, authenticated;

-- Links our order to the Razorpay order created by the server.
create or replace function public.shop_attach_payment(p_secret text, p_order_id text, p_rzp_order_id text)
returns void
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  if not public.shop_server_ok(p_secret) then raise exception 'Not allowed.'; end if;
  update public.shop_orders
     set razorpay_order_id = p_rzp_order_id
   where id = p_order_id and status = 'awaiting_payment' and razorpay_order_id is null;
  if not found then raise exception 'Order % is not awaiting payment.', p_order_id; end if;
end $$;

-- Marks a Razorpay payment as received. Called after the server verified Razorpay's signature
-- (checkout callback or webhook). Idempotent.
create or replace function public.shop_mark_paid(p_secret text, p_rzp_order_id text, p_payment_id text)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  o public.shop_orders;
begin
  if not public.shop_server_ok(p_secret) then raise exception 'Not allowed.'; end if;
  select * into o from public.shop_orders where razorpay_order_id = p_rzp_order_id for update;
  if not found then raise exception 'Unknown Razorpay order.'; end if;
  if o.payment_status = 'paid' then
    return jsonb_build_object('id', o.id, 'status', o.status, 'already', true);
  end if;

  if o.status = 'cancelled' then
    -- Paid after the reservation expired: record it and let staff decide (re-confirm or refund).
    update public.shop_orders
       set payment_status = 'paid', razorpay_payment_id = p_payment_id, paid_at = now(),
           staff_notes = concat_ws(E'\n', staff_notes, 'Payment arrived after auto-cancel. Refund in Razorpay or contact the customer.')
     where id = o.id;
    perform public.shop_notify_admins('Paid after cancel: ' || o.id,
      'Razorpay payment ' || p_payment_id || ' arrived after the order expired. Refund or contact the customer.',
      'shop_order', '/shop/orders/' || o.id);
    return jsonb_build_object('id', o.id, 'status', 'cancelled', 'late', true);
  end if;

  update public.shop_orders
     set payment_status = 'paid', razorpay_payment_id = p_payment_id, paid_at = now(),
         status = case when status = 'awaiting_payment' then 'confirmed' else status end
   where id = o.id;
  perform public.shop_notify_admins(
    'New order ' || o.id || ' (paid online)',
    o.customer_name || ' · ₹' || to_char(o.total, 'FM99,99,99,999') || ' · Razorpay ' || p_payment_id,
    'shop_order', '/shop/orders/' || o.id);
  return jsonb_build_object('id', o.id, 'status', 'confirmed');
end $$;

revoke all on function public.shop_attach_payment(text, text, text) from public;
revoke all on function public.shop_mark_paid(text, text, text) from public;
grant execute on function public.shop_attach_payment(text, text, text) to anon, authenticated;
grant execute on function public.shop_mark_paid(text, text, text) to anon, authenticated;

-- shop_place_order: online orders wait for payment; staff are alerted on payment, not on creation.
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
  if v_pay is null or v_pay not in ('online', 'cod') then raise exception 'Choose a payment method.'; end if;
  if jsonb_typeof(v_items) <> 'array' or jsonb_array_length(v_items) not between 1 and 30 then
    raise exception 'Your cart is empty.';
  end if;

  if not public.rate_limit_hit('shop_order:' || v_phone, 5, 3600) then
    raise exception 'Too many orders from this number. Try again in an hour or contact support.';
  end if;
  if not public.rate_limit_hit('shop_order:all', 300, 3600) then
    raise exception 'We are receiving a lot of orders right now. Try again in a few minutes.';
  end if;

  -- Free stock held by abandoned online payments before checking availability.
  perform public.shop_expire_unpaid();

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

  v_ship := case when v_sub >= 4999 then 0 else 149 end;
  v_cod := case when v_pay = 'cod' then 99 else 0 end;
  v_id := 'EG' || to_char(now() at time zone 'Asia/Kolkata', 'YYMM') || lpad(nextval('public.shop_order_seq')::text, 5, '0');

  insert into public.shop_orders (id, status, payment_method, customer_name, phone, email, address, gstin, company,
                                  subtotal, savings, shipping, cod_fee, total)
  values (v_id, case when v_pay = 'cod' then 'confirmed' else 'awaiting_payment' end, v_pay, v_name, v_phone, v_email,
          jsonb_build_object('line1', v_addr ->> 'line1', 'line2', v_addr ->> 'line2', 'city', v_addr ->> 'city',
                             'state', v_addr ->> 'state', 'pin', v_addr ->> 'pin'),
          v_gstin, nullif(btrim(coalesce(p ->> 'company', '')), ''),
          v_sub, v_mrp_total - v_sub, v_ship, v_cod, v_sub + v_ship + v_cod);

  insert into public.shop_order_items (order_id, product_id, variant_id, name, variant_label, unit_price, mrp, qty)
  select v_id, (r ->> 'product_id')::uuid, (r ->> 'variant_id')::uuid, r ->> 'name', r ->> 'variant_label',
         (r ->> 'unit_price')::integer, (r ->> 'mrp')::integer, (r ->> 'qty')::integer
    from jsonb_array_elements(v_rows) r;

  if v_pay = 'cod' then
    perform public.shop_notify_admins(
      'New order ' || v_id,
      v_name || ' · ₹' || to_char(v_sub + v_ship + v_cod, 'FM99,99,99,999') || ' · Cash on delivery',
      'shop_order',
      '/shop/orders/' || v_id);
  end if;

  return jsonb_build_object('id', v_id, 'total', v_sub + v_ship + v_cod);
end $$;

-- Revenue counts paid online orders and COD orders, not unpaid reservations.
create or replace function public.shop_dashboard_stats()
returns jsonb
language sql
stable
set search_path to 'public'
as $$
  with o as (select * from public.shop_orders where status not in ('cancelled', 'awaiting_payment')),
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
    'awaiting_payment', (select count(*) from public.shop_orders where status = 'awaiting_payment'),
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
