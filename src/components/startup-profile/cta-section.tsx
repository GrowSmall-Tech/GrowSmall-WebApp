"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

import { InvestNowButton } from "@/components/investor-checkout/invest-now-button";
import { submitInvestmentInterest } from "@/lib/actions/investor";
import { Button } from "@/components/ui/button";
import type { InvestorCheckoutStartup } from "@/types/investor-checkout";

import { FadeInSection } from "@/components/startup-profile/fade-in";

export function CTASection({
  headline,
  sublines,
  startupId,
  checkoutStartup,
}: {
  headline: string;
  sublines: string[];
  startupId: string;
  checkoutStartup: InvestorCheckoutStartup;
}) {
  const [pending, startTransition] = useTransition();
  const [note, setNote] = useState<string | null>(null);

  const handleInterest = (amount?: number) => {
    setNote(null);
    startTransition(() => {
      void submitInvestmentInterest({
        startupId,
        amountInterest: amount ?? null,
        message: amount
          ? "Interested in this startup. Please share detailed deck and financials."
          : "Please share full pitch deck and data room.",
      })
        .then((result) => {
          if (result.duplicate) {
            setNote("You have already requested this startup. Founder will contact you soon.");
            return;
          }
          setNote("Interest submitted. Founder has been notified.");
        })
        .catch((error: unknown) => {
          const message =
            error instanceof Error ? error.message : "Unable to submit request right now";
          setNote(message);
        });
    });
  };

  return (
    <FadeInSection>
      <motion.div
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
        className="rounded-2xl border border-slate-100 bg-white px-6 py-12 text-center shadow-[0_16px_48px_rgba(15,23,42,0.08)] sm:px-12 sm:py-16"
      >
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">{headline}</h2>
        <div className="mx-auto mt-4 max-w-2xl space-y-2 text-sm leading-relaxed text-slate-600 sm:text-[15px]">
          {sublines.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
        <motion.div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <InvestNowButton
            startup={checkoutStartup}
            presetAmount={2_500_000}
            className="h-11 min-w-[160px] rounded-lg px-8 text-sm font-semibold"
          />
          <Button
            variant="outline"
            className="h-11 min-w-[200px] rounded-lg border-slate-200 bg-slate-50 text-sm font-semibold text-slate-800 hover:bg-slate-100"
            onClick={() => handleInterest()}
            disabled={pending}
          >
            Request Full Pitch Deck
          </Button>
        </motion.div>
        {note ? <p className="mt-4 text-sm text-slate-600">{note}</p> : null}
        <p className="mt-2 text-xs text-slate-400">
          Not logged in as investor? <Link href="/auth/login" className="underline">Sign in</Link>
        </p>
      </motion.div>
    </FadeInSection>
  );
}
