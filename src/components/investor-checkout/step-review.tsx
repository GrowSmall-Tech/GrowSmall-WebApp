"use client";

import { motion } from "framer-motion";
import { Shield } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  calculateFees,
  estimateInvestorEquityPercent,
  formatEquityPercent,
  formatInrAmount,
} from "@/lib/investor-checkout/calculations";
import { useInvestorCheckoutStore } from "@/store/investor-checkout-store";

import { TractionMiniChart } from "./traction-mini-chart";

export function StepReview() {
  const startup = useInvestorCheckoutStore((s) => s.startup);
  const form = useInvestorCheckoutStore((s) => s.form);
  const agreedToTerms = useInvestorCheckoutStore((s) => s.agreedToTerms);
  const setAgreedToTerms = useInvestorCheckoutStore((s) => s.setAgreedToTerms);
  const setStep = useInvestorCheckoutStore((s) => s.setStep);

  if (!startup) return null;

  const { platformFee, processingFee, totalPayable } = calculateFees(form.amount);
  const equityPct = estimateInvestorEquityPercent(form.amount, startup.valuation);

  const rows = [
    { label: "Investment Amount", value: formatInrAmount(form.amount), highlight: false },
    { label: "Platform Fee (1.5%)", value: formatInrAmount(platformFee), highlight: false },
    { label: "Processing Fee", value: formatInrAmount(processingFee), highlight: false },
    { label: "Total Payable", value: formatInrAmount(totalPayable), highlight: true },
    { label: "Estimated Equity", value: formatEquityPercent(equityPct), highlight: true },
  ];

  return (
    <motion.div
      key="review"
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.28 }}
      className="flex flex-col gap-5 px-5 pb-28 sm:px-6 sm:pb-6"
    >
      <div>
        <h3 className="text-lg font-semibold text-slate-900">Review Investment</h3>
        <p className="mt-1 text-sm text-slate-500">Confirm your pledge before secure checkout.</p>
      </div>

      <motion.div
        className="overflow-hidden rounded-2xl border border-slate-100 bg-linear-to-br from-white via-white to-[#387ED1]/[0.04] shadow-[0_16px_48px_rgba(15,23,42,0.08),0_0_0_1px_rgba(56,126,209,0.08)]"
        whileHover={{ y: -1 }}
      >
        <motion.div className="border-b border-slate-100 bg-[#387ED1]/5 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#387ED1]">Investment Summary</p>
          <p className="mt-0.5 text-sm font-semibold text-slate-900">{startup.startupName}</p>
        </motion.div>
        <dl className="divide-y divide-slate-50 px-4">
          {rows.map((row) => (
            <div
              key={row.label}
              className="flex items-center justify-between py-3.5 text-sm"
            >
              <dt className={row.highlight ? "font-semibold text-slate-900" : "text-slate-500"}>
                {row.label}
              </dt>
              <dd
                className={
                  row.highlight
                    ? "text-base font-bold text-[#387ED1]"
                    : "font-semibold text-slate-900"
                }
              >
                {row.value}
              </dd>
            </div>
          ))}
        </dl>
      </motion.div>

      <TractionMiniChart data={startup.growthChart} />

      <motion.div
        className="flex gap-3 rounded-xl border border-emerald-200/70 bg-emerald-50/80 px-4 py-3"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Shield className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden />
        <div>
          <p className="text-sm font-semibold text-emerald-900">Investor protection active</p>
          <p className="mt-0.5 text-xs leading-relaxed text-emerald-800/90">
            Funds released only after successful round closure. Your pledge is recorded securely.
          </p>
        </div>
      </motion.div>

      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3">
        <Checkbox
          checked={agreedToTerms}
          onCheckedChange={setAgreedToTerms}
          aria-label="Agree to terms"
        />
        <span className="text-sm leading-snug text-slate-600">
          I agree to the{" "}
          <span className="font-medium text-[#387ED1]">Terms &amp; Investor Agreement</span>
        </span>
      </label>

      <motion.div className="fixed inset-x-0 bottom-0 z-10 flex gap-2 border-t border-slate-100 bg-white/90 p-4 backdrop-blur-md sm:static sm:border-0 sm:bg-transparent sm:p-0">
        <Button
          variant="outline"
          className="h-12 flex-1 rounded-xl border-slate-200"
          onClick={() => setStep("details")}
        >
          Back
        </Button>
        <Button
          className="h-12 flex-[1.4] rounded-xl bg-linear-to-r from-[#387ED1] to-[#4f8ee0] font-semibold shadow-[0_8px_24px_rgba(56,126,209,0.35)]"
          disabled={!agreedToTerms}
          onClick={() => setStep("payment")}
        >
          Proceed to Secure Checkout
        </Button>
      </motion.div>
    </motion.div>
  );
}
