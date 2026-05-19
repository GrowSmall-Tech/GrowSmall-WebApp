import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { founderSubmissionSteps } from "@/config/founder-workspace";

import { InsightCard } from "./insight-card";
import { ProgressSteps } from "./progress-steps";

export function SubmissionTracker() {
  return (
    <div className="space-y-5">
      <Card className="rounded-2xl border-slate-200 shadow-[0_12px_30px_-25px_rgba(15,23,42,0.45)]">
        <CardHeader className="pb-3">
          <h2 className="text-2xl font-semibold text-slate-900">Submission Status</h2>
        </CardHeader>
        <CardContent>
          <ProgressSteps steps={founderSubmissionSteps} />
        </CardContent>
      </Card>
      <InsightCard />
    </div>
  );
}
