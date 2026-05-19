"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";

export function FloatingSubmitButton() {
  return (
    <motion.div
      className="pointer-events-none fixed bottom-8 right-4 z-50 md:right-8"
      initial={{ opacity: 0, scale: 0.9, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }}>
        <Link
          href="/founder/pitch"
          className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-[#387ED1] px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_40px_rgba(56,126,209,0.45)] ring-8 ring-white/60 transition-colors hover:bg-[#2f6eb8]"
        >
          <Plus className="h-5 w-5 shrink-0" strokeWidth={2.5} />
          Submit Startup
        </Link>
      </motion.div>
    </motion.div>
  );
}
