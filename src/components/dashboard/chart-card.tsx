"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

export function ChartCard({
  title,
  subtitle,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-xl border border-slate-100 bg-white p-5 shadow-[0_8px_30px_-20px_rgba(15,23,42,0.18)] sm:p-6",
        className,
      )}
    >
      <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          {subtitle ? <p className="text-sm text-slate-500">{subtitle}</p> : null}
        </div>
      </div>
      <div className="w-full">{children}</div>
    </motion.div>
  );
}
