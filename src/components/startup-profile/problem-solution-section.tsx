"use client";

import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, X } from "lucide-react";

import { FadeInSection } from "@/components/startup-profile/fade-in";

export function ProblemSolutionSection({
  problemDescription,
  painPoints,
  solutionDescription,
  advantages,
}: {
  problemDescription: string;
  painPoints: string[];
  solutionDescription: string;
  advantages: string[];
}) {
  return (
    <FadeInSection>
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <motion.div
          className="rounded-2xl border border-red-100 bg-white p-6 sm:p-8"
          whileHover={{ y: -2 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" aria-hidden />
            <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-red-600">The Problem</h2>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-[15px]">{problemDescription}</p>
          <ul className="mt-6 space-y-3">
            {painPoints.map((point) => (
              <li key={point} className="flex gap-3 text-sm text-slate-700">
                <X className="mt-0.5 h-4 w-4 shrink-0 text-red-500" aria-hidden />
                <span className="leading-relaxed">{point}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          className="rounded-2xl border border-[#387ED1]/15 bg-white p-6 sm:p-8"
          whileHover={{ y: -2 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-[#387ED1]" aria-hidden />
            <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-[#387ED1]">The Solution</h2>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-[15px]">{solutionDescription}</p>
          <ul className="mt-6 space-y-3">
            {advantages.map((point) => (
              <li key={point} className="flex gap-3 text-sm text-slate-700">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#387ED1]" aria-hidden />
                <span className="leading-relaxed">{point}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </FadeInSection>
  );
}
