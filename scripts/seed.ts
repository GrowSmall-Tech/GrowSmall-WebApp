import { createClient } from "@supabase/supabase-js";
import { loadEnvConfig } from "@next/env";

type FounderSeed = {
  startupSlug: string;
  full_name: string;
  email: string;
  role: "founder";
  avatar_url: string;
  headline: string;
  bio: string;
  linkedin_url: string;
  twitter_url: string;
};

type StartupSeed = {
  slug: string;
  name: string;
  tagline: string;
  industry: string;
  location: string;
  category: string;
  description: string;
  problem: string;
  solution: string;
  funding_ask: number;
  valuation: number;
  equity_offered: number;
  annual_revenue: number;
  annual_profit: number;
  growth_rate: number;
  stage: string;
  logo_url: string;
  banner_url: string;
  is_featured: boolean;
  is_trending: boolean;
  status: "approved";
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;

const founders: FounderSeed[] = [
  {
    startupSlug: "bharat-agri-tech",
    full_name: "Ananya Sharma",
    email: "ananya@bharatagritech.com",
    role: "founder",
    avatar_url:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=600&q=80",
    headline: "Founder & CEO",
    bio: "Former agronomist building precision farming tools for smallholder networks.",
    linkedin_url: "https://www.linkedin.com/in/ananya-sharma",
    twitter_url: "https://x.com/ananya",
  },
  {
    startupSlug: "mumbai-finpay",
    full_name: "Rohan Mehta",
    email: "rohan@mumbaifinpay.com",
    role: "founder",
    avatar_url:
      "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=600&q=80",
    headline: "Founder & CEO",
    bio: "Ex-payments lead helping Indian SMEs automate collections and reconciliation.",
    linkedin_url: "https://www.linkedin.com/in/rohan-mehta",
    twitter_url: "https://x.com/rohan",
  },
  {
    startupSlug: "delhi-cyberguard",
    full_name: "Priya Nair",
    email: "priya@delhicyberguard.com",
    role: "founder",
    avatar_url:
      "https://images.unsplash.com/photo-1494790108755-2616b612b601?auto=format&fit=crop&w=600&q=80",
    headline: "Founder & CTO",
    bio: "Security architect delivering enterprise-grade cyber monitoring for growth startups.",
    linkedin_url: "https://www.linkedin.com/in/priya-nair",
    twitter_url: "https://x.com/priyanair",
  },
  {
    startupSlug: "bengaluru-ai",
    full_name: "Karthik Rao",
    email: "karthik@bengaluruai.com",
    role: "founder",
    avatar_url:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80",
    headline: "Founder & AI Lead",
    bio: "Building LLM automation copilots for enterprise workflow efficiency.",
    linkedin_url: "https://www.linkedin.com/in/karthik-rao",
    twitter_url: "https://x.com/karthik",
  },
  {
    startupSlug: "greengrid",
    full_name: "Meera Iyer",
    email: "meera@greengrid.in",
    role: "founder",
    avatar_url:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=80",
    headline: "Founder",
    bio: "Climate-tech founder powering renewable energy management for industrial clusters.",
    linkedin_url: "https://www.linkedin.com/in/meera-iyer",
    twitter_url: "https://x.com/meeraiyer",
  },
  {
    startupSlug: "swiftpay",
    full_name: "Arjun Patel",
    email: "arjun@swiftpay.in",
    role: "founder",
    avatar_url:
      "https://images.unsplash.com/photo-1463453091185-61582044d556?auto=format&fit=crop&w=600&q=80",
    headline: "Founder",
    bio: "Payments operator scaling merchant QR and UPI experiences across tier-2 cities.",
    linkedin_url: "https://www.linkedin.com/in/arjun-patel",
    twitter_url: "https://x.com/arjunp",
  },
  {
    startupSlug: "earthly-homes",
    full_name: "Ishita Kapoor",
    email: "ishita@earthlyhomes.com",
    role: "founder",
    avatar_url:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80",
    headline: "Founder & CEO",
    bio: "PropTech founder focused on sustainable housing discovery and financing.",
    linkedin_url: "https://www.linkedin.com/in/ishita-kapoor",
    twitter_url: "https://x.com/ishitak",
  },
  {
    startupSlug: "ayurdigital",
    full_name: "Dr. Neel Joshi",
    email: "neel@ayurdigital.com",
    role: "founder",
    avatar_url:
      "https://images.unsplash.com/photo-1615109398623-88346a601842?auto=format&fit=crop&w=600&q=80",
    headline: "Founder",
    bio: "Doctor-entrepreneur digitizing preventive care and Ayurveda telehealth programs.",
    linkedin_url: "https://www.linkedin.com/in/neel-joshi",
    twitter_url: "https://x.com/drneel",
  },
  {
    startupSlug: "ledgerlane",
    full_name: "Sanya Deshmukh",
    email: "sanya@ledgerlane.in",
    role: "founder",
    avatar_url:
      "https://images.unsplash.com/photo-1554151228-14d9def656e4?auto=format&fit=crop&w=600&q=80",
    headline: "Founder & CEO",
    bio: "FinOps builder creating modern ledger and compliance infrastructure for marketplaces.",
    linkedin_url: "https://www.linkedin.com/in/sanya-deshmukh",
    twitter_url: "https://x.com/sanyad",
  },
  {
    startupSlug: "harvestiq",
    full_name: "Vikram Singh",
    email: "vikram@harvestiq.com",
    role: "founder",
    avatar_url:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80",
    headline: "Founder",
    bio: "Agritech operator helping distributors optimize procurement and yield forecasting.",
    linkedin_url: "https://www.linkedin.com/in/vikram-singh",
    twitter_url: "https://x.com/vikrams",
  },
];

const startups: StartupSeed[] = [
  {
    slug: "bharat-agri-tech",
    name: "Bharat Agri-Tech",
    tagline: "Precision farming intelligence for every acre.",
    industry: "AgriTech",
    location: "Pune, India",
    category: "agritech",
    description: "AI + IoT platform helping farmers increase yield and reduce water usage.",
    problem: "Smallholders lack affordable, real-time insights for crop planning and irrigation.",
    solution: "Low-cost soil sensors, weather intelligence, and advisory workflows via mobile.",
    funding_ask: 8_000_000,
    valuation: 420_000_000,
    equity_offered: 10,
    annual_revenue: 126_000_000,
    annual_profit: 16_000_000,
    growth_rate: 128,
    stage: "Series A",
    logo_url: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=600&q=80",
    banner_url: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1600&q=80",
    is_featured: true,
    is_trending: true,
    status: "approved",
  },
  {
    slug: "mumbai-finpay",
    name: "Mumbai FinPay",
    tagline: "Banking rails for modern Indian SMEs.",
    industry: "Fintech",
    location: "Mumbai, India",
    category: "fintech",
    description: "Unified collections, payouts, and reconciliation stack for fast-growing businesses.",
    problem: "SMEs struggle with fragmented payment gateways and slow settlement cycles.",
    solution: "API-first virtual accounts with automated reconciliation and risk scoring.",
    funding_ask: 15_000_000,
    valuation: 550_000_000,
    equity_offered: 9,
    annual_revenue: 210_000_000,
    annual_profit: 28_000_000,
    growth_rate: 112,
    stage: "Seed",
    logo_url: "https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=600&q=80",
    banner_url: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=1600&q=80",
    is_featured: true,
    is_trending: true,
    status: "approved",
  },
  {
    slug: "delhi-cyberguard",
    name: "Delhi CyberGuard",
    tagline: "Enterprise-grade cyber defense for digital-first teams.",
    industry: "Cybersecurity",
    location: "Delhi, India",
    category: "saas",
    description: "Managed security platform for startups and SMBs with 24x7 incident visibility.",
    problem: "Most growth companies lack dedicated SOC and proactive threat visibility.",
    solution: "Cloud-native threat detection with actionable remediation playbooks.",
    funding_ask: 11_000_000,
    valuation: 460_000_000,
    equity_offered: 8,
    annual_revenue: 150_000_000,
    annual_profit: 20_000_000,
    growth_rate: 94,
    stage: "Series A",
    logo_url: "https://images.unsplash.com/photo-1510511233900-1982d92bd835?auto=format&fit=crop&w=600&q=80",
    banner_url: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80",
    is_featured: false,
    is_trending: true,
    status: "approved",
  },
  {
    slug: "bengaluru-ai",
    name: "Bengaluru AI",
    tagline: "Workflow copilots built for Indian enterprises.",
    industry: "AI",
    location: "Bengaluru, India",
    category: "aiml",
    description: "LLM-powered automation platform reducing manual ops across support and finance.",
    problem: "Teams lose productivity to repetitive workflows and siloed enterprise tools.",
    solution: "Domain-tuned AI agents integrated into CRM, ERP, and ticketing systems.",
    funding_ask: 22_000_000,
    valuation: 880_000_000,
    equity_offered: 7,
    annual_revenue: 300_000_000,
    annual_profit: 40_000_000,
    growth_rate: 140,
    stage: "Series A",
    logo_url: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=600&q=80",
    banner_url: "https://images.unsplash.com/photo-1591453089816-0fbb971b454c?auto=format&fit=crop&w=1600&q=80",
    is_featured: true,
    is_trending: true,
    status: "approved",
  },
  {
    slug: "greengrid",
    name: "GreenGrid",
    tagline: "Smart energy optimization for clean operations.",
    industry: "SaaS",
    location: "Hyderabad, India",
    category: "saas",
    description: "Energy analytics suite for factories and large campuses transitioning to renewables.",
    problem: "Industrial operators cannot easily optimize energy sourcing and usage in real time.",
    solution: "Grid + plant telemetry with ML forecasts and anomaly detection.",
    funding_ask: 12_000_000,
    valuation: 520_000_000,
    equity_offered: 9,
    annual_revenue: 180_000_000,
    annual_profit: 24_000_000,
    growth_rate: 102,
    stage: "Seed",
    logo_url: "https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=600&q=80",
    banner_url: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1600&q=80",
    is_featured: false,
    is_trending: true,
    status: "approved",
  },
  {
    slug: "swiftpay",
    name: "SwiftPay",
    tagline: "Faster merchant collections at scale.",
    industry: "Fintech",
    location: "Jaipur, India",
    category: "fintech",
    description: "Merchant payments infrastructure focused on conversion, settlement speed, and fraud controls.",
    problem: "Merchants face high payment drop-offs and weak dispute visibility.",
    solution: "Adaptive routing, AI fraud checks, and smart retry orchestration.",
    funding_ask: 9_000_000,
    valuation: 390_000_000,
    equity_offered: 10,
    annual_revenue: 132_000_000,
    annual_profit: 14_000_000,
    growth_rate: 88,
    stage: "Pre-Series A",
    logo_url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80",
    banner_url: "https://images.unsplash.com/photo-1559526324-593bc073d938?auto=format&fit=crop&w=1600&q=80",
    is_featured: false,
    is_trending: false,
    status: "approved",
  },
  {
    slug: "earthly-homes",
    name: "Earthly Homes",
    tagline: "Sustainable housing discovery and financing.",
    industry: "SaaS",
    location: "Gurugram, India",
    category: "saas",
    description: "Homebuyer platform combining green-certified inventory with faster loan approvals.",
    problem: "Buyers struggle to find verified sustainable homes with transparent financing.",
    solution: "Verified listings with lender integrations and lifecycle advisory.",
    funding_ask: 13_000_000,
    valuation: 490_000_000,
    equity_offered: 8,
    annual_revenue: 168_000_000,
    annual_profit: 21_000_000,
    growth_rate: 91,
    stage: "Seed",
    logo_url: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=600&q=80",
    banner_url: "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1600&q=80",
    is_featured: true,
    is_trending: false,
    status: "approved",
  },
  {
    slug: "ayurdigital",
    name: "AyurDigital",
    tagline: "Preventive care built on trusted Ayurveda.",
    industry: "HealthTech",
    location: "Kochi, India",
    category: "healthtech",
    description: "Digital preventive care platform blending Ayurveda protocols with modern diagnostics.",
    problem: "Preventive care journeys are fragmented and not personalized enough for retention.",
    solution: "Personalized plans, remote consults, and smart adherence coaching.",
    funding_ask: 10_000_000,
    valuation: 410_000_000,
    equity_offered: 9,
    annual_revenue: 145_000_000,
    annual_profit: 18_000_000,
    growth_rate: 99,
    stage: "Pre-Series A",
    logo_url: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=600&q=80",
    banner_url: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=1600&q=80",
    is_featured: false,
    is_trending: true,
    status: "approved",
  },
  {
    slug: "ledgerlane",
    name: "LedgerLane",
    tagline: "Financial operations core for marketplaces.",
    industry: "Fintech",
    location: "Bengaluru, India",
    category: "fintech",
    description: "Ledger automation and compliance workflows for multi-party marketplaces.",
    problem: "Marketplace finance teams manage payouts and tax rules across disconnected tools.",
    solution: "Composable ledger, tax workflows, and reconciliation automation APIs.",
    funding_ask: 19_000_000,
    valuation: 700_000_000,
    equity_offered: 7,
    annual_revenue: 252_000_000,
    annual_profit: 34_000_000,
    growth_rate: 118,
    stage: "Series A",
    logo_url: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=600&q=80",
    banner_url: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1600&q=80",
    is_featured: true,
    is_trending: true,
    status: "approved",
  },
  {
    slug: "harvestiq",
    name: "HarvestIQ",
    tagline: "Demand forecasting and procurement for agri supply chains.",
    industry: "AgriTech",
    location: "Indore, India",
    category: "agritech",
    description: "B2B platform helping agri distributors optimize sourcing and pricing with predictive analytics.",
    problem: "Distributors rely on reactive procurement and lose margin due to volatility.",
    solution: "Forecasting models, quality scoring, and supplier network digitization.",
    funding_ask: 14_000_000,
    valuation: 530_000_000,
    equity_offered: 8,
    annual_revenue: 190_000_000,
    annual_profit: 23_000_000,
    growth_rate: 107,
    stage: "Seed",
    logo_url: "https://images.unsplash.com/photo-1471193945509-9ad0617afabf?auto=format&fit=crop&w=600&q=80",
    banner_url: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1600&q=80",
    is_featured: false,
    is_trending: true,
    status: "approved",
  },
];

function buildMonthlyMetrics(startupId: string, monthlyRevenueStart: number, usersStart: number) {
  return MONTHS.map((month, index) => ({
    startup_id: startupId,
    month,
    revenue: Math.round(monthlyRevenueStart * (1 + index * 0.08)),
    users_growth: Math.round(usersStart * (1 + index * 0.11)),
  }));
}

async function seed() {
  // Ensure scripts run with the same env loading behavior as Next.js.
  loadEnvConfig(process.cwd());

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_KEY;

  if (!url || !serviceKey) {
    const missing = [
      !url ? "NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL)" : null,
      !serviceKey ? "SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SERVICE_KEY)" : null,
    ]
      .filter(Boolean)
      .join(", ");
    throw new Error(
      `Missing Supabase env: ${missing}.`,
    );
  }

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const founderPayload = founders.map((f) => ({
    role: f.role,
    full_name: f.full_name,
    email: f.email,
    avatar_url: f.avatar_url,
    headline: f.headline,
    bio: f.bio,
    linkedin_url: f.linkedin_url,
    twitter_url: f.twitter_url,
    suspended: false,
  }));

  const { data: founderRows, error: founderError } = await supabase
    .from("users")
    .upsert(founderPayload, { onConflict: "email" })
    .select("id,email");
  if (founderError) throw founderError;

  const founderByEmail = new Map((founderRows ?? []).map((f) => [f.email, f.id]));
  const founderBySlug = new Map(founders.map((f) => [f.startupSlug, founderByEmail.get(f.email)]));

  const startupPayload = startups.map((s) => ({
    ...s,
    founder_id: founderBySlug.get(s.slug) ?? null,
  }));

  const { data: startupRows, error: startupError } = await supabase
    .from("startups")
    .upsert(startupPayload, { onConflict: "slug" })
    .select("id,slug");
  if (startupError) throw startupError;

  const startupBySlug = new Map((startupRows ?? []).map((s) => [s.slug, s.id]));

  for (const founder of founders) {
    const founderId = founderBySlug.get(founder.startupSlug);
    const startupId = startupBySlug.get(founder.startupSlug);
    if (!founderId || !startupId) continue;
    const { error } = await supabase
      .from("users")
      .update({ startup_id: startupId })
      .eq("id", founderId);
    if (error) throw error;
  }

  const startupIds = [...startupBySlug.values()];
  const { error: deleteMetricsError } = await supabase
    .from("startup_metrics")
    .delete()
    .in("startup_id", startupIds);
  if (deleteMetricsError) throw deleteMetricsError;

  const metricsPayload = startups.flatMap((s) => {
    const startupId = startupBySlug.get(s.slug);
    if (!startupId) return [];
    return buildMonthlyMetrics(startupId, Math.round(s.annual_revenue / 18), 8_000);
  });

  const batchSize = 100;
  for (let i = 0; i < metricsPayload.length; i += batchSize) {
    const batch = metricsPayload.slice(i, i + batchSize);
    const { error } = await supabase.from("startup_metrics").insert(batch);
    if (error) throw error;
  }

  const marketSizePayload = startups
    .map((s) => {
      const startupId = startupBySlug.get(s.slug);
      if (!startupId) return null;
      return {
        startup_id: startupId,
        tam: 5_000_000_000,
        sam: 1_200_000_000,
        som: 250_000_000,
      };
    })
    .filter(Boolean);

  const { error: marketSizeError } = await supabase
    .from("startup_market_sizes")
    .upsert(marketSizePayload, { onConflict: "startup_id" });
  if (marketSizeError) throw marketSizeError;

  const pitchPayload = startups
    .map((s) => {
      const startupId = startupBySlug.get(s.slug);
      if (!startupId) return null;
      return {
        startup_id: startupId,
        executive_summary: `${s.name} is scaling rapidly in ${s.industry} and opening a strategic fundraising round.`,
        status: "approved" as const,
      };
    })
    .filter(Boolean);

  const { error: deletePitchError } = await supabase
    .from("pitch_submissions")
    .delete()
    .in("startup_id", startupIds);
  if (deletePitchError) throw deletePitchError;

  const { error: pitchError } = await supabase
    .from("pitch_submissions")
    .insert(pitchPayload);
  if (pitchError) throw pitchError;

  console.log(`Seed complete. Upserted ${startups.length} startups with metrics and founder profiles.`);
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
