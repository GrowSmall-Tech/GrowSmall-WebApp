"use client";

import type { ComponentProps } from "react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { checkInvestorCanInvestAction } from "@/lib/actions/check-investor-approval";
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
  const router = useRouter();
  const open = useInvestorCheckoutStore((s) => s.open);
  const [pending, startTransition] = useTransition();

  return (
    <Button
      {...props}
      className={cn(className)}
      disabled={pending || props.disabled}
      onClick={(e) => {
        onClick?.(e);
        startTransition(async () => {
          const gate = await checkInvestorCanInvestAction();
          if (!gate.allowed) {
            if (gate.message) toast.error(gate.message);
            if (gate.redirectTo) router.push(gate.redirectTo);
            return;
          }
          open(startup, presetAmount);
        });
      }}
      {...props}
    >
      {pending ? "Checking access…" : children}
    </Button>
  );
}
