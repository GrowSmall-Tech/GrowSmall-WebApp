"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Bookmark, BookmarkCheck } from "lucide-react";

import { Card } from "@/components/ui/card";
import type { InvestorStartupCard } from "@/types/investor-dashboard";

export function StartupCard({
  startup,
  onToggleSave,
}: {
  startup: InvestorStartupCard;
  onToggleSave?: (startupId: string) => void;
}) {
  const router = useRouter();

  const openDetails = () => {
    router.push(`/startup/${startup.slug}`);
  };

  return (
    <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
      <Card
        className="cursor-pointer overflow-hidden rounded-2xl border-slate-200 shadow-sm"
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
        <div className="block">
          <Image
            src={startup.image}
            alt={startup.name}
            className="h-36 w-full object-cover"
            width={640}
            height={240}
          />
        </div>
        <div className="space-y-2 p-4">
          <div className="flex items-start justify-between">
            <p className="text-[11px] font-semibold tracking-wide text-[#387ED1] uppercase">
              {startup.industry}
            </p>
            <button
              type="button"
              className="rounded-md p-1 text-slate-400 hover:bg-slate-100"
              onClick={(event) => {
                event.stopPropagation();
                onToggleSave?.(startup.id);
              }}
              aria-label={startup.isSaved ? "Unsave startup" : "Save startup"}
            >
              {startup.isSaved ? (
                <BookmarkCheck className="h-4 w-4 text-[#387ED1]" />
              ) : (
                <Bookmark className="h-4 w-4" />
              )}
            </button>
          </div>
          <h3 className="text-[30px] leading-tight font-semibold text-slate-900">{startup.name}</h3>
          <p className="line-clamp-2 text-sm text-slate-600">{startup.description}</p>
          <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-sm">
            <p className="font-semibold text-slate-800">{startup.target} Target</p>
            <p className="font-semibold text-emerald-600">{startup.raisedPercent}</p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
