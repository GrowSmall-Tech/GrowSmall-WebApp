import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { StartupCheckoutShell } from "@/components/investor-checkout/startup-checkout-shell";
import { buildInvestorCheckoutStartup } from "@/lib/investor-checkout/build-startup-context";
import { BusinessModelSection } from "@/components/startup-profile/business-model-section";
import { CTASection } from "@/components/startup-profile/cta-section";
import { FadeInHero } from "@/components/startup-profile/fade-in";
import { FundingCard } from "@/components/startup-profile/funding-card";
import { FounderCard } from "@/components/startup-profile/founder-card";
import { MarketSizeCard } from "@/components/startup-profile/market-size-card";
import { MetricCard } from "@/components/startup-profile/metric-card";
import { ProblemSolutionSection } from "@/components/startup-profile/problem-solution-section";
import { StartupTractionLoader } from "@/components/startup-profile/startup-traction-loader";
import { StartupProfileLogo } from "@/components/startup-profile/startup-logo";
import { SiteFooter } from "@/components/explore/footer";
import { Navbar } from "@/components/shared/navbar";
import { SupabaseRealtimeRefresh } from "@/components/realtime/supabase-realtime-refresh";
import { bundleToStartupProfile, getStartupBySlug } from "@/lib/queries/startups";

const PROFILE_REALTIME_TABLES = ["startups", "startup_metrics", "pitch_submissions"];

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const bundle = await getStartupBySlug(slug);
  if (!bundle) {
    return { title: "Startup | GrowSmall" };
  }
  const profile = bundleToStartupProfile(bundle);
  return {
    title: `${profile.name} | GrowSmall`,
    description: profile.headline,
  };
}

export default async function StartupProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const bundle = await getStartupBySlug(slug);

  if (!bundle) {
    notFound();
  }

  const profile = bundleToStartupProfile(bundle);
  const checkoutStartup = buildInvestorCheckoutStartup(
    bundle.startup,
    profile,
    profile.founder.name,
  );

  return (
    <StartupCheckoutShell>
    <div className="min-h-screen bg-white">
      <SupabaseRealtimeRefresh tables={PROFILE_REALTIME_TABLES} />
      <Navbar activeNav="explore" />
      <main className="mx-auto max-w-6xl px-4 pb-20 pt-8 sm:px-6 sm:pb-24 sm:pt-10">
        <FadeInHero>
          <div className="relative mb-10 h-60 overflow-hidden rounded-3xl bg-slate-100 sm:h-72 lg:h-80">
            <Image
              src={profile.bannerImage}
              alt={profile.name}
              fill
              sizes="(max-width: 768px) 100vw, 1024px"
              className="object-cover"
              unoptimized={profile.bannerImage.startsWith("/")}
            />
            <div className="absolute inset-0 bg-linear-to-t from-slate-950/65 via-slate-950/20 to-transparent" />
          </div>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)] lg:items-start lg:gap-12">
            <div>
              <div className="flex flex-wrap items-start gap-4">
                <StartupProfileLogo logoUrl={bundle.startup.logo_url} name={profile.name} />
                <div className="min-w-0">
                  <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">{profile.name}</h1>
                  <p className="mt-1 text-sm text-slate-500">
                    {profile.industry}
                    <span className="text-slate-300"> • </span>
                    {profile.location}
                  </p>
                </div>
              </div>

              <p className="mt-8 text-2xl font-semibold leading-snug tracking-tight text-slate-900 sm:text-[28px] sm:leading-snug md:text-[32px] md:leading-snug">
                {profile.headline}
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {profile.tags.map((tag, index) => (
                  <span
                    key={`${tag}-${index}`}
                    className="inline-flex rounded-full bg-[#387ED1]/10 px-3 py-1 text-xs font-medium text-[#387ED1]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <FundingCard
              askLabel={profile.funding.askLabel}
              askDisplay={profile.funding.askDisplay}
              equityLabel={profile.funding.equityLabel}
              equityDisplay={profile.funding.equityDisplay}
              valuationLabel={profile.funding.valuationLabel}
              valuationDisplay={profile.funding.valuationDisplay}
              checkoutStartup={checkoutStartup}
            />
          </div>
        </FadeInHero>

        <section className="mt-12 grid gap-4 sm:grid-cols-3 sm:gap-5 lg:mt-14">
          <MetricCard label={profile.metrics.arr.label} value={profile.metrics.arr.value} icon={profile.metrics.arr.icon} />
          <MetricCard
            label={profile.metrics.profit.label}
            value={profile.metrics.profit.value}
            icon={profile.metrics.profit.icon}
          />
          <MetricCard
            label={profile.metrics.yoyGrowth.label}
            value={profile.metrics.yoyGrowth.value}
            icon={profile.metrics.yoyGrowth.icon}
          />
        </section>

        <section className="mt-16 lg:mt-20">
          <ProblemSolutionSection
            problemDescription={profile.problem.description}
            painPoints={profile.problem.painPoints}
            solutionDescription={profile.solution.description}
            advantages={profile.solution.advantages}
          />
        </section>

        <section className="mt-16 lg:mt-20">
          <StartupTractionLoader
            revenueBadge={profile.traction.revenueBadge}
            activeUsersLabel={profile.traction.activeUsersLabel}
            usersChartTitle={profile.traction.usersChartTitle}
            revenueChart={profile.traction.revenueChart}
            activeUsersChart={profile.traction.activeUsersChart}
          />
        </section>

        <section className="mt-16 grid gap-8 lg:mt-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,400px)] lg:gap-12">
          <BusinessModelSection items={profile.businessModel} />
          <MarketSizeCard marketSize={profile.marketSize} />
        </section>

        <section className="mt-16 lg:mt-20">
          <FounderCard founder={profile.founder} />
        </section>

        <section className="mt-16 grid gap-6 lg:mt-20 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Pitch deck</h3>
            <p className="mt-2 text-sm text-slate-600">Review this startup&apos;s latest investor material and milestones.</p>
            <div className="mt-5">
              <Link
                href={profile.pitchDeckUrl ?? "#"}
                target={profile.pitchDeckUrl ? "_blank" : undefined}
                className="inline-flex rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#387ED1]"
              >
                {profile.pitchDeckUrl ? "Open Pitch Deck" : "Pitch deck coming soon"}
              </Link>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Investment timeline</h3>
            <div className="mt-5 space-y-3">
              {profile.timeline.map((item) => (
                <div key={item.title} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{item.title}</p>
                    <p className="text-xs text-slate-500">{item.quarter}</p>
                  </div>
                  <span className="rounded-full bg-[#387ED1]/10 px-2.5 py-1 text-xs font-semibold text-[#387ED1]">
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-16 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:mt-20">
          <h3 className="text-lg font-semibold text-slate-900">Team</h3>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {profile.team.map((member) => (
              <div key={member.name} className="rounded-xl bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">{member.name}</p>
                <p className="mt-1 text-xs text-slate-500">{member.role}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16 lg:mt-20">
          <CTASection
            headline={profile.cta.headline}
            sublines={profile.cta.sublines}
            startupId={bundle.startup.id}
            checkoutStartup={checkoutStartup}
          />
        </section>
      </main>
      <SiteFooter />
    </div>
    </StartupCheckoutShell>
  );
}
