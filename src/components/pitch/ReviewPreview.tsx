"use client";

import Image from "next/image";
import { Briefcase, Coins, ExternalLink, FileText, MapPin, Sparkles, Target, TrendingUp, Users } from "lucide-react";

import { cn } from "@/lib/utils";

const COVER_PLACEHOLDER = "/images/startup-placeholder.svg";
const LOGO_PLACEHOLDER = "/images/logo-placeholder.svg";

function formatINR(value: number) {
  if (!value || Number.isNaN(value)) return "—";
  if (value >= 10_000_000) return `₹${(value / 10_000_000).toFixed(2)} Cr`;
  if (value >= 100_000) return `₹${(value / 100_000).toFixed(2)} L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
  return `₹${value.toLocaleString("en-IN")}`;
}

interface ReviewPreviewProps {
  startupName: string;
  tagline: string;
  industry: string;
  category: string;
  stage: string;
  location: string;
  description: string;
  problem: string;
  solution: string;
  founderBio: string;
  founderLinkedIn: string;
  teamMembers: string;
  annualRevenue: number;
  fundingAsk: number;
  valuation: number;
  equityOffered: number;
  customers: number;
  burnRate: number;
  logoPreview: string | null;
  coverPreview: string | null;
  pitchDeckName: string | null;
  pitchDeckUrl?: string | null;
  monthlyRevenue: number[];
  quarterlyUsers: number[];
}

export function ReviewPreview(props: ReviewPreviewProps) {
  const {
    startupName,
    tagline,
    industry,
    category,
    stage,
    location,
    description,
    problem,
    solution,
    founderBio,
    founderLinkedIn,
    teamMembers,
    annualRevenue,
    fundingAsk,
    valuation,
    equityOffered,
    customers,
    burnRate,
    logoPreview,
    coverPreview,
    pitchDeckName,
    pitchDeckUrl,
    monthlyRevenue,
    quarterlyUsers,
  } = props;

  const cover = coverPreview || COVER_PLACEHOLDER;
  const logo = logoPreview || LOGO_PLACEHOLDER;
  const raisedPct =
    fundingAsk > 0 ? Math.min(95, Math.max(8, Math.round((annualRevenue / fundingAsk) * 70))) : 12;

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-emerald-100 bg-emerald-50/50 px-5 py-4 text-sm text-emerald-800">
        <div className="flex items-center gap-2 font-semibold">
          <Sparkles className="h-4 w-4" /> Looks great. Here&apos;s how investors will see your startup.
        </div>
        <p className="mt-1 text-xs text-emerald-700/80">
          Review every section carefully. You can go back to any step to edit before submission.
        </p>
      </div>

      <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
        <div className="relative h-44 w-full overflow-hidden sm:h-56">
          <Image
            src={cover}
            alt={`${startupName} cover`}
            fill
            sizes="(max-width: 768px) 100vw, 880px"
            className="object-cover"
            unoptimized
          />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-slate-950/70 to-transparent" />
          <div className="absolute left-4 top-4 flex items-center gap-2">
            <span className="rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-slate-800">
              {stage || "Seed"}
            </span>
            <span className="rounded-full bg-[#387ED1]/95 px-2.5 py-1 text-[11px] font-semibold text-white">
              {industry || "—"}
            </span>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <Image src={logo} alt={`${startupName} logo`} fill sizes="56px" className="object-cover" unoptimized />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-xl font-semibold tracking-tight text-slate-900">
                {startupName || "Untitled startup"}
              </h3>
              <p className="mt-1 line-clamp-2 text-sm text-slate-600">{tagline || description || "Startup tagline goes here"}</p>
              <p className="mt-1.5 inline-flex items-center gap-1 text-xs text-slate-500">
                <MapPin className="h-3.5 w-3.5" /> {location || "India"}
                <span className="text-slate-300"> • </span>
                {category || industry}
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <PreviewMetric label="Funding ask" value={formatINR(fundingAsk)} icon={Target} accent="#387ED1" />
            <PreviewMetric label="Revenue" value={formatINR(annualRevenue)} icon={Coins} />
            <PreviewMetric label="Valuation" value={formatINR(valuation)} icon={TrendingUp} />
            <PreviewMetric label="Equity" value={equityOffered ? `${equityOffered}%` : "—"} icon={Briefcase} />
          </div>

          <div className="mt-5">
            <div className="mb-1 flex items-center justify-between text-[11px] text-slate-500">
              <span>Funding momentum</span>
              <span className="font-semibold text-slate-700">{raisedPct}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full bg-linear-to-r from-[#387ED1] to-[#6da9ea]"
                style={{ width: `${raisedPct}%` }}
              />
            </div>
          </div>
        </div>
      </article>

      <Section title="Problem" icon={Target}>
        <p className="text-sm leading-relaxed text-slate-700">{problem || "Add a clear problem statement."}</p>
      </Section>

      <Section title="Solution" icon={Sparkles}>
        <p className="text-sm leading-relaxed text-slate-700">{solution || "Describe how you solve it."}</p>
      </Section>

      <Section title="Traction snapshot" icon={TrendingUp}>
        <div className="grid gap-3 sm:grid-cols-3">
          <SnapshotPill label="Customers" value={customers ? customers.toLocaleString("en-IN") : "—"} />
          <SnapshotPill label="Monthly burn" value={formatINR(burnRate)} />
          <SnapshotPill label="Annual revenue" value={formatINR(annualRevenue)} />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <MiniBars label="Monthly revenue (₹)" values={monthlyRevenue.length ? monthlyRevenue : [0, 0, 0, 0, 0, 0]} />
          <MiniBars label="Quarterly users" values={quarterlyUsers.length ? quarterlyUsers : [0, 0, 0, 0]} suffix="" />
        </div>
      </Section>

      <Section title="Founder" icon={Users}>
        <p className="text-sm leading-relaxed text-slate-700">{founderBio || "Founder bio not added yet."}</p>
        {teamMembers ? (
          <p className="mt-2 whitespace-pre-line text-xs text-slate-500">{teamMembers}</p>
        ) : null}
        {founderLinkedIn ? (
          <a
            href={founderLinkedIn}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#387ED1] hover:underline"
          >
            <ExternalLink className="h-3.5 w-3.5" /> LinkedIn profile
          </a>
        ) : null}
      </Section>

      <Section title="Pitch deck" icon={FileText}>
        {pitchDeckName ? (
          <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-4 py-3 text-sm">
            <span className="truncate font-medium text-slate-800">{pitchDeckName}</span>
            {pitchDeckUrl ? (
              <a
                href={pitchDeckUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold text-[#387ED1] hover:underline"
              >
                Open
              </a>
            ) : (
              <span className="text-xs text-emerald-600">Ready to upload</span>
            )}
          </div>
        ) : (
          <p className="text-sm text-red-500">Pitch deck is required before submission.</p>
        )}
      </Section>
    </div>
  );
}

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <header className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
        <Icon className="h-3.5 w-3.5 text-[#387ED1]" />
        {title}
      </header>
      {children}
    </section>
  );
}

function PreviewMetric({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  accent?: string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 px-3 py-2.5">
      <p className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-slate-500">
        <Icon className="h-3 w-3" /> {label}
      </p>
      <p
        className={cn("mt-1 text-sm font-semibold")}
        style={accent ? { color: accent } : undefined}
      >
        {value}
      </p>
    </div>
  );
}

function SnapshotPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5">
      <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function MiniBars({ label, values, suffix = "" }: { label: string; values: number[]; suffix?: string }) {
  const max = Math.max(...values, 1);
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-3">
      <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">{label}</p>
      <div className="mt-2 flex h-20 items-end gap-1">
        {values.map((v, i) => {
          const height = Math.max(6, (v / max) * 100);
          return (
            <div key={i} className="flex-1 rounded-t-md bg-[#387ED1]/15">
              <div
                className="h-full w-full rounded-t-md bg-linear-to-t from-[#387ED1] to-[#6da9ea]"
                style={{ height: `${height}%` }}
                title={`${v}${suffix}`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
