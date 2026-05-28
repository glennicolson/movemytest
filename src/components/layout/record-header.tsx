import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

export type RecordHeaderBadge = {
  label: string;
  tone?: "neutral" | "success" | "warning" | "danger";
};

export type RecordHeaderMetric = {
  label: string;
  value: string;
  href?: string;
  className?: string;
};

export function RecordHeader({
  name,
  nameHref,
  identifier,
  photoUrl,
  badges = [],
  metrics = [],
  rightContent,
  className,
  children,
}: {
  name: string;
  /** Makes the name clickable — e.g. to edit the record */
  nameHref?: import("next").Route<string>;
  identifier?: string;
  photoUrl?: string | null;
  badges?: RecordHeaderBadge[];
  metrics?: RecordHeaderMetric[];
  /** Render alongside metrics on the right */
  rightContent?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={cn("rounded-xl border border-slate-200 bg-white p-5 shadow-sm", className)}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          {/* Photo// Avatar */}
          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-200 text-lg font-bold text-slate-500">
            {photoUrl ? (
            <Image src={photoUrl} alt={name} width={56} height={56} className="h-full w-full object-cover" />
            ) : (
              name
                .split(" ")
                .map((n) => n.charAt(0))
                .join("")
                .slice(0, 2)
                .toUpperCase()
            )}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              {nameHref ? (
                <Link href={nameHref} title="Edit learner details">
                  <h1 className="text-xl font-bold text-slate-900 hover:text-blue-600 hover:underline cursor-pointer">{name}</h1>
                </Link>
              ) : (
                <h1 className="text-xl font-bold text-slate-900">{name}</h1>
              )}
              {badges.map((badge, i) => (
                <Badge key={i} tone={badge.tone ?? "neutral"} size="sm">
                  {badge.label}
                </Badge>
              ))}
            </div>
            {identifier ? (
              <p className="mt-0.5 text-sm text-slate-500">{identifier}</p>
            ) : null}
            {/* Custom children — e.g. email, phone */}
            {children ? <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">{children}</div> : null}
          </div>
        </div>

        {/* Key metrics + right content */}
        {metrics.length > 0 || rightContent ? (
          <div className="flex flex-wrap items-stretch gap-3">
            {rightContent}
            {metrics.map((metric, i) => {
              const content = (
                <div className={cn("rounded-lg border px-4 py-2 text-center min-w-[90px] h-full flex flex-col justify-center", metric.className ?? "border-slate-200 bg-slate-50")}>
                  <div className="text-lg font-bold text-slate-900">{metric.value}</div>
                  <div className="text-[11px] font-medium uppercase tracking-wide text-slate-500">{metric.label}</div>
                </div>
              );
              return (
                <div key={i}>
                  {metric.href ? (
                    <a href={metric.href} className="block transition hover:border-slate-300 hover:bg-slate-100 rounded-lg">
                      {content}
                    </a>
                  ) : (
                    content
                  )}
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}
