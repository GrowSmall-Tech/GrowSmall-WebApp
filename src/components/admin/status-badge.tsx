import type { StartupStatus } from "@/types/database";

import { Badge } from "@/components/ui/badge";

const styles: Record<
  StartupStatus | "pending_pitch",
  { label: string; className: string }
> = {
  draft: {
    label: "Draft",
    className: "bg-slate-100 text-slate-700 border-slate-200",
  },
  pending_review: {
    label: "Pending review",
    className: "bg-orange-100 text-orange-800 border-orange-200",
  },
  approved: {
    label: "Approved",
    className: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  live: {
    label: "Live",
    className: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  rejected: {
    label: "Rejected",
    className: "bg-red-100 text-red-800 border-red-200",
  },
  pending_pitch: {
    label: "Pending",
    className: "bg-orange-100 text-orange-800 border-orange-200",
  },
};

export function StatusBadge({
  status,
}: {
  status: StartupStatus | "pending_pitch";
}) {
  const s = styles[status];
  return (
    <Badge className={`rounded-full border font-normal ${s.className}`}>{s.label}</Badge>
  );
}
