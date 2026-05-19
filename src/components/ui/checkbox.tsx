"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type Checked = boolean | "indeterminate";

export function Checkbox({
  className,
  checked,
  onCheckedChange,
  ...props
}: Omit<React.ComponentProps<"input">, "type" | "checked" | "onChange"> & {
  checked?: Checked;
  onCheckedChange?: (checked: boolean) => void;
}) {
  const isIndeterminate = checked === "indeterminate";
  return (
    <input
      type="checkbox"
      className={cn(
        "mt-1 h-4 w-4 shrink-0 rounded border border-slate-300 accent-[#387ED1] outline-none transition focus-visible:ring-2 focus-visible:ring-[#387ED1]/35",
        className,
      )}
      checked={isIndeterminate ? false : !!checked}
      ref={(el) => {
        if (el) el.indeterminate = isIndeterminate;
      }}
      onChange={(e) => onCheckedChange?.(e.target.checked)}
      {...props}
    />
  );
}
