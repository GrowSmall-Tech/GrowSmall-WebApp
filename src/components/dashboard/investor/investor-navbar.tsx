"use client";

import { Bell, ChevronDown, LogOut, Mail, Menu } from "lucide-react";
import { motion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

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
import { SearchBar } from "@/components/shared/search-bar";
import { getRoleFromUser } from "@/lib/auth/constants";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/auth-store";
import type { NotificationRow } from "@/types/database";

const tabs = [
  { label: "Explore", href: "/investor/startups" },
  { label: "Network", href: "/investor/network" },
  { label: "Activity", href: "/investor/activity" },
] as const;

export function InvestorNavbar({
  onOpenMobileMenu,
  notifications = [],
  onSearchChange,
}: {
  onOpenMobileMenu: () => void;
  notifications?: NotificationRow[];
  onSearchChange?: (value: string) => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const role = useAuthStore((s) => s.role) ?? getRoleFromUser(user) ?? "investor";
  const logout = useAuthStore((s) => s.logout);
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [marking, setMarking] = useState<string | null>(null);
  const initial = (user?.email ?? "I").charAt(0).toUpperCase();
  const displayName =
    (user?.user_metadata as { full_name?: string } | undefined)?.full_name ||
    user?.email?.split("@")[0] ||
    "Investor";

  async function onLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      setLoggingOut(false);
    }
  }

  async function markRead(id: string) {
    setMarking(id);
    try {
      await createClient().from("notifications").update({ is_read: true }).eq("id", id);
      router.refresh();
    } finally {
      setMarking(null);
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
      <div className="flex h-16 items-center gap-3 px-4 md:px-6">
        <Button
          variant="outline"
          size="sm"
          className="h-9 w-9 p-0 lg:hidden"
          onClick={onOpenMobileMenu}
          aria-label="Open menu"
        >
          <Menu className="h-4 w-4" />
        </Button>

        <p className="text-[27px] leading-none font-bold tracking-tight text-[#387ED1]">GrowSmall</p>

        <SearchBar
          placeholder="Search startups, sectors..."
          className="hidden max-w-xs md:block"
          onChange={onSearchChange}
        />

        <nav className="ml-2 hidden items-center gap-5 md:flex">
          {tabs.map((tab) => (
            <button
              key={tab.label}
              type="button"
              onClick={() => router.push(tab.href)}
              className={
                pathname === tab.href
                  ? "border-b-2 border-[#387ED1] pb-1 text-sm font-semibold text-[#387ED1]"
                  : "pb-1 text-sm text-slate-500 transition-colors hover:text-slate-800"
              }
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <span className="hidden rounded-full bg-[#387ED1]/10 px-2.5 py-1 text-xs font-semibold text-[#387ED1] md:inline-flex">
            {role}
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <motion.button
                whileHover={{ y: -1 }}
                type="button"
                className="relative rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              >
                <Bell className="h-4 w-4" />
                {notifications.some((n) => !n.is_read) ? (
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-rose-500" />
                ) : null}
              </motion.button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.length === 0 ? (
                <DropdownMenuItem disabled>No notifications yet</DropdownMenuItem>
              ) : (
                notifications.slice(0, 6).map((n) => (
                  <DropdownMenuItem
                    key={n.id}
                    className="block cursor-pointer"
                    onClick={() => void markRead(n.id)}
                    disabled={marking === n.id}
                  >
                    <p className="text-sm font-medium">{n.title}</p>
                    <p className="line-clamp-2 text-xs text-slate-500">{n.body}</p>
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          {[Mail].map((Icon, i) => (
            <motion.button
              key={i}
              whileHover={{ y: -1 }}
              type="button"
              className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            >
              <Icon className="h-4 w-4" />
            </motion.button>
          ))}
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
      <div className="px-4 pb-3 md:hidden">
        <SearchBar placeholder="Search startups, sectors..." onChange={onSearchChange} />
      </div>
      <ConfirmLogoutDialog
        open={logoutDialogOpen}
        onOpenChange={setLogoutDialogOpen}
        onConfirm={onLogout}
        loading={loggingOut}
      />
    </header>
  );
}
