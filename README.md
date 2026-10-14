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

## Payments (Razorpay)

Customers choose **Pay online** (UPI, cards, net banking, wallets via Razorpay Checkout) or **Cash on delivery**.

1. `shop_place_order` reserves stock and creates the order as `awaiting_payment`.
2. The server creates a Razorpay order for the exact database total and opens Checkout in the browser.
3. On success, the server verifies Razorpay's HMAC signature and calls `shop_mark_paid`. The order becomes `confirmed` + `paid`, and admins get a CRM alert.
4. The webhook `POST /api/razorpay/webhook` (`payment.captured`, `order.paid`) confirms payments even if the customer closed the tab.
5. Online orders still unpaid after 30 minutes are auto-cancelled and their stock is released. This runs on each new checkout and on dashboard load.

Payment-state functions require `SHOP_SERVER_SECRET`, whose SHA-256 is stored in `shop_private`, so the public API can't mark orders paid. Online payment only appears at checkout once `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` and `SHOP_SERVER_SECRET` are set. Refunds are done in the Razorpay dashboard, after which you set the payment to *Refunded* on the order page.

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
| `SHOP_SERVER_SECRET` | server-only, sensitive; its SHA-256 lives in `shop_private` |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | Razorpay Dashboard > Account & Settings > API Keys (test keys first) |
| `RAZORPAY_WEBHOOK_SECRET` | the secret you set on the webhook below |
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

- Razorpay keys (until they're set, checkout offers cash on delivery only). Webhook URL: `https://shop.egirerobotics.com/api/razorpay/webhook`, events `payment.captured` and `order.paid`.
- Customer accounts (OTP sign-in) and courier serviceability API for PIN codes.
- Support phone, WhatsApp and GSTIN in `brand.ts` (left empty, so they're hidden until filled in).
