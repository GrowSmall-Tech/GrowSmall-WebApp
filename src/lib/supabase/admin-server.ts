import { createClient } from "@supabase/supabase-js";

import { getSupabaseUrl } from "@/lib/supabase/env";

/** Server-only Supabase client with service role — bypasses RLS for admin CRUD. */
export function createAdminServiceClient() {
  const url = getSupabaseUrl();
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.SUPABASE_SERVICE_KEY ??
    "";

  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY for admin operations.",
    );
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
