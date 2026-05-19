"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Lock, X } from "lucide-react";
import * as DialogPrimitive from "@radix-ui/react-dialog";

import { cn } from "@/lib/utils";
import { useInvestorCheckoutStore } from "@/store/investor-checkout-store";

import { CheckoutProgress } from "./checkout-progress";
import { StepInvestmentDetails } from "./step-investment-details";
import { StepPayment } from "./step-payment";
import { StepReview } from "./step-review";
import { StepSuccess } from "./step-success";

export function InvestorCheckoutModal() {
  const isOpen = useInvestorCheckoutStore((s) => s.isOpen);
  const step = useInvestorCheckoutStore((s) => s.step);
  const close = useInvestorCheckoutStore((s) => s.close);
  const startup = useInvestorCheckoutStore((s) => s.startup);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={(open) => !open && close()}>
      <AnimatePresence>
        {isOpen ? (
          <DialogPrimitive.Portal forceMount>
            <DialogPrimitive.Overlay asChild forceMount>
              <motion.div
                className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-md"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              />
            </DialogPrimitive.Overlay>

            <DialogPrimitive.Content asChild forceMount>
              <motion.div
                className={cn(
                  "fixed z-50 flex max-h-[min(92dvh,820px)] w-full flex-col overflow-hidden",
                  "inset-x-0 bottom-0 rounded-t-3xl border border-white/20",
                  "bg-white/95 shadow-[0_-24px_80px_rgba(15,23,42,0.18),0_0_0_1px_rgba(56,126,209,0.08)] backdrop-blur-xl",
                  "sm:inset-auto sm:left-1/2 sm:top-1/2 sm:max-w-lg sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl",
                  "sm:shadow-[0_32px_80px_rgba(15,23,42,0.2),0_0_0_1px_rgba(56,126,209,0.12)]",
                )}
                initial={{ opacity: 0, y: 40, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 24, scale: 0.98 }}
                transition={{ type: "spring", stiffness: 320, damping: 28 }}
                aria-describedby={undefined}
              >
                <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-linear-to-r from-transparent via-[#387ED1]/40 to-transparent" />

                <div className="flex shrink-0 items-center justify-between border-b border-slate-100/80 px-5 py-4 sm:px-6">
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                    <Lock className="h-3.5 w-3.5 text-[#387ED1]" aria-hidden />
                    <span>256-bit encrypted · GrowSmall Invest</span>
                  </div>
                  <DialogPrimitive.Close
                    className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    aria-label="Close"
                  >
                    <X className="h-4 w-4" />
                  </DialogPrimitive.Close>
                </div>

                {step !== "success" ? <CheckoutProgress currentStep={step} /> : null}

                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain py-4">
                  <DialogPrimitive.Title className="sr-only">
                    Invest in {startup?.startupName ?? "startup"}
                  </DialogPrimitive.Title>

                  <AnimatePresence mode="wait">
                    {step === "details" ? <StepInvestmentDetails key="step-details" /> : null}
                    {step === "review" ? <StepReview key="step-review" /> : null}
                    {step === "payment" ? <StepPayment key="step-payment" /> : null}
                    {step === "success" ? <StepSuccess key="step-success" /> : null}
                  </AnimatePresence>
                </div>
              </motion.div>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        ) : null}
      </AnimatePresence>
    </DialogPrimitive.Root>
  );
}
