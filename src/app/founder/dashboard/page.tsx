import { FounderDashboardOverview } from "@/components/dashboard/founder/founder-dashboard-overview";
import { getFounderPitches } from "@/lib/actions/pitch";
import { getFounderWorkspaceData } from "@/lib/queries/founder";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function FounderDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const pitches = user?.id ? await getFounderPitches() : [];
  const workspace = user?.id ? await getFounderWorkspaceData(user.id) : null;

  return <FounderDashboardOverview pitches={pitches} workspace={workspace} />;
}
