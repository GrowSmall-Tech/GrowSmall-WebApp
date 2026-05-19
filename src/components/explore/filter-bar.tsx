"use client";

import { Filter, LineChartIcon, Search, WalletCards, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { cn } from "@/lib/utils";

const industries = [
  { value: "all", label: "All Industries" },
  { value: "fintech", label: "Fintech" },
  { value: "healthtech", label: "Healthtech" },
  { value: "saas", label: "SaaS" },
  { value: "aiml", label: "AI / ML" },
  { value: "agritech", label: "Agri-Tech" },
];

const fundingRanges = [
  { value: "any", label: "Any Range" },
  { value: "0-50", label: "Under ₹50 Lakhs" },
  { value: "50-200", label: "₹50L – ₹2 Cr" },
  { value: "200-1000", label: "₹2 Cr – ₹10 Cr" },
  { value: "1000+", label: "₹10 Cr+" },
];

const revenues = [
  { value: "any", label: "Any Revenue" },
  { value: "pre", label: "Pre-revenue" },
  { value: "0-5", label: "Under ₹5L MRR" },
  { value: "5-20", label: "₹5L – ₹20L MRR" },
  { value: "20+", label: "₹20L+ MRR" },
];

type FilterBarProps = {
  resultCount: number;
  catalogTotal: number;
  search: string;
  industry: string;
  funding: string;
  revenue: string;
  onSearchChange: (v: string) => void;
  onIndustryChange: (v: string) => void;
  onFundingChange: (v: string) => void;
  onRevenueChange: (v: string) => void;
  onClear: () => void;
};

export function FilterBar({
  resultCount,
  catalogTotal,
  search,
  industry,
  funding,
  revenue,
  onSearchChange,
  onIndustryChange,
  onFundingChange,
  onRevenueChange,
  onClear,
}: FilterBarProps) {
  const hasFilters = search.trim() || industry !== "all" || funding !== "any" || revenue !== "any";
  const chips = [
    search.trim() ? `Search: ${search.trim()}` : null,
    industry !== "all" ? industries.find((i) => i.value === industry)?.label : null,
    funding !== "any" ? fundingRanges.find((i) => i.value === funding)?.label : null,
    revenue !== "any" ? revenues.find((i) => i.value === revenue)?.label : null,
  ].filter(Boolean);

  const FilterFields = (
    <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap lg:gap-3">
      <div className="relative min-w-[220px] flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <Input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search startup, founder, location..."
          className="h-11 border-slate-200 bg-slate-50 pl-9"
        />
      </div>
      <Select value={industry} onValueChange={onIndustryChange}>
        <SelectTrigger className="h-11 min-w-[180px] flex-1 gap-2 border-slate-200 bg-slate-50 sm:max-w-[220px]">
          <Filter className="h-4 w-4 shrink-0 text-slate-500" />
          <SelectValue placeholder="Industry" />
        </SelectTrigger>
        <SelectContent>
          {industries.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={funding} onValueChange={onFundingChange}>
        <SelectTrigger className="h-11 min-w-[180px] flex-1 gap-2 border-slate-200 bg-slate-50 sm:max-w-[220px]">
          <WalletCards className="h-4 w-4 shrink-0 text-slate-500" />
          <SelectValue placeholder="Funding Range" />
        </SelectTrigger>
        <SelectContent>
          {fundingRanges.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={revenue} onValueChange={onRevenueChange}>
        <SelectTrigger className="h-11 min-w-[180px] flex-1 gap-2 border-slate-200 bg-slate-50 sm:max-w-[220px]">
          <LineChartIcon className="h-4 w-4 shrink-0 text-slate-500" />
          <SelectValue placeholder="Revenue" />
        </SelectTrigger>
        <SelectContent>
          {revenues.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <div className="flex flex-col gap-4 border-b border-slate-100 bg-white py-6 lg:gap-5">
      <div className="hidden md:flex">{FilterFields}</div>
      <div className="md:hidden">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="h-11 w-full justify-center gap-2 border-slate-200">
              <Filter className="h-4 w-4" />
              Filters & Search
            </Button>
          </DialogTrigger>
          <DialogContent className="top-auto! bottom-0! translate-y-0! max-h-[88vh] rounded-t-2xl p-5">
            <DialogHeader>
              <DialogTitle>Filters</DialogTitle>
            </DialogHeader>
            <div className="mt-5">{FilterFields}</div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          Showing <span className="font-medium text-slate-800">{resultCount}</span> of{" "}
          <span className="font-medium text-slate-800">{catalogTotal}</span> startups
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {chips.map((chip) => (
            <span key={chip} className="rounded-full bg-[#387ED1]/10 px-2.5 py-1 text-xs font-medium text-[#387ED1]">
              {chip}
            </span>
          ))}
          <button
            type="button"
            disabled={!hasFilters}
            onClick={onClear}
            className={cn(
              "inline-flex items-center gap-1 text-sm font-medium text-[#387ED1] transition hover:text-[#2b63a8] disabled:cursor-not-allowed disabled:opacity-40",
            )}
          >
            <XCircle className="h-4 w-4" />
            Clear all
          </button>
        </div>
      </div>
    </div>
  );
}
