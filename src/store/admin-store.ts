import { create } from "zustand";

import type { StartupStatus } from "@/types/database";

type AdminUiState = {
  startupSearch: string;
  startupStatusFilter: StartupStatus | "all";
  userRoleFilter: "all" | "founder" | "investor" | "admin";
  dashboardRange: "7d" | "30d" | "90d";
  setStartupSearch: (v: string) => void;
  setStartupStatusFilter: (v: StartupStatus | "all") => void;
  setUserRoleFilter: (v: "all" | "founder" | "investor" | "admin") => void;
  setDashboardRange: (v: "7d" | "30d" | "90d") => void;
};

export const useAdminStore = create<AdminUiState>((set) => ({
  startupSearch: "",
  startupStatusFilter: "all",
  userRoleFilter: "all",
  dashboardRange: "30d",
  setStartupSearch: (v) => set({ startupSearch: v }),
  setStartupStatusFilter: (v) => set({ startupStatusFilter: v }),
  setUserRoleFilter: (v) => set({ userRoleFilter: v }),
  setDashboardRange: (v) => set({ dashboardRange: v }),
}));
