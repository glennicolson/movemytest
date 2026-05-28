import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export type SummaryMetric = {
  label: string;
  value: string;
  detail: string;
};

export function SummaryGrid({ metrics }: { metrics: SummaryMetric[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => (
        <Card key={metric.label}>
          <CardDescription>{metric.label}</CardDescription>
          <CardTitle>{metric.value}</CardTitle>
          <p className="mt-3 text-sm text-slate-500">{metric.detail}</p>
        </Card>
      ))}
    </div>
  );
}
