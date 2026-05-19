"use client";

import type { ReactNode } from "react";

import { InvestorCheckoutModal } from "./investor-checkout-modal";

export function StartupCheckoutShell({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <InvestorCheckoutModal />
    </>
  );
}
