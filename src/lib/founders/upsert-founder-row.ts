import type { SupabaseClient } from "@supabase/supabase-js";

function isFoundersSchemaCacheError(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const rec = error as { code?: string; message?: string };
  if (rec.code === "PGRST204") return true;
  const m = rec.message ?? "";
  return m.includes("Could not find") && m.includes("founders");
}

type ModFounders = {
  user_id: string;
  founder_name: string;
  email: string | null;
  linkedin: string | null;
  bio: string | null;
};

/** Works with both workspace founders (email, founder_name, …) and legacy founders (linkedin_url only). */
export async function upsertFounderRow(
  supabase: SupabaseClient,
  row: ModFounders,
): Promise<void> {
  const modern = {
    user_id: row.user_id,
    founder_name: row.founder_name,
    email: row.email,
    linkedin: row.linkedin,
    bio: row.bio,
  };
  const first = await supabase
    .from("founders")
    .upsert(modern, { onConflict: "user_id" });
  if (!first.error) return;
  if (!isFoundersSchemaCacheError(first.error)) throw first.error;

  const legacy = {
    user_id: row.user_id,
    bio: row.bio,
    linkedin_url: row.linkedin,
  };
  const second = await supabase
    .from("founders")
    .upsert(legacy, { onConflict: "user_id" });
  if (second.error) throw second.error;
}
