"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export type TabItem = {
  id: string;
  label: string;
  content: React.ReactNode;
  count?: number | string;
  tone?: "neutral" | "not-started" | "in-progress" | "nearly-ready" | "complete";
  activeClassName?: string;
  inactiveClassName?: string;
  activeCountClassName?: string;
  inactiveCountClassName?: string;
};

function tabToneClass(tone: TabItem["tone"], isActive: boolean) {
  if (isActive) {
    if (tone === "not-started") return "border-slate-600 bg-slate-700 text-white shadow-sm";
    if (tone === "in-progress") return "border-amber-600 bg-amber-600 text-white shadow-sm";
    if (tone === "nearly-ready") return "border-blue-700 bg-blue-700 text-white shadow-sm";
    if (tone === "complete") return "border-emerald-700 bg-emerald-700 text-white shadow-sm";
    return "border-[var(--brand)] bg-[var(--brand)] text-white shadow-sm";
  }

  if (tone === "not-started") return "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-400 hover:bg-white";
  if (tone === "in-progress") return "border-amber-200 bg-amber-50 text-amber-900 hover:border-amber-400 hover:bg-white";
  if (tone === "nearly-ready") return "border-blue-200 bg-blue-50 text-blue-950 hover:border-blue-400 hover:bg-white";
  if (tone === "complete") return "border-emerald-200 bg-emerald-50 text-emerald-950 hover:border-emerald-400 hover:bg-white";
  return "border-slate-200 bg-slate-50 text-slate-700 hover:border-[var(--brand)] hover:bg-white hover:text-slate-900";
}

function countToneClass(tone: TabItem["tone"], isActive: boolean) {
  if (isActive) return "bg-white/20 text-white";
  if (tone === "not-started") return "bg-slate-200 text-slate-700";
  if (tone === "in-progress") return "bg-amber-200 text-amber-950";
  if (tone === "nearly-ready") return "bg-blue-200 text-blue-950";
  if (tone === "complete") return "bg-emerald-200 text-emerald-950";
  return "bg-slate-200 text-slate-700";
}

export function Tabs({ items, initialTabId, className }: { items: TabItem[]; initialTabId?: string; className?: string }) {
  const firstTabId = initialTabId && items.some((item) => item.id === initialTabId) ? initialTabId : items[0]?.id;
  const [activeTab, setActiveTab] = useState(firstTabId);

  if (!items.length || !activeTab) {
    return null;
  }

  const activeItem = items.find((item) => item.id === activeTab) ?? items[0];

  return (
    <div className={cn("min-w-0 space-y-4", className)}>
      <div className="max-w-full overflow-hidden">
        <div className="flex min-w-0 flex-wrap items-stretch gap-2 rounded-2xl border border-[var(--border)] bg-white p-2 shadow-sm md:gap-3 md:p-3">
          {items.map((item) => {
            const isActive = item.id === activeTab;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "flex min-w-[calc(50%-0.25rem)] flex-1 items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-left text-sm font-semibold transition-all sm:min-w-[150px] sm:max-w-[260px] md:max-w-[320px] md:gap-3 md:px-4 md:py-3",
                  isActive
                    ? (item.activeClassName ?? tabToneClass(item.tone, true))
                    : (item.inactiveClassName ?? tabToneClass(item.tone, false)),
                )}
                aria-pressed={isActive}
              >
                <span className="truncate">{item.label}</span>
                {item.count !== undefined ? (
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-bold",
                      isActive
                        ? (item.activeCountClassName ?? countToneClass(item.tone, true))
                        : (item.inactiveCountClassName ?? countToneClass(item.tone, false)),
                    )}
                  >
                    {item.count}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
      <div>{activeItem?.content}</div>
    </div>
  );
}
