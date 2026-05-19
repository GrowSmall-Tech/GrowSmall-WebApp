import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        <p className="text-sm text-slate-500">{subtitle}</p>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
