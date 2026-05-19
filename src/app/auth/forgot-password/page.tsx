"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";

import { AuthBrandHeading, AuthLayout } from "@/components/auth/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    const supabase = createClient();
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${origin}/auth/callback`,
      });
      if (error) {
        setErr(error.message);
        return;
      }
      setMsg("If an account exists, a reset link has been sent to your email.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md mx-auto"
      >
        <AuthBrandHeading subtitle />
        <form
          onSubmit={submit}
          className="mt-2 space-y-4 rounded-xl border border-slate-200/90 bg-white p-6 shadow-[0_14px_50px_-28px_rgba(15,23,42,0.35)]"
        >
          <h1 className="text-xl font-semibold text-slate-900">Reset password</h1>
          <p className="text-sm text-slate-600">
            Enter the email you use for GrowSmall. We&apos;ll send a secure recovery link.
          </p>
          <Input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@company.com"
            className="h-11 border-0 bg-[#f3f4f6]"
            disabled={loading}
          />
          {err ? (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{err}</p>
          ) : null}
          {msg ? (
            <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{msg}</p>
          ) : null}
          <Button type="submit" className="w-full rounded-lg" disabled={loading}>
            {loading ? "Sending…" : "Send reset link"}
          </Button>
          <p className="text-center text-sm text-slate-500">
            <Link href="/auth/login" className="font-semibold text-[#387ED1]">
              Back to login
            </Link>
          </p>
        </form>
      </motion.div>
    </AuthLayout>
  );
}
