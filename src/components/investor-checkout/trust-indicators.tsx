"use client";

import { FileCheck, Lock, ShieldCheck } from "lucide-react";

const ITEMS = [
  { icon: FileCheck, label: "SEBI Compliant Documentation Ready" },
  { icon: Lock, label: "Escrow Protected Investment" },
  { icon: ShieldCheck, label: "KYC Verified Startup" },
] as const;

export function TrustIndicators({ compact }: { compact?: boolean }) {
  return (
    <ul className={compact ? "space-y-2" : "grid gap-2 sm:grid-cols-1"}>
      {ITEMS.map(({ icon: Icon, label }) => (
        <li
          key={label}
          className="flex items-start gap-2.5 rounded-xl border border-[#387ED1]/10 bg-[#387ED1]/[0.04] px-3 py-2.5 text-xs text-slate-600"
        >
          <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#387ED1]" aria-hidden />
          <span className="leading-snug">{label}</span>
        </li>
      ))}
    </ul>
  );
}
