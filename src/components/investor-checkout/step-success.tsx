"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, Copy } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { formatInrAmount } from "@/lib/investor-checkout/calculations";
import { formatShortDate } from "@/lib/format/date";
import { useInvestorCheckoutStore } from "@/store/investor-checkout-store";

export function StepSuccess() {
  const startup = useInvestorCheckoutStore((s) => s.startup);
  const form = useInvestorCheckoutStore((s) => s.form);
  const result = useInvestorCheckoutStore((s) => s.result);
  const portfolioSaved = useInvestorCheckoutStore((s) => s.portfolioSaved);
  const portfolioError = useInvestorCheckoutStore((s) => s.portfolioError);
  const close = useInvestorCheckoutStore((s) => s.close);
  const [copied, setCopied] = useState(false);

  if (!startup || !result) return null;

  const copyTxn = async () => {
    try {
      await navigator.clipboard.writeText(result.transactionId);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  return (
    <motion.div
      key="success"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 120, damping: 18 }}
      className="flex flex-col items-center gap-6 px-5 py-8 text-center sm:px-8"
    >
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.1 }}
      >
        <div className="relative">
          <motion.div
            className="absolute inset-0 rounded-full bg-emerald-400/30 blur-xl"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <CheckCircle2 className="relative h-20 w-20 text-emerald-500" strokeWidth={1.25} />
        </div>
      </motion.div>

      <div>
        <h3 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
          Your investment interest has been successfully recorded.
        </h3>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-500">
          Our investment team will contact you after startup verification.
        </p>
        {portfolioSaved === true ? (
          <p className="mx-auto mt-2 max-w-md text-sm font-medium text-emerald-700">
            Added to your Investments portfolio.
          </p>
        ) : null}
        {portfolioSaved === false ? (
          <p className="mx-auto mt-2 max-w-md text-sm text-amber-700">
            {portfolioError ?? "Sign in as an investor to save this to your portfolio."}{" "}
            <Link href="/auth/login" className="font-medium underline">
              Sign in
            </Link>
          </p>
        ) : null}
      </div>

      <motion.div
        className="w-full max-w-md rounded-2xl border border-slate-100 bg-slate-50/80 p-5 text-left"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <dl className="space-y-3 text-sm">
          <motion.div className="flex items-center justify-between gap-2">
            <dt className="text-slate-500">Transaction ID</dt>
            <dd className="flex items-center gap-1.5 font-mono text-xs font-semibold text-slate-900">
              {result.transactionId}
              <button
                type="button"
                onClick={copyTxn}
                className="rounded p-1 text-slate-400 hover:bg-white hover:text-[#387ED1]"
                aria-label="Copy transaction ID"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
            </dd>
          </motion.div>
          {copied ? (
            <p className="text-right text-[10px] text-emerald-600">Copied!</p>
          ) : null}
          <div className="flex justify-between">
            <dt className="text-slate-500">Startup</dt>
            <dd className="font-semibold text-slate-900">{startup.startupName}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">Amount pledged</dt>
            <dd className="font-semibold text-[#387ED1]">{formatInrAmount(form.amount)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">Timestamp</dt>
            <dd className="font-medium text-slate-800">
              {formatShortDate(result.pledgedAt)}{" "}
              {new Date(result.pledgedAt).toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </dd>
          </div>
        </dl>
      </motion.div>

      <div className="flex w-full max-w-md flex-col gap-2 sm:flex-row">
        <Button
          asChild
          className="h-11 flex-1 rounded-xl bg-linear-to-r from-[#387ED1] to-[#4f8ee0] font-semibold"
        >
          <Link href="/investor/investments" onClick={close}>
            View Portfolio
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-11 flex-1 rounded-xl border-slate-200">
          <Link href="/explore" onClick={close}>
            Explore More Startups
          </Link>
        </Button>
      </div>
    </motion.div>
  );
}
