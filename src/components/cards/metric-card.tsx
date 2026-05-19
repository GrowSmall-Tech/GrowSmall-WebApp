import { Card, CardContent } from "@/components/ui/card";

export function MetricCard({
  label,
  value,
  trend,
}: {
  label: string;
  value: string;
  trend?: string;
}) {
  return (
    <Card>
      <CardContent className="pt-5">
        <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
        <div className="mt-2 text-2xl font-semibold text-slate-900">{value}</div>
        {trend ? <p className="mt-1 text-xs text-emerald-600">{trend}</p> : null}
      </CardContent>
    </Card>
  );
}
