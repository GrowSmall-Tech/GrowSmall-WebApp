/** Format INR amounts for display (lakhs / crores). */
export function formatInrCompact(amount: number | null | undefined): string {
  if (amount == null || Number.isNaN(Number(amount))) return "—";
  const n = Number(amount);
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(n % 1e7 === 0 ? 1 : 2)} Cr`;
  if (n >= 1e5) return `₹${Math.round(n / 1e5)} L`;
  if (n >= 1e3) return `₹${Math.round(n / 1e3)} K`;
  return `₹${Math.round(n)}`;
}

export function formatInrMrrFromAnnual(annual: number | null | undefined): string {
  if (annual == null || annual <= 0) return "Pre-revenue";
  const mrr = annual / 12;
  return `${formatInrCompact(mrr)} MRR`;
}

export function formatPercentDisplay(value: number | null | undefined): string {
  if (value == null || Number.isNaN(Number(value))) return "—";
  return `${Number(value).toFixed(0)}%`;
}
