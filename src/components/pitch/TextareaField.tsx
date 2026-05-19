"use client";

import { useRef } from "react";

import { cn } from "@/lib/utils";

interface TextareaFieldProps {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  maxLength: number;
  error?: string;
  onBlur?: () => void;
  onChange: (value: string) => void;
}

export function TextareaField({
  id,
  label,
  placeholder,
  value,
  maxLength,
  error,
  onBlur,
  onChange,
}: TextareaFieldProps) {
  const ref = useRef<HTMLTextAreaElement>(null);

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      <textarea
        ref={ref}
        id={id}
        value={value}
        onBlur={onBlur}
        onChange={(event) => {
          onChange(event.target.value);
          if (!ref.current) return;
          ref.current.style.height = "auto";
          ref.current.style.height = `${Math.max(ref.current.scrollHeight, 120)}px`;
        }}
        placeholder={placeholder}
        maxLength={maxLength}
        className={cn(
          "w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#387ED1] focus:ring-2 focus:ring-[#387ED1]/20",
          error ? "border-red-300 focus:border-red-400 focus:ring-red-100" : "",
        )}
      />
      <div className="flex items-center justify-between">
        {error ? <p className="text-xs text-red-500">{error}</p> : <span />}
        <p className="text-xs text-slate-400">
          {value.length}/{maxLength}
        </p>
      </div>
    </div>
  );
}
