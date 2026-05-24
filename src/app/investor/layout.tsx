import type { ReactNode } from "react";
import { requireApprovedInvestor } from "@/lib/auth/server";

export default async function InvestorSegmentLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireApprovedInvestor();
  return children;
}
