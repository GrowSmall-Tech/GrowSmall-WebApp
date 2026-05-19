"use client";

import { ResponsiveContainer, AreaChart, Area } from "recharts";

import { Card } from "@/components/ui/card";
import type { InvestorMarketOutlook } from "@/types/investor-dashboard";

const trendData = [
  { month: "Jan", value: 24 },
  { month: "Feb", value: 32 },
  { month: "Mar", value: 37 },
  { month: "Apr", value: 41 },
  { month: "May", value: 47 },
];

export function MarketOutlookWidget({ items }: { items: InvestorMarketOutlook[] }) {
  return (
    <Card className="rounded-2xl border-slate-200 p-4">
      <h4 className="text-[32px] leading-tight font-semibold text-slate-900">Market Outlook</h4>
      <div className="mt-3 h-16 rounded-lg bg-slate-50 p-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trendData}>
            <Area
              type="monotone"
              dataKey="value"
              stroke="#387ED1"
              fill="#387ED1"
              fillOpacity={0.12}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 space-y-2">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm"
          >
            <span className="text-slate-600">{item.label}</span>
            <span className={item.positive ? "font-semibold text-emerald-600" : "font-semibold text-slate-700"}>
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
