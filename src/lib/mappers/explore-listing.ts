import { formatInrCompact, formatInrMrrFromAnnual } from "@/lib/format/inr";
import type { ExploreListingStartup } from "@/types";

export const STARTUP_PLACEHOLDER_COVER = "/images/startup-placeholder.svg";
export const STARTUP_PLACEHOLDER_LOGO = "/images/logo-placeholder.svg";

const FALLBACK_COVERS: Record<ExploreListingStartup["categoryKey"], string> = {
  fintech:
    "https://images.unsplash.com/photo-1556740738-b6a63e27c4df?auto=format&fit=crop&w=1600&q=80",
  healthtech:
    "https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=1600&q=80",
  saas: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80",
  aiml: "https://images.unsplash.com/photo-1677442135136-760c813028c0?auto=format&fit=crop&w=1600&q=80",
  agritech:
    "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1600&q=80",
};

const BROKEN_IMAGE_URLS = new Set([
  "https://images.unsplash.com/photo-1523749099819-dfdcb854eb81?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1523749099819-dfdcb854eb81?auto=format&fit=crop&w=600&q=80",
]);

function sanitizeImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (BROKEN_IMAGE_URLS.has(url)) return null;
  if (url.endsWith("undefined") || url.endsWith("null")) return null;
  return url;
}

function fundingBandFromAsk(ask: number | null): ExploreListingStartup["fundingBand"] {
  if (ask == null || ask <= 0) return "0-50";
  const lakhs = ask / 100_000;
  if (lakhs <= 50) return "0-50";
  if (lakhs <= 200) return "50-200";
  if (lakhs <= 1000) return "200-1000";
  return "1000+";
}

function revenueBandFromAnnual(annual: number | null): ExploreListingStartup["revenueBand"] {
  if (annual == null || annual <= 0) return "pre";
  const mrr = annual / 12;
  const mrrLakhs = mrr / 100_000;
  if (mrrLakhs < 5) return "0-5";
  if (mrrLakhs < 20) return "5-20";
  return "20+";
}

export function categoryKeyFromDb(
  category: string | null | undefined,
  industry: string,
): ExploreListingStartup["categoryKey"] {
  const raw = (category ?? industry).toLowerCase();
  if (raw.includes("fintech") || raw.includes("fin")) return "fintech";
  if (raw.includes("health")) return "healthtech";
  if (raw.includes("saas") || raw.includes("cyber")) return "saas";
  if (raw.includes("ai") || raw.includes("ml")) return "aiml";
  return "agritech";
}

export function mapDbRowToExploreListing(row: {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  stage: string | null;
  location: string | null;
  logo_url: string | null;
  banner_url: string | null;
  cover_image_url?: string | null;
  funding_ask: number | null;
  annual_revenue: number | null;
  category: string | null;
  industry: string;
}): ExploreListingStartup {
  const fa = formatFundingAskDisplay(row.funding_ask);
  const rev = formatInrMrrFromAnnual(row.annual_revenue);
  const categoryKey = categoryKeyFromDb(row.category, row.industry);
  const annualRevenue = Number(row.annual_revenue) || 0;
  const ask = Number(row.funding_ask) || 0;
  const raisedPercent = ask > 0 ? Math.min(99, Math.max(3, Math.round((annualRevenue / ask) * 70))) : 8;
  const safeLogoUrl = sanitizeImageUrl(row.logo_url);
  const safeCoverUrl =
    sanitizeImageUrl(row.cover_image_url) ?? sanitizeImageUrl(row.banner_url);
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description:
      row.description ??
      `${row.name} is building innovative solutions in ${row.industry}.`,
    industry: row.industry,
    stage: row.stage ?? "Seed",
    location: row.location ?? "India",
    coverImage: safeCoverUrl ?? FALLBACK_COVERS[categoryKey] ?? STARTUP_PLACEHOLDER_COVER,
    logoImage:
      safeLogoUrl ??
      `https://api.dicebear.com/9.x/glass/svg?seed=${encodeURIComponent(row.name)}&backgroundType=gradientLinear`,
    fundingAsk: fa,
    revenue: rev,
    raisedPercent,
    categoryKey,
    fundingBand: fundingBandFromAsk(row.funding_ask),
    revenueBand: revenueBandFromAnnual(row.annual_revenue),
  };
}

function formatFundingAskDisplay(ask: number | null): string {
  if (ask == null || ask <= 0) return "—";
  return `${formatInrCompact(ask)} ask`;
}
