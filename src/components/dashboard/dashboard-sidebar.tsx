"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  DollarSign,
  Heart,
  Settings,
  Layers,
  TrendingUp,
  MessageSquareText,
  BarChart4,
  FileText,
  LayoutDashboard,
} from "lucide-react";

import type { UserRole } from "@/lib/auth/constants";
import { cn } from "@/lib/utils";

const investorLinks = [
  { href: "/investor/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/explore", label: "Explore startups", icon: TrendingUp },
  { href: "/investor/saved", label: "Saved", icon: Heart },
  { href: "/investor/investments", label: "Investments", icon: DollarSign },
  { href: "/investor/settings", label: "Settings", icon: Settings },
];

const founderLinks = [
  { href: "/founder/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/founder/my-startup", label: "My startup", icon: Layers },
  { href: "/founder/pitch-details", label: "Pitch details", icon: FileText },
  { href: "/founder/analytics", label: "Analytics", icon: BarChart4 },
  { href: "/founder/messages", label: "Messages", icon: MessageSquareText },
  { href: "/founder/settings", label: "Settings", icon: Settings },
];

export function DashboardSidebar({
  role,
  embedded = false,
}: {
  role: UserRole;
  /** Visible in mobile drawer; desktop layout hides duplicate via `md`. */
  embedded?: boolean;
}) {
  const pathname = usePathname();
  const links = role === "investor" ? investorLinks : founderLinks;

  return (
    <aside
      className={cn(
        "w-full shrink-0",
        embedded ? "block" : "hidden md:block md:w-56 lg:w-64",
      )}
    >
      <div
        className={cn(
          "space-y-1 rounded-xl border border-slate-100 bg-white p-2 shadow-[0_8px_30px_-20px_rgba(15,23,42,0.18)]",
          embedded ? "" : "sticky top-[4.75rem]",
        )}
      >
        <p className="px-3 py-3 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
          Menu
        </p>
        <nav className="flex flex-col gap-0.5">
          {links.map((item) => {
            const active =
              item.href === "/explore"
                ? pathname.startsWith("/explore")
                : pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-[#387ED1]/10 font-semibold text-[#387ED1]"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
