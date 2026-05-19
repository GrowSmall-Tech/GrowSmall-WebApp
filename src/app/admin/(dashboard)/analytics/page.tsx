import { AdminAnalyticsView } from "@/components/admin/admin-analytics-view";
import { fetchAdminDashboardBundle } from "@/lib/admin/queries";

export default async function AdminAnalyticsPage() {
  const data = await fetchAdminDashboardBundle();

  if ("error" in data) {
    return (
      <div className="rounded-xl border border-red-100 bg-red-50 p-6 text-sm text-red-900">
        {data.error}
      </div>
    );
  }

  return (
    <AdminAnalyticsView
      startupCount={data.startupCount}
      pendingApprovalCount={data.pendingApprovalCount}
      userCount={data.userCount}
      investorCount={data.investorCount}
      founderCount={data.founderCount}
      totalFundingAsk={data.totalFundingAsk}
      totalInvested={data.totalInvested}
      approvedPitchCount={data.approvedPitchCount}
    />
  );
}
