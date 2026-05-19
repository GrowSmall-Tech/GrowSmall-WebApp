import { SupabaseRealtimeRefresh } from "@/components/realtime/supabase-realtime-refresh";
import { InvestorDashboardView } from "@/components/dashboard/investor-dashboard-view";
import { getInvestorDashboardData, getInvestorNotifications } from "@/lib/queries/investor";
import { getInvestorSectorPills } from "@/lib/queries/startups";

const INVESTOR_REALTIME_TABLES = [
  "startups",
  "startup_metrics",
  "saved_startups",
  "notifications",
];

export const dynamic = "force-dynamic";

export default async function InvestorDashboardPage() {
  const [dashboard, sectors, notifications] = await Promise.all([
    getInvestorDashboardData(),
    getInvestorSectorPills(),
    getInvestorNotifications(),
  ]);
  if (!dashboard) return null;

  return (
    <>
      <SupabaseRealtimeRefresh tables={INVESTOR_REALTIME_TABLES} />
      <InvestorDashboardView
        featuredStartup={dashboard.featuredStartup}
        trendingCards={dashboard.startupCards}
        sectors={sectors}
        marketOutlook={dashboard.outlook}
        notifications={notifications}
      />
    </>
  );
}
