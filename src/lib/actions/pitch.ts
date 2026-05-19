"use server";

import { revalidatePath } from "next/cache";
import type { User } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";
import { upsertFounderRow } from "@/lib/founders/upsert-founder-row";
import { pitchSchema, type PitchFormInputValues } from "@/lib/validation/pitch-schema";

type DraftPayload = {
  pitchId: string;
  currentStep: number;
  values: Omit<PitchFormInputValues, "pitchDeck" | "startupLogo" | "coverImage">;
};

function textOr(next: string, prev: string | null | undefined) {
  const trimmed = next.trim();
  return trimmed.length > 0 ? trimmed : (prev ?? "");
}

function numberOr(next: number, prev: number | null | undefined) {
  if (Number.isFinite(next) && next > 0) return next;
  return Number(prev) || 0;
}

function isStatusConstraintError(error: unknown) {
  return (
    !!error &&
    typeof error === "object" &&
    "code" in error &&
    (error as { code?: string }).code === "23514"
  );
}

function statusFallbacks(status: unknown): string[] {
  if (typeof status !== "string") return [];
  const candidates = [status];
  if (status === "pending_review") candidates.push("pending", "draft");
  if (status === "pending") candidates.push("pending_review", "draft");
  if (status === "draft") candidates.push("pending", "pending_review");
  return [...new Set(candidates)];
}

async function ensureFounderUserRecord(
  supabase: Awaited<ReturnType<typeof createClient>>,
  user: User,
) {
  const meta = user.user_metadata as Record<string, unknown> | undefined;
  const fullName =
    typeof meta?.full_name === "string" && meta.full_name.trim().length > 0
      ? meta.full_name.trim()
      : user.email ?? "Founder";

  const upsertUser = await supabase.from("users").upsert(
    {
      id: user.id,
      role: "founder",
      email: user.email ?? "",
      full_name: fullName,
      avatar_url: typeof meta?.avatar_url === "string" ? meta.avatar_url : null,
    },
    { onConflict: "id" },
  );
  if (upsertUser.error) throw upsertUser.error;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60);
}

async function getOrCreateStartupId(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  payload: Omit<PitchFormInputValues, "pitchDeck" | "startupLogo" | "coverImage">,
  explicitStartupId?: string,
) {
  if (explicitStartupId) return explicitStartupId;

  const slugBase = slugify(payload.startupName || "startup");
  let slug = slugBase;
  for (let i = 0; i < 8; i += 1) {
    const testSlug = i === 0 ? slug : `${slugBase}-${Math.floor(Math.random() * 9999)}`;
    const check = await supabase.from("startups").select("id").eq("slug", testSlug).maybeSingle();
    if (!check.data?.id) {
      slug = testSlug;
      break;
    }
  }

  const created = await supabase
    .from("startups")
    .insert({
      name: payload.startupName,
      startup_name: payload.startupName,
      slug,
      tagline: payload.tagline,
      industry: payload.industry,
      category: payload.category,
      location: payload.location,
      stage: payload.stage,
      funding_ask: payload.askAmount,
      valuation: payload.valuation,
      equity_offered: payload.equityOffered,
      annual_revenue: payload.annualRevenue,
      revenue: payload.annualRevenue,
      annual_profit: payload.netProfit,
      growth_rate: payload.customers > 0 ? Math.round((payload.customers / Math.max(payload.teamSize, 1)) * 10) : 0,
      description: payload.solution,
      problem: payload.problem,
      solution: payload.solution,
      business_model: payload.businessModel,
      target_market: payload.targetMarket,
      website: payload.website || null,
      founder_id: userId,
      status: "draft",
    })
    .select("id")
    .single();
  if (created.error || !created.data?.id) throw created.error ?? new Error("Unable to create startup");
  return created.data.id;
}

async function upsertPitchSubmissionByStartupId(
  supabase: Awaited<ReturnType<typeof createClient>>,
  startupId: string,
  values: Record<string, unknown>,
) {
  async function runWithStatusFallback(
    op: (payload: Record<string, unknown>) => Promise<{ error: unknown }>,
  ) {
    const rawStatus = values.status;
    const fallbacks = statusFallbacks(rawStatus);

    if (fallbacks.length === 0) {
      const result = await op(values);
      if (result.error) throw result.error;
      return;
    }

    for (let i = 0; i < fallbacks.length; i += 1) {
      const candidate = fallbacks[i];
      const payload = { ...values, status: candidate };
      const result = await op(payload);
      if (!result.error) return;
      const isLast = i === fallbacks.length - 1;
      if (!isStatusConstraintError(result.error) || isLast) {
        throw result.error;
      }
    }
  }

  const existing = await supabase
    .from("pitch_submissions")
    .select("id")
    .eq("startup_id", startupId)
    .maybeSingle();

  if (existing.error) throw existing.error;

  if (existing.data?.id) {
    const targetId = existing.data.id;
    await runWithStatusFallback(async (payload) => {
      const result = await supabase
        .from("pitch_submissions")
        .update(payload)
        .eq("id", targetId);
      return { error: result.error };
    });
    return targetId;
  }

  let inserted = await supabase
    .from("pitch_submissions")
    .insert({ startup_id: startupId, ...values })
    .select("id")
    .single();
  if (inserted.error && isStatusConstraintError(inserted.error)) {
    const fallbacks = statusFallbacks(values.status).slice(1);
    for (const candidate of fallbacks) {
      inserted = await supabase
        .from("pitch_submissions")
        .insert({ startup_id: startupId, ...values, status: candidate })
        .select("id")
        .single();
      if (!inserted.error) break;
      if (!isStatusConstraintError(inserted.error)) break;
    }
  }
  if (inserted.error || !inserted.data?.id) {
    throw inserted.error ?? new Error("Failed to create pitch submission");
  }
  return inserted.data.id;
}

export async function savePitchDraft(payload: DraftPayload) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Authentication required");
  await ensureFounderUserRecord(supabase, user);
  const startupId = await getOrCreateStartupId(supabase, user.id, payload.values, payload.pitchId);

  const existingStartup = await supabase
    .from("startups")
    .select("*")
    .eq("id", startupId)
    .maybeSingle();
  const existing = existingStartup.data;
  const currentStatus = existing?.status ?? "draft";
  const preserveListedStatus = ["pending_review", "approved", "live", "rejected"].includes(
    String(currentStatus),
  );

  const mergedName = textOr(payload.values.startupName, existing?.startup_name ?? existing?.name);
  if (!mergedName.trim()) {
    throw new Error("Startup name is required before saving.");
  }

  const mergedSolution = textOr(
    payload.values.solution,
    existing?.solution ?? existing?.description ?? "",
  );

  const startupUpdate = await supabase
    .from("startups")
    .update({
      startup_name: mergedName,
      name: mergedName,
      tagline: textOr(payload.values.tagline, existing?.tagline),
      industry: payload.values.industry || existing?.industry,
      category: textOr(payload.values.category, existing?.category),
      location: textOr(payload.values.location, existing?.location),
      stage: payload.values.stage || existing?.stage,
      funding_ask: numberOr(payload.values.askAmount, existing?.funding_ask),
      valuation: numberOr(payload.values.valuation, existing?.valuation),
      equity_offered: numberOr(payload.values.equityOffered, existing?.equity_offered),
      annual_revenue: numberOr(payload.values.annualRevenue, existing?.annual_revenue),
      revenue: numberOr(payload.values.annualRevenue, existing?.revenue ?? existing?.annual_revenue),
      annual_profit: numberOr(payload.values.netProfit, existing?.annual_profit),
      description: mergedSolution,
      problem: textOr(payload.values.problem, existing?.problem),
      solution: mergedSolution,
      website: textOr(payload.values.website, existing?.website) || null,
      business_model: textOr(payload.values.businessModel, existing?.business_model),
      target_market: textOr(payload.values.targetMarket, existing?.target_market),
      ...(preserveListedStatus ? {} : { status: "draft" as const }),
    })
    .eq("id", startupId);
  if (startupUpdate.error) throw startupUpdate.error;

  const monthlyRevenue = Array.isArray(payload.values.monthlyRevenue)
    ? payload.values.monthlyRevenue
    : [];
  const quarterlyUsers = Array.isArray(payload.values.quarterlyUsers)
    ? payload.values.quarterlyUsers
    : [];
  if (monthlyRevenue.length || quarterlyUsers.length) {
    await supabase
      .from("startups")
      .update({
        revenue_graph: monthlyRevenue.length ? monthlyRevenue : null,
        user_growth_graph: quarterlyUsers.length ? quarterlyUsers : null,
      })
      .eq("id", startupId);
  }

  const existingSubmission = await supabase
    .from("pitch_submissions")
    .select("step_completed")
    .eq("startup_id", startupId)
    .maybeSingle();

  const pitchPatch: Record<string, unknown> = {
    executive_summary: mergedSolution.slice(0, 260),
    current_step: payload.currentStep,
    step_completed: Math.max(
      Number(existingSubmission.data?.step_completed ?? 0),
      payload.currentStep,
    ),
  };
  if (!preserveListedStatus) {
    pitchPatch.status = "draft";
    pitchPatch.submission_status = "draft";
  } else if (currentStatus === "live" || currentStatus === "approved") {
    pitchPatch.status = "approved";
    pitchPatch.submission_status = "approved";
  } else if (currentStatus === "pending_review") {
    pitchPatch.status = "pending";
    pitchPatch.submission_status = "under_review";
  }
  await upsertPitchSubmissionByStartupId(supabase, startupId, pitchPatch);
  revalidatePath("/founder/dashboard");
  revalidatePath(`/founder/pitch-submission/${startupId}`);
}

export async function createPitchDraft() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Authentication required");
  await ensureFounderUserRecord(supabase, user);

  const baseName = `New Startup ${new Date().toLocaleDateString("en-IN")}`;
  const startupId = await getOrCreateStartupId(
    supabase,
    user.id,
    {
      startupName: baseName,
      tagline: "Building a high-growth startup",
      category: "General",
      location: "India",
      industry: "SaaS",
      stage: "Seed",
      website: "",
      teamSize: 1,
      problem: "Draft problem statement for this startup submission.",
      solution: "Draft solution statement for this startup submission.",
      businessModel: "Draft business model for this startup submission.",
      targetMarket: "Draft target market for this startup submission.",
      annualRevenue: 0,
      netProfit: 0,
      burnRate: 0,
      customers: 0,
      askAmount: 1,
      valuation: 0,
      equityOffered: 0,
      monthlyRevenue: [],
      quarterlyUsers: [],
      founderBio: "Founder bio draft for this startup pitch placeholder copy.",
      founderLinkedIn: "",
      founderExperience: "Founder experience draft.",
      teamMembers: "Founder - CEO",
    },
  );
  await upsertPitchSubmissionByStartupId(supabase, startupId, {
    status: "draft",
    submission_status: "draft",
    current_step: 1,
    step_completed: 0,
  });
  // NOTE: Do not revalidatePath here. createPitchDraft is invoked from
  // server components during render (e.g. /founder/pitch/page.tsx) and
  // Next.js 15 disallows revalidatePath during render. The downstream
  // routes (/founder/dashboard, /founder/pitch-submission/[id]) are
  // already declared `force-dynamic`, so they always fetch fresh.
  return { pitchId: startupId };
}

export async function getFounderPitches() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("startups")
    .select("*, pitch_submissions(*)")
    .eq("founder_id", user.id)
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data;
}

export async function getPitchDraft(pitchId?: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  let startupRes;
  if (pitchId) {
    startupRes = await supabase
      .from("startups")
      .select("*")
      .eq("id", pitchId)
      .eq("founder_id", user.id)
      .maybeSingle();
  } else {
    startupRes = await supabase
      .from("startups")
      .select("*")
      .eq("founder_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
  }
  if (startupRes.error || !startupRes.data) return null;

  const [draftRes, founderRes, metricsRes] = await Promise.all([
    supabase
      .from("pitch_submissions")
      .select("*")
      .eq("startup_id", startupRes.data.id)
      .order("submitted_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase.from("founders").select("bio, linkedin, linkedin_url").eq("user_id", user.id).maybeSingle(),
    supabase
      .from("startup_metrics")
      .select("burn_rate")
      .eq("startup_id", startupRes.data.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  return {
    startup: startupRes.data,
    submission: draftRes.data ?? null,
    founder: founderRes.data ?? null,
    burnRate: Number(metricsRes.data?.burn_rate) || 0,
  };
}

async function uploadMedia(
  supabase: Awaited<ReturnType<typeof createClient>>,
  bucket: string,
  startupId: string,
  file: File | null,
) {
  if (!(file instanceof File)) return null;
  const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]+/g, "-");
  const filePath = `${startupId}/${Date.now()}-${safeName}`;
  const upload = await supabase.storage.from(bucket).upload(filePath, file, {
    contentType: file.type,
    upsert: false,
  });
  if (upload.error) {
    const status = (upload.error as { statusCode?: string | number }).statusCode;
    if (String(status) === "403") {
      throw new Error(
        `Upload to "${bucket}" was blocked by storage RLS. Run the latest Supabase migrations (supabase db push) and try again.`,
      );
    }
    throw upload.error;
  }
  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
  return data.publicUrl;
}

export async function submitPitch(formData: FormData): Promise<{ success: true; startupId: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Authentication required");
  await ensureFounderUserRecord(supabase, user);

  const rawPayload = formData.get("payload");
  const pitchId = String(formData.get("pitchId") ?? "");
  if (typeof rawPayload !== "string") throw new Error("Invalid payload");
  // The client strips File fields with `undefined` before JSON.stringify, but
  // JSON drops undefined keys entirely. Reset them to null so the schema's
  // `File | null` branch is honoured. The actual files arrive via FormData
  // (`deck`, `startupLogo`, `coverImage`) and are validated separately below.
  const rawPayloadObject = JSON.parse(rawPayload) as Record<string, unknown>;
  const payload = {
    ...rawPayloadObject,
    pitchDeck: null,
    startupLogo: null,
    coverImage: null,
  } as PitchFormInputValues;
  const parsed = pitchSchema.safeParse(payload);
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Invalid pitch payload");
  const deck = formData.get("deck");
  const logo = formData.get("startupLogo");
  const cover = formData.get("coverImage");
  const deckFile = deck instanceof File && deck.size > 0 ? deck : null;
  const logoFile = logo instanceof File && logo.size > 0 ? logo : null;
  const coverFile = cover instanceof File && cover.size > 0 ? cover : null;

  const startupId = await getOrCreateStartupId(supabase, user.id, parsed.data, pitchId);

  const existing = await supabase
    .from("startups")
    .select("logo_url, cover_image_url, banner_url, pitch_deck_url")
    .eq("id", startupId)
    .maybeSingle();
  const existingLogo = existing.data?.logo_url ?? null;
  const existingCover = existing.data?.cover_image_url ?? existing.data?.banner_url ?? null;
  const existingDeck = existing.data?.pitch_deck_url ?? null;

  const [uploadedDeck, uploadedLogo, uploadedCover] = await Promise.all([
    uploadMedia(supabase, "pitch-decks", startupId, deckFile),
    uploadMedia(supabase, "startup-logos", startupId, logoFile),
    uploadMedia(supabase, "startup-covers", startupId, coverFile),
  ]);

  const deckUrl = uploadedDeck ?? existingDeck;
  const logoUrl = uploadedLogo ?? existingLogo;
  const coverUrl = uploadedCover ?? existingCover;

  if (!deckUrl) {
    throw new Error("Pitch deck is required. Upload it on the Branding & Deck step.");
  }
  if (!logoUrl) {
    throw new Error("Startup logo is required. Upload it on the Branding & Deck step.");
  }
  if (!coverUrl) {
    throw new Error("Cover image is required. Upload it on the Branding & Deck step.");
  }

  const startupUpdate = await supabase
    .from("startups")
    .update({
      startup_name: parsed.data.startupName,
      name: parsed.data.startupName,
      tagline: parsed.data.tagline,
      industry: parsed.data.industry,
      category: parsed.data.category,
      location: parsed.data.location,
      stage: parsed.data.stage,
      funding_ask: parsed.data.askAmount,
      valuation: parsed.data.valuation,
      equity_offered: parsed.data.equityOffered,
      annual_revenue: parsed.data.annualRevenue,
      revenue: parsed.data.annualRevenue,
      annual_profit: parsed.data.netProfit,
      website: parsed.data.website || null,
      description: parsed.data.solution,
      problem: parsed.data.problem,
      solution: parsed.data.solution,
      business_model: parsed.data.businessModel,
      target_market: parsed.data.targetMarket,
      logo_url: logoUrl,
      banner_url: coverUrl,
      cover_image_url: coverUrl,
      pitch_deck_url: deckUrl,
      revenue_graph: parsed.data.monthlyRevenue?.length ? parsed.data.monthlyRevenue : null,
      user_growth_graph: parsed.data.quarterlyUsers?.length ? parsed.data.quarterlyUsers : null,
      status: "pending_review",
    })
    .eq("id", startupId);
  if (startupUpdate.error) throw startupUpdate.error;

  await upsertPitchSubmissionByStartupId(supabase, startupId, {
    pitch_deck_url: deckUrl,
    executive_summary: parsed.data.solution.slice(0, 260),
    status: "pending",
    submission_status: "under_review",
    submitted_at: new Date().toISOString(),
    current_step: 6,
    step_completed: 6,
  });

  // Track newly uploaded decks in pitch_files for an audit trail. When the
  // founder reuses an already-uploaded deck (no new File on this submit) we
  // skip the insert so we don't duplicate rows on every re-submission.
  if (deckFile) {
    const fileInsert = await supabase.from("pitch_files").insert({
      startup_id: startupId,
      file_name: deckFile.name,
      file_url: deckUrl,
      file_type: deckFile.type || null,
    });
    if (fileInsert.error) throw fileInsert.error;
  }

  await upsertFounderRow(supabase, {
    user_id: user.id,
    founder_name: user.user_metadata.full_name ?? user.email ?? "Founder",
    email: user.email ?? null,
    linkedin: parsed.data.founderLinkedIn || null,
    bio: parsed.data.founderBio || null,
  });

  // Replace metric history with the founder-provided graph series so the public
  // detail page renders real data instead of placeholder bars.
  const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthlyRevenue = parsed.data.monthlyRevenue ?? [];
  const quarterlyUsers = parsed.data.quarterlyUsers ?? [];
  if (monthlyRevenue.length || quarterlyUsers.length) {
    await supabase.from("startup_metrics").delete().eq("startup_id", startupId);
    const now = new Date();
    const totalMonths = Math.max(monthlyRevenue.length, quarterlyUsers.length * 3, 1);
    const rows = Array.from({ length: totalMonths }).map((_, idx) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (totalMonths - 1 - idx), 1);
      const label = monthLabels[date.getMonth()];
      const revenue = monthlyRevenue[idx] ?? null;
      const userVal =
        quarterlyUsers[Math.floor(idx / 3)] ?? quarterlyUsers[quarterlyUsers.length - 1] ?? null;
      return {
        startup_id: startupId,
        month: `${label} ${String(date.getFullYear()).slice(-2)}`,
        revenue: revenue ?? 0,
        users_growth: userVal ?? 0,
        users: userVal ?? 0,
        burn_rate: Number(parsed.data.burnRate) || 0,
      };
    });
    if (rows.length) {
      const insertMetrics = await supabase.from("startup_metrics").insert(rows);
      if (insertMetrics.error) {
        console.warn("startup_metrics insert failed:", insertMetrics.error.message);
      }
    }
  } else {
    await supabase.from("startup_metrics").insert({
      startup_id: startupId,
      month: new Date().toISOString().slice(0, 7),
      revenue: Number(parsed.data.annualRevenue) || 0,
      users_growth: Number(parsed.data.customers) || 0,
      users: Number(parsed.data.customers) || 0,
      burn_rate: Number(parsed.data.burnRate) || 0,
    });
  }

  revalidatePath("/founder/pitch");
  revalidatePath("/founder/pitch-submission");
  revalidatePath(`/founder/pitch-submission/${startupId}`);
  revalidatePath("/founder/dashboard");
  revalidatePath("/admin/businesses");
  revalidatePath("/admin/startups");
  revalidatePath("/investor/dashboard");
  revalidatePath("/explore");
  return { success: true, startupId };
}
