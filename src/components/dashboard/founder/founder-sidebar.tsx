"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  Landmark,
  LayoutDashboard,
  LogOut,
  Rocket,
  Settings,
  UserPlus2,
} from "lucide-react";
import { useState } from "react";
import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmLogoutDialog } from "@/components/shared/confirm-logout-dialog";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { founderSidebarLinks } from "@/config/founder-workspace";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import { inviteFounderByEmail } from "@/lib/actions/founder";

const iconMap = {
  "layout-dashboard": LayoutDashboard,
  rocket: Rocket,
  landmark: Landmark,
  "file-text": FileText,
  settings: Settings,
};

export function FounderSidebar({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname();
  const logout = useAuthStore((s) => s.logout);
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [isSwitchingRole, startSwitchingRole] = useTransition();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteMessage, setInviteMessage] = useState<string | null>(null);

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
    <aside
      className={cn(
        "w-full border-slate-200 bg-[#fcfdff] p-4",
        mobile ? "border-t lg:hidden" : "border-r lg:sticky lg:top-0 lg:h-screen lg:w-[280px] lg:shrink-0 lg:p-6",
      )}
    >
      <div className="flex h-full flex-col">
        <div>
          <Link href="/founder/dashboard" className="text-[34px] font-semibold tracking-tight text-[#387ED1]">
            GrowSmall
          </Link>
          <p className="mt-1 text-sm text-slate-500">Founder Workspace</p>
        </div>
        <nav className="mt-8 space-y-1">
          {founderSidebarLinks.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = iconMap[item.icon];
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                  active
                    ? "bg-[#387ED1]/10 text-[#387ED1]"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto space-y-4 pt-6">
          <Button
            type="button"
            variant="outline"
            className="w-full rounded-xl"
            onClick={() => setLogoutDialogOpen(true)}
            disabled={loggingOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </Button>
          <Card className="rounded-2xl border-slate-200 bg-slate-50 p-4 shadow-none">
            <p className="text-[11px] font-semibold tracking-[0.08em] text-slate-500 uppercase">
              Invite Founder
            </p>
            <p className="mt-2 text-sm text-slate-600">Grow the community and earn platform credits.</p>
            <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
              <DialogTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  className="mt-3 h-auto p-0 text-sm font-semibold text-[#387ED1]"
                >
                  Invite Now <UserPlus2 className="ml-1 h-3.5 w-3.5" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invite a founder</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  <Input
                    type="email"
                    value={inviteEmail}
                    onChange={(event) => setInviteEmail(event.target.value)}
                    placeholder="founder@email.com"
                  />
                  {inviteMessage ? <p className="text-xs text-slate-500">{inviteMessage}</p> : null}
                  <Button
                    className="w-full"
                    onClick={() => {
                      startSwitchingRole(async () => {
                        try {
                          await inviteFounderByEmail(inviteEmail);
                          setInviteMessage("Invite sent");
                          setInviteEmail("");
                        } catch (error) {
                          setInviteMessage(error instanceof Error ? error.message : "Failed");
                        }
                      });
                    }}
                    disabled={isSwitchingRole}
                  >
                    Send invite
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </Card>
        </div>
      </div>
      <ConfirmLogoutDialog
        open={logoutDialogOpen}
        onOpenChange={setLogoutDialogOpen}
        onConfirm={onLogout}
        loading={loggingOut}
      />
    </aside>
  );
}
