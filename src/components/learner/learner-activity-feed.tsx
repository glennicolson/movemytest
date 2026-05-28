"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  BookOpen,
  GraduationCap,
  Car,
  AlertTriangle,
  Bell,
  Clock,
  FileText,
  Target,
} from "lucide-react";

export interface ActivityItem {
  id: string;
  message: string;
  timestamp: Date;
  type: "lesson" | "skill" | "test" | "swap" | "invoice" | "goal" | "prep";
  link?: string;
}

const TYPE_CONFIG: Record<
  ActivityItem["type"],
  { border: string; bg: string; icon: React.ReactNode }
> = {
  lesson: {
    border: "border-l-blue-400",
    bg: "bg-blue-50",
    icon: <Car className="h-4 w-4 text-blue-500" />,
  },
  skill: {
    border: "border-l-emerald-400",
    bg: "bg-emerald-50",
    icon: <GraduationCap className="h-4 w-4 text-emerald-500" />,
  },
  test: {
    border: "border-l-amber-400",
    bg: "bg-amber-50",
    icon: <BookOpen className="h-4 w-4 text-amber-500" />,
  },
  swap: {
    border: "border-l-violet-400",
    bg: "bg-violet-50",
    icon: <Clock className="h-4 w-4 text-violet-500" />,
  },
  invoice: {
    border: "border-l-red-400",
    bg: "bg-red-50",
    icon: <FileText className="h-4 w-4 text-red-500" />,
  },
  goal: {
    border: "border-l-emerald-300",
    bg: "bg-emerald-50",
    icon: <Target className="h-4 w-4 text-emerald-600" />,
  },
  prep: {
    border: "border-l-blue-300",
    bg: "bg-blue-50",
    icon: <BookOpen className="h-4 w-4 text-blue-400" />,
  },
};

function formatRelative(timestamp: Date | string): string {
  if (!timestamp) return "Unknown";
  const t = typeof timestamp === "string" ? new Date(timestamp) : timestamp;
  if (isNaN(t.getTime())) return "Invalid date";
  const diffMs = Date.now() - t.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" }).format(t);
}

interface LearnerActivityFeedProps {
  items: ActivityItem[];
  className?: string;
}

export function LearnerActivityFeed({ items, className }: LearnerActivityFeedProps) {
  if (items.length === 0) {
    return (
      <div className={cn("rounded-2xl border border-slate-200 bg-white p-5 shadow-sm", className)}>
        <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
          Recent Activity
        </h3>
        <div className="mt-4 flex items-center gap-3 text-sm text-slate-400">
          <Bell className="h-5 w-5" />
          <p>No recent activity to show.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("rounded-2xl border border-slate-200 bg-white p-5 shadow-sm", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
          Recent Activity
        </h3>
        <span className="text-xs text-slate-400">{items.length} events</span>
      </div>
      <div className="mt-4 space-y-2">
        {items.map((item) => {
          const config = TYPE_CONFIG[item.type];
          const Wrapper = item.link ? Link : "div";

          return (
            <Wrapper
              key={item.id}
              href={(item.link || "#") as any}
              className={cn(
                "flex items-start gap-3 rounded-lg border-l-4 px-3 py-2.5 transition-colors",
                config.border,
                config.bg,
                item.link && "cursor-pointer hover:bg-opacity-80"
              )}
            >
              <span className="mt-0.5 shrink-0">{config.icon}</span>
              <div className="min-w-0 flex-1">
                <p className="text-xs leading-5 text-slate-700">{item.message}</p>
                <p className="mt-0.5 text-[10px] text-slate-400">{formatRelative(item.timestamp)}</p>
              </div>
            </Wrapper>
          );
        })}
      </div>
    </div>
  );
}
