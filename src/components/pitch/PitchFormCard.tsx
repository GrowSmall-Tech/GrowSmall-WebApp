import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function PitchFormCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_12px_40px_rgba(15,23,42,0.06)] sm:p-8",
        className,
      )}
    >
      {children}
    </section>
  );
}
