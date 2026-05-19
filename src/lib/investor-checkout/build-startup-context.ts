import { deriveMinimumInvestment } from "@/lib/investor-checkout/calculations";
import { formatInrCompact } from "@/lib/format/inr";
import type { InvestorCheckoutStartup } from "@/types/investor-checkout";
import type { StartupProfile } from "@/types/startup-profile";

type StartupRowLike = {
  id: string;
  slug: string;
  name: string;
  logo_url?: string | null;
  funding_ask?: number | null;
  valuation?: number | null;
  equity_offered?: number | null;
  growth_rate?: number | null;
};

export function buildInvestorCheckoutStartup(
  row: StartupRowLike,
  profile: StartupProfile,
  founderName: string,
): InvestorCheckoutStartup {
  const fundingAsk = Number(row.funding_ask) || 0;
  const valuation = Number(row.valuation) || 0;
  const equityOffered = Number(row.equity_offered) || 0;

  return {
    startupId: row.id,
    startupSlug: row.slug,
    startupName: row.name,
    logoUrl: row.logo_url ?? null,
    founderName,
    fundingAsk,
    valuation,
    equityOffered,
    minimumInvestment: deriveMinimumInvestment(fundingAsk),
    askDisplay: profile.funding.askDisplay,
    valuationDisplay: profile.funding.valuationDisplay,
    equityDisplay: profile.funding.equityDisplay,
    growthChart: profile.traction.revenueChart.map((p) => ({
      label: p.month,
      value: p.value,
    })),
    yoyGrowth: profile.metrics.yoyGrowth.value.replace("%", ""),
  };
}

export function formatPresetAmount(amount: number): string {
  return formatInrCompact(amount);
}
