import { cn } from "@/lib/utils";

export function Badge({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-[#387ED1]/10 px-2.5 py-1 text-xs font-medium text-[#387ED1]",
        className
      )}
    >
      {children}
    </span>
  );
}
