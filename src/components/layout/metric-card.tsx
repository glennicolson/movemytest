import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { ChevronRight } from "lucide-react";

export type MetricTone = "neutral" | "info" | "success" | "warning" | "danger";

export interface MetricCardProps {
  label: string;
  value: string | number;
  detail: string;
  tone?: MetricTone;
  icon?: LucideIcon;
  /** Additional metric shown below value (e.g. "67% of total") */
  secondary?: string;
  /** Secondary metric tone */
  secondaryTone?: MetricTone;
  href?: string;
  onClick?: () => void;
}

const borderStyles: Record<MetricTone, string> = {
  neutral: "border-t-slate-400",
  info: "border-t-sky-500",
  success: "border-t-emerald-500",
  warning: "border-t-amber-500",
  danger: "border-t-rose-500",
};

const valueStyles: Record<MetricTone, string> = {
  neutral: "text-slate-900",
  info: "text-sky-700",
  success: "text-emerald-700",
  warning: "text-amber-700",
  danger: "text-rose-700",
};

const secondaryStyles: Record<MetricTone, string> = {
  neutral: "bg-slate-100 text-slate-600",
  info: "bg-sky-50 text-sky-700",
  success: "bg-emerald-50 text-emerald-700",
  warning: "bg-amber-50 text-amber-700",
  danger: "bg-rose-50 text-rose-700",
};

export function MetricCard({
  label,
  value,
  detail,
  tone = "neutral",
  icon: Icon,
  secondary,
  secondaryTone,
  href,
  onClick,
}: MetricCardProps) {
  const isInteractive = !!href || !!onClick;
  const Wrapper = href ? "a" : onClick ? "button" : "div";
  const wrapperProps = href
    ? { href, className: "block group cursor-pointer" }
    : onClick
      ? { onClick, className: "block w-full text-left group cursor-pointer" }
      : { className: "" };

  return (
    <Wrapper {...wrapperProps}>
      <div
        className={cn(
          "rounded-xl border border-slate-200 p-4",
          "border-t-[3px]",
          borderStyles[tone],
          isInteractive && "transition-shadow hover:shadow-md hover:border-slate-300"
        )}
      >
        {/* Header row: icon + label + action hint */}
        <div className="flex items-center gap-2 mb-1.5">
          {Icon && (
            <Icon className={cn(
              "h-4 w-4 shrink-0",
              tone === "danger" ? "text-rose-500" :
              tone === "warning" ? "text-amber-500" :
              tone === "success" ? "text-emerald-500" :
              tone === "info" ? "text-sky-500" :
              "text-slate-400"
            )} />
          )}
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 truncate flex-1">
            {label}
          </span>
          {isInteractive && (
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-300 group-hover:text-slate-500 transition-colors" />
          )}
        </div>

        {/* Value + secondary */}
        <div className="flex items-baseline gap-2 mb-1.5">
          <span className={cn("text-2xl font-bold tracking-tight leading-none", valueStyles[tone])}>
            {value}
          </span>
          {secondary && (
            <span className={cn(
              "rounded-full px-2 py-0.5 text-[11px] font-semibold leading-none",
              secondaryTone ? secondaryStyles[secondaryTone] : "bg-slate-100 text-slate-600"
            )}>
              {secondary}
            </span>
          )}
        </div>

        {/* Detail line */}
        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
          {detail}
        </p>
      </div>
    </Wrapper>
  );
}
