"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { motion } from "framer-motion";

import { InvestorNavbar } from "@/components/dashboard/investor/investor-navbar";
import { InvestorSidebar } from "@/components/dashboard/investor/investor-sidebar";
import type { NotificationRow } from "@/types/database";

export function InvestorPageShell({
  children,
  notifications = [],
}: {
  children: ReactNode;
  notifications?: NotificationRow[];
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <div className="flex">
        <InvestorSidebar />
        <div className="min-w-0 flex-1">
          <InvestorNavbar
            onOpenMobileMenu={() => setMobileMenuOpen(true)}
            notifications={notifications}
          />
          {mobileMenuOpen ? (
            <div
              className="fixed inset-0 z-50 bg-slate-900/25 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            >
              <motion.aside
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                onClick={(e) => e.stopPropagation()}
                className="h-full w-72 bg-white p-5"
              >
                <InvestorSidebar mobile />
              </motion.aside>
            </div>
          ) : null}
          <main className="px-4 py-6 pb-24 md:px-6 lg:pb-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
