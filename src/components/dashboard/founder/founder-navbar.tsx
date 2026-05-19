"use client";

import { Bell, ChevronDown, LogOut, Mail, Menu } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmLogoutDialog } from "@/components/shared/confirm-logout-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { founderTopNav } from "@/config/founder-workspace";
import { getRoleFromUser } from "@/lib/auth/constants";
import { useAuthStore } from "@/store/auth-store";
import { cn } from "@/lib/utils";

import { FounderSidebar } from "./founder-sidebar";

export function FounderNavbar() {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const user = useAuthStore((s) => s.user);
  const role = useAuthStore((s) => s.role) ?? getRoleFromUser(user) ?? "founder";
  const logout = useAuthStore((s) => s.logout);
  const initial = (user?.email ?? "F").charAt(0).toUpperCase();
  const displayName =
    (user?.user_metadata as { full_name?: string } | undefined)?.full_name ||
    user?.email?.split("@")[0] ||
    "Founder";

  async function onLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="lg:hidden"
              onClick={() => setDrawerOpen((prev) => !prev)}
            >
              <Menu className="h-4 w-4" />
            </Button>
            <nav className="flex items-center gap-5">
              {founderTopNav.map((item) => {
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "border-b-2 pb-1.5 text-sm font-medium",
                      active
                        ? "border-[#387ED1] text-[#387ED1]"
                        : "border-transparent text-slate-500 hover:text-slate-800",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="rounded-full border-none bg-[#387ED1]/10 px-3 py-1 text-xs font-semibold text-[#387ED1] uppercase">
              {role}
            </Badge>
            <button type="button" className="text-slate-500 hover:text-slate-800" aria-label="Notifications">
              <Bell className="h-4 w-4" />
            </button>
            <button type="button" className="text-slate-500 hover:text-slate-800" aria-label="Messages">
              <Mail className="h-4 w-4" />
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-1 py-1 pr-2 transition hover:border-slate-300 hover:bg-slate-50"
                  aria-label="Open account menu"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
                    {initial}
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl p-1.5">
                <DropdownMenuLabel className="space-y-0.5">
                  <p className="truncate text-sm font-semibold text-slate-800">{displayName}</p>
                  <p className="truncate text-xs font-normal text-slate-500">{user?.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer rounded-lg text-rose-600 focus:bg-rose-50 focus:text-rose-700"
                  onClick={() => setLogoutDialogOpen(true)}
                  disabled={loggingOut}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      {drawerOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-b border-slate-200 lg:hidden">
          <FounderSidebar mobile />
        </motion.div>
      )}
      <ConfirmLogoutDialog
        open={logoutDialogOpen}
        onOpenChange={setLogoutDialogOpen}
        onConfirm={onLogout}
        loading={loggingOut}
      />
    </>
  );
}
