"use client";

import { useState } from "react";
import { BookOpenCheck, Clock, User, ArrowRight } from "lucide-react";
import { updateLessonPrepStatus } from "@/features/learners/bridge-actions";
import { cn } from "@/lib/utils";
import { formatPortalDateTime } from "@/lib/portal/formatters";

interface LessonPrep {
  id: string;
  title: string;
  description: string | null;
  resourceLink: string | null;
  dueBefore: Date | null;
  status: string;
  createdAt: Date;
  instructor: {
    user: { firstName: string; lastName: string };
  };
}

interface LessonPrepCardProps {
  prepItems: LessonPrep[];
}

const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; border: string; text: string }
> = {
  ASSIGNED: {
    label: "To do",
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-800",
  },
  IN_PROGRESS: {
    label: "In progress",
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-800",
  },
  COMPLETED: {
    label: "Done",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-800",
  },
  SKIPPED: {
    label: "Skipped",
    bg: "bg-slate-50",
    border: "border-slate-200",
    text: "text-slate-500",
  },
};

export function LessonPrepCard({ prepItems }: LessonPrepCardProps) {
  const [items, setItems] = useState(prepItems);

  async function handleStatusChange(prepId: string, newStatus: string) {
    setItems((prev) =>
      prev.map((item) =>
        item.id === prepId ? { ...item, status: newStatus } : item
      )
    );

    const formData = new FormData();
    formData.append("prepId", prepId);
    formData.append("status", newStatus);
    await updateLessonPrepStatus(formData);
  }

  if (prepItems.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-[var(--instructor-mint)]/50 bg-[var(--instructor-mint)] p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-600">
          Pre-Lesson Prep
        </h3>
        <span className="text-xs text-slate-500">
          {items.filter((i) => ["ASSIGNED", "IN_PROGRESS"].includes(i.status)).length} pending
        </span>
      </div>

      <div className="mt-4 space-y-3">
        {items.map((item) => {
          const config = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.ASSIGNED;

          return (
            <div
              key={item.id}
              className={cn(
                "rounded-xl border p-4 transition-colors",
                config.border,
                config.bg
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <BookOpenCheck className={cn("h-4 w-4", config.text)} />
                    <p className="font-semibold text-slate-900">{item.title}</p>
                  </div>
                  {item.description && (
                    <p className="mt-1 text-xs text-slate-600">{item.description}</p>
                  )}
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      From {item.instructor.user.firstName}
                    </span>
                    {item.dueBefore && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Before {formatPortalDateTime(item.dueBefore)}
                      </span>
                    )}
                  </div>
                  {item.resourceLink && (
                    <a
                      href={item.resourceLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-[var(--brand)] hover:underline"
                    >
                      <BookOpenCheck className="h-3 w-3" />
                      Read resource
                      <ArrowRight className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>

              <div className="mt-3 flex gap-2">
                {item.status === "ASSIGNED" && (
                  <>
                    <button
                      onClick={() => handleStatusChange(item.id, "IN_PROGRESS")}
                      className="rounded-full bg-[var(--brand)] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[var(--brand-strong)] transition-colors"
                    >
                      Start
                    </button>
                    <button
                      onClick={() => handleStatusChange(item.id, "SKIPPED")}
                      className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:border-slate-300 transition-colors"
                    >
                      Skip
                    </button>
                  </>
                )}
                {item.status === "IN_PROGRESS" && (
                  <button
                    onClick={() => handleStatusChange(item.id, "COMPLETED")}
                    className="rounded-full bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-600 transition-colors"
                  >
                    Mark Complete
                  </button>
                )}
                {item.status === "COMPLETED" && (
                  <span className="text-xs font-medium text-emerald-600">
                    ✓ Completed
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
