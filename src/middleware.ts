import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/admin/session";
import {
  isUserRole,
  roleDashboardPath,
  type UserRole,
} from "@/lib/auth/constants";
import {
  investorPostAuthPath,
  isInvestorApproved,
} from "@/lib/auth/investor-status";
import { isInvestorStatus, type InvestorStatus } from "@/types/investor-kyc";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/env";

function redirectLegacyDashboards(url: NextRequest["nextUrl"]) {
  const p = url.pathname;
  if (p === "/dashboard/investor" || p.startsWith("/dashboard/investor/")) {
    return NextResponse.redirect(new URL("/investor/dashboard", url));
  }
  if (p === "/dashboard/founder" || p.startsWith("/dashboard/founder/")) {
    return NextResponse.redirect(new URL("/founder/dashboard", url));
  }
  return null;
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  if (path.startsWith("/admin")) {
    const isLogin = path === "/admin/login";
    const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    const valid = await verifyAdminSessionToken(token);

    if (!isLogin && !valid) {
      const login = new URL("/admin/login", request.url);
      login.searchParams.set("next", `${path}${request.nextUrl.search}`);
      return NextResponse.redirect(login);
    }
    if (isLogin && valid) {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
    return NextResponse.next({ request });
  }

  const legacyRedirect = redirectLegacyDashboards(request.nextUrl);
  if (legacyRedirect) return legacyRedirect;

  const nu = request.nextUrl;
  if (nu.pathname === "/investor" || nu.pathname === "/investor/") {
    return NextResponse.redirect(new URL("/investor/dashboard", nu));
  }
  if (nu.pathname === "/founder" || nu.pathname === "/founder/") {
    return NextResponse.redirect(new URL("/founder/dashboard", nu));
  }

  if (request.nextUrl.pathname === "/auth/signup") {
    return NextResponse.redirect(new URL("/auth/select-role", request.nextUrl));
  }
  if (request.nextUrl.pathname === "/auth/role") {
    return NextResponse.redirect(new URL("/auth/select-role", request.nextUrl));
  }

  let response = NextResponse.next({ request });
  const supabaseUrl = getSupabaseUrl();
  const supabaseAnonKey = getSupabaseAnonKey();

  if (!supabaseUrl || !supabaseAnonKey) {
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isApprovalPending = path === "/approval-pending";
  const isProtectedInvestor =
    path === "/investor" || path.startsWith("/investor/");
  const isProtectedFounder = path === "/founder" || path.startsWith("/founder/");

  let resolvedRole: UserRole | null = null;
  let investorStatus: InvestorStatus | null = null;

  if (user) {
    const profileResult = await supabase
      .from("profiles")
      .select("role, investor_status")
      .eq("id", user.id)
      .maybeSingle();

    if (isUserRole(profileResult.data?.role)) {
      resolvedRole = profileResult.data.role;
    }
    if (profileResult.data?.role === "investor") {
      investorStatus = isInvestorStatus(profileResult.data.investor_status)
        ? profileResult.data.investor_status
        : "pending_approval";
    }

    if (!resolvedRole) {
      const userResult = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();
      if (isUserRole(userResult.data?.role)) {
        resolvedRole = userResult.data.role;
      } else {
        const meta = user.user_metadata as Record<string, unknown> | undefined;
        resolvedRole = isUserRole(meta?.role) ? meta.role : null;
      }
    }
  }

  if ((isProtectedInvestor || isProtectedFounder) && !user) {
    const login = new URL("/auth/login", request.url);
    login.searchParams.set("next", `${path}${request.nextUrl.search}`);
    return NextResponse.redirect(login);
  }

  if (user && (isProtectedInvestor || isProtectedFounder)) {
    if (!resolvedRole) {
      return NextResponse.redirect(new URL("/auth/select-role", request.url));
    }

    if (isProtectedInvestor && resolvedRole !== "investor") {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
    if (isProtectedFounder && resolvedRole !== "founder") {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    if (
      isProtectedInvestor &&
      resolvedRole === "investor" &&
      !isInvestorApproved(investorStatus)
    ) {
      return NextResponse.redirect(new URL("/approval-pending", request.url));
    }
  }

  if (user && isApprovalPending && resolvedRole === "investor") {
    if (isInvestorApproved(investorStatus)) {
      return NextResponse.redirect(new URL("/investor/dashboard", request.url));
    }
  }

  if (
    user &&
    resolvedRole &&
    (path === "/auth/login" ||
      path.startsWith("/auth/signup") ||
      path === "/auth/select-role")
  ) {
    const destination =
      resolvedRole === "investor"
        ? investorPostAuthPath(investorStatus)
        : roleDashboardPath(resolvedRole);
    return NextResponse.redirect(new URL(destination, request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/investor/:path*",
    "/founder/:path*",
    "/dashboard/:path*",
    "/auth/:path*",
    "/approval-pending",
  ],
};
