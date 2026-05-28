"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export interface TimelineBlock {
  id: string;
  label: string;
  startHour: number; // 0-24
  startMinute: number; // 0-59
  endHour: number;
  endMinute: number;
  color?: "green" | "red" | "amber" | "slate";
}

export interface TimelineBarProps {
  blocks: TimelineBlock[];
  dayStartHour?: number;// default 7
  dayEndHour?: number;// default 21
  currentTime?: { hour: number; minute: number } | null;
  className?: string;
}

const colorMap: Record<NonNullable<TimelineBlock["color"]>, { bg: string; border: string; text: string }> = {
  green: { bg: "bg-[var(--instructor-timeline-block-bg)]", border: "border-[var(--instructor-timeline-block)]", text: "text-[var(--brand-strong)]" },
  red: { bg: "bg-red-100", border: "border-red-500", text: "text-red-800" },
  amber: { bg: "bg-amber-100", border: "border-amber-500", text: "text-amber-800" },
  slate: { bg: "bg-slate-100", border: "border-slate-400", text: "text-slate-700" },
};

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [matches, query]);

  return matches;
}

export function TimelineBar({
  blocks,
  dayStartHour: propDayStartHour = 7,
  dayEndHour: propDayEndHour = 21,
  currentTime,
  className,
}: TimelineBarProps) {
// On mobile, reduce hours shown to 4 hours for better visibility
  const isMobile = useMediaQuery("(max-width: 640px)");
  
// Calculate visible range based on blocks and current time
  const calculateVisibleRange = () => {
    if (!isMobile) {
      return { start: propDayStartHour, end: propDayEndHour };
    }

// On mobile: find the relevant time window
    let earliestBlock = propDayEndHour;
    let latestBlock = propDayStartHour;

    blocks.forEach(block => {
      if (block.startHour < earliestBlock) earliestBlock = block.startHour;
      if (block.endHour > latestBlock) latestBlock = block.endHour;
    });

// Include current time in the range
    if (currentTime) {
      if (currentTime.hour < earliestBlock) earliestBlock = currentTime.hour;
      if (currentTime.hour > latestBlock) latestBlock = currentTime.hour;
    }

// Add padding (1 hour before and after)
    let start = Math.max(propDayStartHour, earliestBlock - 1);
    let end = Math.min(propDayEndHour, latestBlock + 2);

// Ensure minimum 4-hour window on mobile
    if (end - start < 4) {
      end = Math.min(propDayEndHour, start + 4);
    }
    if (end - start < 4) {
      start = Math.max(propDayStartHour, end - 4);
    }

    return { start, end };
  };

  const { start: dayStartHour, end: dayEndHour } = calculateVisibleRange();
  const totalHours = dayEndHour - dayStartHour;

  const toPosition = (hour: number, minute: number): number => {
    return ((hour - dayStartHour + minute / 60) / totalHours) * 100;
  };

  const hourLabels = Array.from({ length: totalHours + 1 }, (_, i) => dayStartHour + i);

  return (
    <div className={cn("w-full", className)}>
      {/* Hour labels - positioned above bar with proper spacing */}
      <div className="relative h-5 sm:h-6 mb-1 w-full">
        {hourLabels.map((hour, i) => {
// On mobile, only show every hour to save space
          return (
            <div
              key={hour}
              className="absolute top-0 text-[10px] sm:text-xs font-medium text-slate-500 whitespace-nowrap"
              style={{ 
                left: `${(i / totalHours) * 100}%`, 
                transform: "translateX(-50%)"
              }}
            >
              {hour}:00
            </div>
          );
        })}
      </div>

      {/* Timeline bar */}
      <div className="relative h-10 sm:h-12 w-full rounded-lg bg-[var(--instructor-timeline-bg)]">
        {/* Current time line */}
        {currentTime && (
          <div
            className="absolute top-0 z-10 h-full w-0.5 bg-red-500"
            style={{ left: `${toPosition(currentTime.hour, currentTime.minute)}%` }}
          />
        )}

        {/* Blocks */}
        {blocks.map((block) => {
// Only show blocks within visible range
          if (block.endHour < dayStartHour || block.startHour > dayEndHour) return null;
          
          const left = toPosition(block.startHour, block.startMinute);
          const width = toPosition(block.endHour, block.endMinute) - left;
          const colors = colorMap[block.color ?? "green"];
          return (
            <div
              key={block.id}
              className={cn(
                "absolute top-1 bottom-1 rounded-md border px-1 sm:px-2 flex items-center overflow-hidden",
                colors.bg,
                colors.border,
              )}
              style={{ left: `${Math.max(0, left)}%`, width: `${Math.max(1, width)}%` }}
              title={block.label}
            >
              <span className={cn("truncate text-[10px] sm:text-xs font-semibold leading-3", colors.text)}>
                {block.label}
              </span>
            </div>
          );
        })}

        {/* Hour markers */}
        <div className="absolute inset-0 flex pointer-events-none">
          {Array.from({ length: totalHours + 1 }, (_, i) => (
            <div
              key={i}
              className="flex-1 border-l border-slate-300/50 first:border-l-0"
            />
          ))}
        </div>
      </div>

      {/* Mobile scroll hint if hours are truncated */}
      {isMobile && (dayStartHour > propDayStartHour || dayEndHour < propDayEndHour) && (
        <p className="mt-1 text-[10px] text-slate-400 text-center sm:hidden">
          Showing {dayStartHour}:00–{dayEndHour}:00 (scroll in Schedule for full day)
        </p>
      )}
    </div>
  );
}