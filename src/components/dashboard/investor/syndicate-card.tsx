"use client";

import { motion } from "framer-motion";
import { Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { InvestorSyndicate } from "@/types/investor-dashboard";

export function SyndicateCard({ data }: { data: InvestorSyndicate }) {
  return (
    <Card className="rounded-2xl border-0 bg-[#0B5CB3] p-5 text-white shadow-none">
      <Users className="h-5 w-5 text-white/90" />
      <h4 className="mt-3 text-[30px] leading-tight font-semibold">{data.title}</h4>
      <p className="mt-2 text-sm text-white/80">{data.description}</p>
      <motion.div whileHover={{ y: -1 }} className="mt-4">
        <Button className="h-10 w-full rounded-lg bg-white text-[#0B5CB3] hover:bg-slate-100">
          {data.ctaLabel}
        </Button>
      </motion.div>
    </Card>
  );
}
