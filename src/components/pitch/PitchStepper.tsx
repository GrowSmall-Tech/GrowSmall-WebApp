"use client";

import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

interface StepItem {
  key: string;
  label: string;
}

interface PitchStepperProps {
  steps: StepItem[];
  currentStep: number;
}

export function PitchStepper({ steps, currentStep }: PitchStepperProps) {
  return (
    <div className="w-full">
      <div className="relative flex items-start justify-between gap-2 sm:gap-4">
        <div className="absolute left-[10%] right-[10%] top-4 hidden h-[2px] bg-slate-200 sm:block" />
        <motion.div
          className="absolute left-[10%] top-4 hidden h-[2px] bg-[#387ED1] sm:block"
          initial={false}
          animate={{
            width: `${Math.max(0, ((currentStep - 1) / (steps.length - 1)) * 80)}%`,
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        />
        {steps.map((step, idx) => {
          const number = idx + 1;
          const isActive = number === currentStep;
          const isCompleted = number < currentStep;

          return (
            <div key={step.key} className="relative z-10 flex min-w-0 flex-1 flex-col items-center">
              <motion.div
                initial={false}
                animate={{
                  backgroundColor: isActive || isCompleted ? "#387ED1" : "#E2E8F0",
                  color: isActive || isCompleted ? "#FFFFFF" : "#64748B",
                  scale: isActive ? 1.05 : 1,
                }}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold sm:h-9 sm:w-9",
                )}
              >
                {number}
              </motion.div>
              <p
                className={cn(
                  "mt-2 text-center text-[11px] font-medium sm:text-xs",
                  isActive ? "text-[#387ED1]" : "text-slate-500",
                )}
              >
                {step.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
