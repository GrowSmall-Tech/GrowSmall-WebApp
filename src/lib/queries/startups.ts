import { formatInrCompact } from "@/lib/format/inr";
import { mapDbRowToExploreListing } from "@/lib/mappers/explore-listing";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type { ExploreListingStartup, Startup } from "@/types";
import type {
  MarketSizeRow,
  PitchSubmissionRow,
  StartupMetricRow,
  StartupRow,
  UserRow,
} from "@/types/database";
import type {
  InvestorFeaturedStartup,
  InvestorSector,
  InvestorStartupCard,
} from "@/types/investor-dashboard";
import type { StartupProfile } from "@/types/startup-profile";

const PLACEHOLDER_IMG =
  "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1200&q=80";

function isConfigured() {
  return Boolean(getSupabaseUrl() && getSupabaseAnonKey());
}

function mapRowToMarketingStartup(row: StartupRow): Startup {
  const fundingAsk = Number(row.funding_ask) || 0;
  const annual = Number(row.annual_revenue) || 0;
  const fundedPercent =
    fundingAsk > 0 ? Math.min(95, Math.round((annual / Math.max(fundingAsk, 1)) * 50)) : 40;

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    tagline: row.tagline?.trim() || row.industry,
    category: row.category?.trim() || row.industry,
    valuation: row.valuation != null ? formatInrCompact(Number(row.valuation)) : "—",
    fundingAsk,
    raised: annual,
    fundedPercent: Math.max(5, Math.min(95, fundedPercent)),
    description:
      row.description?.trim() ??
      `${row.name} is building in ${row.industry}.`,
    monthlyRevenue: annual ? annual / 12 : 0,
    monthlyProfit: row.annual_profit != null ? Number(row.annual_profit) / 12 : 0,
    traction: row.stage ? `${row.stage} stage` : "Early traction",
    founder: {
      name: "Founder",
      role: "Founder",
      experience: "",
    },
    problem: row.problem ?? "",
    solution: row.solution ?? "",
    revenueData: [],
    growthData: [],
  };
}

export async function getFeaturedStartups(limit = 6): Promise<Startup[]> {
  if (!isConfigured()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("startups")
    .select("*")
    .eq("status", "live")
    .eq("is_featured", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data?.length) return [];
  return (data as StartupRow[]).map(mapRowToMarketingStartup);
}

export async function getApprovedStartups(options?: {
  limit?: number;
  offset?: number;
}): Promise<ExploreListingStartup[]> {
  if (!isConfigured()) return [];
  const limit = options?.limit ?? 200;
  const offset = options?.offset ?? 0;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("startups")
    .select("*")
    .eq("status", "live")
    .order("is_featured", { ascending: false })
    .order("is_trending", { ascending: false })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error || !data) return [];
  return (data as StartupRow[]).map(mapDbRowToExploreListing);
}

export async function countApprovedStartups(): Promise<number> {
  if (!isConfigured()) return 0;
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("startups")
    .select("id", { count: "exact", head: true })
    .eq("status", "live");
  if (error) return 0;
  return count ?? 0;
}

export async function getTrendingApprovedStartups(limit = 12): Promise<StartupRow[]> {
  if (!isConfigured()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("startups")
    .select("*")
    .eq("status", "live")
    .eq("is_trending", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return data as StartupRow[];
}

export async function getLatestApprovedStartups(limit = 12): Promise<StartupRow[]> {
  if (!isConfigured()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("startups")
    .select("*")
    .eq("status", "live")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return data as StartupRow[];
}

export async function getInvestorFeaturedStartup(): Promise<InvestorFeaturedStartup | null> {
  if (!isConfigured()) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("startups")
    .select("*")
    .eq("status", "live")
    .eq("is_featured", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  const row = data as StartupRow;
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category ?? row.industry,
    stage: row.stage ?? "Seed",
    description:
      row.description ??
      `${row.name} is raising capital to scale across ${row.industry}.`,
    seekingAmount: formatInrCompact(Number(row.funding_ask) || 0),
    equityOffered:
      row.equity_offered != null ? `${Number(row.equity_offered)}%` : "—",
    image: row.logo_url ?? row.banner_url ?? PLACEHOLDER_IMG,
    logo:
      row.logo_url ??
      `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(row.name)}`,
    tags: [row.industry, row.category ?? row.stage ?? "Featured"].filter(Boolean) as string[],
  };
}

function sectorIconFor(industry: string): InvestorSector["icon"] {
  const s = industry.toLowerCase();
  if (s.includes("fin") || s.includes("bank")) return "landmark";
  if (s.includes("agri") || s.includes("farm")) return "sprout";
  if (s.includes("edu")) return "graduation-cap";
  if (s.includes("climate") || s.includes("green")) return "leaf";
  if (s.includes("mobility") || s.includes("ev")) return "car";
  return "sprout";
}

export async function getInvestorSectorPills(): Promise<InvestorSector[]> {
  if (!isConfigured()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("startups")
    .select("industry")
    .eq("status", "live");

  if (error || !data?.length) return [];

  const counts = new Map<string, number>();
  for (const row of data) {
    const ind = (row as { industry: string }).industry || "General";
    counts.set(ind, (counts.get(ind) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([label]) => ({
      id: label.toLowerCase().replace(/\s+/g, "-"),
      label,
      icon: sectorIconFor(label),
    }));
}

export type StartupDetailBundle = {
  startup: StartupRow;
  founder: UserRow | null;
  metrics: StartupMetricRow[];
  marketSize: MarketSizeRow | null;
  pitch: PitchSubmissionRow | null;
};

export async function getStartupBySlug(slug: string): Promise<StartupDetailBundle | null> {
  if (!isConfigured()) return null;
  const supabase = await createClient();
  const { data: startup, error } = await supabase
    .from("startups")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !startup) return null;
  const row = startup as StartupRow;
  if (row.status !== "live") return null;

  void supabase
    .from("startups")
    .update({ views_count: (row.views_count ?? 0) + 1 })
    .eq("id", row.id);

  let founder: UserRow | null = null;
  if (row.founder_id) {
    const fr = await supabase.from("users").select("*").eq("id", row.founder_id).maybeSingle();
    if (!fr.error && fr.data) founder = fr.data as UserRow;
  }

  const m = await supabase
    .from("startup_metrics")
    .select("*")
    .eq("startup_id", row.id)
    .order("created_at", { ascending: true });
  const metrics = (m.data ?? []) as StartupMetricRow[];

  const market = await supabase
    .from("startup_market_sizes")
    .select("*")
    .eq("startup_id", row.id)
    .maybeSingle();
  const marketSize = (market.data as MarketSizeRow | null) ?? null;

  const p = await supabase
    .from("pitch_submissions")
    .select("*")
    .eq("startup_id", row.id)
    .order("submitted_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return {
    startup: row,
    founder,
    metrics,
    marketSize,
    pitch: p.data as PitchSubmissionRow | null,
  };
}

export async function getFounderStartupBundle(
  userId: string,
): Promise<StartupDetailBundle | null> {
  if (!isConfigured()) return null;
  const supabase = await createClient();
  const { data: startup, error } = await supabase
    .from("startups")
    .select("*")
    .eq("founder_id", userId)
    .maybeSingle();

  if (error || !startup) return null;
  const row = startup as StartupRow;

  const m = await supabase
    .from("startup_metrics")
    .select("*")
    .eq("startup_id", row.id)
    .order("created_at", { ascending: true });
  const metrics = (m.data ?? []) as StartupMetricRow[];

  const market = await supabase
    .from("startup_market_sizes")
    .select("*")
    .eq("startup_id", row.id)
    .maybeSingle();
  const marketSize = (market.data as MarketSizeRow | null) ?? null;

  const p = await supabase
    .from("pitch_submissions")
    .select("*")
    .eq("startup_id", row.id)
    .order("submitted_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let founder: UserRow | null = null;
  const fr = await supabase.from("users").select("*").eq("id", userId).maybeSingle();
  if (!fr.error && fr.data) founder = fr.data as UserRow;

  return {
    startup: row,
    founder,
    metrics,
    marketSize,
    pitch: p.data as PitchSubmissionRow | null,
  };
}

export async function getTrendingStartups(limit = 12): Promise<StartupRow[]> {
  return getTrendingApprovedStartups(limit);
}

export async function getStartupMetrics(startupId: string): Promise<StartupMetricRow[]> {
  if (!isConfigured()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("startup_metrics")
    .select("*")
    .eq("startup_id", startupId)
    .order("created_at", { ascending: true });
  if (error || !data) return [];
  return data as StartupMetricRow[];
}

function inferTags(industry: string, category: string | null): string[] {
  const base = [industry, category].filter(Boolean) as string[];
  return [...new Set(base.map((tag) => tag.trim()).filter(Boolean))].slice(0, 4);
}

function metricsToCharts(metrics: StartupMetricRow[]) {
  const revenueChart = metrics
    .filter((r) => Number(r.revenue ?? 0) >= 0)
    .map((r) => ({
      month: r.month,
      value: Number(r.revenue) || 0,
    }));
  const activeUsersChart = metrics
    .filter((r) => Number(r.users_growth ?? 0) >= 0)
    .map((r) => ({
      period: r.month,
      value: Number(r.users_growth) || 0,
    }));
  return { revenueChart, activeUsersChart };
}

function normaliseSeries(value: unknown): number[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => {
      if (typeof entry === "number") return entry;
      if (entry && typeof entry === "object" && "value" in (entry as Record<string, unknown>)) {
        const v = (entry as { value: unknown }).value;
        return typeof v === "number" ? v : Number(v) || 0;
      }
      return Number(entry) || 0;
    })
    .filter((n) => Number.isFinite(n));
}

/** Ignore placeholder arrays like `[0]` that hide mock traction charts. */
function seriesHasMeaningfulData(values: number[]): boolean {
  return values.length > 0 && values.some((n) => n > 0);
}

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Shown when a public startup has no `revenue_graph` or `startup_metrics` revenue rows yet. */
const MOCK_REVENUE_TRACTION = [42, 48, 55, 61, 68, 74, 82, 91, 99, 108, 122, 138];

/** Shown when there is no `user_growth_graph` or user metric series yet. */
const MOCK_USER_TRACTION = [1400, 2200, 3600, 5400];

function buildRevenueSeriesFromGraph(values: number[]): { month: string; value: number }[] {
  const now = new Date();
  return values.map((value, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (values.length - 1 - index), 1);
    return {
      month: `${MONTH_LABELS[date.getMonth()]} ${String(date.getFullYear()).slice(-2)}`,
      value,
    };
  });
}

function buildUsersSeriesFromGraph(values: number[]): { period: string; value: number }[] {
  return values.map((value, index) => ({
    period: `Q${index + 1}`,
    value,
  }));
}

export function bundleToStartupProfile(bundle: StartupDetailBundle): StartupProfile {
  const { startup: row, founder, metrics, marketSize, pitch } = bundle;
  const growthPct = row.growth_rate != null ? Number(row.growth_rate) : 96;

  const founderRevenueSeries = normaliseSeries(row.revenue_graph);
  const founderUsersSeries = normaliseSeries(row.user_growth_graph);
  const metricsCharts = metricsToCharts(metrics);

  const revenueChart = seriesHasMeaningfulData(founderRevenueSeries)
    ? buildRevenueSeriesFromGraph(founderRevenueSeries)
    : metricsCharts.revenueChart.some((p) => p.value > 0)
      ? metricsCharts.revenueChart
      : buildRevenueSeriesFromGraph(MOCK_REVENUE_TRACTION);

  const activeUsersChart = seriesHasMeaningfulData(founderUsersSeries)
    ? buildUsersSeriesFromGraph(founderUsersSeries)
    : metricsCharts.activeUsersChart.some((p) => p.value > 0)
      ? metricsCharts.activeUsersChart
      : buildUsersSeriesFromGraph(MOCK_USER_TRACTION);

  return {
    slug: row.slug,
    name: row.name,
    industry: row.industry,
    location: row.location ?? "India",
    headline: row.tagline ?? row.description ?? `${row.name} — ${row.industry}`,
    tags: inferTags(row.industry, row.category),
    bannerImage:
      row.cover_image_url ??
      row.banner_url ??
      "/images/startup-placeholder.svg",
    pitchDeckUrl: pitch?.pitch_deck_url ?? null,
    logoKind: "leaf",
    funding: {
      askLabel: "Funding Ask",
      askDisplay: formatInrCompact(Number(row.funding_ask) || 0),
      equityLabel: "Equity Offered",
      equityDisplay:
        row.equity_offered != null ? `${Number(row.equity_offered)}%` : "—",
      valuationLabel: "Valuation",
      valuationDisplay: formatInrCompact(Number(row.valuation) || 0),
    },
    metrics: {
      arr: {
        label: "Annual Revenue",
        value: formatInrCompact(Number(row.annual_revenue) || 0),
        icon: "coins",
      },
      profit: {
        label: "Annual Profit",
        value: formatInrCompact(Number(row.annual_profit) || 0),
        icon: "trending",
      },
      yoyGrowth: {
        label: "YoY Growth",
        value: `${growthPct}%`,
        icon: "zap",
      },
    },
    problem: {
      description:
        row.problem ??
        `${row.name} is solving critical challenges in ${row.industry}.`,
      painPoints: [
        "Market fragmentation increases acquisition cost",
        "Operational complexity without unified tooling",
      ],
    },
    solution: {
      description:
        row.solution ??
        `Our platform delivers measurable outcomes for teams operating in ${row.industry}.`,
      advantages: [
        "Differentiated product wedge with measurable ROI",
        "Distribution partnerships accelerating adoption",
      ],
    },
    traction: {
      revenueBadge: row.growth_rate != null ? `+${Number(row.growth_rate)}% YoY` : "+18% MoM",
      activeUsersLabel: "Active users",
      usersChartTitle: "User growth",
      revenueChart,
      activeUsersChart,
    },
    businessModel: [
      {
        title: "Core platform",
        description:
          row.description?.slice(0, 160) ??
          "Subscription and usage-based revenue with expansion motion.",
        icon: "layers",
      },
      {
        title: "Market expansion",
        description: "Enterprise contracts and partner-led distribution.",
        icon: "marketplace",
      },
      {
        title: "Data advantages",
        description: "Insights and automation improving retention.",
        icon: "sparkles",
      },
    ],
    marketSize: {
      tam: { value: formatInrCompact(Number(marketSize?.tam) || 5e9), widthPct: 100 },
      sam: { value: formatInrCompact(Number(marketSize?.sam) || 1.2e9), widthPct: 28 },
      som: { value: formatInrCompact(Number(marketSize?.som) || 2.5e8), widthPct: 8 },
    },
    founder: {
      name: founder?.full_name ?? "Founding team",
      role: founder?.headline ?? "Founder",
      quote: row.tagline ?? `Building ${row.name} with focus on ${row.industry}.`,
      bio:
        founder?.bio ??
        (founder?.email ? `Reach us via ${founder.email}` : "Founder details on request."),
      imageSrc:
        founder?.avatar_url ??
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=640&q=80",
      linkedIn: founder?.linkedin_url ?? "https://www.linkedin.com/",
      email: founder?.email ? `mailto:${founder.email}` : "mailto:hello@example.com",
    },
    team: [
      { name: founder?.full_name ?? "Founding Lead", role: founder?.headline ?? "Founder & CEO" },
      { name: "Growth Lead", role: "Go-to-Market" },
      { name: "Product Lead", role: "Product & Tech" },
    ],
    timeline: [
      { title: "MVP launched", quarter: "Q1 2026", status: "done" },
      { title: "Revenue scale-up", quarter: "Q2 2026", status: "active" },
      { title: "Regional expansion", quarter: "Q3 2026", status: "planned" },
    ],
    cta: {
      headline: `Partner with ${row.name}`,
      sublines: pitch?.executive_summary
        ? [pitch.executive_summary.slice(0, 220)]
        : [
            "Request the data room for financials and milestones.",
            "Our team responds within two business days.",
          ],
    },
  };
}

export function mapStartupRowToInvestorCard(row: StartupRow): InvestorStartupCard {
  const target = Number(row.funding_ask) || 0;
  const raised = Number(row.annual_revenue) || 0;
  const pct =
    target > 0 ? Math.min(99, Math.round((raised / Math.max(target, 1)) * 85)) : 12;
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    stage: row.stage ?? "Seed",
    industry: row.industry,
    description:
      row.description ?? `${row.name} — ${row.category ?? row.industry}`,
    target: formatInrCompact(target),
    raisedPercent: `${pct}% Raised`,
    image: row.logo_url ?? row.banner_url ?? PLACEHOLDER_IMG,
    logo:
      row.logo_url ??
      `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(row.name)}`,
    founderName: "Founder",
    tags: [row.industry, row.category ?? row.stage ?? "Early"].filter(Boolean) as string[],
  };
}
