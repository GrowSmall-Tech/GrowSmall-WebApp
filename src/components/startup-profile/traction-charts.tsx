"use client";

import { useId } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { ChartCard } from "@/components/startup-profile/chart-card";
import { FadeInSection } from "@/components/startup-profile/fade-in";

const tickStyle = { fill: "#94a3b8", fontSize: 11 };

function yAxisMax(data: { value: number }[]) {
  const peak = data.reduce((max, point) => Math.max(max, point.value), 0);
  return Math.max(10, Math.ceil(peak * 1.15));
}

function RevTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg">
      <p className="font-medium text-slate-700">{label}</p>
      <p className="mt-0.5 font-semibold text-[#387ED1]">{payload[0].value}</p>
    </div>
  );
}

function UsersTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const v = payload[0].value;
  const display = v >= 1000 ? `${Math.round(v / 1000)}k` : `${v}`;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg">
      <p className="font-medium text-slate-700">{label}</p>
      <p className="mt-0.5 font-semibold text-[#387ED1]">{display}</p>
    </div>
  );
}

export function TractionCharts({
  revenueBadge,
  activeUsersLabel,
  usersChartTitle,
  revenueChart,
  activeUsersChart,
}: {
  revenueBadge: string;
  activeUsersLabel: string;
  usersChartTitle: string;
  revenueChart: { month: string; value: number }[];
  activeUsersChart: { period: string; value: number }[];
}) {
  const gradId = useId().replace(/:/g, "");

  return (
    <FadeInSection>
      <div className="text-center">
        <h2 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">Traction & Growth</h2>
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-2 lg:gap-8">
        <ChartCard
          title="Revenue Growth (12m)"
          rightSlot={
            <span className="inline-flex rounded-full bg-[#387ED1]/10 px-2.5 py-1 text-xs font-semibold text-[#387ED1]">
              {revenueBadge}
            </span>
          }
        >
          <div className="h-[260px] w-full sm:h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueChart} margin={{ top: 6, right: 4, left: -18, bottom: 0 }}>
                <CartesianGrid stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={tickStyle}
                  interval={0}
                  angle={-35}
                  textAnchor="end"
                  height={48}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={tickStyle}
                  width={40}
                  domain={[0, yAxisMax(revenueChart)]}
                />
                <Tooltip content={<RevTooltip />} cursor={{ fill: "rgba(56, 126, 209, 0.06)" }} />
                <Bar dataKey="value" fill="#387ED1" radius={[5, 5, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard
          title={usersChartTitle}
          rightSlot={<span className="text-sm font-semibold text-[#387ED1]">{activeUsersLabel}</span>}
        >
          <div className="h-[260px] w-full sm:h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activeUsersChart} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#387ED1" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#387ED1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="period" axisLine={false} tickLine={false} tick={tickStyle} interval={0} height={36} />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={tickStyle}
                  width={40}
                  domain={[0, yAxisMax(activeUsersChart)]}
                />
                <Tooltip content={<UsersTooltip />} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#387ED1"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill={`url(#${gradId})`}
                  dot={false}
                  activeDot={{ r: 4, fill: "#387ED1", stroke: "#fff", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>
    </FadeInSection>
  );
}
