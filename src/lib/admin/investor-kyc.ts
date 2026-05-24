"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/admin/session";
import { INVESTOR_KYC_BUCKET } from "@/lib/auth/investor-status";
import { createAdminServiceClient } from "@/lib/supabase/admin-server";
import { isInvestorStatus, type InvestorApprovalRow } from "@/types/investor-kyc";

async function requireAdmin() {
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  if (!(await verifyAdminSessionToken(token))) {
    throw new Error("Unauthorized");
  }
}

function adminDb() {
  return createAdminServiceClient();
}

export type InvestorKycStats = {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
};

export async function fetchInvestorKycStats(): Promise<InvestorKycStats> {
  await requireAdmin();
  const supabase = adminDb();

  const [totalRes, pendingRes, approvedRes, rejectedRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "investor"),
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

  return {
    total: totalRes.count ?? 0,
    pending: pendingRes.count ?? 0,
    approved: approvedRes.count ?? 0,
    rejected: rejectedRes.count ?? 0,
  };
}

export async function listInvestorsForApproval(): Promise<InvestorApprovalRow[]> {
  await requireAdmin();
  const supabase = adminDb();

  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, email, full_name, role, investor_status, kyc_document_url, income_certificate_url, approved_by, approved_at, rejection_reason, created_at",
    )
    .eq("role", "investor")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    ...row,
    investor_status: isInvestorStatus(row.investor_status)
      ? row.investor_status
      : "pending_approval",
  })) as InvestorApprovalRow[];
}

export async function getInvestorDocumentSignedUrl(
  storagePath: string,
): Promise<string> {
  await requireAdmin();
  if (!storagePath?.trim()) throw new Error("Document path is required.");

  const supabase = adminDb();
  const { data, error } = await supabase.storage
    .from(INVESTOR_KYC_BUCKET)
    .createSignedUrl(storagePath, 60 * 15);

  if (error || !data?.signedUrl) {
    throw new Error(error?.message ?? "Unable to generate document URL.");
  }

  return data.signedUrl;
}

export async function approveInvestorAction(investorId: string) {
  await requireAdmin();
  const supabase = adminDb();
  const now = new Date().toISOString();

  const { error } = await supabase
    .from("profiles")
    .update({
      investor_status: "approved",
      approved_at: now,
      rejection_reason: null,
    })
    .eq("id", investorId)
    .eq("role", "investor");

  if (error) throw new Error(error.message);

  revalidatePath("/admin/investors");
  revalidatePath("/admin/dashboard");
  revalidatePath("/approval-pending");
  revalidatePath("/investor/dashboard");

  return { success: true as const };
}

export async function rejectInvestorAction(
  investorId: string,
  rejectionReason?: string | null,
) {
  await requireAdmin();
  const supabase = adminDb();

  const { error } = await supabase
    .from("profiles")
    .update({
      investor_status: "rejected",
      rejection_reason: rejectionReason?.trim() || null,
      approved_at: null,
    })
    .eq("id", investorId)
    .eq("role", "investor");

  if (error) throw new Error(error.message);

  revalidatePath("/admin/investors");
  revalidatePath("/admin/dashboard");
  revalidatePath("/approval-pending");

  return { success: true as const };
}
