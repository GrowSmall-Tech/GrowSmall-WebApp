"use client";

import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";

export function ApprovalPendingActions() {
  const logout = useAuthStore((s) => s.logout);
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await logout();
    } catch {
      setSigningOut(false);
    }
  }

  return (
    <div className="flex flex-col gap-3 pt-2 sm:flex-row">
      <Button variant="outline" className="h-11 rounded-lg" asChild>
        <Link href="/explore">Browse startups</Link>
      </Button>
      <Button
        type="button"
        variant="ghost"
        className="h-11 rounded-lg"
        disabled={signingOut}
        onClick={() => void handleSignOut()}
      >
        {signingOut ? "Signing out…" : "Sign out & switch account"}
      </Button>
    </div>
  );
}
