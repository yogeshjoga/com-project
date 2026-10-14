-- Brands without a product feed are imported from their product pages' structured data and HTML.
alter table public.shop_products drop constraint shop_products_source_check;
alter table public.shop_products add constraint shop_products_source_check
  check (source in ('manual', 'shopify', 'woocommerce', 'html'));
