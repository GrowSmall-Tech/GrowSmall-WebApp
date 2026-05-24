export const INVESTOR_STATUSES = [
  "pending_approval",
  "approved",
  "rejected",
] as const;

export type InvestorStatus = (typeof INVESTOR_STATUSES)[number];

export function isInvestorStatus(value: unknown): value is InvestorStatus {
  return (
    value === "pending_approval" ||
    value === "approved" ||
    value === "rejected"
  );
}

export type InvestorKycProfile = {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  investor_status: InvestorStatus | null;
  kyc_document_url: string | null;
  income_certificate_url: string | null;
  approved_by: string | null;
  approved_at: string | null;
  rejection_reason: string | null;
  created_at: string;
};

export type InvestorApprovalRow = InvestorKycProfile;
