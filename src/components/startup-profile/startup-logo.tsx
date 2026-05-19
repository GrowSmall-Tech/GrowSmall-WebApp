import Image from "next/image";
import { Leaf } from "lucide-react";

import { cn } from "@/lib/utils";

export function StartupProfileLogo({
  className,
  logoUrl,
  name,
}: {
  className?: string;
  logoUrl?: string | null;
  name?: string;
}) {
  if (logoUrl) {
    return (
      <div
        className={cn(
          "relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white text-white shadow-sm",
          className,
        )}
      >
        <Image src={logoUrl} alt={`${name ?? "Startup"} logo`} fill className="object-cover" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#387ED1] text-white shadow-sm",
        className,
      )}
    >
      <Leaf className="h-7 w-7" strokeWidth={1.75} aria-hidden />
    </div>
  );
}
