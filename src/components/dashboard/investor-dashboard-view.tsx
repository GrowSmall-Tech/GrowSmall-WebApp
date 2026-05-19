"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Filter, LayoutDashboard, Rocket, Settings, Wallet } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FeaturedStartupCard } from "@/components/dashboard/investor/featured-startup-card";
import { InvestorNavbar } from "@/components/dashboard/investor/investor-navbar";
import { InvestorSidebar } from "@/components/dashboard/investor/investor-sidebar";
import { MarketOutlookWidget } from "@/components/dashboard/investor/market-outlook-widget";
import { SectorPills } from "@/components/dashboard/investor/sector-pills";
import { StartupCard } from "@/components/dashboard/investor/startup-card";
import { SyndicateCard } from "@/components/dashboard/investor/syndicate-card";
import { createClient } from "@/lib/supabase/client";
import type {
  InvestorFeaturedStartup,
  InvestorMarketOutlook,
  InvestorSector,
  InvestorStartupCard,
} from "@/types/investor-dashboard";
import type { NotificationRow } from "@/types/database";

const defaultOutlook: InvestorMarketOutlook[] = [
  { label: "Approved listings", value: "Live", positive: true },
  { label: "Platform focus", value: "Seed–Series A", positive: true },
  { label: "Diligence cadence", value: "72h SLA", positive: true },
];

const defaultSyndicate = {
  title: "Join an Investor Syndicate",
  description: "Co-invest with industry veterans in vetted high-growth startups.",
  ctaLabel: "Browse Syndicates",
} as const;

const mobileNavItems = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Investments", icon: Wallet },
  { label: "Startups", icon: Rocket, active: true },
  { label: "Settings", icon: Settings },
];

const emptyFeatured: InvestorFeaturedStartup = {
  id: "—",
  name: "No featured startup",
  category: "—",
  stage: "—",
  description: "Mark a startup as featured in the admin panel to highlight it here.",
  seekingAmount: "—",
  equityOffered: "—",
  image:
    "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1200&q=80",
};

export function InvestorDashboardView({
  featuredStartup,
  trendingCards = [],
  sectors = [],
  marketOutlook = defaultOutlook,
  syndicate = defaultSyndicate,
  notifications = [],
}: {
  featuredStartup?: InvestorFeaturedStartup | null;
  trendingCards?: InvestorStartupCard[];
  sectors?: InvestorSector[];
  marketOutlook?: InvestorMarketOutlook[];
  syndicate?: { title: string; description: string; ctaLabel: string };
  notifications?: NotificationRow[];
}) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [showOnlySaved, setShowOnlySaved] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const primary = featuredStartup ?? emptyFeatured;
  const cards = trendingCards.filter((card) => {
    const q = search.trim().toLowerCase();
    const qOk =
      !q ||
      card.name.toLowerCase().includes(q) ||
      card.industry.toLowerCase().includes(q) ||
      card.description.toLowerCase().includes(q) ||
      card.founderName.toLowerCase().includes(q);
    const savedOk = !showOnlySaved || card.isSaved;
    const sectorOk =
      selectedSectors.length === 0 || selectedSectors.includes(card.industry);
    return qOk && savedOk && sectorOk;
  });
  const sectorList: InvestorSector[] =
    sectors.length > 0
      ? sectors
      : [{ id: "all", label: "All sectors", icon: "sprout" }];

  async function toggleSave(startupId: string) {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const { data: existing } = await supabase
      .from("saved_startups")
      .select("id")
      .eq("investor_id", user.id)
      .eq("startup_id", startupId)
      .maybeSingle();
    if (existing?.id) {
      await supabase.from("saved_startups").delete().eq("id", existing.id);
    } else {
      await supabase.from("saved_startups").insert({
        investor_id: user.id,
        startup_id: startupId,
      });
    }
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <div className="flex">
        <InvestorSidebar />
        <div className="min-w-0 flex-1">
          <InvestorNavbar
            onOpenMobileMenu={() => setMobileMenuOpen(true)}
            notifications={notifications}
            onSearchChange={setSearch}
          />

          {mobileMenuOpen ? (
            <div className="fixed inset-0 z-50 bg-slate-900/25 lg:hidden" onClick={() => setMobileMenuOpen(false)}>
              <motion.aside
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                onClick={(e) => e.stopPropagation()}
                className="h-full w-72 bg-white p-5"
              >
                <InvestorSidebar mobile />
              </motion.aside>
            </div>
          ) : null}

          <main className="px-4 py-6 pb-24 md:px-6 lg:pb-8">
            <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h1 className="text-[42px] leading-tight font-semibold">Explore Startups</h1>
                  <p className="mt-1 text-sm text-slate-600">
                    Discover high-potential early-stage ventures in India
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" className="rounded-lg" onClick={() => setFilterOpen(true)}>
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                  </Button>
                </div>
              </div>
            </motion.section>

            <section className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
              <FeaturedStartupCard startup={primary} onToggleSave={toggleSave} />
              <div className="space-y-4">
                <MarketOutlookWidget items={marketOutlook} />
                <SyndicateCard data={syndicate} />
              </div>
            </section>

            <section className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {cards.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No startups yet. Approve listings in the admin panel to populate this grid.
                </p>
              ) : (
                cards.map((startup, index) => (
                  <motion.div
                    key={startup.id}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.06 * index }}
                  >
                    <StartupCard startup={startup} onToggleSave={toggleSave} />
                  </motion.div>
                ))
              )}
            </section>

            <section className="mt-8">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-[34px] leading-tight font-semibold">Sectors on the Rise</h2>
                <button type="button" className="text-sm font-semibold text-[#387ED1]">
                  View All Sectors
                </button>
              </div>
              <SectorPills sectors={sectorList} />
            </section>
          </main>
        </div>
      </div>

      <nav className="fixed right-0 bottom-0 left-0 z-30 border-t border-slate-200 bg-white lg:hidden">
        <div className="grid grid-cols-4">
          {mobileNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                type="button"
                className={
                  item.active
                    ? "flex flex-col items-center gap-1 py-2 text-xs font-semibold text-[#387ED1]"
                    : "flex flex-col items-center gap-1 py-2 text-xs font-medium text-slate-500"
                }
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </div>
      </nav>
      <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Filters</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Saved only</span>
              <Checkbox
                checked={showOnlySaved}
                onCheckedChange={(v) => setShowOnlySaved(Boolean(v))}
              />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Industry</p>
              {sectorList.map((sector) => (
                <label key={sector.id} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={selectedSectors.includes(sector.label)}
                    onCheckedChange={(checked) =>
                      setSelectedSectors((prev) =>
                        checked
                          ? [...prev, sector.label]
                          : prev.filter((v) => v !== sector.label),
                      )
                    }
                  />
                  {sector.label}
                </label>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedSectors([])}>
              Reset
            </Button>
            <Button onClick={() => setFilterOpen(false)}>Apply</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
