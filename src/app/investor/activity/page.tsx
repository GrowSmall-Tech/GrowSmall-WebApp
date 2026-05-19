import { InvestorPageShell } from "@/components/dashboard/investor/investor-page-shell";
import { SupabaseRealtimeRefresh } from "@/components/realtime/supabase-realtime-refresh";
import { getInvestorActivity, getInvestorNotifications } from "@/lib/queries/investor";

export const dynamic = "force-dynamic";

export default async function InvestorActivityPage() {
  const [activity, notifications] = await Promise.all([
    getInvestorActivity(),
    getInvestorNotifications(),
  ]);
  return (
    <>
      <SupabaseRealtimeRefresh tables={["investor_activity", "notifications"]} />
      <InvestorPageShell notifications={notifications}>
        <h1 className="text-2xl font-semibold text-slate-900">Activity</h1>
        <div className="mt-6 rounded-xl border border-slate-100 bg-white p-4">
          {activity.length === 0 ? (
            <p className="text-sm text-slate-500">No activity recorded yet.</p>
          ) : (
            <ul className="space-y-2">
              {activity.map((item) => (
                <li key={item.id} className="rounded-lg border border-slate-100 px-3 py-2 text-sm">
                  <span className="font-medium">{item.action.replaceAll("_", " ")}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </InvestorPageShell>
    </>
  );
}
