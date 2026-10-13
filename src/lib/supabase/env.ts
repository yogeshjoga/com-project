export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";

/** False when env vars are missing; the store then falls back to the bundled sample catalog. */
export const supabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_KEY);
