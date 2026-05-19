import { unstable_noStore as noStore } from "next/cache";

import { formatInrCompact } from "@/lib/format/inr";
import { createClient } from "@/lib/supabase/server";
import type {
  ActivityRow,
  DocumentRow,
  InvestorProfileRow,
  InvestmentRow,
  NotificationRow,
  SavedStartupRow,
  StartupRow,
} from "@/types/database";
import type {
  InvestorFeaturedStartup,
  InvestorMarketOutlook,
  InvestorPortfolioItem,
  InvestorStartupCard,
} from "@/types/investor-dashboard";

const INDUSTRY_IMAGES: Record<string, string> = {
  fintech:
    "https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=1200&q=80",
  ai: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80",
  cybersecurity:
    "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80",
  healthtech:
    "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80",
  agritech:
    "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1200&q=80",
  saas: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
  climatetech:
    "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1200&q=80",
};

function imageForIndustry(industry: string, fallback?: string | null) {
  if (fallback) return fallback;
  const key = industry.toLowerCase().replace(/[\s-]/g, "");
  for (const [k, img] of Object.entries(INDUSTRY_IMAGES)) {
    if (key.includes(k)) return img;
  }
  return INDUSTRY_IMAGES.saas;
}

function logoFor(startup: StartupRow) {
  if (startup.logo_url) return startup.logo_url;
  return `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(startup.name)}`;
}

function formatPortfolioStatus(status: string) {
  if (status === "watching") return "Pending verification";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export async function getInvestorDashboardData() {
  noStore();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [featuredRes, startupsRes, savedRes, investmentsRes] = await Promise.all([
    supabase
      .from("startups")
      .select("*")
      .eq("status", "live")
      .eq("is_featured", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("startups")
      .select("*")
      .eq("status", "live")
      .order("created_at", { ascending: false })
      .limit(60),
    supabase.from("saved_startups").select("*").eq("investor_id", user.id),
    supabase.from("investment_tx").select("*").eq("investor_id", user.id),
  ]);

  const startups = (startupsRes.data ?? []) as StartupRow[];
  const saved = (savedRes.data ?? []) as SavedStartupRow[];
  const investments = (investmentsRes.data ?? []) as InvestmentRow[];
  const savedSet = new Set(saved.map((s) => s.startup_id));

  const featuredRow = featuredRes.data as StartupRow | null;
  const featuredStartup: InvestorFeaturedStartup | null = featuredRow
    ? {
        id: featuredRow.id,
        slug: featuredRow.slug,
        name: featuredRow.name,
        category: featuredRow.category ?? featuredRow.industry,
        stage: featuredRow.stage ?? "Seed",
        description: featuredRow.description ?? `${featuredRow.name} is currently fundraising.`,
        seekingAmount: formatInrCompact(Number(featuredRow.funding_ask) || 0),
        equityOffered:
          featuredRow.equity_offered != null ? `${Number(featuredRow.equity_offered)}%` : "—",
        image: imageForIndustry(featuredRow.industry, featuredRow.banner_url),
        logo: logoFor(featuredRow),
        tags: [featuredRow.industry, featuredRow.category ?? "Growth"].filter(Boolean),
      }
    : null;

  const startupCards: InvestorStartupCard[] = startups.map((row) => {
    const target = Number(row.funding_ask) || 0;
    const raised = Number(row.annual_revenue) || 0;
    const pct = target > 0 ? Math.min(99, Math.round((raised / target) * 90)) : 18;
    return {
      id: row.id,
      slug: row.slug,
      name: row.name,
      stage: row.stage ?? "Seed",
      industry: row.industry,
      description: row.description ?? `${row.name} operates in ${row.industry}.`,
      target: formatInrCompact(target),
      raisedPercent: `${pct}% Raised`,
      image: imageForIndustry(row.industry, row.banner_url),
      logo: logoFor(row),
      founderName: "Founder",
      tags: [row.industry, row.category ?? row.stage ?? "Early"].filter(Boolean) as string[],
      isSaved: savedSet.has(row.id),
    };
  });

  const approvedCount = startups.length;
  const totalFunding = investments.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const outlook: InvestorMarketOutlook[] = [
    { label: "Total startups", value: String(approvedCount), positive: true },
    { label: "Approved listings", value: String(approvedCount), positive: true },
    { label: "Funding deployed", value: formatInrCompact(totalFunding), positive: true },
    {
      label: "Trending sectors",
      value: [...new Set(startups.slice(0, 3).map((s) => s.industry))].join(", ") || "SaaS",
      positive: true,
    },
  ];

  return {
    userId: user.id,
    featuredStartup,
    startupCards,
    outlook,
  };
}

export async function getInvestorPortfolio(): Promise<InvestorPortfolioItem[]> {
  noStore();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase
    .from("investment_tx")
    .select("*, startups(name, slug)")
    .eq("investor_id", user.id)
    .order("invested_at", { ascending: false });

  return ((data ?? []) as Array<
    InvestmentRow & { startups?: { name: string; slug: string } | null }
  >).map((row) => ({
    id: row.id,
    startupName: row.startups?.name ?? "Startup",
    startupSlug: row.startups?.slug ?? "",
    amount: formatInrCompact(Number(row.amount) || 0),
    equity: row.equity_percent != null ? `${Number(row.equity_percent)}%` : "—",
    roi: row.roi_percent != null ? `${Number(row.roi_percent)}%` : "—",
    status: formatPortfolioStatus(row.status),
    investedAt: row.invested_at,
  }));
}

export async function getInvestorNotifications(): Promise<NotificationRow[]> {
  noStore();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);
  return (data ?? []) as NotificationRow[];
}

export async function getInvestorDocuments(): Promise<DocumentRow[]> {
  noStore();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase
    .from("documents")
    .select("*")
    .eq("investor_id", user.id)
    .order("created_at", { ascending: false });
  return (data ?? []) as DocumentRow[];
}

export async function getInvestorProfile(): Promise<InvestorProfileRow | null> {
  noStore();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("investor_profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();
  return (data as InvestorProfileRow | null) ?? null;
}

export async function getInvestorActivity(): Promise<ActivityRow[]> {
  noStore();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase
    .from("investor_activity")
    .select("*")
    .eq("investor_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100);
  return (data ?? []) as ActivityRow[];
}
