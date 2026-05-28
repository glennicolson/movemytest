"use client";

import { cn } from "@/lib/utils";

export interface SegmentOption {
  id: string;
  label: string;
  badge?: number;
}

export interface SegmentControlProps {
  options: SegmentOption[];
  active: string;
  onChange: (id: string) => void;
  className?: string;
}

export function SegmentControl({
  options,
  active,
  onChange,
  className,
}: SegmentControlProps) {
  return (
    <div className={cn("flex max-w-full gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1", className)} role="tablist">
      {options.map((option) => {
        const isActive = option.id === active;
        return (
          <button
            key={option.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(option.id)}
            className={cn(
              "relative min-w-fit flex-1 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold transition-all",
              isActive
                ? "bg-white text-[var(--instructor-tab-active)] shadow-sm ring-1 ring-slate-200/60"
                : "text-[var(--instructor-tab-inactive)] hover:text-slate-700",
            )}
          >
            {option.label}
            {option.badge !== undefined && option.badge > 0 && (
              <span className="ml-1.5 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-slate-200 px-1 text-[10px] font-bold text-slate-600">
                {option.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
