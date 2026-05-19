import { cn } from "@/lib/utils";

export function Progress({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn("h-2 w-full rounded-full bg-slate-100", className)}>
      <div
        className="h-full rounded-full bg-[#387ED1] transition-all"
        style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
      />
    </div>
  );
}
