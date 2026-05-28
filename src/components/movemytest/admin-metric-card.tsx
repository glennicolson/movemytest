"use client";

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export type MetricSeverity = "healthy" | "info" | "warning" | "urgent";

export interface AdminMetricCardProps {
  label: string;
  value: number | string;
  detail?: string;
  icon: ReactNode;
  severity?: MetricSeverity;
  href?: string;
  onClick?: () => void;
}

const severityStyles: Record<MetricSeverity, string> = {
  healthy: "border-t-emerald-400 bg-emerald-50/30",
  info: "border-t-blue-400 bg-blue-50/30",
  warning: "border-t-amber-400 bg-amber-50/30",
  urgent: "border-t-red-500 bg-red-50/40",
};

const severityValueStyles: Record<MetricSeverity, string> = {
  healthy: "text-emerald-800",
  info: "text-blue-800",
  warning: "text-amber-800",
  urgent: "text-red-800",
};

const severityIconStyles: Record<MetricSeverity, string> = {
  healthy: "text-emerald-600",
  info: "text-blue-600",
  warning: "text-amber-600",
  urgent: "text-red-600",
};

export function AdminMetricCard({
  label,
  value,
  detail,
  icon,
  severity = "healthy",
  href,
  onClick,
}: AdminMetricCardProps) {
  const Wrapper = href ? "a" : onClick ? "button" : "div";
  const wrapperProps = href
    ? { href, className: "block cursor-pointer" }
    : onClick
      ? { onClick, className: "block cursor-pointer text-left w-full" }
      : { className: "block" };

  return (
    <Wrapper {...(wrapperProps as any)}>
      <div
        className={cn(
          "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md",
          "border-t-4",
          severityStyles[severity],
        )}
      >
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
            {label}
          </p>
          <span className={cn("shrink-0", severityIconStyles[severity])}>
            {icon}
          </span>
        </div>
        <p className={cn("mt-2 text-3xl font-bold", severityValueStyles[severity])}>
          {value}
        </p>
        {detail ? (
          <p className="mt-1.5 text-xs leading-5 text-slate-500">{detail}</p>
        ) : null}
      </div>
    </Wrapper>
  );
}
