"use client";

import type { ComponentProps } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useInvestorCheckoutStore } from "@/store/investor-checkout-store";
import type { InvestorCheckoutStartup } from "@/types/investor-checkout";

type InvestNowButtonProps = ComponentProps<typeof Button> & {
  startup: InvestorCheckoutStartup;
  presetAmount?: number;
};

export function InvestNowButton({
  startup,
  presetAmount,
  className,
  children = "Invest Now",
  onClick,
  ...props
}: InvestNowButtonProps) {
  const open = useInvestorCheckoutStore((s) => s.open);

  return (
    <Button
      className={cn(className)}
      onClick={(e) => {
        onClick?.(e);
        open(startup, presetAmount);
      }}
      {...props}
    >
      {children}
    </Button>
  );
}
