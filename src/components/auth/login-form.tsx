"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { BadgeCheck, Eye, EyeOff, Lock, Shield } from "lucide-react";
import { useState } from "react";

import { AuthBrandHeading } from "@/components/auth/auth-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  roleDashboardPath,
  type UserRole,
} from "@/lib/auth/constants";
import {
  fetchInvestorStatusForUser,
  investorPostAuthPath,
} from "@/lib/auth/investor-status";
import { resolveRoleForUser, upsertProfileFromUser } from "@/lib/auth/profile";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const tabs: { id: UserRole; label: string }[] = [
  { id: "investor", label: "Investor" },
  { id: "founder", label: "Founder" },
];

function isRoleAllowedPath(role: UserRole, path: string) {
  if (path.startsWith("/founder")) return role === "founder";
  if (path.startsWith("/investor")) return role === "investor";
  return true;
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next");

  const [tab, setTab] = useState<UserRole>(
    searchParams.get("role") === "founder" ? "founder" : "investor",
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    try {
      if (remember) {
        localStorage.setItem("growsmall_remember_me", "1");
      } else {
        localStorage.removeItem("growsmall_remember_me");
      }

      const { data, error: signErr } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signErr) {
        setError(signErr.message);
        return;
      }

      const user = data.user;
      console.log("Logged in user:", user.email);
      let effectiveRole = await upsertProfileFromUser(supabase, user, tab);
      if (!effectiveRole) {
        effectiveRole = await resolveRoleForUser(supabase, user);
      }
      console.log("User role:", effectiveRole);

      if (!effectiveRole) {
        router.replace("/auth/select-role");
        router.refresh();
        return;
      }

      if (effectiveRole !== tab) {
        setTab(effectiveRole);
        setError(
          `This account is registered as ${effectiveRole}. Please continue with the ${effectiveRole} tab.`,
        );
        return;
      }

      let destination = roleDashboardPath(effectiveRole);
      if (effectiveRole === "investor") {
        const status = await fetchInvestorStatusForUser(supabase, user.id);
        const investorHome = investorPostAuthPath(status);
        if (
          nextPath?.startsWith("/") &&
          nextPath.length > 1 &&
          isRoleAllowedPath(effectiveRole, nextPath) &&
          status === "approved"
        ) {
          destination = nextPath;
        } else if (
          nextPath?.startsWith("/investor") &&
          status !== "approved"
        ) {
          destination = "/approval-pending";
        } else {
          destination = investorHome;
        }
      } else if (
        nextPath?.startsWith("/") &&
        nextPath.length > 1 &&
        isRoleAllowedPath(effectiveRole, nextPath)
      ) {
        destination = nextPath;
      }

      router.replace(destination);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mx-auto w-full max-w-[420px]"
    >
      <AuthBrandHeading subtitle />
      <Card className="border-slate-200/90 shadow-[0_14px_50px_-28px_rgba(15,23,42,0.35)]">
        <CardContent className="space-y-5 p-7 sm:p-8">
          <div
            role="tablist"
            aria-label="Account type"
            className="flex rounded-lg bg-[#f3f4f6] p-1"
          >
            {tabs.map((t) => {
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setTab(t.id)}
                  className={cn(
                    "flex-1 rounded-md py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-white text-[#387ED1] shadow-sm"
                      : "text-slate-500 hover:text-slate-800",
                  )}
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-semibold text-slate-900"
              >
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="name@company.com"
                value={email}
                onChange={(ev) => setEmail(ev.target.value)}
                disabled={loading}
                className="h-11 border-0 bg-[#f3f4f6] placeholder:text-slate-400"
                required
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-semibold text-slate-900"
              >
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(ev) => setPassword(ev.target.value)}
                  disabled={loading}
                  className="h-11 border-0 bg-[#f3f4f6] pr-11 placeholder:text-slate-400"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  disabled={loading}
                  className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-md p-1.5 text-slate-500 transition-colors hover:bg-slate-200/80 hover:text-slate-800 disabled:pointer-events-none disabled:opacity-40"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" aria-hidden />
                  ) : (
                    <Eye className="h-5 w-5" aria-hidden />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-1 text-sm">
              <label className="flex cursor-pointer items-center gap-2 text-slate-600 select-none">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(ev) => setRemember(ev.target.checked)}
                  className="accent-[#387ED1]"
                />
                Remember me
              </label>
              <Link
                href="/auth/forgot-password"
                className="font-medium text-[#387ED1] hover:text-[#2f6eb8]"
              >
                Forgot password?
              </Link>
            </div>

            {error ? (
              <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            ) : null}

            <Button
              type="submit"
              disabled={loading}
              className="mt-2 h-11 w-full rounded-lg text-base font-semibold shadow-sm"
            >
              {loading ? "Signing in…" : "Login"}
            </Button>
          </form>

          <p className="text-center text-sm text-slate-500">
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/select-role"
              className="font-semibold text-[#387ED1] hover:text-[#2f6eb8]"
            >
              Sign up
            </Link>
          </p>

          <p className="text-center text-sm">
            <Link
              href="/"
              className="font-medium text-slate-500 transition-colors hover:text-slate-700"
            >
              Back to Home
            </Link>
          </p>
        </CardContent>
      </Card>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mt-10 flex justify-center gap-10 text-slate-300"
        aria-hidden
      >
        <Shield className="h-5 w-5" />
        <Lock className="h-5 w-5" />
        <BadgeCheck className="h-5 w-5" />
      </motion.div>
    </motion.div>
  );
}
