import type { PitchFormValues } from "@/lib/validation/pitch-schema";

export type PitchStepKey = "basics" | "problem" | "financials" | "deck" | "founder" | "review";

export interface StartupBasics {
  startupName: string;
  industry: PitchFormValues["industry"];
}

export interface StartupFinancials {
  annualRevenue: number;
  netProfit: number;
}

export interface StartupVision {
  problem: string;
  solution: string;
}

export interface FundingAsk {
  askAmount: number;
}

export interface UploadedDeck {
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
}

export interface PitchDraft {
  basics: StartupBasics;
  financials: StartupFinancials;
  vision: StartupVision;
  ask: FundingAsk;
  deck: UploadedDeck | null;
}
