"use client";

import { motion } from "framer-motion";

const COLORS = ["#387ED1", "#60A5FA", "#34D399", "#FBBF24", "#A78BFA", "#F472B6"];

const particles = Array.from({ length: 48 }, (_, i) => ({
  id: i,
  color: COLORS[i % COLORS.length],
  x: (Math.random() - 0.5) * 320,
  y: -(80 + Math.random() * 200),
  rotate: Math.random() * 720 - 360,
  delay: Math.random() * 0.15,
  size: 6 + Math.random() * 6,
}));

export function ConfettiBurst({ active }: { active: boolean }) {
  if (!active) return null;

  return (
    <motion.div
      className="pointer-events-none absolute inset-0 z-50 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="absolute left-1/2 top-1/2 rounded-sm"
          style={{
            width: p.size,
            height: p.size * 0.6,
            backgroundColor: p.color,
          }}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
          animate={{
            x: p.x,
            y: p.y,
            opacity: [1, 1, 0],
            rotate: p.rotate,
          }}
          transition={{ duration: 1.4, delay: p.delay, ease: "easeOut" }}
        />
      ))}
    </motion.div>
  );
}
