"use client";

import type {
  Session,
  SignInWithPasswordCredentials,
  SignUpWithPasswordCredentials,
  User,
} from "@supabase/supabase-js";
import { create } from "zustand";

import { getRoleFromUser, type UserRole } from "@/lib/auth/constants";
import { createClient } from "@/lib/supabase/client";

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | null> {
  return new Promise((resolve) => {
    const id = setTimeout(() => resolve(null), ms);
    promise
      .then((value) => {
        clearTimeout(id);
        resolve(value);
      })
      .catch(() => {
        clearTimeout(id);
        resolve(null);
      });
  });
}

interface AuthStore {
  user: User | null;
  session: Session | null;
  role: UserRole | null;
  initialized: boolean;
  loading: boolean;
  setAuth: (user: User | null, session: Session | null) => void;
  setRole: (role: UserRole | null) => void;
  setInitialized: (v: boolean) => void;
  setLoading: (v: boolean) => void;
  login: (
    credentials: SignInWithPasswordCredentials,
  ) => ReturnType<ReturnType<typeof createClient>["auth"]["signInWithPassword"]>;
  signup: (
    credentials: SignUpWithPasswordCredentials,
  ) => ReturnType<ReturnType<typeof createClient>["auth"]["signUp"]>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  session: null,
  role: null,
  initialized: false,
  loading: false,
  setAuth: (user, session) =>
    set({ user, session, role: getRoleFromUser(user) }),
  setRole: (role) => set({ role }),
  setInitialized: (initialized) => set({ initialized }),
  setLoading: (loading) => set({ loading }),
  login: (credentials) => createClient().auth.signInWithPassword(credentials),
  signup: (credentials) => createClient().auth.signUp(credentials),
  logout: async () => {
    const supabase = createClient();

    // Never let logout UI hang; both calls are best-effort.
    await Promise.all([
      withTimeout(
        fetch("/api/auth/logout", {
          method: "POST",
          keepalive: true,
        }),
        3000,
      ),
      withTimeout(supabase.auth.signOut({ scope: "local" }), 3000),
    ]);

    set({ user: null, session: null, role: null });

    if (typeof window !== "undefined") {
      window.location.replace("/auth/login");
    }
  },
}));
