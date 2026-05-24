"use client";

import { useMemo, useState, useTransition } from "react";
import {
  Check,
  Download,
  ExternalLink,
  Eye,
  FileText,
  X,
} from "lucide-react";

import { InvestorStatusBadge } from "@/components/admin/investor-status-badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import {
  approveInvestorAction,
  getInvestorDocumentSignedUrl,
  rejectInvestorAction,
} from "@/lib/admin/investor-kyc";
import { formatShortDate } from "@/lib/format/date";
import type { InvestorApprovalRow } from "@/types/investor-kyc";

function isPdfPath(path: string) {
  return path.toLowerCase().endsWith(".pdf");
}

export function InvestorApprovalTable({
  investors,
}: {
  investors: InvestorApprovalRow[];
}) {
  const [rows, setRows] = useState(investors);
  const [pending, startTransition] = useTransition();
  const [rejectTarget, setRejectTarget] = useState<InvestorApprovalRow | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const sorted = useMemo(
    () =>
      [...rows].sort((a, b) => {
        const order = { pending_approval: 0, rejected: 1, approved: 2 };
        const sa = order[a.investor_status ?? "pending_approval"] ?? 0;
        const sb = order[b.investor_status ?? "pending_approval"] ?? 0;
        if (sa !== sb) return sa - sb;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }),
    [rows],
  );

  async function openDocument(path: string | null, download = false) {
    if (!path) {
      toast.error("No document on file.");
      return;
    }
    try {
      const url = await getInvestorDocumentSignedUrl(path);
      if (download) {
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = path.split("/").pop() ?? "document";
        anchor.target = "_blank";
        anchor.rel = "noopener noreferrer";
        anchor.click();
        return;
      }
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not open document.");
    }
  }

  function handleApprove(investor: InvestorApprovalRow) {
    startTransition(async () => {
      try {
        await approveInvestorAction(investor.id);
        setRows((prev) =>
          prev.map((r) =>
            r.id === investor.id
              ? { ...r, investor_status: "approved", rejection_reason: null }
              : r,
          ),
        );
        toast.success("Investor approved successfully");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Approval failed.");
      }
    });
  }

  function handleReject() {
    if (!rejectTarget) return;
    const id = rejectTarget.id;
    const reason = rejectReason;
    startTransition(async () => {
      try {
        await rejectInvestorAction(id, reason);
        setRows((prev) =>
          prev.map((r) =>
            r.id === id
              ? {
                  ...r,
                  investor_status: "rejected",
                  rejection_reason: reason.trim() || null,
                }
              : r,
          ),
        );
        toast.success("Investor rejected");
        setRejectTarget(null);
        setRejectReason("");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Rejection failed.");
      }
    });
  }

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>KYC Document</TableHead>
              <TableHead>Income Certificate</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((investor) => (
              <TableRow key={investor.id}>
                <TableCell className="font-medium text-slate-900">
                  {investor.full_name ?? "—"}
                </TableCell>
                <TableCell className="max-w-[200px] truncate text-slate-600">
                  {investor.email}
                </TableCell>
                <TableCell>
                  <DocumentActions
                    path={investor.kyc_document_url}
                    onOpen={openDocument}
                  />
                </TableCell>
                <TableCell>
                  <DocumentActions
                    path={investor.income_certificate_url}
                    onOpen={openDocument}
                  />
                </TableCell>
                <TableCell>
                  <InvestorStatusBadge status={investor.investor_status} />
                </TableCell>
                <TableCell className="text-slate-600">
                  {formatShortDate(investor.created_at)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      size="sm"
                      className="h-8 gap-1 rounded-lg"
                      disabled={
                        pending || investor.investor_status === "approved"
                      }
                      onClick={() => handleApprove(investor)}
                    >
                      <Check className="h-3.5 w-3.5" />
                      Approve
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-8 gap-1 rounded-lg text-red-700 hover:bg-red-50"
                      disabled={
                        pending || investor.investor_status === "rejected"
                      }
                      onClick={() => {
                        setRejectTarget(investor);
                        setRejectReason(investor.rejection_reason ?? "");
                      }}
                    >
                      <X className="h-3.5 w-3.5" />
                      Reject
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {sorted.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center text-slate-500">
                  No investor applications yet.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>

      <Dialog
        open={rejectTarget != null}
        onOpenChange={(open) => {
          if (!open) {
            setRejectTarget(null);
            setRejectReason("");
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reject investor</DialogTitle>
            <p className="text-sm text-slate-600">
              Optionally share a reason with {rejectTarget?.full_name ?? "this investor"}.
            </p>
          </DialogHeader>
          <Textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Reason for rejection (optional)"
            rows={4}
            className="resize-none"
          />
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setRejectTarget(null)}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="bg-red-600 text-white hover:bg-red-700"
              disabled={pending}
              onClick={handleReject}
            >
              Confirm reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function DocumentActions({
  path,
  onOpen,
}: {
  path: string | null;
  onOpen: (path: string | null, download?: boolean) => Promise<void>;
}) {
  if (!path) {
    return <span className="text-xs text-slate-400">Not uploaded</span>;
  }

  const fileName = path.split("/").pop() ?? "document";
  const pdf = isPdfPath(path);

  return (
    <div className="flex flex-col gap-1.5">
      <span className="max-w-[140px] truncate text-xs text-slate-600" title={fileName}>
        {fileName}
      </span>
      <div className="flex flex-wrap gap-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-[#387ED1]"
          onClick={() => onOpen(path)}
        >
          {pdf ? <Eye className="mr-1 h-3 w-3" /> : <ExternalLink className="mr-1 h-3 w-3" />}
          {pdf ? "Preview" : "Open"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 px-2"
          onClick={() => onOpen(path, true)}
        >
          <Download className="mr-1 h-3 w-3" />
          Download
        </Button>
      </div>
    </div>
  );
}

export function InvestorKycStatsCards({
  stats,
}: {
  stats: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
}) {
  const cards = [
    { label: "Total Investors", value: stats.total },
    { label: "Pending Approvals", value: stats.pending },
    { label: "Approved Investors", value: stats.approved },
    { label: "Rejected Investors", value: stats.rejected },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="flex items-center gap-2 text-slate-500">
            <FileText className="h-4 w-4" />
            <p className="text-xs font-medium uppercase tracking-wide">{card.label}</p>
          </div>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{card.value}</p>
        </div>
      ))}
    </div>
  );
}
