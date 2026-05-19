"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import {
  FileText,
  LayoutDashboard,
  LogOut,
  Rocket,
  Settings,
  Wallet,
  UserPlus,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { ConfirmLogoutDialog } from "@/components/shared/confirm-logout-dialog";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/auth-store";

const menuItems = [
  { label: "Dashboard", href: "/investor/dashboard", icon: LayoutDashboard },
  { label: "Investments", href: "/investor/investments", icon: Wallet },
  { label: "Startups", href: "/investor/startups", icon: Rocket },
  { label: "Documents", href: "/investor/documents", icon: FileText },
  { label: "Settings", href: "/investor/settings", icon: Settings },
];

export function InvestorSidebar({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);

  async function onLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      setLoggingOut(false);
    }
  }

  async function onInviteFounder() {
    if (!user?.id || !inviteEmail.trim()) return;
    setInviteLoading(true);
    try {
      const supabase = createClient();
      await supabase.from("invitations").insert({
        inviter_id: user.id,
        invitee_email: inviteEmail.trim().toLowerCase(),
        status: "pending",
      });
      await supabase.from("notifications").insert({
        user_id: user.id,
        title: "Founder invite created",
        body: `Invite sent to ${inviteEmail.trim()}`,
        type: "system",
      });
      setInviteEmail("");
      setInviteOpen(false);
      router.refresh();
    } finally {
      setInviteLoading(false);
    }
  }

  return (
    <aside
      className={cn(
        "w-[220px] shrink-0 border-r border-slate-200 bg-white px-4 py-5",
        mobile ? "block h-full" : "hidden lg:block",
      )}
    >
      <div className="space-y-1">
        <p className="text-[28px] leading-none font-bold tracking-tight text-[#387ED1]">GrowSmall</p>
        <p className="text-xs font-medium text-slate-500">Investor Mode</p>
      </div>

      <div className="mt-8 flex h-[calc(100%-5rem)] flex-col">
        <nav className="space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                pathname === item.href
                  ? "bg-[#387ED1]/12 text-[#387ED1]"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
        </nav>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-auto space-y-2"
        >
          <Button
            variant="outline"
            className="h-10 w-full justify-start rounded-xl"
            onClick={() => setLogoutDialogOpen(true)}
            disabled={loggingOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </Button>
          <Button
            variant="default"
            className="h-10 w-full justify-start rounded-xl"
            onClick={() => setInviteOpen(true)}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Invite Founder
          </Button>
        </motion.div>
      </div>
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Founder</DialogTitle>
          </DialogHeader>
          <Input
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            type="email"
            placeholder="founder@startup.com"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => void onInviteFounder()} disabled={inviteLoading}>
              {inviteLoading ? "Sending..." : "Send Invite"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <ConfirmLogoutDialog
        open={logoutDialogOpen}
        onOpenChange={setLogoutDialogOpen}
        onConfirm={onLogout}
        loading={loggingOut}
      />
    </aside>
  );
}
