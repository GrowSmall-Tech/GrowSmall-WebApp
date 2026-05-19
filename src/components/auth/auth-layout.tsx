import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type AuthLayoutVariant = "center" | "split";

export function AuthLayout({
  variant = "center",
  leftPanel,
  children,
  className,
  /** Max width for centered auth shells (login, select-role, forgot password). */
  contentMaxClassName = "max-w-md",
}: {
  variant?: AuthLayoutVariant;
  leftPanel?: ReactNode;
  children: ReactNode;
  className?: string;
  contentMaxClassName?: string;
}) {
  if (variant === "split" && leftPanel) {
    return (
      <div
        className={cn(
          "min-h-screen bg-white lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]",
          className,
        )}
      >
        <div className="relative hidden overflow-hidden lg:block">{leftPanel}</div>
        <div className="flex min-h-screen flex-col justify-center px-4 py-10 sm:px-8 lg:px-12">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex min-h-screen flex-col items-center justify-center bg-white px-4 py-12",
        className,
      )}
    >
      <div className={cn("w-full", contentMaxClassName)}>{children}</div>
    </div>
  );
}

export function AuthBrandHeading({ subtitle }: { subtitle?: boolean }) {
  return (
    <div className="mb-8 text-center">
      <Link
        href="/"
        className="text-2xl font-bold tracking-tight text-[#387ED1] transition hover:text-[#2f6eb8]"
      >
        GrowSmall
      </Link>
      {subtitle ? (
        <p className="mt-2 text-sm text-slate-500">
          Precision clarity in capital growth.
        </p>
      ) : null}
    </div>
  );
}
