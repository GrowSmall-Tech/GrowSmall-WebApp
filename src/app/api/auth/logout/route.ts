import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/env";

export async function POST() {
  const supabaseUrl = getSupabaseUrl();
  const supabaseAnonKey = getSupabaseAnonKey();

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ ok: true });
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(toSet) {
        toSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options);
        });
      },
    },
  });

  // Local scope clears session cookies without a blocking global revoke HTTP call,
  // which can hang or stall and leaves the logout UI stuck on "Logging out...".
  await supabase.auth.signOut({ scope: "local" });
  return NextResponse.json({ ok: true });
}
