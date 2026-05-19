"use client";

import { Input } from "@/components/ui/input";

interface CurrencyInputProps {
  id: string;
  label: string;
  placeholder?: string;
  value: number;
  error?: string;
  onChange: (value: number) => void;
  onBlur?: () => void;
}

function formatIndianCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(value);
}

export function CurrencyInput({
  id,
  label,
  placeholder = "0",
  value,
  error,
  onChange,
  onBlur,
}: CurrencyInputProps) {
  const displayValue = value ? formatIndianCurrency(value) : "";

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
          ₹
        </span>
        <Input
          id={id}
          inputMode="numeric"
          value={displayValue}
          onBlur={onBlur}
          onChange={(event) => {
            const clean = event.target.value.replaceAll(",", "").replace(/[^\d-]/g, "");
            onChange(clean === "" || clean === "-" ? 0 : Number(clean));
          }}
          placeholder={placeholder}
          className="h-11 rounded-xl border-slate-200 bg-slate-50 pl-8"
        />
      </div>
      {error ? <p className="text-xs text-red-500">{error}</p> : null}
    </div>
  );
}
