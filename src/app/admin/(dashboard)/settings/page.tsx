"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { ConfirmLogoutDialog } from "@/components/shared/confirm-logout-dialog";
import { Button } from "@/components/ui/button";

export default function AdminSettingsPage() {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  async function logout() {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      setLogoutDialogOpen(false);
      router.push("/admin/login");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="border-b border-slate-100 pb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Settings</h1>
        <p className="mt-1 text-sm text-slate-600">
          Platform configuration is driven by environment variables and Supabase policies.
        </p>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">Environment</h2>
        <ul className="mt-3 list-inside list-disc space-y-2 text-sm text-slate-600">
          <li>
            <code className="rounded bg-slate-50 px-1">NEXT_PUBLIC_SUPABASE_URL</code> — Supabase project URL
          </li>
          <li>
            <code className="rounded bg-slate-50 px-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> — Public anon key
          </li>
          <li>
            <code className="rounded bg-slate-50 px-1">ADMIN_EMAIL</code> (or{" "}
            <code className="rounded bg-slate-50 px-1">ADMIN_ID</code>) /{" "}
            <code className="rounded bg-slate-50 px-1">ADMIN_PASSWORD</code> — Admin login
          </li>
          <li>
            <code className="rounded bg-slate-50 px-1">SUPABASE_SERVICE_ROLE_KEY</code> — Server-only admin CRUD
          </li>
        </ul>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">Content</h2>
        <p className="mt-2 text-sm text-slate-600">
          Featured startups and approvals are managed from{" "}
          <a className="font-medium text-[#387ED1]" href="/admin/businesses">
            Businesses
          </a>{" "}
          and the dashboard queue.
        </p>
      </section>

      <Button
        type="button"
        variant="outline"
        className="text-red-600 hover:bg-red-50"
        onClick={() => setLogoutDialogOpen(true)}
      >
        Sign out
      </Button>
      <ConfirmLogoutDialog
        open={logoutDialogOpen}
        onOpenChange={setLogoutDialogOpen}
        onConfirm={logout}
        loading={loggingOut}
      />
    </div>
  );
}
