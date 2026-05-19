"use client";

import { create } from "zustand";

import type {
  InvestorCheckoutForm,
  InvestorCheckoutResult,
  InvestorCheckoutStartup,
  InvestorCheckoutStep,
  PaymentMethod,
} from "@/types/investor-checkout";

const defaultForm: InvestorCheckoutForm = {
  amount: 0,
  fullName: "",
  email: "",
  mobile: "",
};

type InvestorCheckoutStore = {
  isOpen: boolean;
  step: InvestorCheckoutStep;
  startup: InvestorCheckoutStartup | null;
  form: InvestorCheckoutForm;
  agreedToTerms: boolean;
  paymentMethod: PaymentMethod;
  paymentPhase: "idle" | "processing" | "success";
  result: InvestorCheckoutResult | null;
  portfolioSaved: boolean | null;
  portfolioError: string | null;
  open: (startup: InvestorCheckoutStartup, presetAmount?: number) => void;
  close: () => void;
  setStep: (step: InvestorCheckoutStep) => void;
  patchForm: (patch: Partial<InvestorCheckoutForm>) => void;
  setAgreedToTerms: (value: boolean) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  setPaymentPhase: (phase: "idle" | "processing" | "success") => void;
  setResult: (result: InvestorCheckoutResult | null) => void;
  setPortfolioSaved: (saved: boolean | null, error?: string | null) => void;
  resetPayment: () => void;
};

export const useInvestorCheckoutStore = create<InvestorCheckoutStore>((set) => ({
  isOpen: false,
  step: "details",
  startup: null,
  form: defaultForm,
  agreedToTerms: false,
  paymentMethod: "upi",
  paymentPhase: "idle",
  result: null,
  portfolioSaved: null,
  portfolioError: null,
  open: (startup, presetAmount) =>
    set({
      isOpen: true,
      step: "details",
      startup,
      form: {
        ...defaultForm,
        amount: presetAmount ?? startup.minimumInvestment,
      },
      agreedToTerms: false,
      paymentMethod: "upi",
      paymentPhase: "idle",
      result: null,
      portfolioSaved: null,
      portfolioError: null,
    }),
  close: () =>
    set({
      isOpen: false,
      step: "details",
      startup: null,
      form: defaultForm,
      agreedToTerms: false,
      paymentMethod: "upi",
      paymentPhase: "idle",
      result: null,
      portfolioSaved: null,
      portfolioError: null,
    }),
  setStep: (step) => set({ step }),
  patchForm: (patch) => set((state) => ({ form: { ...state.form, ...patch } })),
  setAgreedToTerms: (agreedToTerms) => set({ agreedToTerms }),
  setPaymentMethod: (paymentMethod) => set({ paymentMethod }),
  setPaymentPhase: (paymentPhase) => set({ paymentPhase }),
  setResult: (result) => set({ result }),
  setPortfolioSaved: (portfolioSaved, portfolioError = null) =>
    set({ portfolioSaved, portfolioError }),
  resetPayment: () => set({ paymentPhase: "idle" }),
}));
