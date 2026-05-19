"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  LineChart,
  Plus,
  Wallet,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatShortDate } from "@/lib/format/date";
import { formatInrCompact } from "@/lib/format/inr";
import { cn } from "@/lib/utils";
import type { PitchSubmissionLite, StartupStatus, StartupWithPitch } from "@/types/database";

function resolvePitchDisplayStatus(startup: StartupWithPitch): string {
  const pitch = startup.pitch_submissions?.[0] as PitchSubmissionLite | undefined;
  if (startup.status === "live") return "live";
  if (startup.status === "approved") return "approved";
  if (startup.status === "rejected") return "rejected";
  if (startup.status === "pending_review") {
    return pitch?.submission_status ?? pitch?.status ?? "under_review";
  }
  if (startup.status === "draft") return pitch?.submission_status ?? "draft";
  return pitch?.submission_status ?? pitch?.status ?? startup.status;
}

const COVER_FALLBACK = "/images/startup-placeholder.svg";
const LOGO_FALLBACK = "/images/logo-placeholder.svg";

type StatusFilter = StartupStatus | "all";

const STATUS_TABS: Array<{ id: StatusFilter; label: string; helper: string }> = [
  { id: "all", label: "All", helper: "Every pitch you've started" },
  { id: "draft", label: "Drafts", helper: "Not yet submitted" },
  { id: "pending_review", label: "Pending", helper: "Waiting on admin" },
  { id: "approved", label: "Approved", helper: "Cleared for launch" },
  { id: "live", label: "Live", helper: "Visible to investors" },
  { id: "rejected", label: "Rejected", helper: "Needs changes" },
];

const STATUS_LABEL: Record<StartupStatus, string> = {
  draft: "Draft",
  pending_review: "Pending review",
  approved: "Approved",
  live: "Live",
  rejected: "Rejected",
};

const STATUS_TONE: Record<StartupStatus, string> = {
  draft: "bg-slate-100 text-slate-700",
  pending_review: "bg-amber-100 text-amber-800",
  approved: "bg-emerald-100 text-emerald-800",
  live: "bg-[#387ED1]/10 text-[#387ED1]",
  rejected: "bg-red-100 text-red-700",
};

const placeholderStats = [
  { label: "Submission Progress", value: "—", icon: CheckCircle2 },
  { label: "Approval Status", value: "—", icon: CheckCircle2 },
  { label: "Investor Requests", value: "—", icon: Wallet },
  { label: "Startup Views", value: "—", icon: Eye },
  { label: "Funding Progress", value: "—", icon: LineChart },
  { label: "Traction", value: "—", icon: LineChart },
];

export function FounderDashboardOverview({
  pitches,
  workspace,
}: {
  pitches: StartupWithPitch[];
  workspace: {
    documents: Array<{ id: string }>;
    submission: { submission_status?: string | null } | null;
    pitchFiles: Array<{ id: string }>;
    startup: {
      funding_ask?: number | null;
      founder_workspace_views?: number | null;
      founder_workspace_bookmarks?: number | null;
    } | null;
  } | null;
}) {
  const [activeTab, setActiveTab] = React.useState<StatusFilter>("all");
  const latestStartup = pitches[0] ?? null;
  const latestPitch = latestStartup?.pitch_submissions?.[0] ?? null;

  const counts = React.useMemo(() => {
    const totals = pitches.reduce<Record<StartupStatus, number>>(
      (acc, p) => {
        acc[p.status] = (acc[p.status] ?? 0) + 1;
        return acc;
      },
      { draft: 0, pending_review: 0, approved: 0, live: 0, rejected: 0 },
    );
    return { ...totals, all: pitches.length };
  }, [pitches]);

  const visiblePitches = React.useMemo(() => {
    if (activeTab === "all") return pitches;
    return pitches.filter((p) => p.status === activeTab);
  }, [pitches, activeTab]);

  const stats = latestStartup
    ? [
        {
          label: "Submission status",
          value: resolvePitchDisplayStatus(latestStartup),
          icon: CheckCircle2,
        },
        {
          label: "Approval status",
          value: latestStartup.status,
          icon: CheckCircle2,
        },
        {
          label: "Investor requests",
          value: String(latestStartup.investor_interest_count ?? 0),
          icon: Wallet,
        },
        {
          label: "Startup views",
          value: String(latestStartup.views_count ?? 0),
          icon: Eye,
        },
        {
          label: "Funding progress",
          value: formatInrCompact(
            Number(workspace?.startup?.funding_ask ?? latestStartup.funding_ask) || 0,
          ),
          icon: Wallet,
        },
        {
          label: "Documents uploaded",
          value: String(workspace?.documents?.length ?? 0),
          icon: LineChart,
        },
      ]
    : placeholderStats;

  return (
    <div className="space-y-7">
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-900">Founder Dashboard</h1>
          <p className="mt-2 text-slate-500">
            {latestStartup
              ? `${latestStartup.name} — data syncs from Supabase as you update your profile.`
              : "Create your first startup pitch to begin review and go live."}
          </p>
        </div>
        <Button asChild className="self-start rounded-xl">
          <Link href="/founder/pitch-submission">
            <Plus className="mr-2 h-4 w-4" /> Create new startup
          </Link>
        </Button>
      </motion.section>

      <section className="grid gap-4 md:grid-cols-3">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <motion.div key={item.label} whileHover={{ y: -3 }}>
              <Card className="rounded-2xl border-slate-200 p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-500">{item.label}</p>
                  <Icon className="h-4 w-4 text-[#387ED1]" />
                </div>
                <p className="mt-5 text-2xl font-semibold tracking-tight text-slate-900">{item.value}</p>
              </Card>
            </motion.div>
          );
        })}
      </section>

      <Card className="rounded-3xl border-slate-200 p-7">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">My Startups</h2>
            <p className="mt-1 text-sm text-slate-500">
              {latestStartup
                ? `Latest pitch status: ${resolvePitchDisplayStatus(latestStartup)}.${
                    latestPitch?.submitted_at
                      ? ` Submitted ${formatShortDate(latestPitch.submitted_at)}.`
                      : ""
                  }`
                : "Track every startup you submit. Filter by status to find drafts, pending reviews, or live listings."}
            </p>
          </div>
          {latestStartup ? (
            <Button variant="outline" asChild className="self-start rounded-xl">
              <Link href={`/startup/${latestStartup.slug}`}>Preview public profile</Link>
            </Button>
          ) : null}
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {STATUS_TABS.map((tab) => {
            const count = counts[tab.id] ?? 0;
            const active = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "group inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition",
                  active
                    ? "border-[#387ED1]/40 bg-[#387ED1]/10 text-[#387ED1]"
                    : "border-slate-200 bg-white text-slate-600 hover:border-[#387ED1]/30 hover:text-[#387ED1]",
                )}
              >
                {tab.label}
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                    active
                      ? "bg-white/80 text-[#387ED1]"
                      : "bg-slate-100 text-slate-500 group-hover:bg-[#387ED1]/10 group-hover:text-[#387ED1]",
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {visiblePitches.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
            <p className="text-sm font-semibold text-slate-700">No startups in this bucket yet</p>
            <p className="mt-1 text-xs text-slate-500">
              Start a new pitch to populate this view. You can keep multiple drafts at once.
            </p>
            <Button asChild className="mt-4 rounded-xl">
              <Link href="/founder/pitch-submission">
                <Plus className="mr-2 h-4 w-4" /> Create new startup
              </Link>
            </Button>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {visiblePitches.map((startup) => {
              const pitchStatus = resolvePitchDisplayStatus(startup);
              const tone = STATUS_TONE[startup.status] ?? STATUS_TONE.draft;
              const label = STATUS_LABEL[startup.status] ?? startup.status;
              const cover =
                startup.cover_image_url ?? startup.banner_url ?? COVER_FALLBACK;
              return (
                <motion.div key={startup.id} whileHover={{ y: -3 }}>
                  <Card className="overflow-hidden rounded-2xl border-slate-200 p-0">
                    <div className="relative h-32 w-full bg-slate-100">
                      <Image
                        src={cover}
                        alt={startup.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 480px"
                        className="object-cover"
                        unoptimized={cover.startsWith("/")}
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-slate-950/65 to-transparent" />
                      <span
                        className={cn(
                          "absolute right-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide",
                          tone,
                        )}
                      >
                        {label}
                      </span>
                    </div>
                    <div className="p-5">
                      <div className="flex items-start gap-3">
                        <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white">
                          <Image
                            src={startup.logo_url ?? LOGO_FALLBACK}
                            alt={`${startup.name} logo`}
                            fill
                            sizes="44px"
                            className="object-cover"
                            unoptimized={!startup.logo_url}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                            {startup.category ?? startup.industry}
                          </p>
                          <h3 className="mt-0.5 truncate text-base font-semibold text-slate-900">
                            {startup.name}
                          </h3>
                          <p className="mt-0.5 text-xs text-slate-500">
                            Updated {formatShortDate(startup.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <Button asChild size="sm" variant="outline" className="rounded-lg">
                          <Link href={`/founder/pitch-submission/${startup.id}`}>
                            {startup.status === "draft" ? "Continue draft" : "Edit"}
                            <ArrowRight className="ml-1 h-3.5 w-3.5" />
                          </Link>
                        </Button>
                        {startup.status === "live" ? (
                          <Button asChild size="sm" variant="ghost" className="rounded-lg text-[#387ED1]">
                            <Link href={`/startup/${startup.slug}`}>View live</Link>
                          </Button>
                        ) : null}
                        <span className="ml-auto text-xs text-slate-500">Submission: {pitchStatus}</span>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
