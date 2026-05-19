"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

function bumpInvestorPaths() {
  revalidatePath("/investor/dashboard");
  revalidatePath("/investor/startups");
  revalidatePath("/investor/saved");
  revalidatePath("/investor/investments");
  revalidatePath("/investor/documents");
  revalidatePath("/investor/settings");
  revalidatePath("/investor/activity");
}

export async function toggleSavedStartup(startupId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const existing = await supabase
    .from("saved_startups")
    .select("id")
    .eq("investor_id", user.id)
    .eq("startup_id", startupId)
    .maybeSingle();

  if (existing.data?.id) {
    await supabase.from("saved_startups").delete().eq("id", existing.data.id);
    await supabase.from("investor_activity").insert({
      investor_id: user.id,
      startup_id: startupId,
      action: "unsaved_startup",
    });
    bumpInvestorPaths();
    return { saved: false };
  }

  await supabase.from("saved_startups").insert({
    investor_id: user.id,
    startup_id: startupId,
  });
  await supabase.from("investor_activity").insert({
    investor_id: user.id,
    startup_id: startupId,
    action: "saved_startup",
  });
  bumpInvestorPaths();
  return { saved: true };
}

export async function trackStartupView(startupId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("investor_activity").insert({
    investor_id: user.id,
    startup_id: startupId,
    action: "viewed_startup",
  });
}

export async function createFounderInvitation(email: string, message?: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  await supabase.from("invitations").insert({
    inviter_id: user.id,
    invitee_email: email.trim().toLowerCase(),
    message: message?.trim() || null,
  });
  await supabase.from("notifications").insert({
    user_id: user.id,
    title: "Founder invitation queued",
    body: `Invite created for ${email}`,
    type: "system",
  });
  bumpInvestorPaths();
}

export async function updateInvestorProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const payload = {
    user_id: user.id,
    bio: String(formData.get("bio") ?? "").trim() || null,
    phone: String(formData.get("phone") ?? "").trim() || null,
    focus_sectors: String(formData.get("focus_sectors") ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    cheque_size_min: Number(formData.get("cheque_size_min") || 0) || null,
    cheque_size_max: Number(formData.get("cheque_size_max") || 0) || null,
    email_updates: String(formData.get("email_updates")) === "on",
    push_updates: String(formData.get("push_updates")) === "on",
    updated_at: new Date().toISOString(),
  };

  await supabase.from("investor_profiles").upsert(payload, { onConflict: "user_id" });
  await supabase.from("investor_activity").insert({
    investor_id: user.id,
    action: "profile_updated",
  });
  bumpInvestorPaths();
}

export async function uploadInvestorDocument(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const file = formData.get("file");
  if (!(file instanceof File)) throw new Error("File is required");

  const category = String(formData.get("category") || "due_diligence");
  const path = `${user.id}/${Date.now()}-${file.name}`;
  const upload = await supabase.storage.from("investor-documents").upload(path, file, {
    contentType: file.type,
    upsert: false,
  });
  if (upload.error) throw upload.error;

  await supabase.from("documents").insert({
    investor_id: user.id,
    title: file.name,
    category,
    file_path: path,
    mime_type: file.type || null,
    size_bytes: file.size || null,
  });
  await supabase.from("investor_activity").insert({
    investor_id: user.id,
    action: "document_uploaded",
    metadata: { fileName: file.name, category },
  });
  bumpInvestorPaths();
}

export async function markNotificationRead(notificationId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId)
    .eq("user_id", user.id);
  bumpInvestorPaths();
}

export async function switchInvestorToFounder() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const roleUpdate = await supabase
    .from("users")
    .update({ role: "founder" })
    .eq("id", user.id);
  if (roleUpdate.error) throw roleUpdate.error;

  const profileUpdate = await supabase.from("profiles").upsert(
    {
      id: user.id,
      email: user.email ?? "",
      role: "founder",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );
  if (profileUpdate.error) throw profileUpdate.error;
}

export async function submitInvestmentInterest(input: {
  startupId: string;
  amountInterest?: number | null;
  message?: string | null;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const startupRes = await supabase
    .from("startups")
    .select("id,founder_id,name,investor_interest_count,status")
    .eq("id", input.startupId)
    .maybeSingle();

  if (startupRes.error || !startupRes.data) {
    throw startupRes.error ?? new Error("Startup not found");
  }
  if (startupRes.data.status !== "live") {
    throw new Error("This startup is not currently open for investor interest");
  }

  const existing = await supabase
    .from("investment_requests")
    .select("id")
    .eq("investor_id", user.id)
    .eq("startup_id", input.startupId)
    .maybeSingle();
  if (existing.data?.id) {
    return { success: true, duplicate: true };
  }

  const insertReq = await supabase.from("investment_requests").insert({
    investor_id: user.id,
    startup_id: input.startupId,
    amount_interest: input.amountInterest ?? null,
    message: input.message?.trim() || null,
    status: "pending",
  });
  if (insertReq.error) throw insertReq.error;

  const nextInterestCount = (startupRes.data.investor_interest_count ?? 0) + 1;
  await supabase
    .from("startups")
    .update({ investor_interest_count: nextInterestCount })
    .eq("id", input.startupId);

  if (startupRes.data.founder_id) {
    await supabase.from("notifications").insert({
      user_id: startupRes.data.founder_id,
      title: "New investor interest",
      body: `An investor requested details for ${startupRes.data.name}.`,
      type: "investment",
      link: `/founder/messages`,
    });
  }

  revalidatePath(`/startup`);
  revalidatePath("/explore");
  revalidatePath("/investor/dashboard");
  revalidatePath("/investor/startups");
  revalidatePath("/founder/dashboard");

  return { success: true, duplicate: false };
}

/** Persist a simulated checkout pledge to the investor portfolio (`investment_tx`). */
export async function recordCheckoutInvestment(input: {
  startupId: string;
  amount: number;
  equityPercent: number;
  transactionId: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Sign in as an investor to save this investment to your portfolio.");
  }

  const profileRes = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (profileRes.data?.role !== "investor") {
    throw new Error("Only investor accounts can record portfolio investments.");
  }

  if (!input.amount || input.amount <= 0) {
    throw new Error("Enter a valid investment amount.");
  }

  const startupRes = await supabase
    .from("startups")
    .select("id, name, status, founder_id")
    .eq("id", input.startupId)
    .maybeSingle();

  if (startupRes.error || !startupRes.data) {
    throw startupRes.error ?? new Error("Startup not found");
  }
  if (startupRes.data.status !== "live") {
    throw new Error("This startup is not open for investment right now.");
  }

  const insert = await supabase
    .from("investment_tx")
    .insert({
      investor_id: user.id,
      startup_id: input.startupId,
      amount: input.amount,
      equity_percent: input.equityPercent > 0 ? input.equityPercent : null,
      roi_percent: null,
      status: "watching",
      invested_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (insert.error) throw insert.error;

  await supabase.from("investor_activity").insert({
    investor_id: user.id,
    startup_id: input.startupId,
    action: "investment_added",
    metadata: {
      transactionId: input.transactionId,
      amount: input.amount,
      equityPercent: input.equityPercent,
      source: "checkout",
    },
  });

  if (startupRes.data.founder_id) {
    await supabase.from("notifications").insert({
      user_id: startupRes.data.founder_id,
      title: "New investment pledge",
      body: `An investor pledged ₹${input.amount.toLocaleString("en-IN")} in ${startupRes.data.name}.`,
      type: "investment",
      link: "/founder/dashboard",
    });
  }

  await supabase.from("notifications").insert({
    user_id: user.id,
    title: "Investment recorded",
    body: `Your pledge in ${startupRes.data.name} is pending verification.`,
    type: "investment",
    link: "/investor/investments",
  });

  bumpInvestorPaths();

  return { success: true, id: insert.data.id as string };
}
