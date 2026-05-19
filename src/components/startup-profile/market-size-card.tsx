"use client";

import { motion } from "framer-motion";

import { FadeInSection } from "@/components/startup-profile/fade-in";
import type { StartupProfile } from "@/types/startup-profile";

const rows: { key: keyof StartupProfile["marketSize"]; label: string }[] = [
  { key: "tam", label: "TAM" },
  { key: "sam", label: "SAM" },
  { key: "som", label: "SOM" },
];

export function MarketSizeCard({ marketSize }: { marketSize: StartupProfile["marketSize"] }) {
  return (
    <FadeInSection>
      <motion.div
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
        className="flex h-full flex-col justify-center rounded-2xl bg-[#0b1220] px-6 py-8 text-white shadow-[0_20px_50px_rgba(15,23,42,0.25)] sm:px-8 sm:py-10"
      >
        <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-400">Market size</h3>
        <div className="mt-8 space-y-7">
          {rows.map(({ key, label }) => (
            <div key={key}>
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-sm font-medium text-slate-300">{label}</span>
                <span className="text-sm font-semibold tabular-nums text-white">{marketSize[key].value}</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800">
                <motion.div
                  className="h-full rounded-full bg-[#387ED1]"
                  initial={{ width: 0 }}
                  whileInView={{ width: `${marketSize[key].widthPct}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </FadeInSection>
  );
}
