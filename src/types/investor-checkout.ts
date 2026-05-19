export type InvestorCheckoutStep = "details" | "review" | "payment" | "success";

export type PaymentMethod = "upi" | "card" | "netbanking" | "wallet";

export type InvestorCheckoutStartup = {
  startupId: string;
  startupSlug: string;
  startupName: string;
  logoUrl: string | null;
  founderName: string;
  fundingAsk: number;
  valuation: number;
  equityOffered: number;
  minimumInvestment: number;
  askDisplay: string;
  valuationDisplay: string;
  equityDisplay: string;
  growthChart: { label: string; value: number }[];
  yoyGrowth?: string;
};

export type InvestorCheckoutForm = {
  amount: number;
  fullName: string;
  email: string;
  mobile: string;
};

export type InvestorCheckoutResult = {
  transactionId: string;
  pledgedAt: string;
};
