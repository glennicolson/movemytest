"use client";

import { useActionState } from "react";
import { initialMoveMyTestActionState } from "@/features/movemytest/action-state";
import { submitInstructorSupportAction } from "@/features/movemytest/instructor-support-actions";

const categories = [
  { value: "INSTRUCTOR_GENERAL", label: "General question" },
  { value: "INSTRUCTOR_MATCH", label: "Help with a learner match" },
  { value: "INSTRUCTOR_LEARNER_LINK", label: "Linking learners" },
  { value: "INSTRUCTOR_TECHNICAL", label: "Technical issue" },
  { value: "INSTRUCTOR_ACCOUNT", label: "Account// login" },
];

export function InstructorSupportTicketForm() {
  const [state, action, pending] = useActionState(submitInstructorSupportAction, initialMoveMyTestActionState);

  return (
    <form action={action} className="mt-5 space-y-4">
      {state.status === "success" ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-950">
          {state.message}
        </div>
      ) : state.status === "error" ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-950">
          {state.message}
        </div>
      ) : null}

      <label className="space-y-2 text-sm font-medium text-slate-800">
        Category
        <select name="category" className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm">
          {categories.map((cat) => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>
      </label>

      <label className="space-y-2 text-sm font-medium text-slate-800">
        Your message
        <textarea
          name="detail"
          required
          className="min-h-32 w-full rounded-xl border border-slate-300 p-3 text-sm"
          placeholder="Tell MoveMyTest what you need help with. Include relevant match ID or learner details if applicable."
        />
      </label>

      <button
        disabled={pending}
        className="rounded-full bg-[var(--brand)] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--brand-strong)] disabled:opacity-60"
      >
        {pending ? "Sending..." : "Send support message"}
      </button>
    </form>
  );
}
