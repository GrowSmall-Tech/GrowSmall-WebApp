import { DashboardSidebar } from "@/components/shared/dashboard-sidebar";
import { MetricCard } from "@/components/cards/metric-card";
import { Navbar } from "@/components/shared/navbar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function FounderDashboardPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="container-max grid gap-6 py-8 md:grid-cols-[260px_1fr]">
        <DashboardSidebar />
        <div className="space-y-6">
          <h1 className="text-2xl font-semibold text-slate-900">Founder Dashboard</h1>
          <div className="grid gap-4 sm:grid-cols-3">
            <MetricCard label="Submitted Pitches" value="8" />
            <MetricCard label="Active Investors" value="62" />
            <MetricCard label="Funding Status" value="$365k / $500k" trend="73% completed" />
          </div>
          <Card>
            <CardHeader><h2 className="text-lg font-semibold">Submitted Pitches</h2></CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-slate-600">
                <div className="flex items-center justify-between rounded-md border border-slate-200 p-3"><span>HarvestIQ Seed Round</span><span className="text-emerald-600">Approved</span></div>
                <div className="flex items-center justify-between rounded-md border border-slate-200 p-3"><span>New Market Expansion</span><span className="text-amber-600">Under Review</span></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
