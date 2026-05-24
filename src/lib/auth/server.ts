import { redirect } from "next/navigation";

import { fetchInvestorStatusForUser, isInvestorApproved } from "@/lib/auth/investor-status";
import { resolveRoleForUser, upsertProfileFromUser } from "@/lib/auth/profile";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/auth/constants";

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getCurrentRole(): Promise<UserRole | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const role = await upsertProfileFromUser(supabase, user);
  if (role) return role;
  return resolveRoleForUser(supabase, user);
}

export async function requireFounder() {
  const role = await getCurrentRole();
  if (role !== "founder") {
    redirect("/auth/login");
  }
}

export async function requireInvestor() {
  const role = await getCurrentRole();
  if (role !== "investor") {
    redirect("/auth/login");
  }
}

export async function requireApprovedInvestor() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/auth/login");
  }

  const role = await getCurrentRole();
  if (role !== "investor") {
    redirect("/auth/login");
  }

  const status = await fetchInvestorStatusForUser(supabase, user.id);
  if (!isInvestorApproved(status)) {
    redirect("/approval-pending");
  }
}
