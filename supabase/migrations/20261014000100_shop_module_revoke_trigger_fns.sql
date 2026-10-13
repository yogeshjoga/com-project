-- Trigger functions are not meant to be called through the API.
revoke all on function public.shop_low_stock_alert() from public, anon, authenticated;
revoke all on function public.shop_restock_on_cancel() from public, anon, authenticated;
