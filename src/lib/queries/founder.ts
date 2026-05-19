import { createClient } from "@/lib/supabase/server";

export async function getFounderWorkspaceData(userId: string) {
  const supabase = await createClient();

  const [startupRes, submissionRes, filesRes, fundingRes, docsRes, invitesRes] = await Promise.all([
    supabase
      .from("startups")
      .select("*")
      .eq("founder_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("pitch_submissions")
      .select("*")
      .order("submitted_at", { ascending: false })
      .limit(1),
    supabase.from("pitch_files").select("*").order("created_at", { ascending: false }),
    supabase.from("funding_history").select("*").order("created_at", { ascending: false }),
    supabase.from("documents").select("*").eq("founder_id", userId).order("uploaded_at", { ascending: false }),
    supabase.from("founder_invites").select("*").eq("invited_by", userId).order("created_at", { ascending: false }),
  ]);

  const startup = startupRes.data;
  const submission = submissionRes.data?.find((row) => row.startup_id === startup?.id) ?? null;
  const pitchFiles = (filesRes.data ?? []).filter((row) => row.startup_id === startup?.id);
  const fundingHistory = (fundingRes.data ?? []).filter((row) => row.startup_id === startup?.id);
  const documents = (docsRes.data ?? []).filter((row) => row.startup_id === startup?.id || !row.startup_id);
  const invites = invitesRes.data ?? [];

  return { startup, submission, pitchFiles, fundingHistory, documents, invites };
}
