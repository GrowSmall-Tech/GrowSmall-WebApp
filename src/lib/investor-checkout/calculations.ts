import { formatInrCompact } from "@/lib/format/inr";

const PLATFORM_FEE_RATE = 0.015;
const PROCESSING_FEE = 99;

export function deriveMinimumInvestment(fundingAsk: number): number {
  const fromAsk = Math.round(fundingAsk * 0.01);
  return Math.max(25_000, fromAsk || 25_000);
}

export function estimateInvestorEquityPercent(amount: number, valuation: number): number {
  if (!amount || !valuation || valuation <= 0) return 0;
  return (amount / valuation) * 100;
}

export function formatEquityPercent(pct: number): string {
  if (pct <= 0) return "0%";
  if (pct >= 0.01) return `${pct.toFixed(2)}%`;
  if (pct >= 0.001) return `${pct.toFixed(3)}%`;
  return `${pct.toFixed(4)}%`;
}

export function calculateFees(amount: number) {
  const platformFee = Math.round(amount * PLATFORM_FEE_RATE);
  const processingFee = PROCESSING_FEE;
  const totalPayable = amount + platformFee + processingFee;
  return { platformFee, processingFee, totalPayable };
}

export function formatInrAmount(amount: number): string {
  return formatInrCompact(amount).replace("—", "₹0");
}

export function generateTransactionId(): string {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `GS-INV-${stamp}-${rand}`;
}
