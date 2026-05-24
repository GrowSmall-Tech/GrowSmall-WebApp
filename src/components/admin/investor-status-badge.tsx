import { Badge } from "@/components/ui/badge";
import type { InvestorStatus } from "@/types/investor-kyc";

const styles: Record<
  InvestorStatus,
  { label: string; className: string }
> = {
  pending_approval: {
    label: "Pending Review",
    className: "bg-amber-100 text-amber-900 border-amber-200",
  },
  approved: {
    label: "Approved",
    className: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  rejected: {
    label: "Rejected",
    className: "bg-red-100 text-red-800 border-red-200",
  },
};

export function InvestorStatusBadge({
  status,
}: {
  status: InvestorStatus | null | undefined;
}) {
  const key = status ?? "pending_approval";
  const s = styles[key] ?? styles.pending_approval;
  return (
    <Badge className={`rounded-full border font-normal ${s.className}`}>
      {s.label}
    </Badge>
  );
}
