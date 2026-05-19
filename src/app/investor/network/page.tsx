import { InvestorPageShell } from "@/components/dashboard/investor/investor-page-shell";
import { SupabaseRealtimeRefresh } from "@/components/realtime/supabase-realtime-refresh";
import { getInvestorDashboardData, getInvestorNotifications } from "@/lib/queries/investor";

export const dynamic = "force-dynamic";

export default async function InvestorNetworkPage() {
  const [dashboard, notifications] = await Promise.all([
    getInvestorDashboardData(),
    getInvestorNotifications(),
  ]);
  if (!dashboard) return null;
  return (
    <>
      <SupabaseRealtimeRefresh tables={["startups", "notifications"]} />
      <InvestorPageShell notifications={notifications}>
        <h1 className="text-2xl font-semibold text-slate-900">Network</h1>
        <p className="mt-1 text-sm text-slate-600">Founders, investors, and trending startups.</p>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {dashboard.startupCards.slice(0, 9).map((startup) => (
            <article key={startup.id} className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold text-[#387ED1]">{startup.industry}</p>
              <h3 className="mt-1 text-lg font-semibold">{startup.name}</h3>
              <p className="mt-2 text-sm text-slate-600">{startup.description}</p>
            </article>
          ))}
        </div>
      </InvestorPageShell>
    </>
  );
}
