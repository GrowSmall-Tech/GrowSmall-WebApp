import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { roleDashboardPath } from "@/lib/auth/constants";
import {
  fetchInvestorStatusForUser,
  investorPostAuthPath,
} from "@/lib/auth/investor-status";
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

  let next = "/auth/select-role";
  if (role === "investor" && user) {
    const status = await fetchInvestorStatusForUser(supabase, user.id);
    next = investorPostAuthPath(status);
  } else if (role != null) {
    next = roleDashboardPath(role);
  }

  return NextResponse.redirect(new URL(next, origin));
}
