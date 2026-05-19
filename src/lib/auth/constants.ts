import type { User } from "@supabase/supabase-js";

export const USER_ROLES = ["investor", "founder"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export function isUserRole(value: unknown): value is UserRole {
  return value === "investor" || value === "founder";
}

export function getRoleFromUser(user: User | null | undefined): UserRole | null {
  if (!user) return null;
  const meta = user.user_metadata as Record<string, unknown> | undefined;
  return isUserRole(meta?.role) ? meta.role : null;
}

export function roleDashboardPath(role: UserRole): string {
  return role === "investor" ? "/investor/dashboard" : "/founder/dashboard";
}
