import Link from "next/link";
import { BarChart3, Layers3, LayoutDashboard, Settings } from "lucide-react";

const items = [
  { href: "/dashboard/founder", label: "Overview", icon: LayoutDashboard },
  { href: "/submit-pitch", label: "Pitches", icon: Layers3 },
  { href: "/dashboard/investor", label: "Analytics", icon: BarChart3 },
  { href: "/admin", label: "Settings", icon: Settings },
];

export function DashboardSidebar() {
  return (
    <aside className="w-full rounded-2xl border border-slate-200 bg-white p-4 md:w-64">
      <div className="mb-6 text-sm font-semibold text-slate-900">Dashboard</div>
      <nav className="space-y-2">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
