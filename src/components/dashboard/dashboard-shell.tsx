"use client";

import type { ReactNode } from "react";

import type { UserRole } from "@/lib/auth/constants";

import { DashboardNavbar } from "./dashboard-navbar";
import { DashboardSidebar } from "./dashboard-sidebar";

export function DashboardShell({
  role,
  children,
}: {
  role: UserRole;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#fafbfc]">
      <DashboardNavbar role={role} />
      <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6 px-4 py-8 sm:px-6 md:flex-row md:items-start">
        <DashboardSidebar role={role} />
        <main className="min-w-0 flex-1 space-y-8">{children}</main>
      </div>
    </div>
  );
}
