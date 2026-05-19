"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
import type { InvestorCheckoutStep } from "@/types/investor-checkout";

const STEPS: { id: InvestorCheckoutStep; label: string }[] = [
  { id: "details", label: "Details" },
  { id: "review", label: "Review" },
  { id: "payment", label: "Pay" },
  { id: "success", label: "Done" },
];

function stepIndex(step: InvestorCheckoutStep) {
  return STEPS.findIndex((s) => s.id === step);
}

export function CheckoutProgress({ currentStep }: { currentStep: InvestorCheckoutStep }) {
  const current = stepIndex(currentStep);

  return (
    <div className="px-5 pt-5 sm:px-6">
      <div className="flex items-center justify-between gap-1">
        {STEPS.map((step, index) => {
          const done = index < current;
          const active = index === current;
          return (
            <motion.div
              key={step.id}
              className="flex flex-1 flex-col items-center gap-1.5"
              initial={false}
              animate={{ opacity: active || done ? 1 : 0.45 }}
            >
              <motion.div
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full border text-[10px] font-bold transition-colors",
                  done && "border-[#387ED1] bg-[#387ED1] text-white",
                  active &&
                    !done &&
                    "border-[#387ED1] bg-[#387ED1]/10 text-[#387ED1] shadow-[0_0_0_4px_rgba(56,126,209,0.12)]",
                  !done && !active && "border-slate-200 bg-white text-slate-400",
                )}
                layout
              >
                {done ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : index + 1}
              </motion.div>
              <span
                className={cn(
                  "hidden text-[10px] font-medium uppercase tracking-wide sm:block",
                  active ? "text-[#387ED1]" : "text-slate-400",
                )}
              >
                {step.label}
              </span>
            </motion.div>
          );
        })}
      </div>
      <div className="mx-5 mt-3 h-0.5 overflow-hidden rounded-full bg-slate-100 sm:mx-6">
        <motion.div
          className="h-full rounded-full bg-linear-to-r from-[#387ED1] to-[#60A5FA]"
          animate={{ width: `${((current + 1) / STEPS.length) * 100}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        />
      </div>
    </div>
  );
}
