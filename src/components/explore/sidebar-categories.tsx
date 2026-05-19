"use client";

import type { ComponentType } from "react";
import {
  BriefcaseMedical,
  Cloud,
  Cpu,
  Network,
  Sprout,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

import type { ExploreListingStartup } from "@/types";

import { cn } from "@/lib/utils";

const categories: {
  id: ExploreListingStartup["categoryKey"];
  label: string;
  icon: ComponentType<{ className?: string }>;
}[] = [
  { id: "fintech", label: "Fintech", icon: Network },
  { id: "healthtech", label: "Healthtech", icon: BriefcaseMedical },
  { id: "saas", label: "SaaS", icon: Cloud },
  { id: "aiml", label: "AI / ML", icon: Cpu },
  { id: "agritech", label: "Agri-Tech", icon: Sprout },
];

type SidebarCategoriesProps = {
  activeCategory: ExploreListingStartup["categoryKey"] | null;
  categoryCounts: Record<ExploreListingStartup["categoryKey"], number>;
  onCategoryChange: (category: ExploreListingStartup["categoryKey"]) => void;
};

export function SidebarCategories({
  activeCategory,
  categoryCounts,
  onCategoryChange,
}: SidebarCategoriesProps) {
  return (
    <div className="lg:sticky lg:top-[4.75rem]">
      <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
        Categories
      </p>
      <ul className="space-y-1">
        {categories.map(({ id, label, icon: Icon }) => {
          const isActive = id === activeCategory;
          return (
            <li key={id}>
              <button
                type="button"
                onClick={() => onCategoryChange(id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
                  isActive
                    ? "bg-[#387ED1]/10 font-semibold text-[#387ED1]"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                )}
              >
                <Icon className={cn("h-[18px] w-[18px]", isActive ? "text-[#387ED1]" : "text-slate-400")} />
                <span className="flex-1 text-left">{label}</span>
                <span className="rounded-full bg-white/70 px-2 py-0.5 text-[11px] font-semibold text-slate-500">
                  {categoryCounts[id] ?? 0}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="mt-8 rounded-xl bg-gradient-to-br from-[#387ED1] to-[#2b63a8] p-6 text-white shadow-[0_16px_40px_rgba(56,126,209,0.35)]">
        <p className="text-lg font-semibold tracking-tight">Ready to pitch?</p>
        <p className="mt-2 text-sm leading-relaxed text-white/90">
          Join 2,000+ startups getting funded through GrowSmall.
        </p>
        <Button variant="outline" className="mt-5 h-11 w-full border-0 bg-white text-[#387ED1] hover:bg-slate-100" asChild>
          <Link href="/founder/pitch">Create Pitch</Link>
        </Button>
      </div>
    </div>
  );
}
