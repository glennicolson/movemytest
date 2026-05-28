"use client";

import { useState } from "react";
import { Star, Send } from "lucide-react";
import { addSelfAssessment } from "@/features/learners/bridge-actions";
import { cn } from "@/lib/utils";

const CONFIDENCE_LEVELS = [
  { value: "NOT_CONFIDENT", label: "Not confident", stars: 1 },
  { value: "SLIGHTLY_CONFIDENT", label: "Slightly confident", stars: 2 },
  { value: "MODERATELY_CONFIDENT", label: "Moderately confident", stars: 3 },
  { value: "VERY_CONFIDENT", label: "Very confident", stars: 4 },
  { value: "FULLY_CONFIDENT", label: "Fully confident", stars: 5 },
];

interface SelfAssessmentFormProps {
  learnerId: string;
  skillLabel: string;
  lessonId?: string;
  onSubmitted?: () => void;
}

export function SelfAssessmentForm({
  learnerId,
  skillLabel,
  lessonId,
  onSubmitted,
}: SelfAssessmentFormProps) {
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit() {
    if (!selectedLevel) return;
    setSubmitting(true);

    const formData = new FormData();
    formData.append("learnerId", learnerId);
    formData.append("skillLabel", skillLabel);
    formData.append("confidence", selectedLevel);
    formData.append("notes", notes);
    if (lessonId) formData.append("lessonId", lessonId);

    await addSelfAssessment(formData);
    setSubmitting(false);
    setSubmitted(true);
    onSubmitted?.();
  }

  if (submitted) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center">
        <p className="text-sm font-medium text-emerald-800">
          ✓ Assessment recorded for {skillLabel}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
        How confident do you feel?
      </h3>
      <p className="mt-1 text-xs text-slate-400">{skillLabel}</p>

      <div className="mt-4 space-y-2">
        {CONFIDENCE_LEVELS.map((level) => (
          <button
            key={level.value}
            onClick={() => setSelectedLevel(level.value)}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl border p-3 transition-all text-left",
              selectedLevel === level.value
                ? "border-[var(--brand)] bg-[var(--instructor-mint)]"
                : "border-slate-100 bg-slate-50/50 hover:border-slate-200"
            )}
          >
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-4 w-4",
                    i < level.stars
                      ? "fill-amber-400 text-amber-400"
                      : "text-slate-200"
                  )}
                />
              ))}
            </div>
            <span className="text-sm font-medium text-slate-700">{level.label}</span>
          </button>
        ))}
      </div>

      <div className="mt-4">
        <label className="text-xs font-medium text-slate-500">
          Any notes for your instructor? (optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[var(--brand)] focus:outline-none"
          rows={3}
          placeholder="e.g. I struggled with the clutch control today..."
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={!selectedLevel || submitting}
        className={cn(
          "mt-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white transition-colors",
          selectedLevel && !submitting
            ? "bg-[var(--brand)] hover:bg-[var(--brand-strong)]"
            : "bg-slate-300 cursor-not-allowed"
        )}
      >
        <Send className="h-4 w-4" />
        {submitting ? "Submitting..." : "Submit Assessment"}
      </button>
    </div>
  );
}
