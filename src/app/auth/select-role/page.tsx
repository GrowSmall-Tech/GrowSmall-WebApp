"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { AlertTriangle, LineChart } from "lucide-react";

import { AuthLayout } from "@/components/auth/auth-layout";
import { RoleCard } from "@/components/auth/role-card";

export default function SelectRolePage() {
  return (
    <div className="min-h-screen bg-white">
      <AuthLayout contentMaxClassName="max-w-5xl">
        <div className="mx-auto w-full max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 text-center"
          >
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
              Join as Investor or Founder
            </h1>
            <p className="mx-auto max-w-2xl text-sm leading-relaxed text-slate-500 sm:text-[15px]">
              Choose your role to unlock financial clarity—the right workspace, compliance
              checkpoints, and dashboards built for how you actually move capital or raise it.
            </p>
          </motion.div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            <RoleCard
              icon={LineChart}
              title="I am an Investor"
              description="Discover and invest in startups."
              href="/auth/signup/investor"
              actionLabel="Continue as Investor"
              delay={0.05}
            />
            <RoleCard
              icon={AlertTriangle}
              title="I am a Founder"
              description="Pitch your startup and raise funding."
              href="/auth/signup/founder"
              actionLabel="Continue as Founder"
              delay={0.1}
            />
          </div>

          <p className="mt-10 text-center text-sm text-slate-500">
            Already registered?{" "}
            <Link href="/auth/login" className="font-semibold text-[#387ED1]">
              Log in
            </Link>
          </p>
        </div>
      </AuthLayout>

      <motion.section
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="relative mt-24 h-[120px] w-full overflow-hidden border-t border-slate-50 bg-[#071226]"
      >
        <div className="absolute inset-x-12 top-1/2 h-24 -translate-y-1/2 rounded-xl bg-gradient-to-br from-[#387ED1]/40 via-transparent to-transparent blur-3xl opacity-85" />
        <div className="absolute inset-x-14 top-14 flex gap-8">
          {[24, 40, 32, 48, 56, 36, 62, 42].map((h, i) => (
            <motion.span
              key={i}
              className="w-px rounded-full bg-gradient-to-t from-transparent via-[#7bb6ff] to-[#cce6ff]"
              style={{ height: h }}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.4, 0.95, 0.4], height: [h * 0.6, h, h * 0.72] }}
              transition={{ duration: 4.5, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </div>
      </motion.section>
    </div>
  );
}
