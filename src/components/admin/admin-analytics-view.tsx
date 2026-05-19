"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { AnalyticsCard } from "@/components/admin/analytics-card";

export function AdminAnalyticsView({
  startupCount,
  pendingApprovalCount,
  userCount,
  investorCount,
  founderCount,
  totalFundingAsk,
  totalInvested,
  approvedPitchCount,
}: {
  startupCount: number;
  pendingApprovalCount: number;
  userCount: number;
  investorCount: number;
  founderCount: number;
  totalFundingAsk: number;
  totalInvested: number;
  approvedPitchCount: number;
}) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const fundingTrend = months.map((m, i) => ({
    month: m,
    total: Math.max(0, Math.round((totalFundingAsk / 1e6) * (0.4 + i * 0.1))),
  }));
  const approvalTrend = months.map((m, i) => ({
    month: m,
    approved: Math.max(0, Math.round(approvedPitchCount * (0.2 + i * 0.12))),
    pending: Math.max(0, Math.round(startupCount * (0.05 + i * 0.03))),
  }));

  return (
    <div className="space-y-8">
      <div className="border-b border-slate-100 pb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Analytics</h1>
        <p className="mt-1 text-sm text-slate-600">
          Platform growth, funding, investor activity, and approvals.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AnalyticsCard title="Total Users" value={`${userCount}`} />
        <AnalyticsCard title="Investors" value={`${investorCount}`} />
        <AnalyticsCard title="Founders" value={`${founderCount}`} />
        <AnalyticsCard title="Approved Pitches" value={`${approvedPitchCount}`} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <AnalyticsCard title="Pending startup approvals" value={`${pendingApprovalCount}`} />
        <AnalyticsCard
          title="Capital deployed (tracked)"
          value={
            totalInvested >= 1e7
              ? `₹${(totalInvested / 1e7).toFixed(2)} Cr`
              : `₹${Math.round(totalInvested / 1e5)} L`
          }
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-slate-900">Funding momentum</h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fundingTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="total" fill="#387ED1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-slate-900">Startup approvals</h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={approvalTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line
                  type="monotone"
                  dataKey="approved"
                  stroke="#387ED1"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="pending"
                  stroke="#cbd5e1"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <p className="text-xs text-slate-500">
        Charts use normalized trends derived from live totals. Connect historical snapshots in Supabase for
        period-over-period reporting.
      </p>
    </div>
  );
}
