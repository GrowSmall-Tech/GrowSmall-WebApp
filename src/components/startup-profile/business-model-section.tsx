"use client";

import { motion } from "framer-motion";
import { type LucideIcon, Layers, Snowflake, Sparkles } from "lucide-react";

import { FadeInSection } from "@/components/startup-profile/fade-in";
import type { StartupProfile } from "@/types/startup-profile";

import { cn } from "@/lib/utils";

const icons: Record<StartupProfile["businessModel"][number]["icon"], LucideIcon> = {
  marketplace: Snowflake,
  layers: Layers,
  sparkles: Sparkles,
};

export function BusinessModelSection({ items }: { items: StartupProfile["businessModel"] }) {
  return (
    <FadeInSection>
      <div className="space-y-4">
        {items.map((item, i) => {
          const Icon = icons[item.icon];
          return (
            <motion.div
              key={item.title}
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2, delay: i * 0.02 }}
              className="flex gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.05)] sm:p-6"
            >
              <div
                className={cn(
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
                  "bg-[#387ED1]/10 text-[#387ED1]",
                )}
              >
                <Icon className="h-5 w-5" strokeWidth={2} aria-hidden />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.description}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </FadeInSection>
  );
}
