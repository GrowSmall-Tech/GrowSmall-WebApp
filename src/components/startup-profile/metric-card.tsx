"use client";

import { motion } from "framer-motion";
import { Coins, TrendingUp, Zap } from "lucide-react";

import type { StartupProfileMetricIcon } from "@/types/startup-profile";

import { cn } from "@/lib/utils";

const metricIcons: Record<
  StartupProfileMetricIcon,
  { Icon: typeof Coins; iconWrap: string }
> = {
  coins: { Icon: Coins, iconWrap: "bg-[#387ED1]/10 text-[#387ED1]" },
  trending: { Icon: TrendingUp, iconWrap: "bg-emerald-500/10 text-emerald-600" },
  zap: { Icon: Zap, iconWrap: "bg-sky-500/10 text-sky-600" },
};

export function MetricCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: StartupProfileMetricIcon;
}) {
  const { Icon, iconWrap } = metricIcons[icon];
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.18, ease: [0.25, 0.1, 0.25, 1] }}
      className="flex items-center gap-4 rounded-xl border border-slate-100 bg-[#f8fafc] px-5 py-4 shadow-[0_1px_0_rgba(15,23,42,0.04)]"
    >
      <div
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
          iconWrap,
        )}
      >
        <Icon className="h-5 w-5" strokeWidth={2} aria-hidden />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <p className="mt-1 text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">{value}</p>
      </div>
    </motion.div>
  );
}
