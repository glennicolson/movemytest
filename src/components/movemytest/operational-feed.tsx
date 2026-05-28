"use client";

import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Info,
  Mail,
  MessageSquare,
  ShieldCheck,
  UserCheck,
  type LucideIcon,
} from "lucide-react";

export type FeedSeverity = "info" | "success" | "warning" | "error";

export interface FeedItem {
  id: string;
  message: string;
  severity: FeedSeverity;
  timestamp?: string;
  icon?: LucideIcon;
}

const severityConfig: Record<
  FeedSeverity,
  { icon: LucideIcon; iconClass: string; bgClass: string; textClass: string; borderClass: string }
> = {
  info: {
    icon: Info,
    iconClass: "text-blue-500",
    bgClass: "bg-blue-50",
    textClass: "text-blue-800",
    borderClass: "border-blue-200",
  },
  success: {
    icon: CheckCircle2,
    iconClass: "text-emerald-500",
    bgClass: "bg-emerald-50",
    textClass: "text-emerald-800",
    borderClass: "border-emerald-200",
  },
  warning: {
    icon: AlertTriangle,
    iconClass: "text-amber-500",
    bgClass: "bg-amber-50",
    textClass: "text-amber-800",
    borderClass: "border-amber-200",
  },
  error: {
    icon: AlertCircle,
    iconClass: "text-red-500",
    bgClass: "bg-red-50",
    textClass: "text-red-800",
    borderClass: "border-red-200",
  },
};

function getDefaultIcon(type: string): LucideIcon {
  const map: Record<string, LucideIcon> = {
    email: Mail,
    note: MessageSquare,
    support: MessageSquare,
    privacy: ShieldCheck,
    audit: UserCheck,
  };
  return map[type] ?? Info;
}

export interface OperationalFeedProps {
  items: FeedItem[];
  maxItems?: number;
  title?: string;
}

export function OperationalFeed({
  items,
  maxItems = 6,
  title = "Operational Activity",
}: OperationalFeedProps) {
  if (items.length === 0) return null;

  const displayItems = items.slice(0, maxItems);
  const hasMore = items.length > maxItems;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
          {title}
        </h3>
        <span className="text-xs text-slate-400">
          {items.length} total
        </span>
      </div>
      <div className="mt-4 space-y-2">
        {displayItems.map((item) => {
          const config = severityConfig[item.severity];
          const Icon = item.icon ?? config.icon;

          return (
            <div
              key={item.id}
              className={cn(
                "flex items-start gap-3 rounded-xl border px-4 py-3",
                config.bgClass,
                config.borderClass,
              )}
            >
              <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", config.iconClass)} />
              <div className="min-w-0 flex-1">
                <p className={cn("text-sm leading-5", config.textClass)}>
                  {item.message}
                </p>
                {item.timestamp ? (
                  <p className="mt-0.5 text-xs text-slate-500">{item.timestamp}</p>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
      {hasMore ? (
        <p className="mt-3 text-center text-xs text-slate-400">
          +{items.length - maxItems} more items
        </p>
      ) : null}
    </div>
  );
}
