"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Bookmark } from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { InvestorFeaturedStartup } from "@/types/investor-dashboard";

export function FeaturedStartupCard({
  startup,
  onToggleSave,
}: {
  startup: InvestorFeaturedStartup;
  onToggleSave?: (startupId: string) => void;
}) {
  const router = useRouter();

  const openDetails = () => {
    router.push(`/startup/${startup.slug}`);
  };

  return (
    <Card
      className="cursor-pointer overflow-hidden rounded-2xl border-slate-200 shadow-[0_8px_24px_rgba(15,23,42,0.06)]"
      role="button"
      tabIndex={0}
      onClick={openDetails}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openDetails();
        }
      }}
    >
      <div className="grid md:grid-cols-[1.1fr_1fr]">
        <Link href={`/startup/${startup.slug}`} className="block">
          <Image
            src={startup.image}
            alt={startup.name}
            className="h-60 w-full object-cover md:h-full"
            width={920}
            height={480}
          />
        </Link>
        <div className="space-y-3 p-5">
          <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
            {startup.category} • {startup.stage}
          </p>
          <h3 className="text-[34px] leading-tight font-semibold text-slate-900">{startup.name}</h3>
          <p className="text-sm leading-relaxed text-slate-600">{startup.description}</p>
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <p className="text-[11px] tracking-wide text-slate-500 uppercase">Seeking</p>
              <p className="text-[28px] font-semibold text-[#387ED1]">{startup.seekingAmount}</p>
            </div>
            <div>
              <p className="text-[11px] tracking-wide text-slate-500 uppercase">Equity Offered</p>
              <p className="text-[28px] font-semibold text-slate-900">{startup.equityOffered}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 pt-2">
            <motion.div whileHover={{ y: -1 }}>
              <Button className="rounded-xl px-6" asChild>
                <Link href={`/startup/${startup.slug}`}>View Details</Link>
              </Button>
            </motion.div>
            <Button
              variant="outline"
              className="h-10 w-10 rounded-xl p-0"
              onClick={(event) => {
                event.stopPropagation();
                onToggleSave?.(startup.id);
              }}
            >
              <Bookmark className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
