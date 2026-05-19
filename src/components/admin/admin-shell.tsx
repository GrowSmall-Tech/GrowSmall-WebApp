"use client";

import { useState } from "react";

import { AdminNavbar } from "@/components/admin/admin-navbar";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [mobileNav, setMobileNav] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      <AdminSidebar
        mobileOpen={mobileNav}
        onNavigate={() => setMobileNav(false)}
      />
      {mobileNav ? (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          aria-label="Close menu"
          onClick={() => setMobileNav(false)}
        />
      ) : null}
      <div className="lg:pl-64">
        <AdminNavbar onMenu={() => setMobileNav(true)} />
        <main className="min-h-[calc(100vh-4rem)] p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
