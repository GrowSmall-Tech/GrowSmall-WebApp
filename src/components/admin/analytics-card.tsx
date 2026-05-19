"use client";

import type { ReactNode } from "react";
import { TrendingUp } from "lucide-react";

import { cn } from "@/lib/utils";

export function AnalyticsCard({
  title,
  value,
  subtitle,
  delta,
  deltaPositive,
  chart,
  className,
}: {
  title: string;
  value: string;
  subtitle?: string;
  delta?: string;
  deltaPositive?: boolean;
  chart?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200 bg-white p-5 shadow-sm",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {title}
          </p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
            {value}
          </p>
          {subtitle ? (
            <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
          ) : null}
        </div>
        {delta ? (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
              deltaPositive
                ? "bg-emerald-100 text-emerald-800"
                : "bg-red-100 text-red-800",
            )}
          >
            <TrendingUp className="h-3 w-3" />
            {delta}
          </span>
        ) : null}
      </div>
      {chart ? <div className="mt-4">{chart}</div> : null}
    </div>
  );
}
