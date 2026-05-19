import { CurrencyInput } from "@/components/pitch/CurrencyInput";

interface FinancialSectionProps {
  annualRevenue: number;
  netProfit: number;
  annualRevenueError?: string;
  netProfitError?: string;
  onAnnualRevenueChange: (value: number) => void;
  onNetProfitChange: (value: number) => void;
  onAnnualRevenueBlur: () => void;
  onNetProfitBlur: () => void;
}

export function FinancialSection({
  annualRevenue,
  netProfit,
  annualRevenueError,
  netProfitError,
  onAnnualRevenueChange,
  onNetProfitChange,
  onAnnualRevenueBlur,
  onNetProfitBlur,
}: FinancialSectionProps) {
  return (
    <section className="space-y-4">
      <div>
        <h3 className="text-xl font-semibold text-slate-900">Step 3: Financial Health</h3>
        <p className="mt-1 text-sm text-slate-500">Localized performance metrics (Annual).</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <CurrencyInput
          id="annualRevenue"
          label="Annual Revenue (₹)"
          value={annualRevenue}
          error={annualRevenueError}
          onBlur={onAnnualRevenueBlur}
          onChange={onAnnualRevenueChange}
        />
        <CurrencyInput
          id="netProfit"
          label="Net Profit (₹)"
          value={netProfit}
          error={netProfitError}
          onBlur={onNetProfitBlur}
          onChange={onNetProfitChange}
        />
      </div>
    </section>
  );
}
