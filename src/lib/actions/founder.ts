"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { upsertFounderRow } from "@/lib/founders/upsert-founder-row";

function revalidateFounderPaths() {
  revalidatePath("/founder/dashboard");
  revalidatePath("/founder/funding-history");
  revalidatePath("/founder/documents");
  revalidatePath("/founder/settings");
}

async function getCurrentFounder() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return { supabase, user };
}

export async function switchFounderToInvestor() {
  const { supabase, user } = await getCurrentFounder();
  const update = await supabase.from("users").update({ role: "investor" }).eq("id", user.id);
  if (update.error) throw update.error;
  const profileUpdate = await supabase
    .from("profiles")
    .upsert(
      {
        id: user.id,
        email: user.email ?? "",
        role: "investor",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    );
  if (profileUpdate.error) throw profileUpdate.error;
  revalidateFounderPaths();
}

export async function inviteFounderByEmail(email: string) {
  const { supabase, user } = await getCurrentFounder();
  const clean = email.trim().toLowerCase();
  if (!clean || !clean.includes("@")) throw new Error("Valid email required");
  const inserted = await supabase
    .from("founder_invites")
    .insert({ email: clean, invited_by: user.id, status: "pending" });
  if (inserted.error) throw inserted.error;
  revalidateFounderPaths();
}

export async function addFundingRound(input: {
  startupId: string;
  amount: number;
  investorName: string;
  roundType: string;
}) {
  const { supabase } = await getCurrentFounder();
  const inserted = await supabase.from("funding_history").insert({
    startup_id: input.startupId,
    amount: input.amount,
    investor_name: input.investorName,
    round_type: input.roundType,
  });
  if (inserted.error) throw inserted.error;
  revalidateFounderPaths();
}

export async function uploadFounderDocument(formData: FormData) {
  const { supabase, user } = await getCurrentFounder();
  const file = formData.get("file");
  if (!(file instanceof File)) throw new Error("File is required");
  const startupId = String(formData.get("startupId") ?? "");
  const docType = String(formData.get("documentType") ?? "general");
  const filePath = `${user.id}/${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
  const upload = await supabase.storage.from("founder-documents").upload(filePath, file, {
    contentType: file.type,
    upsert: true,
  });
  if (upload.error) throw upload.error;
  const { data: publicUrlData } = supabase.storage.from("founder-documents").getPublicUrl(filePath);

  const inserted = await supabase.from("documents").insert({
    founder_id: user.id,
    startup_id: startupId || null,
    document_name: file.name,
    document_url: publicUrlData.publicUrl,
    document_type: docType,
    title: file.name,
    category: "due_diligence",
    file_path: filePath,
    mime_type: file.type || null,
    size_bytes: file.size || null,
  });
  if (inserted.error) throw inserted.error;
  revalidateFounderPaths();
}

export async function deleteFounderDocument(id: string) {
  const { supabase, user } = await getCurrentFounder();
  const row = await supabase
    .from("documents")
    .select("id,file_path")
    .eq("id", id)
    .eq("founder_id", user.id)
    .maybeSingle();
  if (row.error || !row.data) throw row.error ?? new Error("Document not found");
  await supabase.storage.from("founder-documents").remove([row.data.file_path]);
  const deleted = await supabase.from("documents").delete().eq("id", id).eq("founder_id", user.id);
  if (deleted.error) throw deleted.error;
  revalidateFounderPaths();
}

export async function renameFounderDocument(id: string, documentName: string) {
  const { supabase, user } = await getCurrentFounder();
  const updated = await supabase
    .from("documents")
    .update({ document_name: documentName, title: documentName })
    .eq("id", id)
    .eq("founder_id", user.id);
  if (updated.error) throw updated.error;
  revalidateFounderPaths();
}

export async function updateFounderSettings(input: {
  founderName: string;
  bio: string;
  linkedin: string;
  startupName: string;
  tagline: string;
  notificationsEmail: boolean;
}) {
  const { supabase, user } = await getCurrentFounder();
  await upsertFounderRow(supabase, {
    user_id: user.id,
    founder_name: input.founderName,
    email: user.email ?? null,
    linkedin: input.linkedin || null,
    bio: input.bio || null,
  });

  const startup = await supabase
    .from("startups")
    .update({
      startup_name: input.startupName,
      name: input.startupName,
      tagline: input.tagline || null,
    })
    .eq("founder_id", user.id);
  if (startup.error) throw startup.error;

  const notificationInsert = await supabase.from("notifications").insert({
    user_id: user.id,
    title: "Founder settings updated",
    body: input.notificationsEmail ? "Email notifications enabled." : "Email notifications disabled.",
    type: "system",
  });
  if (notificationInsert.error) throw notificationInsert.error;
  revalidateFounderPaths();
}
