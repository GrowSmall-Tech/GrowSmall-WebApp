"use client";

import type { ReactNode } from "react";

import { FounderNavbar } from "./founder-navbar";
import { FounderSidebar } from "./founder-sidebar";

export function FounderWorkspaceShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <div className="lg:flex">
        <div className="hidden lg:block">
          <FounderSidebar />
        </div>
        <div className="min-w-0 flex-1">
          <FounderNavbar />
          <main className="px-4 py-8 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
