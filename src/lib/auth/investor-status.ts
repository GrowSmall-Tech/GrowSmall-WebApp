import type { SupabaseClient } from "@supabase/supabase-js";

import {
  isInvestorStatus,
  type InvestorStatus,
} from "@/types/investor-kyc";

export const INVESTOR_KYC_BUCKET = "investor-documents";

export const KYC_ACCEPTED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
] as const;

export const KYC_MAX_BYTES = 10 * 1024 * 1024;

export const KYC_DOC_HINTS = [
  "Aadhaar",
  "PAN",
  "Passport",
  "Driving License",
] as const;

export const INCOME_DOC_HINTS = ["ITR", "Salary Slip", "Bank Statement"] as const;

export function isInvestorApproved(status: InvestorStatus | null | undefined): boolean {
  return status === "approved";
}

export function investorPostAuthPath(status: InvestorStatus | null | undefined): string {
  return isInvestorApproved(status) ? "/investor/dashboard" : "/approval-pending";
}

export async function fetchInvestorStatusForUser(
  supabase: SupabaseClient,
  userId: string,
): Promise<InvestorStatus | null> {
  const { data } = await supabase
    .from("profiles")
    .select("investor_status, role")
    .eq("id", userId)
    .maybeSingle();

  if (data?.role !== "investor") return null;
  return isInvestorStatus(data.investor_status) ? data.investor_status : "pending_approval";
}

export function validateKycFile(file: File): string | null {
  if (!KYC_ACCEPTED_TYPES.includes(file.type as (typeof KYC_ACCEPTED_TYPES)[number])) {
    return "Only PDF, JPG, JPEG, and PNG files are allowed.";
  }
  if (file.size > KYC_MAX_BYTES) {
    return "File must be 10MB or smaller.";
  }
  return null;
}

export function storageObjectPath(
  userId: string,
  kind: "kyc" | "income",
  fileName: string,
): string {
  const safeName = fileName.replace(/[^\w.\-()+ ]/g, "_");
  return `${userId}/${kind}/${Date.now()}-${safeName}`;
}
