"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Building2,
  CheckCircle2,
  CreditCard,
  Loader2,
  Smartphone,
  Wallet,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { recordCheckoutInvestment } from "@/lib/actions/investor";
import {
  calculateFees,
  estimateInvestorEquityPercent,
  formatInrAmount,
  generateTransactionId,
} from "@/lib/investor-checkout/calculations";
import { useInvestorCheckoutStore } from "@/store/investor-checkout-store";
import type { PaymentMethod } from "@/types/investor-checkout";
import { cn } from "@/lib/utils";

import { ConfettiBurst } from "./confetti-burst";

const METHODS: { id: PaymentMethod; label: string; icon: typeof Smartphone }[] = [
  { id: "upi", label: "UPI", icon: Smartphone },
  { id: "card", label: "Card", icon: CreditCard },
  { id: "netbanking", label: "Net Banking", icon: Building2 },
  { id: "wallet", label: "Wallets", icon: Wallet },
];

function FakeQrPattern() {
  const cells = Array.from({ length: 121 }, (_, i) => (i + Math.floor(i / 11)) % 3 !== 0);
  return (
    <div className="grid grid-cols-11 gap-0.5 rounded-lg bg-white p-2">
      {cells.map((dark, i) => (
        <div
          key={i}
          className={cn("aspect-square rounded-[1px]", dark ? "bg-slate-900" : "bg-white")}
        />
      ))}
    </div>
  );
}

export function StepPayment() {
  const startup = useInvestorCheckoutStore((s) => s.startup);
  const form = useInvestorCheckoutStore((s) => s.form);
  const paymentMethod = useInvestorCheckoutStore((s) => s.paymentMethod);
  const paymentPhase = useInvestorCheckoutStore((s) => s.paymentPhase);
  const setPaymentMethod = useInvestorCheckoutStore((s) => s.setPaymentMethod);
  const setPaymentPhase = useInvestorCheckoutStore((s) => s.setPaymentPhase);
  const setResult = useInvestorCheckoutStore((s) => s.setResult);
  const setPortfolioSaved = useInvestorCheckoutStore((s) => s.setPortfolioSaved);
  const setStep = useInvestorCheckoutStore((s) => s.setStep);

  const [cardNumber, setCardNumber] = useState("");
  const [upiId] = useState(() => `growsmall.pay@${startup?.startupSlug.slice(0, 8) ?? "demo"}`);

  const { totalPayable } = calculateFees(form.amount);

  const handlePay = useCallback(() => {
    if (paymentPhase !== "idle" || !startup) return;
    setPaymentPhase("processing");
    setPortfolioSaved(null);

    const transactionId = generateTransactionId();
    const pledgedAt = new Date().toISOString();
    const equityPercent = estimateInvestorEquityPercent(form.amount, startup.valuation);

    void recordCheckoutInvestment({
      startupId: startup.startupId,
      amount: form.amount,
      equityPercent,
      transactionId,
    })
      .then(() => setPortfolioSaved(true))
      .catch((error: unknown) => {
        const message =
          error instanceof Error ? error.message : "Could not save to portfolio";
        setPortfolioSaved(false, message);
      });

    window.setTimeout(() => {
      setPaymentPhase("success");
      setResult({ transactionId, pledgedAt });
      window.setTimeout(() => setStep("success"), 1400);
    }, 2200);
  }, [
    form.amount,
    paymentPhase,
    setPaymentPhase,
    setPortfolioSaved,
    setResult,
    setStep,
    startup,
  ]);

  useEffect(() => {
    if (paymentPhase === "idle") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && paymentPhase === "processing") return;
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [paymentPhase]);

  if (!startup) return null;

  return (
    <motion.div
      key="payment"
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.28 }}
      className="relative flex flex-col gap-5 px-5 pb-28 sm:px-6 sm:pb-6"
    >
      <ConfettiBurst active={paymentPhase === "success"} />

      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Secure checkout</p>
        <h3 className="mt-1 text-lg font-semibold text-slate-900">Complete payment</h3>
        <p className="mt-1 text-xs text-slate-500">
          Simulated checkout — no real payment is processed.
        </p>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {METHODS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setPaymentMethod(id)}
            className={cn(
              "flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-[10px] font-semibold transition",
              paymentMethod === id
                ? "border-[#387ED1] bg-[#387ED1]/10 text-[#387ED1] shadow-[0_0_0_1px_rgba(56,126,209,0.3)]"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300",
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {paymentMethod === "upi" && paymentPhase === "idle" ? (
          <motion.div
            key="upi"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4"
          >
            <div className="mx-auto w-fit">
              <FakeQrPattern />
            </div>
            <p className="mt-4 text-center text-xs text-slate-500">Scan with any UPI app</p>
            <p className="mt-2 text-center font-mono text-sm font-medium text-slate-800">{upiId}</p>
          </motion.div>
        ) : null}

        {paymentMethod === "card" && paymentPhase === "idle" ? (
          <motion.div
            key="card"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-3 rounded-2xl border border-slate-100 bg-white p-4"
          >
            <motion.div className="space-y-2">
              <Label>Card number</Label>
              <Input
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, "").slice(0, 16))}
                placeholder="4111 1111 1111 1111"
                className="h-11 rounded-xl font-mono"
              />
            </motion.div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Expiry</Label>
                <Input placeholder="MM/YY" className="h-11 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>CVV</Label>
                <Input placeholder="•••" type="password" className="h-11 rounded-xl" />
              </div>
            </div>
          </motion.div>
        ) : null}

        {(paymentMethod === "netbanking" || paymentMethod === "wallet") && paymentPhase === "idle" ? (
          <motion.div
            key={paymentMethod}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500"
          >
            Select your {paymentMethod === "netbanking" ? "bank" : "wallet"} on the next screen (demo).
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {paymentPhase === "processing" ? (
          <motion.div
            key="processing"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4 rounded-2xl border border-[#387ED1]/20 bg-[#387ED1]/5 py-10"
          >
            <Loader2 className="h-10 w-10 animate-spin text-[#387ED1]" />
            <p className="text-sm font-semibold text-slate-800">Securing transaction…</p>
            <p className="text-xs text-slate-500">Encrypting payment details</p>
          </motion.div>
        ) : null}

        {paymentPhase === "success" ? (
          <motion.div
            key="success-pay"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 py-10"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 14 }}
            >
              <CheckCircle2 className="h-14 w-14 text-emerald-500" strokeWidth={1.5} />
            </motion.div>
            <p className="text-sm font-semibold text-emerald-900">Payment successful</p>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="fixed inset-x-0 bottom-0 z-10 space-y-2 border-t border-slate-100 bg-white/90 p-4 backdrop-blur-md sm:static sm:border-0 sm:bg-transparent sm:p-0">
        {paymentPhase === "idle" ? (
          <>
            <Button
              variant="outline"
              className="hidden h-11 w-full rounded-xl sm:flex"
              onClick={() => setStep("review")}
            >
              Back
            </Button>
            <Button
              className="h-12 w-full rounded-xl bg-[#0f172a] text-sm font-semibold hover:bg-slate-800"
              onClick={handlePay}
            >
              Pay {formatInrAmount(totalPayable)}
            </Button>
          </>
        ) : null}
      </div>
    </motion.div>
  );
}
