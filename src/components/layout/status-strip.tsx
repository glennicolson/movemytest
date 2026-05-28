import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export type StatusStripItem = {
  label: string;
  value?: string;
  tone?: "neutral" | "success" | "warning" | "danger";
  icon?: React.ReactNode;
};

export function StatusStrip({
  items,
  className,
}: {
  items: StatusStripItem[];
  className?: string;
}) {
  if (!items || items.length === 0) return null;

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5",
        className
      )}
    >
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-1.5 text-sm">
          {item.icon ? <span className="text-slate-400">{item.icon}</span> : null}
          <span className="text-slate-500">{item.label}</span>
          {item.value ? (
            <Badge tone={item.tone ?? "neutral"} size="sm">
              {item.value}
            </Badge>
          ) : null}
          {i < items.length - 1 ? (
            <span className="mx-1 h-4 w-px bg-slate-300" aria-hidden="true" />
          ) : null}
        </div>
      ))}
    </div>
  );
}
