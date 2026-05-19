import type { PitchFormInputValues, PitchFormValues } from "@/lib/validation/pitch-schema";

export const pitchFormEmptyDefaults: PitchFormInputValues = {
  startupName: "",
  tagline: "",
  category: "",
  location: "",
  industry: "SaaS",
  stage: "Seed",
  website: "",
  teamSize: 2,
  problem: "",
  solution: "",
  businessModel: "",
  targetMarket: "",
  annualRevenue: 0,
  netProfit: 0,
  burnRate: 0,
  customers: 0,
  askAmount: 0,
  valuation: 0,
  equityOffered: 0,
  pitchDeck: null,
  startupLogo: null,
  coverImage: null,
  monthlyRevenue: [],
  quarterlyUsers: [],
  founderBio: "",
  founderLinkedIn: "",
  founderExperience: "",
  teamMembers: "",
};

export function toNumberSeries(input: unknown): number[] {
  if (!Array.isArray(input)) return [];
  return input
    .map((item) => {
      if (typeof item === "number") return item;
      if (item && typeof item === "object" && "value" in (item as Record<string, unknown>)) {
        const v = (item as { value: unknown }).value;
        return typeof v === "number" ? v : Number(v) || 0;
      }
      return Number(item) || 0;
    })
    .filter((n) => Number.isFinite(n));
}

export function mapStartupRowToPitchForm(
  startup: Record<string, unknown>,
  options?: {
    founder?: { bio?: string | null; linkedin?: string | null; linkedin_url?: string | null } | null;
    burnRate?: number;
  },
): PitchFormInputValues {
  const remoteRevenueGraph = toNumberSeries(startup.revenue_graph);
  const remoteUserGraph = toNumberSeries(startup.user_growth_graph);
  const founder = options?.founder ?? null;

  return {
    ...pitchFormEmptyDefaults,
    startupName: String(startup.startup_name || startup.name || ""),
    tagline: String(startup.tagline || ""),
    category: String(startup.category || ""),
    location: String(startup.location || ""),
    industry: (startup.industry as PitchFormValues["industry"]) || pitchFormEmptyDefaults.industry,
    stage: (startup.stage as PitchFormValues["stage"]) || pitchFormEmptyDefaults.stage,
    website: String(startup.website || ""),
    problem: String(startup.problem || ""),
    solution: String(startup.solution || startup.description || ""),
    businessModel: String(startup.business_model || ""),
    targetMarket: String(startup.target_market || ""),
    annualRevenue: Number(startup.annual_revenue) || 0,
    netProfit: Number(startup.annual_profit) || 0,
    burnRate: options?.burnRate ?? 0,
    askAmount: Number(startup.funding_ask) || 0,
    valuation: Number(startup.valuation) || 0,
    equityOffered: Number(startup.equity_offered) || 0,
    monthlyRevenue: remoteRevenueGraph,
    quarterlyUsers: remoteUserGraph,
    founderBio: String(founder?.bio || ""),
    founderLinkedIn: String(founder?.linkedin || founder?.linkedin_url || ""),
    pitchDeck: null,
    startupLogo: null,
    coverImage: null,
  };
}

export type PitchDraftBundle = {
  startup: Record<string, unknown>;
  submission: Record<string, unknown> | null;
  founder: { bio?: string | null; linkedin?: string | null; linkedin_url?: string | null } | null;
  burnRate: number;
} | null;

export function resolvePitchFormStep(submission: Record<string, unknown> | null | undefined): number {
  const remoteStep = Number(submission?.current_step ?? 0);
  if (remoteStep > 0) return remoteStep;
  return Math.max(1, Number(submission?.step_completed ?? 1));
}

export function resolvePitchStepsComplete(submission: Record<string, unknown> | null | undefined): number {
  return Math.max(0, Number(submission?.step_completed ?? 0));
}
