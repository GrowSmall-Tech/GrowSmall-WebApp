export interface InvestorFeaturedStartup {
  id: string;
  slug: string;
  name: string;
  category: string;
  stage: string;
  description: string;
  seekingAmount: string;
  equityOffered: string;
  image: string;
  logo: string;
  tags: string[];
}

export interface InvestorMarketOutlook {
  label: string;
  value: string;
  positive: boolean;
}

export interface InvestorSyndicate {
  title: string;
  description: string;
  ctaLabel: string;
}

export interface InvestorStartupCard {
  id: string;
  slug: string;
  name: string;
  stage: string;
  industry: string;
  description: string;
  target: string;
  raisedPercent: string;
  image: string;
  logo: string;
  founderName: string;
  tags: string[];
  isSaved?: boolean;
}

export interface InvestorSector {
  id: string;
  label: string;
  icon: "car" | "sprout" | "graduation-cap" | "leaf" | "landmark";
}

export interface InvestorPortfolioItem {
  id: string;
  startupName: string;
  startupSlug: string;
  amount: string;
  equity: string;
  roi: string;
  status: string;
  investedAt: string;
}
