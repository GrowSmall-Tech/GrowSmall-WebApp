"use client";

import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function SearchBar({
  placeholder,
  className,
  onChange,
}: {
  placeholder: string;
  className?: string;
  onChange?: (value: string) => void;
}) {
  return (
    <div className={cn("relative w-full", className)}>
      <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <Input
        placeholder={placeholder}
        className="h-9 rounded-lg pl-9"
        onChange={(e) => onChange?.(e.target.value)}
      />
    </div>
  );
}
