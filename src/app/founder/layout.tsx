import type { ReactNode } from "react";

import { FounderWorkspaceShell } from "@/components/dashboard/founder/founder-workspace-shell";
import { requireFounder } from "@/lib/auth/server";

export default async function FounderSegmentLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireFounder();
  return <FounderWorkspaceShell>{children}</FounderWorkspaceShell>;
}
