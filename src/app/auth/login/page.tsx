import { Suspense } from "react";

import { AuthLayout } from "@/components/auth/auth-layout";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <AuthLayout>
      <Suspense fallback={<LoginFallback />}>
        <LoginForm />
      </Suspense>
    </AuthLayout>
  );
}

function LoginFallback() {
  return (
    <div className="mx-auto w-full max-w-[420px] animate-pulse space-y-8">
      <div className="mx-auto h-8 w-44 rounded bg-slate-100" />
      <div className="h-80 rounded-xl bg-slate-100" />
    </div>
  );
}
