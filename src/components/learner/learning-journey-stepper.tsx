"use client";

import { cn } from "@/lib/utils";

interface LearningJourneyStepperProps {
  stages: string[];
  currentStage: string;
  onSelect: (stage: string) => void;
  selectedStage: string | null;
}

const STAGE_COLORS: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  "Getting started": {
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-800",
    dot: "bg-blue-500",
  },
  "Building control": {
    bg: "bg-purple-50",
    border: "border-purple-200",
    text: "text-purple-800",
    dot: "bg-purple-500",
  },
  "Reading the road": {
    bg: "bg-teal-50",
    border: "border-teal-200",
    text: "text-teal-800",
    dot: "bg-teal-500",
  },
  "Complex situations": {
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-800",
    dot: "bg-amber-500",
  },
  "Independent driving": {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-800",
    dot: "bg-emerald-500",
  },
};

export function LearningJourneyStepper({
  stages,
  currentStage,
  onSelect,
  selectedStage,
}: LearningJourneyStepperProps) {
  const currentIndex = stages.indexOf(currentStage);

  return (
    <div className="relative">
      {/* Connecting line (desktop) */}
      <div className="hidden sm:block absolute top-5 left-0 right-0 h-0.5 bg-slate-200 -z-10" />

      <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-0">
        {stages.map((stage, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isSelected = selectedStage === stage;
          const colors = STAGE_COLORS[stage] ?? STAGE_COLORS["Getting started"];

          return (
            <button
              key={stage}
              onClick={() => onSelect(isSelected ? "" : stage)}
              className={cn(
                "flex-1 flex flex-row sm:flex-col items-center gap-3 sm:gap-2 rounded-xl p-3 sm:p-2 transition-all text-left",
                isSelected && `${colors.bg} ${colors.border} border`,
                !isSelected && "hover:bg-slate-50",
              )}
            >
              {/* Dot */}
              <div
                className={cn(
                  "relative flex items-center justify-center h-10 w-10 rounded-full border-2 shrink-0 transition-all",
                  isCompleted || isCurrent
                    ? `${colors.border} ${colors.bg}`
                    : "border-slate-200 bg-white",
                  isSelected && "ring-2 ring-offset-2 ring-[var(--brand)]",
                )}
              >
                <span
                  className={cn(
                    "h-3 w-3 rounded-full transition-all",
                    isCompleted || isCurrent ? colors.dot : "bg-slate-300",
                    isCurrent && "ring-2 ring-offset-1 ring-white",
                  )}
                />
                {isCurrent && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--brand)] text-[10px] font-bold text-white">
                    {index + 1}
                  </span>
                )}
              </div>

              {/* Label */}
              <div className="min-w-0 flex-1 sm:text-center">
                <p
                  className={cn(
                    "text-sm font-semibold leading-tight",
                    isCompleted || isCurrent ? colors.text : "text-slate-500",
                  )}
                >
                  {stage}
                </p>
                {isCurrent && (
                  <p className="mt-0.5 text-[10px] font-medium text-[var(--brand)]">
                    You are here
                  </p>
                )}
                {isCompleted && (
                  <p className="mt-0.5 text-[10px] text-slate-400">
                    Completed
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
