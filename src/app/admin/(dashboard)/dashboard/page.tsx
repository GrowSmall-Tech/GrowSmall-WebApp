import { AdminDashboardView } from "@/components/admin/dashboard-view";
import { fetchAdminDashboardBundle } from "@/lib/admin/queries";

export default async function AdminDashboardPage() {
  const data = await fetchAdminDashboardBundle();

  if ("error" in data) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-950">
        <p className="font-medium">Unable to load dashboard</p>
        <p className="mt-2 opacity-90">{data.error}</p>
        <p className="mt-4 text-xs">
          Add <code className="rounded bg-white/80 px-1">SUPABASE_SERVICE_ROLE_KEY</code> to{" "}
          <code className="rounded bg-white/80 px-1">.env.local</code> and apply the SQL migration in{" "}
          <code className="rounded bg-white/80 px-1">supabase/migrations/</code>.
        </p>
      </div>
    );
  }

  return (
    <AdminDashboardView
      startups={data.startups}
      recentUsers={data.recentUsers}
      startupCount={data.startupCount}
      pendingApprovalCount={data.pendingApprovalCount}
      userCount={data.userCount}
      investorCount={data.investorCount}
      founderCount={data.founderCount}
      totalFundingAsk={data.totalFundingAsk}
      totalInvested={data.totalInvested}
      investorKycPending={data.investorKycPending}
      investorKycApproved={data.investorKycApproved}
      investorKycRejected={data.investorKycRejected}
    />
  );
}
