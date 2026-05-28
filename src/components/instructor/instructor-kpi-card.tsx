"use client";

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export type KpiTone = "neutral" | "success" | "warning" | "danger" | "info";

export interface InstructorKpiCardProps {
  label: string;
  value: number | string;
  subtitle?: string;
  icon: ReactNode;
  tone?: KpiTone;
  onClick?: () => void;
}

const toneStyles: Record<KpiTone, { border: string; bg: string; valueClass: string; iconClass: string }> = {
  neutral: { border: "border-slate-200", bg: "bg-white", valueClass: "text-slate-900", iconClass: "text-slate-400" },
  success: { border: "border-emerald-200", bg: "bg-emerald-50/50", valueClass: "text-emerald-800", iconClass: "text-emerald-500" },
  warning: { border: "border-amber-200", bg: "bg-amber-50/50", valueClass: "text-amber-800", iconClass: "text-amber-500" },
  danger: { border: "border-red-200", bg: "bg-red-50/50", valueClass: "text-red-800", iconClass: "text-red-500" },
  info: { border: "border-blue-200", bg: "bg-blue-50/50", valueClass: "text-blue-800", iconClass: "text-blue-500" },
};

export function InstructorKpiCard({
  label,
  value,
  subtitle,
  icon,
  tone = "neutral",
  onClick,
}: InstructorKpiCardProps) {
  const styles = toneStyles[tone];
  const Wrapper = onClick ? "button" : "div";

  return (
    <Wrapper
      {...(onClick ? { onClick, type: "button" as const } : {})}
      className={cn(
        "rounded-2xl border p-3 sm:p-4 text-left transition-shadow hover:shadow-sm min-w-0",
        styles.border,
        styles.bg,
        onClick && "cursor-pointer",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 truncate">{label}</p>
        <span className={cn("shrink-0", styles.iconClass)}>{icon}</span>
      </div>
      <p className={cn("mt-1 sm:mt-2 text-xl sm:text-2xl font-bold", styles.valueClass)}>{value}</p>
      {subtitle && <p className="mt-1 text-[10px] sm:text-xs text-slate-500 truncate">{subtitle}</p>}
    </Wrapper>
  );
}
