"use client";

import type { FieldError } from "react-hook-form";

import { cn } from "@/lib/utils";

interface ExecutiveSummaryFieldProps {
  value: string;
  maxLength: number;
  error?: FieldError;
  onChange: (value: string) => void;
}

export function ExecutiveSummaryField({
  value,
  maxLength,
  error,
  onChange,
}: ExecutiveSummaryFieldProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-800">Executive Summary (280 characters)</label>
      <textarea
        value={value}
        maxLength={maxLength}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Briefly describe the problem you are solving and your unique value proposition..."
        className={cn(
          "min-h-32 w-full resize-none rounded-xl border px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400",
          error
            ? "border-rose-300 focus:ring-2 focus:ring-rose-200"
            : "border-slate-200 bg-slate-50/60 focus:border-[#387ED1] focus:ring-2 focus:ring-[#387ED1]/20",
        )}
      />
      <div className="flex items-center justify-between">
        <p className="text-xs text-rose-500">{error?.message ?? ""}</p>
        <p className="text-xs text-slate-500">
          {value.length} / {maxLength}
        </p>
      </div>
    </div>
  );
}
