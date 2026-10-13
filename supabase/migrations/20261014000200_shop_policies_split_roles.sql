-- has_module_access() is not executable by anon in this database, so public read policies
-- must not reference it. Split each table into a public policy and an authenticated staff policy.

drop policy shop_products_read on public.shop_products;
drop policy shop_products_write on public.shop_products;
create policy shop_products_read_public on public.shop_products for select to anon, authenticated
  using (is_published);
create policy shop_products_read_staff on public.shop_products for select to authenticated
  using (public.has_module_access('shop', 'read'));
create policy shop_products_write on public.shop_products for all to authenticated
  using (public.has_module_access('shop', 'write'))
  with check (public.has_module_access('shop', 'write'));

drop policy shop_variants_read on public.shop_product_variants;
drop policy shop_variants_write on public.shop_product_variants;
create policy shop_variants_read_public on public.shop_product_variants for select to anon, authenticated
  using (exists (select 1 from public.shop_products p where p.id = product_id and p.is_published));
create policy shop_variants_read_staff on public.shop_product_variants for select to authenticated
  using (public.has_module_access('shop', 'read'));
create policy shop_variants_write on public.shop_product_variants for all to authenticated
  using (public.has_module_access('shop', 'write'))
  with check (public.has_module_access('shop', 'write'));

drop policy shop_orders_read on public.shop_orders;
drop policy shop_orders_update on public.shop_orders;
drop policy shop_orders_delete on public.shop_orders;
create policy shop_orders_read on public.shop_orders for select to authenticated
  using (public.has_module_access('shop', 'read'));
create policy shop_orders_update on public.shop_orders for update to authenticated
  using (public.has_module_access('shop', 'write'))
  with check (public.has_module_access('shop', 'write'));
create policy shop_orders_delete on public.shop_orders for delete to authenticated
  using (public.is_super_admin());

drop policy shop_order_items_read on public.shop_order_items;
create policy shop_order_items_read on public.shop_order_items for select to authenticated
  using (public.has_module_access('shop', 'read'));

drop policy shop_announcements_read on public.shop_announcements;
drop policy shop_announcements_write on public.shop_announcements;
create policy shop_announcements_read_public on public.shop_announcements for select to anon, authenticated
  using (is_active and starts_at <= now() and (ends_at is null or ends_at > now()));
create policy shop_announcements_read_staff on public.shop_announcements for select to authenticated
  using (public.has_module_access('shop', 'read'));
create policy shop_announcements_write on public.shop_announcements for all to authenticated
  using (public.has_module_access('shop', 'write'))
  with check (public.has_module_access('shop', 'write'));
