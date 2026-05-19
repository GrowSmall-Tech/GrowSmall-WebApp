import { InvestorPageShell } from "@/components/dashboard/investor/investor-page-shell";
import { StartupCard } from "@/components/dashboard/investor/startup-card";
import { SupabaseRealtimeRefresh } from "@/components/realtime/supabase-realtime-refresh";
import { getInvestorDashboardData, getInvestorNotifications } from "@/lib/queries/investor";

export const dynamic = "force-dynamic";

export default async function InvestorSavedPage() {
  const [dashboard, notifications] = await Promise.all([
    getInvestorDashboardData(),
    getInvestorNotifications(),
  ]);
  if (!dashboard) return null;
  const saved = dashboard.startupCards.filter((s) => s.isSaved);
  return (
    <>
      <SupabaseRealtimeRefresh tables={["saved_startups"]} />
      <InvestorPageShell notifications={notifications}>
        <div className="space-y-6">
          <header>
            <h1 className="text-2xl font-semibold text-slate-900">Saved startups</h1>
            <p className="mt-2 text-sm text-slate-600">Bookmarked opportunities synced to your account.</p>
          </header>
          {saved.length === 0 ? (
            <div className="rounded-xl border border-slate-100 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
              No saved startups yet.
            </div>
          ) : (
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {saved.map((startup) => (
                <StartupCard key={startup.id} startup={startup} />
              ))}
            </section>
          )}
        </div>
      </InvestorPageShell>
    </>
  );
}
