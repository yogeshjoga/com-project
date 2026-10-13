import "server-only";
import { redirect } from "next/navigation";
import { serverClient } from "@/lib/supabase/server";

export const SHOP_ROLES = ["super_admin", "admin"] as const;
export type ShopRole = (typeof SHOP_ROLES)[number];

export interface ShopAdmin {
  id: string;
  name: string;
  email: string;
  role: ShopRole;
}

type Check =
  | { ok: true; admin: ShopAdmin; sb: Awaited<ReturnType<typeof serverClient>> }
  | { ok: false; reason: "signed-out" | "mfa" | "denied" };

/**
 * Same rules as the CRM database: active, non-archived super_admin or admin,
 * and a two-factor session when the account has MFA enrolled (mirrors mfa_ok()).
 * RLS enforces this again on every query, so this check is for routing and UX.
 */
async function check(): Promise<Check> {
  const sb = await serverClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return { ok: false, reason: "signed-out" };

  const { data: aal } = await sb.auth.mfa.getAuthenticatorAssuranceLevel();
  if (aal?.nextLevel === "aal2" && aal.currentLevel !== "aal2") return { ok: false, reason: "mfa" };

  const { data: p } = await sb
    .from("profiles")
    .select("id, full_name, email, role, status, archived_at")
    .eq("id", user.id)
    .maybeSingle();
  if (!p || !(SHOP_ROLES as readonly string[]).includes(p.role) || p.status !== "active" || p.archived_at) {
    return { ok: false, reason: "denied" };
  }
  return { ok: true, sb, admin: { id: p.id, name: p.full_name || p.email, email: p.email, role: p.role } };
}

/** For pages: sends anyone else to the sign-in screen. */
export async function requireShopAdmin() {
  const res = await check();
  if (!res.ok) redirect(res.reason === "signed-out" ? "/shop/login" : `/shop/login?reason=${res.reason}`);
  return res;
}

/** For server actions: throws instead of redirecting. */
export async function assertShopAdmin() {
  const res = await check();
  if (!res.ok) throw new Error("Your session has ended or you don’t have shop access. Sign in again.");
  return res;
}
