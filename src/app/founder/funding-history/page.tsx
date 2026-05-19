import { FundingHistoryView } from "@/components/dashboard/founder/funding-history-view";
import { getFounderWorkspaceData } from "@/lib/queries/founder";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function FounderFundingHistoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const workspace = user?.id ? await getFounderWorkspaceData(user.id) : null;

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-semibold text-slate-900">Funding History</h1>
        <p className="mt-2 text-sm text-slate-600">Track rounds, investors, timeline events, and total amount raised.</p>
      </div>
      <FundingHistoryView startupId={workspace?.startup?.id ?? null} rounds={workspace?.fundingHistory ?? []} />
    </div>
  );
}
