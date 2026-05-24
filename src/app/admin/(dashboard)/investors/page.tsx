import {
  InvestorApprovalTable,
  InvestorKycStatsCards,
} from "@/components/admin/InvestorApprovalTable";
import {
  fetchInvestorKycStats,
  listInvestorsForApproval,
} from "@/lib/admin/investor-kyc";

export default async function AdminInvestorsPage() {
  let investors: Awaited<ReturnType<typeof listInvestorsForApproval>> = [];
  let stats: Awaited<ReturnType<typeof fetchInvestorKycStats>> = {
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  };
  let error: string | null = null;

  try {
    [investors, stats] = await Promise.all([
      listInvestorsForApproval(),
      fetchInvestorKycStats(),
    ]);
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load investors.";
  }

  if (error) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-950">
        <p className="font-medium">Unable to load investor approvals</p>
        <p className="mt-2 opacity-90">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Investor KYC Approvals
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Review submitted identity and income documents before granting dashboard access.
        </p>
      </div>

      <InvestorKycStatsCards stats={stats} />
      <InvestorApprovalTable investors={investors} />
    </div>
  );
}
