import type { SupabaseClient } from "@supabase/supabase-js";

import { fetchInvestorStatusForUser, isInvestorApproved } from "@/lib/auth/investor-status";
import type { InvestorStatus } from "@/types/investor-kyc";

export class InvestorNotApprovedError extends Error {
  readonly status: InvestorStatus | null;

  constructor(status: InvestorStatus | null) {
    super(
      status === "rejected"
        ? "Your investor application was rejected. Contact support to appeal."
        : "Your documents are under review. Please wait for admin approval.",
    );
    this.name = "InvestorNotApprovedError";
    this.status = status;
  }
}

export async function assertApprovedInvestor(
  supabase: SupabaseClient,
  userId: string,
): Promise<void> {
  const status = await fetchInvestorStatusForUser(supabase, userId);
  if (!isInvestorApproved(status)) {
    throw new InvestorNotApprovedError(status);
  }
}
