"use client";

import * as React from "react";
import Link from "next/link";

import { FeaturedStartupCard } from "@/components/cards/featured-startup-card";
import { StartupCard } from "@/components/cards/startup-card";
import type { ExploreListingStartup } from "@/types";
import type { Startup } from "@/types";

import { FilterBar } from "./filter-bar";
import { Pagination } from "./pagination";
import { SidebarCategories } from "./sidebar-categories";

const PAGE_SIZE = 11;

export function ExploreContent({
  featuredStartups = [],
  listings,
  catalogTotal,
}: {
  featuredStartups?: Startup[];
  listings: ExploreListingStartup[];
  catalogTotal: number;
}) {
  const [industry, setIndustry] = React.useState("all");
  const [search, setSearch] = React.useState("");
  const [funding, setFunding] = React.useState("any");
  const [revenue, setRevenue] = React.useState("any");
  const [currentPage, setCurrentPage] = React.useState(1);

  const activeCategory =
    industry === "all"
      ? null
      : (industry as ExploreListingStartup["categoryKey"]);

  const filtered = React.useMemo(() => {
    return listings.filter((item) => {
      const industryOk =
        industry === "all" || item.categoryKey === (industry as ExploreListingStartup["categoryKey"]);
      const fundingOk = funding === "any" || item.fundingBand === funding;
      const revenueOk = revenue === "any" || item.revenueBand === revenue;
      const query = search.trim().toLowerCase();
      const searchOk =
        query.length === 0 ||
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.location.toLowerCase().includes(query) ||
        item.industry.toLowerCase().includes(query);
      return industryOk && fundingOk && revenueOk && searchOk;
    });
  }, [industry, funding, revenue, search, listings]);

  const categoryCounts = React.useMemo(() => {
    return listings.reduce<Record<ExploreListingStartup["categoryKey"], number>>(
      (acc, item) => {
        acc[item.categoryKey] += 1;
        return acc;
      },
      { fintech: 0, healthtech: 0, saas: 0, aiml: 0, agritech: 0 },
    );
  }, [listings]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pageItems = filtered.slice((safeCurrentPage - 1) * PAGE_SIZE, safeCurrentPage * PAGE_SIZE);

  const handleClear = () => {
    setIndustry("all");
    setSearch("");
    setFunding("any");
    setRevenue("any");
    setCurrentPage(1);
  };

  const handleCategorySelect = (key: ExploreListingStartup["categoryKey"]) => {
    setIndustry(key);
    setCurrentPage(1);
  };

  return (
    <main className="flex-1">
      <div className="border-b border-slate-50 bg-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <FilterBar
            resultCount={filtered.length}
            catalogTotal={catalogTotal}
            search={search}
            industry={industry}
            funding={funding}
            revenue={revenue}
            onSearchChange={(v) => {
              setSearch(v);
              setCurrentPage(1);
            }}
            onIndustryChange={(v) => {
              setIndustry(v);
              setCurrentPage(1);
            }}
            onFundingChange={(v) => {
              setFunding(v);
              setCurrentPage(1);
            }}
            onRevenueChange={(v) => {
              setRevenue(v);
              setCurrentPage(1);
            }}
            onClear={handleClear}
          />
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {featuredStartups.length > 0 ? (
          <section className="mb-12 border-b border-slate-100 pb-12">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Featured on GrowSmall</h2>
              <Link href="/" className="text-sm text-[#387ED1]">
                Learn more
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredStartups.slice(0, 3).map((s) => (
                <FeaturedStartupCard key={s.id} startup={s} />
              ))}
            </div>
          </section>
        ) : null}

        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-[28px]">
            Explore Startups
          </h1>
          <p className="mt-1 text-sm text-slate-500">Vetted founders raising transparent rounds.</p>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center">
            <p className="text-lg font-semibold text-slate-800">No startups match your filters</p>
            <p className="mt-2 text-sm text-slate-500">Try changing industry, funding range, or clear all filters.</p>
          </div>
        ) : (
          <>
            <div className="grid gap-10 lg:grid-cols-[minmax(0,248px)_1fr] lg:gap-14">
              <SidebarCategories
                activeCategory={activeCategory}
                categoryCounts={categoryCounts}
                onCategoryChange={handleCategorySelect}
              />

              <div>
                <div className="grid gap-6 sm:grid-cols-2">
                  {pageItems.map((startup) => (
                    <StartupCard key={startup.id} startup={startup} />
                  ))}
                </div>

                <Pagination totalPages={totalPages} currentPage={safeCurrentPage} onPageChange={setCurrentPage} />
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
