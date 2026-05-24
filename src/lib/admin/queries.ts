import { cookies } from "next/headers";

import {
  ADMIN_SESSION_COOKIE,
  verifyAdminSessionToken,
} from "@/lib/admin/session";
import { createAdminServiceClient } from "@/lib/supabase/admin-server";
import type { StartupWithPitch, UserRow } from "@/types/database";

export type AdminDashboardBundle = {
  startups: StartupWithPitch[];
  recentUsers: UserRow[];
  startupCount: number;
  pendingApprovalCount: number;
  userCount: number;
  investorCount: number;
  founderCount: number;
  totalFundingAsk: number;
  totalInvested: number;
  approvedPitchCount: number;
  investorKycPending: number;
  investorKycApproved: number;
  investorKycRejected: number;
};

export async function fetchAdminDashboardBundle(): Promise<
  AdminDashboardBundle | { error: string }
> {
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  if (!(await verifyAdminSessionToken(token))) {
    return { error: "Unauthorized" };
  }

  try {
    const supabase = createAdminServiceClient();

    const [
      startupsListRes,
      startupsCountRes,
      pendingCountRes,
      usersCountRes,
      recentUsersRes,
      investorsRes,
      foundersRes,
      fundingRes,
      investmentsRes,
      pitchApprovedRes,
      investorKycPendingRes,
      investorKycApprovedRes,
      investorKycRejectedRes,
    ] = await Promise.all([
      supabase
        .from("startups")
        .select(
          `
          *,
          pitch_submissions (
            id,
            status,
            submitted_at
          )
        `,
        )
        .order("created_at", { ascending: false })
        .limit(128),
      supabase.from("startups").select("id", { count: "exact", head: true }),
      supabase
        .from("startups")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending_review"),
      supabase.from("users").select("id", { count: "exact", head: true }),
      supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(8),
      supabase
        .from("users")
        .select("id", { count: "exact", head: true })
        .eq("role", "investor"),
      supabase
        .from("users")
        .select("id", { count: "exact", head: true })
        .eq("role", "founder"),
      supabase.from("startups").select("funding_ask"),
      supabase.from("investments").select("amount"),
      supabase
        .from("pitch_submissions")
        .select("id", { count: "exact", head: true })
        .eq("status", "approved"),
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("role", "investor")
        .eq("investor_status", "pending_approval"),
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("role", "investor")
        .eq("investor_status", "approved"),
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("role", "investor")
        .eq("investor_status", "rejected"),
    ]);

    if (startupsListRes.error) throw new Error(startupsListRes.error.message);
    if (recentUsersRes.error) throw new Error(recentUsersRes.error.message);

    const fundingRows = fundingRes.data ?? [];
    const totalFundingAsk = fundingRows.reduce(
      (acc, row) => acc + (Number(row.funding_ask) || 0),
      0,
    );
    const investmentRows = investmentsRes.data ?? [];
    const totalInvested = investmentRows.reduce(
      (acc, row) => acc + (Number((row as { amount: unknown }).amount) || 0),
      0,
    );

    return {
      startups: (startupsListRes.data ?? []) as StartupWithPitch[],
      recentUsers: (recentUsersRes.data ?? []) as UserRow[],
      startupCount: startupsCountRes.count ?? 0,
      pendingApprovalCount: pendingCountRes.count ?? 0,
      userCount: usersCountRes.count ?? 0,
      investorCount: investorsRes.count ?? 0,
      founderCount: foundersRes.count ?? 0,
      totalFundingAsk,
      totalInvested,
      approvedPitchCount: pitchApprovedRes.count ?? 0,
      investorKycPending: investorKycPendingRes.count ?? 0,
      investorKycApproved: investorKycApprovedRes.count ?? 0,
      investorKycRejected: investorKycRejectedRes.count ?? 0,
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load dashboard";
    return { error: message };
  }
}

export async function fetchAdminBusinessesData(): Promise<
  | { startups: StartupWithPitch[]; founders: UserRow[] }
  | { error: string }
> {
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  if (!(await verifyAdminSessionToken(token))) {
    return { error: "Unauthorized" };
  }

  try {
    const supabase = createAdminServiceClient();
    const [startupsRes, foundersRes] = await Promise.all([
      supabase
        .from("startups")
        .select(
          `
          *,
          pitch_submissions (
            id,
            status,
            submitted_at
          )
        `,
        )
        .order("created_at", { ascending: false }),
      supabase
        .from("users")
        .select("*")
        .eq("role", "founder")
        .order("full_name", { ascending: true }),
    ]);

    if (startupsRes.error) throw new Error(startupsRes.error.message);
    if (foundersRes.error) throw new Error(foundersRes.error.message);

    return {
      startups: (startupsRes.data ?? []) as StartupWithPitch[],
      founders: (foundersRes.data ?? []) as UserRow[],
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load businesses";
    return { error: message };
  }
}

export async function fetchAdminUsersData(): Promise<
  UserRow[] | { error: string }
> {
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  if (!(await verifyAdminSessionToken(token))) {
    return { error: "Unauthorized" };
  }

  try {
    const supabase = createAdminServiceClient();
    const res = await supabase
      .from("users")
      .select("*")
      .order("created_at", { ascending: false });
    if (res.error) throw new Error(res.error.message);
    return (res.data ?? []) as UserRow[];
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load users";
    return { error: message };
  }
}
