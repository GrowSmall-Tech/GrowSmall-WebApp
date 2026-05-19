export type Role = "investor" | "founder";

export type ExploreListingStartup = {
  id: string;
  /** Canonical URL slug for `/startup/[slug]`; duplicated listing rows reuse the template slug. */
  slug: string;
  /** Canonical startup id for `/startups/[id]` (legacy). Listing `id` may be unique per row in explore. */
  detailId?: string;
  name: string;
  description: string;
  industry: string;
  stage: string;
  location: string;
  coverImage: string;
  logoImage: string;
  fundingAsk: string;
  revenue: string;
  raisedPercent: number;
  categoryKey: "fintech" | "healthtech" | "saas" | "aiml" | "agritech";
  /** Mock filter tiers for UI only */
  fundingBand: "0-50" | "50-200" | "200-1000" | "1000+";
  revenueBand: "pre" | "0-5" | "5-20" | "20+";
};

export type Startup = {
  id: string;
  /** Public profile URL segment, e.g. `bharat-agri-tech` for `/startup/[slug]`. */
  slug: string;
  name: string;
  tagline: string;
  category: string;
  valuation: string;
  fundingAsk: number;
  raised: number;
  fundedPercent: number;
  description: string;
  monthlyRevenue: number;
  monthlyProfit: number;
  traction: string;
  founder: {
    name: string;
    role: string;
    experience: string;
  };
  problem: string;
  solution: string;
  revenueData: Array<{ month: string; revenue: number }>;
  growthData: Array<{ month: string; users: number }>;
};

export type Stat = {
  label: string;
  value: string;
};

export type Faq = {
  question: string;
  answer: string;
};
