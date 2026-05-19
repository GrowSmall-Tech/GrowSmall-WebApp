"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/admin/session";
import { createAdminServiceClient } from "@/lib/supabase/admin-server";
import type {
  PitchSubmissionStatus,
  StartupStatus,
  StartupWithPitch,
} from "@/types/database";

async function requireAdmin() {
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  if (!(await verifyAdminSessionToken(token))) {
    throw new Error("Unauthorized");
  }
}

function adminDb() {
  return createAdminServiceClient();
}

export async function listStartupsAction() {
  await requireAdmin();
  const supabase = adminDb();
  const { data, error } = await supabase
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
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data as StartupWithPitch[];
}

export async function listUsersAction() {
  await requireAdmin();
  const supabase = adminDb();
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

async function revalidateStartupSurfaces(supabase: ReturnType<typeof adminDb>, id: string) {
  const { data } = await supabase.from("startups").select("slug").eq("id", id).maybeSingle();
  if (data?.slug) {
    revalidatePath(`/startup/${data.slug}`);
  }
  revalidatePath("/");
  revalidatePath("/explore");
  revalidatePath("/investor/dashboard");
}

export async function updateStartupStatusAction(
  id: string,
  status: StartupStatus,
  rejectionReason?: string | null,
) {
  await requireAdmin();
  const supabase = adminDb();
  const { error } = await supabase
    .from("startups")
    .update({
      status,
      rejection_reason: status === "rejected" ? rejectionReason?.trim() || null : null,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);

  if (status === "live" || status === "approved") {
    await supabase
      .from("pitch_submissions")
      .update({ status: "approved", submission_status: "approved" })
      .eq("startup_id", id);
  } else if (status === "rejected") {
    await supabase
      .from("pitch_submissions")
      .update({ status: "rejected", submission_status: "rejected" })
      .eq("startup_id", id);
  } else if (status === "pending_review") {
    await supabase
      .from("pitch_submissions")
      .update({ status: "pending", submission_status: "under_review" })
      .eq("startup_id", id);
  }

  const adminUser = await supabase
    .from("users")
    .select("id")
    .eq("role", "admin")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (adminUser.data?.id) {
    const reviewAction =
      status === "live"
        ? "approved"
        : status === "rejected"
          ? "rejected"
          : "requested_changes";
    await supabase.from("admin_reviews").insert({
      startup_id: id,
      admin_id: adminUser.data.id,
      action: reviewAction,
      notes: rejectionReason?.trim() || null,
    });
  }
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/businesses");
  await revalidateStartupSurfaces(supabase, id);
}

export async function updatePitchStatusAction(
  id: string,
  status: PitchSubmissionStatus,
) {
  await requireAdmin();
  const supabase = adminDb();
  const { error } = await supabase
    .from("pitch_submissions")
    .update({ status })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/businesses");
}

export async function toggleFeaturedAction(id: string, isFeatured: boolean) {
  await requireAdmin();
  const supabase = adminDb();
  const { error } = await supabase
    .from("startups")
    .update({ is_featured: isFeatured })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/businesses");
  await revalidateStartupSurfaces(supabase, id);
}

export async function toggleTrendingAction(id: string, isTrending: boolean) {
  await requireAdmin();
  const supabase = adminDb();
  const { error } = await supabase
    .from("startups")
    .update({ is_trending: isTrending })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/businesses");
  await revalidateStartupSurfaces(supabase, id);
}

export async function createStartupAction(input: {
  name: string;
  slug: string;
  industry: string;
  tagline?: string | null;
  location?: string | null;
  category?: string | null;
  description?: string;
  problem?: string | null;
  solution?: string | null;
  funding_ask?: number | null;
  annual_revenue?: number | null;
  annual_profit?: number | null;
  growth_rate?: number | null;
  equity_offered?: number | null;
  valuation?: number | null;
  stage?: string | null;
  founder_id?: string | null;
  logo_url?: string | null;
  banner_url?: string | null;
  status?: StartupStatus;
}) {
  await requireAdmin();
  const supabase = adminDb();
  const { error } = await supabase.from("startups").insert({
    name: input.name,
    slug: input.slug,
    industry: input.industry,
    tagline: input.tagline ?? null,
    location: input.location ?? null,
    category: input.category ?? null,
    description: input.description ?? null,
    problem: input.problem ?? null,
    solution: input.solution ?? null,
    funding_ask: input.funding_ask ?? null,
    annual_revenue: input.annual_revenue ?? null,
    annual_profit: input.annual_profit ?? null,
    growth_rate: input.growth_rate ?? null,
    equity_offered: input.equity_offered ?? null,
    valuation: input.valuation ?? null,
    stage: input.stage ?? null,
    founder_id: input.founder_id ?? null,
    logo_url: input.logo_url ?? null,
    banner_url: input.banner_url ?? null,
    is_featured: false,
    is_trending: false,
    status: input.status ?? "pending_review",
  });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/businesses");
  revalidatePath("/admin/dashboard");
}

export async function updateStartupAction(
  id: string,
  input: Partial<{
    name: string;
    slug: string;
    industry: string;
    tagline: string | null;
    location: string | null;
    category: string | null;
    description: string | null;
    problem: string | null;
    solution: string | null;
    funding_ask: number | null;
    annual_revenue: number | null;
    annual_profit: number | null;
    growth_rate: number | null;
    equity_offered: number | null;
    valuation: number | null;
    stage: string | null;
    founder_id: string | null;
    logo_url: string | null;
    banner_url: string | null;
    status: StartupStatus;
    is_featured: boolean;
    is_trending: boolean;
  }>,
) {
  await requireAdmin();
  const supabase = adminDb();
  const { error } = await supabase.from("startups").update(input).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/businesses");
  revalidatePath("/admin/dashboard");
  await revalidateStartupSurfaces(supabase, id);
}

export async function deleteStartupAction(id: string) {
  await requireAdmin();
  const supabase = adminDb();
  await revalidateStartupSurfaces(supabase, id);
  const { error } = await supabase.from("startups").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/businesses");
  revalidatePath("/admin/dashboard");
}

export async function setUserSuspendedAction(id: string, suspended: boolean) {
  await requireAdmin();
  const supabase = adminDb();
  const { error } = await supabase.from("users").update({ suspended }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/users");
}

export async function deleteUserAction(id: string) {
  await requireAdmin();
  const supabase = adminDb();
  const { error } = await supabase.from("users").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/users");
}

export async function createFounderUserAction(input: {
  full_name: string;
  email: string;
}) {
  await requireAdmin();
  const supabase = adminDb();
  const { error } = await supabase.from("users").insert({
    role: "founder",
    full_name: input.full_name.trim(),
    email: input.email.trim().toLowerCase(),
  });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/users");
  revalidatePath("/admin/businesses");
}

export async function upsertStartupMetricsAction(
  startupId: string,
  rows: Array<{ month: string; revenue?: number | null; users_growth?: number | null }>,
) {
  await requireAdmin();
  const supabase = adminDb();
  const { error } = await supabase.from("startup_metrics").delete().eq("startup_id", startupId);
  if (error) throw new Error(error.message);
  if (!rows.length) return;
  const { error: insErr } = await supabase.from("startup_metrics").insert(
    rows.map((r) => ({
      startup_id: startupId,
      month: r.month,
      revenue: r.revenue ?? null,
      users_growth: r.users_growth ?? null,
    })),
  );
  if (insErr) throw new Error(insErr.message);
  revalidatePath("/admin/businesses");
  await revalidateStartupSurfaces(supabase, startupId);
}

export async function getAdminAnalyticsSnapshotAction() {
  await requireAdmin();
  const supabase = adminDb();

  const [
    startupsRes,
    pendingRes,
    usersRes,
    fundingRes,
    investmentsRes,
    investorsRes,
    foundersRes,
    pitchApprovedRes,
  ] = await Promise.all([
    supabase.from("startups").select("id", { count: "exact", head: true }),
    supabase
      .from("startups")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending_review"),
    supabase.from("users").select("id", { count: "exact", head: true }),
    supabase.from("startups").select("funding_ask"),
    supabase.from("investments").select("amount"),
    supabase
      .from("users")
      .select("id", { count: "exact", head: true })
      .eq("role", "investor"),
    supabase
      .from("users")
      .select("id", { count: "exact", head: true })
      .eq("role", "founder"),
    supabase
      .from("pitch_submissions")
      .select("id", { count: "exact", head: true })
      .eq("status", "approved"),
  ]);

  const fundingRows = fundingRes.data ?? [];
  const totalFundingAsk = fundingRows.reduce(
    (acc, row) => acc + (Number(row.funding_ask) || 0),
    0,
  );
  const investmentRows = investmentsRes.data ?? [];
  const totalInvested = investmentRows.reduce(
    (acc, row) => acc + (Number(row.amount) || 0),
    0,
  );

  return {
    startupCount: startupsRes.count ?? 0,
    pendingApprovalCount: pendingRes.count ?? 0,
    userCount: usersRes.count ?? 0,
    investorCount: investorsRes.count ?? 0,
    founderCount: foundersRes.count ?? 0,
    totalFundingAsk,
    totalInvested,
    approvedPitchCount: pitchApprovedRes.count ?? 0,
  };
}
