"use client";

import { useEffect } from "react";

import { useAuthStore } from "@/store/auth-store";
import { isUserRole } from "@/lib/auth/constants";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export function AuthSync({ children }: { children: React.ReactNode }) {
  const setAuth = useAuthStore((s) => s.setAuth);
  const setRole = useAuthStore((s) => s.setRole);
  const setInitialized = useAuthStore((s) => s.setInitialized);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setInitialized(true);
      return;
    }

    const supabase = createClient();

    void supabase.auth.getSession().then(async ({ data }) => {
      const { session } = data;
      setAuth(session?.user ?? null, session);
      if (session?.user?.id) {
        const profileResult = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .maybeSingle();
        setRole(isUserRole(profileResult.data?.role) ? profileResult.data.role : null);
      }
      setInitialized(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setAuth(session?.user ?? null, session);
      if (session?.user?.id) {
        const profileResult = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .maybeSingle();
        setRole(isUserRole(profileResult.data?.role) ? profileResult.data.role : null);
      } else {
        setRole(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [setAuth, setInitialized, setRole]);

  return children;
}
