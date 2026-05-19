"use client";

import { motion } from "framer-motion";
import { BadgeCheck, TrendingUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StartupProfileLogo } from "@/components/startup-profile/startup-logo";
import {
  estimateInvestorEquityPercent,
  formatEquityPercent,
  formatInrAmount,
} from "@/lib/investor-checkout/calculations";
import { useInvestorCheckoutStore } from "@/store/investor-checkout-store";

import { LiveInvestorsBadge } from "./live-investors-badge";
import { TestimonialsSlider } from "./testimonials-slider";
import { TrustIndicators } from "./trust-indicators";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function isValidMobile(mobile: string) {
  return /^[6-9]\d{9}$/.test(mobile.replace(/\D/g, "").slice(-10));
}

export function StepInvestmentDetails() {
  const startup = useInvestorCheckoutStore((s) => s.startup);
  const form = useInvestorCheckoutStore((s) => s.form);
  const patchForm = useInvestorCheckoutStore((s) => s.patchForm);
  const setStep = useInvestorCheckoutStore((s) => s.setStep);

  if (!startup) return null;

  const equityPct = estimateInvestorEquityPercent(form.amount, startup.valuation);
  const equityLabel = formatEquityPercent(equityPct);
  const min = startup.minimumInvestment;
  const canContinue =
    form.amount >= min &&
    form.fullName.trim().length >= 2 &&
    isValidEmail(form.email) &&
    isValidMobile(form.mobile);

  return (
    <motion.div
      key="details"
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.28 }}
      className="flex flex-col gap-5 px-5 pb-28 sm:px-6 sm:pb-6"
    >
      <motion.div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex gap-3">
          <StartupProfileLogo logoUrl={startup.logoUrl} name={startup.startupName} />
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
            <h3 className="text-lg font-semibold tracking-tight text-slate-900">{startup.startupName}</h3>
            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
              <BadgeCheck className="h-3.5 w-3.5 text-[#387ED1]" aria-hidden />
              Founder verified · {startup.founderName}
            </p>
          </motion.div>
        </div>
        <LiveInvestorsBadge seed={startup.startupId} />
      </motion.div>

      <motion.div className="grid grid-cols-2 gap-3 rounded-2xl border border-slate-100 bg-slate-50/60 p-4 sm:grid-cols-4">
        {[
          { label: "Funding Ask", value: startup.askDisplay },
          { label: "Valuation", value: startup.valuationDisplay },
          { label: "Equity Offered", value: startup.equityDisplay },
          { label: "Min. Investment", value: formatInrAmount(min) },
        ].map((item) => (
          <motion.div key={item.label} whileHover={{ y: -1 }} className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">{item.label}</p>
            <p className="mt-1 truncate text-sm font-semibold text-slate-900">{item.value}</p>
          </motion.div>
        ))}
      </motion.div>

      {startup.yoyGrowth ? (
        <motion.div className="flex items-center gap-2 rounded-xl border border-[#387ED1]/15 bg-[#387ED1]/5 px-3 py-2 text-xs text-slate-600">
          <TrendingUp className="h-4 w-4 text-[#387ED1]" aria-hidden />
          <span>
            <strong className="text-slate-800">{startup.yoyGrowth}</strong> YoY growth · Active round
          </span>
        </motion.div>
      ) : null}

      <div className="space-y-4">
        <motion.div
          className="space-y-2 rounded-xl"
          animate={
            form.amount >= min
              ? { boxShadow: "0 0 0 1px rgba(56,126,209,0.2)" }
              : { boxShadow: "0 0 0 0px transparent" }
          }
        >
          <Label htmlFor="invest-amount">Investment Amount (₹)</Label>
          <Input
            id="invest-amount"
            type="number"
            min={min}
            step={1000}
            value={form.amount || ""}
            onChange={(e) => patchForm({ amount: Number(e.target.value) || 0 })}
            className="h-11 rounded-xl border-slate-200 text-base font-semibold"
          />
          <p className="text-xs text-slate-500">Minimum {formatInrAmount(min)}</p>
          {form.amount >= min ? (
            <motion.p
              className="rounded-xl bg-linear-to-r from-[#387ED1]/10 to-[#60A5FA]/10 px-3 py-2.5 text-sm font-medium text-[#2f6eb8]"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              You will receive approx <strong>{equityLabel}</strong> equity
            </motion.p>
          ) : null}
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="investor-name">Investor Full Name</Label>
            <Input
              id="investor-name"
              value={form.fullName}
              onChange={(e) => patchForm({ fullName: e.target.value })}
              placeholder="As per PAN / KYC"
              className="h-11 rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="investor-email">Email</Label>
            <Input
              id="investor-email"
              type="email"
              value={form.email}
              onChange={(e) => patchForm({ email: e.target.value })}
              placeholder="you@email.com"
              className="h-11 rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="investor-mobile">Mobile Number</Label>
            <Input
              id="investor-mobile"
              type="tel"
              value={form.mobile}
              onChange={(e) => patchForm({ mobile: e.target.value })}
              placeholder="10-digit mobile"
              className="h-11 rounded-xl"
            />
          </div>
        </div>
      </div>

      <TrustIndicators />

      <motion.div className="hidden lg:block">
        <TestimonialsSlider />
      </motion.div>

      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-slate-100 bg-white/90 p-4 backdrop-blur-md sm:static sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
        <Button
          className="h-12 w-full rounded-xl bg-linear-to-r from-[#387ED1] to-[#4f8ee0] text-sm font-semibold shadow-[0_8px_24px_rgba(56,126,209,0.35)] transition hover:shadow-[0_12px_32px_rgba(56,126,209,0.4)]"
          disabled={!canContinue}
          onClick={() => setStep("review")}
        >
          Continue to Review
        </Button>
      </div>
    </motion.div>
  );
}
