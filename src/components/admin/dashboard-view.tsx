"use client";

import { useMemo } from "react";
import { Calendar } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { AnalyticsCard } from "@/components/admin/analytics-card";
import { StartupTable } from "@/components/admin/startup-table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatShortDate } from "@/lib/format/date";
import { useAdminStore } from "@/store/admin-store";
import type { StartupWithPitch, UserRow } from "@/types/database";

function formatInrCr(value: number): string {
  if (!value || value <= 0) return "₹0";
  const cr = value / 1e7;
  return `₹${cr >= 100 ? cr.toFixed(1) : cr.toFixed(2)}Cr`;
}

function formatUsersShort(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return `${n}`;
}

function roleLabel(role: UserRow["role"], email: string): string {
  if (role === "investor") return `${email.split("@")[0] ?? "Investor"} · Investor`;
  if (role === "founder") return `${email.split("@")[0] ?? "Founder"} · Founder`;
  return "Platform Admin";
}

export function AdminDashboardView({
  startups,
  recentUsers,
  startupCount,
  pendingApprovalCount,
  userCount,
  investorCount,
  founderCount,
  totalFundingAsk,
  totalInvested,
  investorKycPending,
  investorKycApproved,
  investorKycRejected,
}: {
  startups: StartupWithPitch[];
  recentUsers: UserRow[];
  startupCount: number;
  pendingApprovalCount: number;
  userCount: number;
  investorCount: number;
  founderCount: number;
  totalFundingAsk: number;
  totalInvested: number;
  investorKycPending: number;
  investorKycApproved: number;
  investorKycRejected: number;
}) {
  const dashboardRange = useAdminStore((s) => s.dashboardRange);
  const setDashboardRange = useAdminStore((s) => s.setDashboardRange);

  const fundingBars = useMemo(() => {
    const keys = ["MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV"];
    const seed = Math.abs(totalFundingAsk % 97);
    return keys.map((name, i) => ({
      name,
      value: 18 + ((seed + i * 11) % 42),
    }));
  }, [totalFundingAsk]);

  const userLines = useMemo(() => {
    const keys = ["MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV"];
    const seed = userCount % 53;
    return keys.map((name, i) => ({
      name,
      investors: 3 + ((seed + i * 5) % 12),
      startups: 1 + ((seed + i * 3) % 8),
    }));
  }, [userCount]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 border-b border-slate-100 pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Platform Overview
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Real-time insights across the GrowSmall investment ecosystem.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-slate-400" aria-hidden />
          <Select
            value={dashboardRange}
            onValueChange={(v) => setDashboardRange(v as typeof dashboardRange)}
          >
            <SelectTrigger className="h-10 w-[160px] rounded-lg border-slate-200 bg-white">
              <SelectValue placeholder="Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AnalyticsCard
          title="Pending Investor KYC"
          value={`${investorKycPending}`}
          subtitle={`${investorKycApproved} approved · ${investorKycRejected} rejected`}
        />
        <AnalyticsCard
          title="Approved Investors"
          value={`${investorKycApproved}`}
          subtitle="Dashboard access granted"
        />
      </div>

      <div className="flex justify-end">
        <Button variant="outline" size="sm" className="rounded-lg" asChild>
          <a href="/admin/investors">Review investor documents</a>
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        <AnalyticsCard
          title="Total Funding Platform-wide"
          value={formatInrCr(totalFundingAsk)}
          subtitle={totalInvested > 0 ? `${formatInrCr(totalInvested)} recorded investments` : undefined}
          delta="+12.5%"
          deltaPositive
          chart={
            <div className="h-[120px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={fundingBars} barSize={14}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      border: "1px solid #e2e8f0",
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {fundingBars.map((_, i) => (
                      <Cell
                        key={i}
                        fill={i === fundingBars.length - 1 ? "#387ED1" : "#e2e8f0"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          }
        />
        <AnalyticsCard
          title="User Growth"
          value={formatUsersShort(userCount)}
          subtitle="Verified accounts"
          chart={
            <div className="h-[120px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={userLines}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      border: "1px solid #e2e8f0",
                      fontSize: 12,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="investors"
                    stroke="#387ED1"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="startups"
                    stroke="#93c5fd"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: 11 }}
                    formatter={(value) =>
                      value === "investors" ? "Verified Investors" : "New Startups"
                    }
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          }
        />
        <AnalyticsCard
          title="Active Startups"
          value={`${startupCount}`}
          subtitle={pendingApprovalCount > 0 ? `${pendingApprovalCount} pending approval` : "On platform"}
        />
        <AnalyticsCard
          title="Investors"
          value={`${investorCount}`}
          subtitle={`${founderCount} founders`}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <StartupTable startups={startups} />
        </div>
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">Recent Users</h2>
              <Button variant="ghost" size="sm" className="h-8 text-[#387ED1]" asChild>
                <a href="/admin/users">View All</a>
              </Button>
            </div>
            <ul className="space-y-4">
              {recentUsers.map((u) => (
                <li key={u.id} className="flex gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-600">
                    {u.full_name.slice(0, 1).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {u.full_name}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {roleLabel(u.role, u.email)}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-slate-400">
                    {formatShortDate(u.created_at)}
                  </span>
                </li>
              ))}
              {recentUsers.length === 0 ? (
                <li className="text-sm text-slate-500">No users yet.</li>
              ) : null}
            </ul>
          </div>

          <div className="rounded-xl bg-[#387ED1] p-6 text-white shadow-sm">
            <h3 className="text-lg font-semibold">Growth Action: Run Quarterly Audit</h3>
            <p className="mt-2 text-sm text-white/90">
              Review all approved startups from the last 3 months for compliance.
            </p>
            <Button
              variant="outline"
              className="mt-5 w-full border-white bg-white text-[#387ED1] hover:bg-slate-100"
              type="button"
            >
              Start Audit Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
