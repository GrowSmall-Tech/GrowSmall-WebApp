"use client";

import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { ChartCard } from "@/components/cards/chart-card";

export function StartupCharts({
  revenueData,
  growthData,
}: {
  revenueData: Array<{ month: string; revenue: number }>;
  growthData: Array<{ month: string; users: number }>;
}) {
  return (
    <section className="grid gap-6 lg:grid-cols-2">
      <ChartCard title="Revenue Trend" subtitle="Monthly recurring revenue ($k)">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#387ED1" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>
      <ChartCard title="User Growth" subtitle="Monthly active users">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={growthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="users" fill="#387ED1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>
    </section>
  );
}
