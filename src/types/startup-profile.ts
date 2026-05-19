export type StartupProfileLogoKind = "leaf";

export type StartupProfileMetricIcon = "coins" | "trending" | "zap";

export type StartupProfile = {
  slug: string;
  name: string;
  industry: string;
  location: string;
  headline: string;
  tags: string[];
  bannerImage: string;
  pitchDeckUrl: string | null;
  logoKind: StartupProfileLogoKind;
  funding: {
    askLabel: string;
    askDisplay: string;
    equityLabel: string;
    equityDisplay: string;
    valuationLabel: string;
    valuationDisplay: string;
  };
  metrics: {
    arr: { label: string; value: string; icon: StartupProfileMetricIcon };
    profit: { label: string; value: string; icon: StartupProfileMetricIcon };
    yoyGrowth: { label: string; value: string; icon: StartupProfileMetricIcon };
  };
  problem: {
    description: string;
    painPoints: string[];
  };
  solution: {
    description: string;
    advantages: string[];
  };
  traction: {
    revenueBadge: string;
    activeUsersLabel: string;
    /** e.g. Active Farmers (line chart heading). */
    usersChartTitle: string;
    revenueChart: { month: string; value: number }[];
    activeUsersChart: { period: string; value: number }[];
  };
  businessModel: {
    title: string;
    description: string;
    icon: "marketplace" | "layers" | "sparkles";
  }[];
  marketSize: {
    tam: { value: string; widthPct: number };
    sam: { value: string; widthPct: number };
    som: { value: string; widthPct: number };
  };
  founder: {
    name: string;
    role: string;
    quote: string;
    bio: string;
    imageSrc: string;
    linkedIn: string;
    email: string;
  };
  team: { name: string; role: string }[];
  timeline: { title: string; quarter: string; status: "done" | "active" | "planned" }[];
  cta: {
    headline: string;
    sublines: string[];
  };
};
