"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function RoleCard({
  title,
  description,
  href,
  actionLabel,
  icon: Icon,
  delay = 0,
}: {
  title: string;
  description: string;
  href: string;
  actionLabel: string;
  icon: LucideIcon;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      whileHover={{ y: -4 }}
      className="h-full"
    >
      <Card
        className={cn(
          "h-full border-slate-200/90 shadow-[0_8px_30px_-12px_rgba(56,126,209,0.25)] transition-shadow hover:shadow-[0_14px_40px_-14px_rgba(56,126,209,0.35)]",
        )}
      >
        <CardHeader className="space-y-3 pb-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#387ED1]/10 text-[#387ED1]">
            <Icon className="h-5 w-5" aria-hidden />
          </div>
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <p className="text-sm leading-relaxed text-slate-600">{description}</p>
        </CardHeader>
        <CardContent className="pt-2">
          <Button asChild className="w-full rounded-lg py-6 text-base">
            <Link href={href}>{actionLabel}</Link>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
