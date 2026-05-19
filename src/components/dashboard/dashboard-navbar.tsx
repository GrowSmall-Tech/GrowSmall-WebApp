"use client";

import Link from "next/link";
import { LogOut, Menu } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { ConfirmLogoutDialog } from "@/components/shared/confirm-logout-dialog";
import type { UserRole } from "@/lib/auth/constants";
import { roleDashboardPath } from "@/lib/auth/constants";
import { useAuthStore } from "@/store/auth-store";
import { cn } from "@/lib/utils";

import { DashboardSidebar } from "./dashboard-sidebar";

export function DashboardNavbar({ role }: { role: UserRole }) {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [open, setOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function onLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      setLoggingOut(false);
    }
  }

  const display =
    (user?.user_metadata as { full_name?: string } | undefined)?.full_name ||
    user?.email?.split("@")[0] ||
    "Account";

  const dashboardHref = roleDashboardPath(role);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 w-full max-w-[1400px] items-center justify-between gap-4 px-4 sm:h-16 sm:px-6">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 w-9 p-0 md:hidden"
              onClick={() => setOpen((x) => !x)}
              aria-label="Toggle menu"
            >
              <Menu className="h-4 w-4" />
            </Button>
            <Link
              href={dashboardHref}
              className="text-lg font-bold tracking-tight text-[#387ED1]"
            >
              GrowSmall
            </Link>
            <span className="hidden rounded-full bg-slate-100 px-3 py-0.5 text-[11px] font-semibold text-slate-600 capitalize sm:inline">
              {role}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <span className="hidden max-w-[200px] truncate text-sm font-medium text-slate-700 sm:inline">
              {display}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setLogoutDialogOpen(true)}
              className="gap-2 text-slate-600"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>

        {/* Mobile drawer */}
        <div className={cn("border-t border-slate-100 md:hidden", open ? "block" : "hidden")}>
          <div className="bg-white px-2 py-4">
            <DashboardSidebar role={role} embedded />
          </div>
        </div>
      </header>
      <ConfirmLogoutDialog
        open={logoutDialogOpen}
        onOpenChange={setLogoutDialogOpen}
        onConfirm={onLogout}
        loading={loggingOut}
      />
    </>
  );
}
