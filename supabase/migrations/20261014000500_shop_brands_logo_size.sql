-- Intrinsic logo size, used to size logos optically (equal visual area) on the storefront.
alter table public.shop_brands
  add column logo_width integer check (logo_width is null or logo_width > 0),
  add column logo_height integer check (logo_height is null or logo_height > 0);

update public.shop_brands b set logo_width = v.w, logo_height = v.h
from (values
  ('arduino', 179, 120), ('benewake', 140, 120), ('betafpv', 425, 120), ('caddx', 480, 117), ('cnhl', 234, 120),
  ('diatone', 480, 86), ('dji', 208, 120), ('espressif', 480, 86), ('fat-shark', 480, 105), ('fluke', 480, 74),
  ('gemfan', 480, 114), ('geprc', 422, 120), ('gopro', 464, 120), ('heewing', 226, 120), ('hglrc', 480, 114),
  ('hobbywing', 480, 86), ('holybro', 480, 104), ('iflight', 480, 58), ('insta360', 480, 99), ('isdt', 348, 120),
  ('kester', 480, 107), ('newbeedrone', 388, 120), ('owon', 423, 120), ('pine64', 89, 120), ('radiomaster', 480, 105),
  ('raspberry-pi', 94, 120), ('readytosky', 216, 120), ('rfdesign', 480, 86), ('runcam', 480, 110), ('siyi', 331, 120),
  ('stmicroelectronics', 171, 120), ('tattu', 480, 81), ('tbs', 146, 120), ('toolkitrc', 403, 120), ('truerc', 430, 120),
  ('zerodrag', 480, 91)
) as v(slug, w, h)
where b.slug = v.slug;
