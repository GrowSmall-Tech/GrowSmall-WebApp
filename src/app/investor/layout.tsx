import type { ReactNode } from "react";
import { requireInvestor } from "@/lib/auth/server";

export default async function InvestorSegmentLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireInvestor();
  return children;
}
