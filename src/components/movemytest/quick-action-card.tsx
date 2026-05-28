"use client";

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export interface QuickActionCardProps {
  title: string;
  summary: string;
  icon: ReactNode;
  href?: string;
  onClick?: () => void;
  badge?: string;
  badgeTone?: "neutral" | "success" | "warning" | "danger" | "info";
}

const badgeStyles: Record<NonNullable<QuickActionCardProps["badgeTone"]>, string> = {
  neutral: "bg-slate-100 text-slate-700",
  success: "bg-emerald-100 text-emerald-700",
  warning: "bg-amber-100 text-amber-700",
  danger: "bg-red-100 text-red-700",
  info: "bg-blue-100 text-blue-700",
};

export function QuickActionCard({
  title,
  summary,
  icon,
  href,
  onClick,
  badge,
  badgeTone = "neutral",
}: QuickActionCardProps) {
  const Wrapper = href ? "a" : onClick ? "button" : "div";
  const wrapperProps = href
    ? { href, className: "block cursor-pointer" }
    : onClick
      ? { onClick, className: "block cursor-pointer text-left w-full" }
      : { className: "block" };

  return (
    <Wrapper {...(wrapperProps as any)}>
      <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md hover:border-slate-300">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-slate-900">{title}</p>
            {badge ? (
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs font-semibold",
                  badgeStyles[badgeTone],
                )}
              >
                {badge}
              </span>
            ) : null}
          </div>
          <p className="mt-0.5 text-xs text-slate-500 truncate">{summary}</p>
        </div>
      </div>
    </Wrapper>
  );
}
