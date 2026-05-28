"use client";

import { cn } from "@/lib/utils";

interface SkillProgressRingProps {
  level: string;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

const LEVEL_CONFIG: Record<string, { color: string; pct: number }> = {
  INTRODUCED: { color: "text-slate-400", pct: 20 },
  DEVELOPING: { color: "text-blue-500", pct: 40 },
  CONFIDENT: { color: "text-amber-500", pct: 60 },
  MASTERED: { color: "text-emerald-500", pct: 80 },
  REFLECTION: { color: "text-violet-500", pct: 100 },
};

export function SkillProgressRing({
  level,
  size = 48,
  strokeWidth = 4,
  className,
}: SkillProgressRingProps) {
  const config = LEVEL_CONFIG[level] ?? { color: "text-slate-300", pct: 0 };
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (config.pct / 100) * circumference;

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)} style={{ width: size, height: size }}>
      <svg className="-rotate-90" width={size} height={size}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-slate-100"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={cn("transition-all duration-500", config.color)}
        />
      </svg>
      <span className={cn("absolute text-[10px] font-bold", config.color)}>
        {config.pct}%
      </span>
    </div>
  );
}
