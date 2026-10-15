-- Official products taken off sale because their options had no price of their own (a feed gave
-- one price for every option). The catalog tools republish a product and remove its row once at
-- least one option has its own brand price. Internal bookkeeping: no client access.
create table if not exists public.shop_option_price_hold (
  product_id uuid primary key,
  held_at timestamptz not null default now()
);
alter table public.shop_option_price_hold enable row level security;
revoke all on public.shop_option_price_hold from anon, authenticated;
