"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BarChart3, CircleDollarSign, Search } from "lucide-react";

import { FeaturedStartupCard } from "@/components/cards/featured-startup-card";
import { FAQAccordion } from "@/components/shared/faq-accordion";
import { Navbar } from "@/components/shared/navbar";
import { Button } from "@/components/ui/button";
import { landingFaqs, landingStats } from "@/lib/content/landing";
import { useFadeIn } from "@/hooks/use-fade-in";
import type { Startup } from "@/types";

export function LandingView({ featuredStartups }: { featuredStartups: Startup[] }) {
  const fade = useFadeIn(0.05);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <section className="container-max grid gap-8 py-16 md:grid-cols-2 md:py-20">
          <motion.div {...fade} className="space-y-6">
            <span className="inline-flex rounded-full bg-[#387ED1]/10 px-3 py-1 text-xs font-medium text-[#387ED1]">
              Trusted by 1,000+ global investors
            </span>
            <h1 className="text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl">
              Discover, evaluate, and invest in the next breakout startup.
            </h1>
            <p className="max-w-xl text-slate-600">
              GrowSmall connects ambitious founders with growth-focused investors through a curated pipeline and transparent metrics.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild><Link href="/explore">Explore Startups</Link></Button>
              <Button variant="outline" asChild><Link href="/auth/select-role">Pitch Your Idea</Link></Button>
            </div>
          </motion.div>
          <motion.div {...fade} className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <div className="rounded-xl bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">Average Investor ROI</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">+24.8%</p>
              <div className="mt-4 h-40 rounded-lg bg-gradient-to-br from-[#387ED1]/10 to-white" />
            </div>
          </motion.div>
        </section>

        <section className="border-y border-slate-100 bg-slate-50">
          <div className="container-max grid gap-6 py-10 text-center sm:grid-cols-3">
            {landingStats.map((item) => (
              <div key={item.label}>
                <p className="text-3xl font-semibold text-slate-900">{item.value}</p>
                <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">{item.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="container-max py-16">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-slate-900">Featured Startups</h2>
            <Link className="text-sm text-[#387ED1]" href="/explore">View all</Link>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {featuredStartups.map((startup) => (
              <FeaturedStartupCard key={startup.id} startup={startup} />
            ))}
          </div>
        </section>

        <section className="container-max py-16">
          <h2 className="mb-8 text-center text-2xl font-semibold text-slate-900">How It Works</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { title: "Explore", icon: Search, text: "Browse verified startups with transparent traction and funding metrics." },
              { title: "Analyze", icon: BarChart3, text: "Review growth charts, financials, and founder profile insights." },
              { title: "Invest", icon: CircleDollarSign, text: "Invest seamlessly and track performance in your dashboard." },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-slate-200 bg-white p-6 text-center">
                <item.icon className="mx-auto h-8 w-8 text-[#387ED1]" />
                <h3 className="mt-4 text-lg font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="container-max py-16">
          <h2 className="mb-8 text-center text-2xl font-semibold text-slate-900">Frequently Asked Questions</h2>
          <div className="mx-auto max-w-3xl"><FAQAccordion items={landingFaqs} /></div>
        </section>

        <section className="bg-[#387ED1] py-16 text-white">
          <div className="container-max text-center">
            <h2 className="text-3xl font-semibold">Ready to grow your portfolio?</h2>
            <p className="mt-3 text-sm text-white/85">Join thousands of investors discovering high-growth startups before they scale.</p>
            <Button variant="outline" className="mt-6 border-white bg-white text-[#387ED1] hover:bg-slate-100" asChild>
              <Link href="/auth/select-role">Create Free Account</Link>
            </Button>
          </div>
        </section>
      </main>
      <footer className="border-t border-slate-100 py-8">
        <div className="container-max flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
          <span>GrowSmall</span>
          <span>© {new Date().getFullYear()} GrowSmall. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
