import { FounderSettingsForm } from "@/components/dashboard/founder/founder-settings-form";
import { getFounderWorkspaceData } from "@/lib/queries/founder";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function FounderSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const workspace = user?.id ? await getFounderWorkspaceData(user.id) : null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">Settings</h1>
      <p className="text-sm text-slate-600">
        Team invites, branding, watermarking decks, fundraising preferences.
      </p>
      <FounderSettingsForm
        defaults={{
          founderName: "",
          bio: "",
          linkedin: "",
          startupName: workspace?.startup?.startup_name ?? workspace?.startup?.name ?? "",
          tagline: workspace?.startup?.tagline ?? "",
        }}
      />
    </div>
  );
}
