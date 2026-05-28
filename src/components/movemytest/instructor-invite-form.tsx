"use client";

import { useActionState } from "react";
import { inviteLearnerToMoveMyTestAction } from "@/features/movemytest/instructor-actions";

const initialInviteState = { status: "idle" as const, message: "" };

export function InstructorInviteForm() {
  const [state, action, pending] = useActionState(inviteLearnerToMoveMyTestAction, initialInviteState);

  return (
    <form action={action} className="space-y-4">
      {state.status === "success" ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-950">
          {state.message}
        </div>
      ) : state.status === "error" ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-950">
          {state.message}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm font-medium text-slate-800">
          Learner email
          <input name="email" type="email" required className="w-full rounded-xl border border-slate-300 px-3 py-3 text-sm" placeholder="learner@email.com" />
        </label>
        <label className="space-y-2 text-sm font-medium text-slate-800">
          Learner name (optional)
          <input name="learnerName" type="text" className="w-full rounded-xl border border-slate-300 px-3 py-3 text-sm" placeholder="Jane Smith" />
        </label>
        <label className="space-y-2 text-sm font-medium text-slate-800 md:col-span-2">
          Mobile number (optional)
          <input name="mobileNumber" type="tel" className="w-full rounded-xl border border-slate-300 px-3 py-3 text-sm" placeholder="07..." />
        </label>
      </div>

      <button
        disabled={pending}
        className="rounded-full bg-[var(--brand)] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--brand-strong)] disabled:opacity-60"
      >
        {pending ? "Sending invite..." : "Send invite link"}
      </button>

      <p className="text-xs text-slate-500">
        The learner will receive an email with a registration link. When they create an account, your ADI number will be pre-filled so their future listings are visible to you.
      </p>
    </form>
  );
}
