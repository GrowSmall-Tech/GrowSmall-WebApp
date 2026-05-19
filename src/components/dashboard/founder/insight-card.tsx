"use client";

import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { founderInsights } from "@/config/founder-workspace";

export function InsightCard() {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="rounded-2xl bg-[#0d63be] p-5 text-white shadow-[0_18px_38px_-24px_rgba(13,99,190,0.9)]"
    >
      <p className="text-[11px] font-semibold tracking-[0.08em] uppercase text-white/85">
        {founderInsights.title}
      </p>
      <p className="mt-3 text-[28px] leading-[1.15]">↗</p>
      <p className="max-w-[18ch] text-xl leading-tight font-semibold">{founderInsights.message}</p>
      <Button
        type="button"
        variant="outline"
        className="mt-5 border-white/25 bg-white/10 text-white hover:bg-white/20 hover:text-white"
      >
        Learn More
      </Button>
    </motion.div>
  );
}
