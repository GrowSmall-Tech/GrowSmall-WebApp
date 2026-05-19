"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { useState, type ReactNode } from "react";

import { AuthBrandHeading } from "@/components/auth/auth-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { roleDashboardPath } from "@/lib/auth/constants";
import { upsertProfileFromUser } from "@/lib/auth/profile";
import { createClient } from "@/lib/supabase/client";

const investmentInterests = [
  "SaaS & enterprise",
  "Fintech",
  "Climate / cleantech",
  "Consumer & brands",
  "Deep tech & AI",
  "Healthcare & longevity",
];

const budgetRanges = [
  "Under ₹10L",
  "₹10L — ₹50L",
  "₹50L — ₹1Cr",
  "₹1Cr — ₹2Cr",
  "₹2Cr+",
];

const industries = [
  "AgriTech",
  "ClimateTech",
  "HealthTech",
  "SaaS",
  "AI / ML",
  "Logistics",
  "Consumer",
];

function SocialStub() {
  return (
    <div className="mt-8 flex justify-center gap-4">
      <span className="h-10 w-10 rounded-md border border-slate-200 bg-slate-50" />
      <span className="h-10 w-10 rounded-md border border-slate-200 bg-slate-50" />
    </div>
  );
}

/** Split-layout hero — investor signup (financial growth narrative). */
export function InvestorSignupLeftPanel() {
  return (
    <div className="relative flex h-full min-h-[420px] flex-col justify-between bg-gradient-to-br from-[#387ED1] via-[#2f68b8] to-[#214a94] px-12 py-14 text-white lg:min-h-screen">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.18),transparent_42%)]" />
      <div className="relative z-10 max-w-xl space-y-5">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/85">
          GrowSmall for investors
        </p>
        <h2 className="text-4xl leading-tight font-bold">
          Unlock India&apos;s highest growth startups.
        </h2>
        <p className="text-sm leading-relaxed text-white/85">
          Access exclusive equity opportunities with institutional-grade portfolio
          analytics and a streamlined, disclosure-first workflow tailored for Indian
          professional investors.
        </p>
      </div>

      <div className="relative z-10 mt-10 rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-md">
        <div className="flex items-center justify-between text-xs uppercase tracking-wide text-white/75">
          <span>Portfolio trend</span>
          <span className="text-emerald-200">Positive</span>
        </div>
        <svg
          className="mt-4 h-[120px] w-full overflow-visible text-white"
          viewBox="0 0 400 110"
          fill="none"
          aria-hidden
        >
          <path
            d="M10 92 C70 74 96 94 154 62 C218 34 274 74 394 36"
            stroke="currentColor"
            strokeOpacity="0.35"
            strokeWidth="10"
            strokeLinecap="round"
          />
          <path
            d="M10 92 C70 74 96 94 154 62 C218 34 274 74 394 36"
            stroke="#bfe6ff"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <defs>
            <linearGradient id="invGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#dff3ff" stopOpacity="0" />
              <stop offset="55%" stopColor="#dff3ff" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#dff3ff" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M10 92 C70 74 96 94 154 62 C218 34 274 74 394 104 L394 120 L10 120 Z"
            fill="url(#invGrad)"
          />
        </svg>
        <div className="mt-4 grid grid-cols-2 gap-3 text-xs font-medium">
          <div className="rounded-xl border border-white/15 bg-white/10 px-3 py-2">
            <p className="text-white/70">TOTAL ASSETS</p>
            <p className="text-lg font-semibold">₹ 24.5 Cr</p>
          </div>
          <div className="rounded-xl border border-white/15 bg-white/10 px-3 py-2">
            <p className="text-white/70">ANNUAL ROI</p>
            <p className="text-lg font-semibold text-emerald-100">+ 11.4%</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Split-layout hero — founder signup */
export function FounderSignupLeftPanel() {
  return (
    <div className="relative flex h-full min-h-[420px] flex-col justify-end bg-gradient-to-br from-[#387ED1] via-[#2f68b8] to-[#1b3f78] px-12 py-14 text-white lg:min-h-screen">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(255,255,255,0.16),transparent_42%)]" />
      <div className="relative z-10 flex flex-1 flex-col justify-center pb-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="relative mx-auto flex h-[min(340px,50vh)] w-[min(360px,80vw)] items-center justify-center"
        >
          <div className="absolute inset-0 rounded-[40%] bg-[radial-gradient(circle,rgba(255,255,255,0.32),transparent_62%)] blur-3xl" />
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="relative text-[180px] leading-none drop-shadow-[0_28px_60px_rgba(0,0,0,0.35)]"
            aria-hidden
          >
            🚀
          </motion.div>
        </motion.div>
        <div className="relative z-10 mx-auto mt-8 max-w-md text-center">
          <p className="text-3xl font-bold leading-tight">Ignite Your Vision</p>
          <p className="mt-3 text-sm leading-relaxed text-white/85">
            Join the circle of founders building iconic companies—from seed diligence
            to scale—with absolute equity clarity at every milestone.
          </p>
        </div>
      </div>
    </div>
  );
}

export function InvestorSignupForm() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [interest, setInterest] = useState("");
  const [budget, setBudget] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (!agreeTerms) {
      setError("Please confirm you agree to the terms and disclosures.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const origin =
      typeof window !== "undefined" ? window.location.origin : undefined;

    try {
      const { data, error: signErr } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: origin ? `${origin}/auth/callback` : undefined,
          data: {
            role: "investor",
            full_name: fullName.trim(),
            investment_interest: interest,
            budget_range: budget,
          },
        },
      });
      if (signErr) {
        setError(signErr.message);
        return;
      }
      if (!data.session) {
        router.push("/auth/login?registered=investor&message=confirm-email");
        return;
      }
      if (data.user) {
        await upsertProfileFromUser(supabase, data.user, "investor");
      }
      router.replace(roleDashboardPath("investor"));
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-lg">
      <div className="mb-8 lg:hidden">
        <AuthBrandHeading />
      </div>
      <div className="mb-10 hidden lg:block">
        <AuthBrandHeading />
        <Badge className="rounded-full bg-[#387ED1]/10 px-3 py-1 text-[11px] font-semibold tracking-wide text-[#387ED1]">
          Investor account
        </Badge>
      </div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-semibold text-slate-900">Create your account</h1>
        <p className="mt-2 text-sm text-slate-600">
          Join the network of professional Indian investors discovering founder-led,
          diligence-ready deals.
        </p>

        <form onSubmit={submit} className="mt-8 space-y-4">
          <Field label="Full Name">
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Rahul Sharma"
              disabled={loading}
              required
              className="h-11 rounded-lg bg-[#f9fafb]"
            />
          </Field>
          <Field label="Email Address">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="rahul@example.com"
              disabled={loading}
              required
              className="h-11 rounded-lg bg-[#f9fafb]"
            />
          </Field>
          <Field label="Password">
            <div className="relative">
              <Input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
                minLength={8}
                className="h-11 rounded-lg bg-[#f9fafb] pr-12"
              />
              <button
                type="button"
                aria-label={showPw ? "Hide password" : "Show password"}
                className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-2 text-slate-500 hover:bg-slate-100"
                onClick={() => setShowPw((v) => !v)}
              >
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Investment interest">
              <Select
                value={interest || undefined}
                onValueChange={setInterest}
                disabled={loading}
              >
                <SelectTrigger className="h-11 rounded-lg bg-[#f9fafb]">
                  <SelectValue placeholder="Select focus" />
                </SelectTrigger>
                <SelectContent>
                  {investmentInterests.map((x) => (
                    <SelectItem key={x} value={x}>
                      {x}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Budget range (INR)">
              <Select value={budget || undefined} onValueChange={setBudget} disabled={loading}>
                <SelectTrigger className="h-11 rounded-lg bg-[#f9fafb]">
                  <SelectValue placeholder="Choose range" />
                </SelectTrigger>
                <SelectContent>
                  {budgetRanges.map((x) => (
                    <SelectItem key={x} value={x}>
                      {x}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <label className="flex cursor-pointer gap-3 text-sm text-slate-600 leading-snug select-none">
            <Checkbox checked={agreeTerms} onCheckedChange={(v) => setAgreeTerms(v === true)} />
            <span>
              I agree to the Terms of Service and Disclosure guidelines aligned with Indian
              market regulations applicable to angel and professional investor participation.
            </span>
          </label>

          {error ? (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          ) : null}

          <Button type="submit" disabled={loading} className="h-11 w-full rounded-lg">
            {loading ? "Creating account…" : "Create Account"}
          </Button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link href="/auth/login" className="font-semibold text-[#387ED1]">
            Login
          </Link>
        </p>

        <SocialStub />

        <footer className="mt-12 flex flex-wrap justify-center gap-x-5 gap-y-2 text-[11px] text-slate-400">
          <Link href="/explore" className="hover:text-[#387ED1]">
            Find startups
          </Link>
          <Link href="#" className="hover:text-[#387ED1]">
            Privacy
          </Link>
          <Link href="#" className="hover:text-[#387ED1]">
            Terms
          </Link>
          <Link href="#" className="hover:text-[#387ED1]">
            Disclosure
          </Link>
          <Link href="#" className="hover:text-[#387ED1]">
            Contact
          </Link>
        </footer>
      </motion.div>
    </div>
  );
}

export function FounderSignupForm() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [startupName, setStartupName] = useState("");
  const [industry, setIndustry] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const origin =
      typeof window !== "undefined" ? window.location.origin : undefined;

    try {
      const { data, error: signErr } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: origin ? `${origin}/auth/callback` : undefined,
          data: {
            role: "founder",
            full_name: fullName.trim(),
            startup_name: startupName.trim(),
            industry,
          },
        },
      });
      if (signErr) {
        setError(signErr.message);
        return;
      }
      if (!data.session) {
        router.push("/auth/login?registered=founder&message=confirm-email");
        return;
      }
      if (data.user) {
        await upsertProfileFromUser(supabase, data.user, "founder");
      }
      router.replace(roleDashboardPath("founder"));
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-lg">
      <div className="mb-8 lg:hidden">
        <AuthBrandHeading />
      </div>
      <div className="mb-10 hidden lg:flex lg:items-start lg:justify-between">
        <div>
          <AuthBrandHeading />
        </div>
        <Badge className="rounded-full bg-[#387ED1]/10 px-3 py-1 text-[11px] font-semibold tracking-wide text-[#387ED1]">
          Founder
        </Badge>
      </div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Build for the Future</h1>
            <p className="mt-2 text-sm text-slate-600">
              Tell us about yourself and your company so investors can discover you faster.
            </p>
          </div>
          <Badge className="hidden rounded-full bg-[#387ED1]/10 px-3 py-1 text-[11px] font-semibold tracking-wide text-[#387ED1] sm:inline-flex">
            Founder
          </Badge>
        </div>

        <form onSubmit={submit} className="mt-8 space-y-4">
          <Field label="Full Name">
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Founder legal name"
              disabled={loading}
              required
              className="h-11 rounded-lg bg-[#f9fafb]"
            />
          </Field>
          <Field label="Email Address">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
              className="h-11 rounded-lg bg-[#f9fafb]"
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Startup name">
              <Input
                value={startupName}
                onChange={(e) => setStartupName(e.target.value)}
                disabled={loading}
                required
                className="h-11 rounded-lg bg-[#f9fafb]"
              />
            </Field>
            <Field label="Industry">
              <Select
                value={industry || undefined}
                onValueChange={setIndustry}
                disabled={loading}
              >
                <SelectTrigger className="h-11 rounded-lg bg-[#f9fafb]">
                  <SelectValue placeholder="Select Industry" />
                </SelectTrigger>
                <SelectContent>
                  {industries.map((x) => (
                    <SelectItem key={x} value={x}>
                      {x}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Field label="Password">
            <div className="relative">
              <Input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
                minLength={8}
                className="h-11 rounded-lg bg-[#f9fafb] pr-12"
              />
              <button
                type="button"
                aria-label={showPw ? "Hide password" : "Show password"}
                className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-2 text-slate-500 hover:bg-slate-100"
                onClick={() => setShowPw((v) => !v)}
              >
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </Field>

          {error ? (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          ) : null}

          <Button type="submit" disabled={loading} className="h-11 w-full rounded-lg">
            {loading ? "Creating account…" : "Create Account"}
          </Button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link href="/auth/login" className="font-semibold text-[#387ED1]">
            Login
          </Link>
        </p>

        <SocialStub />

        <footer className="mt-12 flex flex-wrap justify-center gap-x-5 gap-y-2 text-[11px] text-slate-400">
          <Link href="/submit-pitch" className="hover:text-[#387ED1]">
            Submit pitch
          </Link>
          <Link href="#" className="hover:text-[#387ED1]">
            Privacy
          </Link>
          <Link href="#" className="hover:text-[#387ED1]">
            Terms
          </Link>
          <Link href="#" className="hover:text-[#387ED1]">
            Help
          </Link>
        </footer>
      </motion.div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <span className="text-sm font-semibold text-slate-900">{label}</span>
      {children}
    </div>
  );
}

/** Routing-friendly wrapper — same export name as architecture spec */
export function SignupForm(props: { variant: "investor" | "founder" }) {
  if (props.variant === "investor") return <InvestorSignupForm />;
  return <FounderSignupForm />;
}
