"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users } from "lucide-react";

export function LiveInvestorsBadge({ seed }: { seed: string }) {
  const base = 8 + (seed.charCodeAt(0) % 9);
  const [count, setCount] = useState(base);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount((c) => (Math.random() > 0.7 ? c + 1 : c));
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      className="flex items-center gap-2 rounded-full border border-emerald-200/80 bg-emerald-50/90 px-3 py-1.5 text-xs font-medium text-emerald-800"
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
      </span>
      <Users className="h-3.5 w-3.5" aria-hidden />
      <span>
        <strong>{count}</strong> investors in last 24h
      </span>
    </motion.div>
  );
}
