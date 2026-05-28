"use client";

import { useState } from "react";
import Link from "next/link";
import { Target, CheckCircle2, CalendarDays, User } from "lucide-react";
import { updateGoalStatus } from "@/features/learners/bridge-actions";
import { cn } from "@/lib/utils";
import { formatPortalDate } from "@/lib/portal/formatters";

interface LearnerGoal {
  id: string;
  title: string;
  description: string | null;
  targetSkill: string | null;
  targetLevel: string | null;
  dueDate: Date | null;
  status: string;
  completedAt: Date | null;
  createdAt: Date;
  instructor: {
    user: { firstName: string; lastName: string };
  };
}

interface MyGoalsProps {
  goals: LearnerGoal[];
}

export function MyGoals({ goals }: MyGoalsProps) {
  const [optimisticGoals, setOptimisticGoals] = useState(goals);

  const activeGoals = optimisticGoals.filter((g) => g.status === "ACTIVE");
  const completedGoals = optimisticGoals.filter((g) => g.status === "COMPLETED");

  async function handleComplete(goalId: string) {
    setOptimisticGoals((prev) =>
      prev.map((g) =>
        g.id === goalId ? { ...g, status: "COMPLETED", completedAt: new Date() } : g
      )
    );

    const formData = new FormData();
    formData.append("goalId", goalId);
    formData.append("status", "COMPLETED");
    await updateGoalStatus(formData);
  }

  if (goals.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
          My Goals
        </h3>
        <div className="mt-4 flex items-center gap-3 text-sm text-slate-400">
          <Target className="h-5 w-5" />
          <p>No goals set yet. Your instructor will add goals as you progress.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
          My Goals
        </h3>
        <span className="text-xs text-slate-400">
          {activeGoals.length} active
        </span>
      </div>

      <div className="mt-4 space-y-3">
        {activeGoals.map((goal) => (
          <div
            key={goal.id}
            className="rounded-xl border border-[var(--instructor-mint)] bg-[var(--instructor-mint)]/30 p-4 transition-colors hover:bg-[var(--instructor-mint)]/50"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-900">{goal.title}</p>
                {goal.description && (
                  <p className="mt-1 text-xs text-slate-600">{goal.description}</p>
                )}
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                  {goal.targetSkill && (
                    <span className="flex items-center gap-1">
                      <Target className="h-3 w-3" />
                      {goal.targetSkill}
                      {goal.targetLevel && ` → ${goal.targetLevel}`}
                    </span>
                  )}
                  {goal.dueDate && (
                    <span className="flex items-center gap-1">
                      <CalendarDays className="h-3 w-3" />
                      Due {formatPortalDate(goal.dueDate)}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    Set by {goal.instructor.user.firstName}
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleComplete(goal.id)}
                className="shrink-0 rounded-full border border-emerald-300 bg-emerald-50 p-2 text-emerald-600 hover:bg-emerald-100 transition-colors"
                title="Mark as completed"
              >
                <CheckCircle2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}

        {completedGoals.length > 0 && (
          <details className="mt-4">
            <summary className="cursor-pointer text-xs font-semibold text-slate-500">
              Completed goals ({completedGoals.length})
            </summary>
            <div className="mt-2 space-y-2">
              {completedGoals.map((goal) => (
                <div
                  key={goal.id}
                  className="rounded-xl border border-slate-100 bg-slate-50/50 p-3 opacity-60"
                >
                  <p className="text-sm font-medium text-slate-700 line-through">
                    {goal.title}
                  </p>
                  {goal.completedAt && (
                    <p className="mt-1 text-[10px] text-slate-400">
                      Completed {formatPortalDate(goal.completedAt)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </details>
        )}
      </div>
    </div>
  );
}
