import type { ReactNode } from "react";

export function ChartCard({
  title,
  rightSlot,
  children,
}: {
  title: string;
  rightSlot?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.06)] sm:p-7">
      <div className="mb-4 flex items-start justify-between gap-3">
        <h3 className="text-base font-semibold tracking-tight text-slate-900">{title}</h3>
        {rightSlot ? <div className="shrink-0">{rightSlot}</div> : null}
      </div>
      {children}
    </div>
  );
}
