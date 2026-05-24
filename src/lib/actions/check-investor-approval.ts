"use server";

import { createClient } from "@/lib/supabase/server";
import {
  fetchInvestorStatusForUser,
  isInvestorApproved,
} from "@/lib/auth/investor-status";

export async function checkInvestorCanInvestAction(): Promise<{
  allowed: boolean;
  redirectTo: string | null;
  message: string | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      allowed: false,
      redirectTo: "/auth/login",
      message: "Sign in as an investor to continue.",
    };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "investor") {
    return {
      allowed: false,
      redirectTo: "/auth/login",
      message: "Only investor accounts can use this action.",
    };
  }

  const status = await fetchInvestorStatusForUser(supabase, user.id);
  if (!isInvestorApproved(status)) {
    return {
      allowed: false,
      redirectTo: "/approval-pending",
      message:
        "Your documents are under review. Please wait for admin approval.",
    };
  }

  return { allowed: true, redirectTo: null, message: null };
}
