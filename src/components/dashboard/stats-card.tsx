"use client";

import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

export function StatsCard({
  label,
  value,
  trend,
  className,
}: {
  label: string;
  value: string;
  trend?: string;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.22 }}
      className={cn(
        "rounded-xl border border-slate-100 bg-white p-5 shadow-[0_6px_24px_-14px_rgba(15,23,42,0.2)]",
        className,
      )}
    >
      <p className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{value}</p>
      {trend ? (
        <p className="mt-1 text-xs font-medium text-emerald-600">{trend}</p>
      ) : null}
    </motion.div>
  );
}
