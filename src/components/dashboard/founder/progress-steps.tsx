"use client";

import { CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

import type { SubmissionStep } from "@/config/founder-workspace";
import { cn } from "@/lib/utils";

interface ProgressStepsProps {
  steps: SubmissionStep[];
}

export function ProgressSteps({ steps }: ProgressStepsProps) {
  return (
    <ol className="space-y-4" aria-label="Submission progress">
      {steps.map((step) => (
        <motion.li
          key={step.id}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: step.id * 0.05 }}
          className="flex items-start gap-3"
        >
          <div
            className={cn(
              "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
              step.state === "completed" &&
                "border-emerald-200 bg-emerald-50 text-emerald-600",
              step.state === "active" && "border-[#387ED1] bg-[#387ED1] text-white",
              step.state === "pending" && "border-slate-200 bg-white text-slate-400",
            )}
          >
            {step.state === "completed" ? <CheckCircle2 className="h-4 w-4" /> : step.id}
          </div>
          <div className="space-y-0.5">
            <p
              className={cn(
                "text-sm font-medium",
                step.state === "pending" ? "text-slate-400" : "text-slate-800",
              )}
            >
              {step.title}
            </p>
            <p className="text-xs text-slate-500">{step.description}</p>
          </div>
        </motion.li>
      ))}
    </ol>
  );
}
