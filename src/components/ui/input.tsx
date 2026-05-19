import * as React from "react";

import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-md border border-slate-200 px-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-[#387ED1] focus:ring-2 focus:ring-[#387ED1]/20",
        className
      )}
      {...props}
    />
  );
}
