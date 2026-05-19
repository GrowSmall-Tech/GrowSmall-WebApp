import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  roleDashboardPath
} from "@/lib/auth/constants";
import { resolveRoleForUser, upsertProfileFromUser } from "@/lib/auth/profile";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/env";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  const supabaseUrl = getSupabaseUrl();
  const supabaseAnonKey = getSupabaseAnonKey();

  const cookieStore = await cookies();

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.redirect(new URL("/auth/login", origin));
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(toSet) {
        try {
          toSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          /* ignore */
        }
      },
    },
  });

  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const role = user
    ? (await upsertProfileFromUser(supabase, user)) ??
      (await resolveRoleForUser(supabase, user))
    : null;
  const next =
    role != null ? roleDashboardPath(role) : "/auth/select-role";

  return NextResponse.redirect(new URL(next, origin));
}
