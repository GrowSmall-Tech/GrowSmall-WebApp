"use client";

import { useRouter } from "next/navigation";
import { Bell, LogOut, Mail, Menu, MessageCircle, Search } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { ConfirmLogoutDialog } from "@/components/shared/confirm-logout-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

export function AdminNavbar({ onMenu }: { onMenu?: () => void }) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  async function logout() {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      setLogoutDialogOpen(false);
      router.push("/admin/login");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-slate-200 bg-white px-4 lg:px-6">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="lg:hidden"
        onClick={onMenu}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5 text-slate-600" />
      </Button>
      <div className="relative max-w-xl flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          readOnly
          placeholder="Search startups, investors or users..."
          className="h-10 rounded-full border-slate-200 bg-slate-50 pl-10 text-sm"
        />
      </div>
      <div className="flex items-center gap-1 sm:gap-2">
        <Button variant="ghost" size="sm" className="relative h-10 w-10 p-0" aria-label="Notifications">
          <Bell className="h-5 w-5 text-slate-600" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#387ED1]" />
        </Button>
        <Button variant="ghost" size="sm" className="h-10 w-10 p-0" aria-label="Messages">
          <MessageCircle className="h-5 w-5 text-slate-600" />
        </Button>
        <Button variant="ghost" size="sm" className="hidden h-10 w-10 p-0 sm:flex" aria-label="Mail">
          <Mail className="h-5 w-5 text-slate-600" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="ml-1 flex items-center gap-3 border-l border-slate-200 pl-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-[#387ED1]/40"
            >
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium text-slate-900">Admin User</p>
                <p className="text-xs text-slate-500">Super Admin</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#387ED1]/15 text-sm font-semibold text-[#387ED1]">
                A
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem asChild>
              <a href="/admin/settings">Settings</a>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="gap-2 text-red-600 focus:text-red-600"
              onSelect={(e) => {
                e.preventDefault();
                setLogoutDialogOpen(true);
              }}
            >
              <LogOut className="h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <ConfirmLogoutDialog
        open={logoutDialogOpen}
        onOpenChange={setLogoutDialogOpen}
        onConfirm={logout}
        loading={loggingOut}
      />
    </header>
  );
}
