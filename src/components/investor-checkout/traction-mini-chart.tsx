"use client";

import { motion } from "framer-motion";
import { Area, AreaChart, ResponsiveContainer } from "recharts";

export function TractionMiniChart({
  data,
}: {
  data: { label: string; value: number }[];
}) {
  if (!data.length) return null;

  return (
    <motion.div
      className="rounded-xl border border-slate-100 bg-white p-3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
        Revenue traction
      </p>
      <motion.div
        className="h-[72px] w-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="checkoutChartFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#387ED1" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#387ED1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="value"
              stroke="#387ED1"
              strokeWidth={2}
              fill="url(#checkoutChartFill)"
              dot={false}
              isAnimationActive
            />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>
    </motion.div>
  );
}
