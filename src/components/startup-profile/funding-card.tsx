"use client";

import { motion } from "framer-motion";

import { InvestNowButton } from "@/components/investor-checkout/invest-now-button";
import type { InvestorCheckoutStartup } from "@/types/investor-checkout";

export function FundingCard({
  askLabel,
  askDisplay,
  equityLabel,
  equityDisplay,
  valuationLabel,
  valuationDisplay,
  checkoutStartup,
}: {
  askLabel: string;
  askDisplay: string;
  equityLabel: string;
  equityDisplay: string;
  valuationLabel: string;
  valuationDisplay: string;
  checkoutStartup: InvestorCheckoutStartup;
}) {
  return (
    <motion.aside
      className="rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.08)] lg:sticky lg:top-28 lg:self-start"
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">{askLabel}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-[#387ED1]">{askDisplay}</p>

      <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-slate-100 pt-6">
        <div>
          <dt className="text-xs text-slate-500">{equityLabel}</dt>
          <dd className="mt-1 text-sm font-semibold text-slate-900">{equityDisplay}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">{valuationLabel}</dt>
          <dd className="mt-1 text-sm font-semibold text-slate-900">{valuationDisplay}</dd>
        </div>
      </dl>

      <InvestNowButton
        startup={checkoutStartup}
        className="mt-8 h-11 w-full rounded-lg text-sm font-semibold shadow-sm transition hover:shadow-md"
      />
    </motion.aside>
  );
}
