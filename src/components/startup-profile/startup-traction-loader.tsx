"use client";

import dynamic from "next/dynamic";

import type { StartupProfile } from "@/types/startup-profile";

const TractionCharts = dynamic(
  () => import("@/components/startup-profile/traction-charts").then((m) => m.TractionCharts),
  {
    ssr: false,
    loading: () => (
      <div>
        <div className="text-center">
          <h2 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">Traction & Growth</h2>
        </div>
        <div className="mt-8 grid gap-6 lg:grid-cols-2 lg:gap-8">
          <div className="h-[300px] animate-pulse rounded-2xl bg-slate-100" />
          <div className="h-[300px] animate-pulse rounded-2xl bg-slate-100" />
        </div>
      </div>
    ),
  },
);

type Props = Pick<
  StartupProfile["traction"],
  "revenueBadge" | "activeUsersLabel" | "usersChartTitle" | "revenueChart" | "activeUsersChart"
>;

export function StartupTractionLoader(props: Props) {
  return <TractionCharts {...props} />;
}
