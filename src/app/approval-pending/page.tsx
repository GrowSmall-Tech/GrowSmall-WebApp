import Link from "next/link";
import { Clock, FileCheck2, Mail, ShieldCheck } from "lucide-react";

import { InvestorStatusBadge } from "@/components/admin/investor-status-badge";
import { ApprovalPendingActions } from "@/components/investor/approval-pending-actions";
import { createClient } from "@/lib/supabase/server";
import { isInvestorStatus } from "@/types/investor-kyc";
import { redirect } from "next/navigation";

export default async function ApprovalPendingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/approval-pending");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, investor_status, rejection_reason, full_name")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "investor") {
    redirect("/auth/select-role");
  }

  const status = isInvestorStatus(profile.investor_status)
    ? profile.investor_status
    : "pending_approval";

  if (status === "approved") {
    redirect("/investor/dashboard");
  }

  const isRejected = status === "rejected";

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 via-white to-[#387ED1]/5">
      <div className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-6 py-16">
        <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_24px_80px_-32px_rgba(15,23,42,0.18)]">
          <div className="bg-linear-to-r from-[#387ED1] to-[#2f68b8] px-8 py-10 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
                {isRejected ? (
                  <Mail className="h-6 w-6" />
                ) : (
                  <Clock className="h-6 w-6" />
                )}
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
                  GrowSmall Investor
                </p>
                <h1 className="text-2xl font-semibold tracking-tight">
                  Documents Under Review
                </h1>
              </div>
            </div>
          </div>

          <div className="space-y-6 px-8 py-10">
            <div className="flex items-center gap-3">
              <InvestorStatusBadge status={status} />
              {profile.full_name ? (
                <span className="text-sm text-slate-600">
                  {profile.full_name}
                </span>
              ) : null}
            </div>

            {isRejected ? (
              <>
                <p className="text-base leading-relaxed text-slate-700">
                  Your investor application was not approved at this time.
                  {profile.rejection_reason ? (
                    <>
                      {" "}
                      <span className="font-medium">Reason:</span>{" "}
                      {profile.rejection_reason}
                    </>
                  ) : null}
                </p>
                <p className="text-sm text-slate-600">
                  Contact{" "}
                  <a
                    href="mailto:support@growsmall.com"
                    className="font-medium text-[#387ED1] hover:underline"
                  >
                    support@growsmall.com
                  </a>{" "}
                  if you believe this was a mistake.
                </p>
              </>
            ) : (
              <>
                <p className="text-base leading-relaxed text-slate-700">
                  Your investor account is currently under verification.
                </p>
                <p className="text-sm leading-relaxed text-slate-600">
                  Our admin team is reviewing your submitted KYC and income documents.
                  You will gain access to the Investor Dashboard once approved.
                </p>
                <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4 text-sm text-slate-600">
                  Your documents are under review. Please wait for admin approval.
                </div>
              </>
            )}

            <ul className="space-y-3 text-sm text-slate-600">
              <li className="flex gap-3">
                <FileCheck2 className="mt-0.5 h-4 w-4 shrink-0 text-[#387ED1]" />
                KYC and income proof received securely
              </li>
              <li className="flex gap-3">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#387ED1]" />
                Encrypted storage — only admins can view your files
              </li>
            </ul>

            <ApprovalPendingActions />
          </div>
        </div>
      </div>
    </div>
  );
}
