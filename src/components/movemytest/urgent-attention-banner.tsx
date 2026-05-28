"use client";

import { cn } from "@/lib/utils";
import { AlertTriangle, AlertCircle, XCircle, X } from "lucide-react";
import { useState } from "react";

export interface UrgentItem {
  id: string;
  message: string;
  severity: "urgent" | "warning";
  actionLabel?: string;
  actionHref?: string;
  actionOnClick?: () => void;
}

export interface UrgentAttentionBannerProps {
  items: UrgentItem[];
}

export function UrgentAttentionBanner({ items }: UrgentAttentionBannerProps) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  if (items.length === 0) return null;

  const visibleItems = items.filter((item) => !dismissed.has(item.id));
  if (visibleItems.length === 0) return null;

  const hasUrgent = visibleItems.some((item) => item.severity === "urgent");

  return (
    <div
      className={cn(
        "rounded-2xl border p-4 shadow-sm",
        hasUrgent
          ? "border-red-300 bg-red-50"
          : "border-amber-300 bg-amber-50",
      )}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 shrink-0">
          {hasUrgent ? (
            <XCircle className="h-5 w-5 text-red-600" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-amber-600" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3
            className={cn(
              "text-sm font-semibold",
              hasUrgent ? "text-red-900" : "text-amber-900",
            )}
          >
            {hasUrgent
              ? `${visibleItems.filter((i) => i.severity === "urgent").length} urgent item${visibleItems.filter((i) => i.severity === "urgent").length !== 1 ? "s" : ""} require${visibleItems.filter((i) => i.severity === "urgent").length === 1 ? "s" : ""} attention`
              : `${visibleItems.length} warning${visibleItems.length !== 1 ? "s" : ""} to review`}
          </h3>
          <div className="mt-2 space-y-2">
            {visibleItems.map((item) => {
              const ActionWrapper = item.actionHref
                ? "a"
                : item.actionOnClick
                  ? "button"
                  : "span";
              const actionProps = item.actionHref
                ? { href: item.actionHref, className: "underline hover:no-underline" }
                : item.actionOnClick
                  ? {
                      onClick: item.actionOnClick,
                      className: "underline hover:no-underline",
                    }
                  : {};

              return (
                <div
                  key={item.id}
                  className="flex items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-2">
                    <AlertCircle
                      className={cn(
                        "mt-0.5 h-4 w-4 shrink-0",
                        item.severity === "urgent"
                          ? "text-red-500"
                          : "text-amber-500",
                      )}
                    />
                    <span
                      className={cn(
                        "text-sm leading-5",
                        item.severity === "urgent"
                          ? "text-red-800"
                          : "text-amber-800",
                      )}
                    >
                      {item.message}
                      {item.actionLabel ? (
                        <>{" "}
                          <ActionWrapper
                            {...(actionProps as any)}
                            className={cn(
                              "font-semibold",
                              item.severity === "urgent"
                                ? "text-red-700"
                                : "text-amber-700",
                              actionProps.className,
                            )}
                          >
                            {item.actionLabel}
                          </ActionWrapper>
                        </>
                      ) : null}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setDismissed((prev) => new Set(prev).add(item.id))
                    }
                    className={cn(
                      "shrink-0 rounded-full p-1 transition-colors",
                      item.severity === "urgent"
                        ? "text-red-400 hover:bg-red-100 hover:text-red-600"
                        : "text-amber-400 hover:bg-amber-100 hover:text-amber-600",
                    )}
                    aria-label="Dismiss"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
