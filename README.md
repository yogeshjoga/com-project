# EgireRobotics Shop

The EgireRobotics online store for FPV drones, drone parts and electronics (`shop.egirerobotics.com`), plus the CRM e-commerce dashboard at `/shop`.

Built with Next.js 16 (App Router, Cache Components), TypeScript and Tailwind CSS 4, on the same Supabase project as `crm.egirerobotics.com` (`egirerobotics-lms`).

## Run it

```bash
npm install
cp .env.example .env.local   # public Supabase URL + publishable key
npm run dev                  # http://localhost:3000
```

## Store

- Home, departments, categories, brands, hot deals, just landed, instant search, filters and sorting
- Product pages with options (KV, colour, kit, RAM), per-option price and stock, specs, PIN-code delivery estimate
- Cart drawer and page, wishlist, checkout (GSTIN for businesses, UPI / card / net banking / COD), order tracking by order ID + mobile
- Orders go through the `shop_place_order` database function, which recomputes prices and checks and reserves stock atomically

**Speed:** catalog pages are prerendered and cached (`use cache`, `cacheLife('minutes')`). CRM edits and orders call `updateTag()`, so the store shows changes within seconds without losing the static speed.

## CRM e-commerce dashboard (`/shop`)

Only **super_admin** and **admin** CRM accounts can open it, enforced three ways: the page guard, server-action checks, and Postgres RLS via the CRM's own `has_module_access('shop', …)`. Accounts with MFA must enter their authenticator code.

- **Dashboard:** revenue today and over 30 days, orders to ship, low stock, a daily revenue chart, recent orders and top sellers
- **Products & stock:** search and filter, inline stock edits, show or hide on the store, add, edit and delete products, options, photo upload (to the `site-media` bucket under `shop/`)
- **Orders:** status (confirmed → packed → shipped → delivered, or cancelled, which returns stock), payment status, courier and tracking, staff notes
- **Notifications:** store announcement bar (info / deal / alert, optional end time). New-order and low-stock alerts go to the CRM notification bell of every active admin and super admin.

## Database

Migrations live in `supabase/migrations/` and are already applied to `egirerobotics-lms`. They're additive: `shop_*` tables, RLS, audit triggers (`audit_row`), order and tracking RPCs, alerts, and `role_module_access` rows (`admin` = write, `instructor` and `coordinator` = none).

`scripts/seed-sql.ts` prints SQL that seeds the catalog from `src/data/products.ts`. Without Supabase env vars the store runs on that bundled catalog.

## Deploy (Vercel)

| Env var | Value |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://txbrnewcztixcagdnnfx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | the project's publishable key |
| `SHOP_ADMIN_ONLY_ON_CRM_HOST` | optional, `true` to serve `/shop` only on `CRM_HOST` |
| `CRM_HOST` | optional, default `crm.egirerobotics.com` |

Domain: add a DNS record at your registrar, `CNAME shop → cname.vercel-dns.com`.

### Opening the dashboard from inside the CRM

The CRM (`fpv-crm`, a Vite app) can serve this dashboard under its own domain by adding to its `vercel.json`:

```json
{ "rewrites": [{ "source": "/shop/:path*", "destination": "https://shop.egirerobotics.com/shop/:path*" }] }
```

The CRM bell's shop alerts already link to `/shop/orders/…` and `/shop/products/…`.

## Brand

Name, contact and logo files are in `src/config/brand.ts`. Colours are the `:root` tokens in `src/app/globals.css` (navy `#0e2a49`, letterhead gold `#c8a127`). The logo comes from the CRM `branding` bucket.

## Not wired up yet

- Online payment gateway (Razorpay / Cashfree). Non-COD orders are created as *payment pending*.
- Customer accounts (OTP sign-in) and courier serviceability API for PIN codes.
- Support phone, WhatsApp and GSTIN in `brand.ts` (left empty, so they're hidden until filled in).
