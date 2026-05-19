"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { Flame } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { Startup } from "@/types";

export function FeaturedStartupCard({ startup }: { startup: Startup }) {
  const router = useRouter();
  return (
    <motion.div whileHover={{ y: -8 }} transition={{ duration: 0.2 }}>
      <Card
        onClick={() => router.push(`/startup/${startup.slug}`)}
        className="group h-full cursor-pointer overflow-hidden border-0 bg-linear-to-br from-slate-900 via-[#17487d] to-[#387ED1] text-white shadow-[0_20px_70px_rgba(24,56,92,0.5)]"
      >
        <div className="relative h-36 w-full">
          <Image
            src={`https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80&sig=${encodeURIComponent(startup.slug)}`}
            alt={startup.name}
            fill
            className="object-cover opacity-35 transition duration-300 group-hover:scale-105"
          />
        </div>
        <CardHeader className="space-y-3 pt-4">
          <div className="flex items-start justify-between gap-3 text-white">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Badge className="border border-white/30 bg-white/15 text-white">Featured</Badge>
                <Badge className="border border-orange-300/50 bg-orange-400/20 text-orange-100">
                  <Flame className="mr-1 h-3.5 w-3.5" />
                  Trending
                </Badge>
              </div>
              <h3 className="text-lg font-semibold">{startup.name}</h3>
              <p className="text-sm text-white/80">{startup.tagline}</p>
            </div>
            <Badge className="border border-white/30 bg-white/10 text-white">
              {startup.fundedPercent}% Funded
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="line-clamp-2 text-sm text-white/85">{startup.description}</p>
          <div className="space-y-2 text-xs text-white/80">
            <div className="flex justify-between"><span>Category</span><span>{startup.category}</span></div>
            <div className="flex justify-between"><span>Valuation</span><span>{startup.valuation}</span></div>
            <div className="flex justify-between"><span>Funding Ask</span><span>₹{startup.fundingAsk.toLocaleString("en-IN")}</span></div>
          </div>
          <Progress value={startup.fundedPercent} className="bg-white/20 [&>div]:bg-white" />
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              router.push(`/startup/${startup.slug}`);
            }}
            className="w-full rounded-xl border border-white/40 bg-white/15 py-2.5 text-sm font-semibold text-white transition hover:bg-white/25"
          >
            View Details
          </button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
