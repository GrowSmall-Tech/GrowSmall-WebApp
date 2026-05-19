import { SupabaseRealtimeRefresh } from "@/components/realtime/supabase-realtime-refresh";
import { InvestorPageShell } from "@/components/dashboard/investor/investor-page-shell";
import { StartupCard } from "@/components/dashboard/investor/startup-card";
import { getInvestorDashboardData, getInvestorNotifications } from "@/lib/queries/investor";

export const dynamic = "force-dynamic";

export default async function InvestorStartupsPage() {
  const [dashboard, notifications] = await Promise.all([
    getInvestorDashboardData(),
    getInvestorNotifications(),
  ]);
  if (!dashboard) return null;

  return (
    <>
      <SupabaseRealtimeRefresh tables={["startups", "saved_startups"]} />
      <InvestorPageShell notifications={notifications}>
        <h1 className="text-2xl font-semibold text-slate-900">Startups</h1>
        <p className="mt-1 text-sm text-slate-600">Live listings with realtime updates and bookmarks.</p>
        <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {dashboard.startupCards.map((startup) => (
            <StartupCard key={startup.id} startup={startup} />
          ))}
        </section>
      </InvestorPageShell>
    </>
  );
}
