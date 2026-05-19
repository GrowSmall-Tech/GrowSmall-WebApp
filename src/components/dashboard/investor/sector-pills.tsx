"use client";

import { motion } from "framer-motion";
import { Car, GraduationCap, Landmark, Leaf, Sprout } from "lucide-react";

import type { InvestorSector } from "@/types/investor-dashboard";

const iconMap = {
  car: Car,
  sprout: Sprout,
  "graduation-cap": GraduationCap,
  leaf: Leaf,
  landmark: Landmark,
} as const;

export function SectorPills({ sectors }: { sectors: InvestorSector[] }) {
  return (
    <div className="flex flex-wrap gap-3">
      {sectors.map((sector) => {
        const Icon = iconMap[sector.icon];
        return (
          <motion.button
            key={sector.id}
            whileHover={{ y: -2 }}
            type="button"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-[#387ED1]/30 hover:text-[#387ED1]"
          >
            <Icon className="h-4 w-4" />
            {sector.label}
          </motion.button>
        );
      })}
    </div>
  );
}
