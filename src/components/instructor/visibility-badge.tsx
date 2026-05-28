"use client";

import { cn } from "@/lib/utils";
import { Eye, Lock } from "lucide-react";

export type VisibilityBadgeVariant = "shared" | "private";

export interface VisibilityBadgeProps {
  variant: VisibilityBadgeVariant;
  className?: string;
  label?: string;
}

const config: Record<VisibilityBadgeVariant, { bg: string; border: string; text: string; icon: typeof Eye; defaultLabel: string }> = {
  shared: {
    bg: "bg-[var(--instructor-shared)]",
    border: "border-[var(--instructor-shared-border)]",
    text: "text-amber-800",
    icon: Eye,
    defaultLabel: "SHARED WITH PUPIL",
  },
  private: {
    bg: "bg-[var(--instructor-private)]",
    border: "border-[var(--instructor-private-border)]",
    text: "text-red-800",
    icon: Lock,
    defaultLabel: "PRIVATE TO YOU",
  },
};

export function VisibilityBadge({ variant, className, label }: VisibilityBadgeProps) {
  const { bg, border, text, icon: Icon, defaultLabel } = config[variant];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.05em]",
        bg,
        border,
        text,
        className,
      )}
    >
      <Icon className="h-3 w-3" />
      {label ?? defaultLabel}
    </span>
  );
}
