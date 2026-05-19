"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Quote } from "lucide-react";

const TESTIMONIALS = [
  {
    quote: "GrowSmall made angel investing feel as smooth as my brokerage app.",
    author: "Priya M.",
    role: "Angel Investor, Bangalore",
  },
  {
    quote: "Transparent terms and escrow protection gave me confidence to commit.",
    author: "Rahul K.",
    role: "Family Office, Mumbai",
  },
  {
    quote: "The review step breakdown is clearer than most platforms I've used.",
    author: "Ananya S.",
    role: "LP, Delhi NCR",
  },
];

export function TestimonialsSlider() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % TESTIMONIALS.length), 5000);
    return () => clearInterval(t);
  }, []);

  const item = TESTIMONIALS[index];

  return (
    <motion.div
      className="rounded-xl border border-slate-100 bg-slate-50/80 p-4"
      layout
    >
      <Quote className="mb-2 h-4 w-4 text-[#387ED1]/60" aria-hidden />
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -8 }}
          transition={{ duration: 0.25 }}
        >
          <p className="text-sm leading-relaxed text-slate-600">&ldquo;{item.quote}&rdquo;</p>
          <p className="mt-2 text-xs font-semibold text-slate-800">{item.author}</p>
          <p className="text-[11px] text-slate-500">{item.role}</p>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
