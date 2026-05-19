import Link from "next/link";

import { InvestorPageShell } from "@/components/dashboard/investor/investor-page-shell";
import { SupabaseRealtimeRefresh } from "@/components/realtime/supabase-realtime-refresh";
import { formatShortDate } from "@/lib/format/date";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getInvestorNotifications, getInvestorPortfolio } from "@/lib/queries/investor";

export const dynamic = "force-dynamic";

export default async function InvestorInvestmentsPage() {
  const [portfolio, notifications] = await Promise.all([
    getInvestorPortfolio(),
    getInvestorNotifications(),
  ]);
  return (
    <>
      <SupabaseRealtimeRefresh tables={["investment_tx", "notifications"]} />
      <InvestorPageShell notifications={notifications}>
        <div className="space-y-6">
          <h1 className="text-2xl font-semibold text-slate-900">Investments</h1>
          <p className="text-sm text-slate-600">Portfolio performance and investment history.</p>
          <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Startup</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Equity</TableHead>
                  <TableHead>ROI</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {portfolio.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5}>No investments yet.</TableCell>
                  </TableRow>
                ) : (
                  portfolio.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        {item.startupSlug ? (
                          <Link
                            href={`/startup/${item.startupSlug}`}
                            className="font-medium text-[#387ED1] hover:underline"
                          >
                            {item.startupName}
                          </Link>
                        ) : (
                          item.startupName
                        )}
                        <p className="mt-0.5 text-xs text-slate-400">
                          {formatShortDate(item.investedAt)}
                        </p>
                      </TableCell>
                      <TableCell className="font-medium">{item.amount}</TableCell>
                      <TableCell>{item.equity}</TableCell>
                      <TableCell>{item.roi}</TableCell>
                      <TableCell>{item.status}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </InvestorPageShell>
    </>
  );
}
