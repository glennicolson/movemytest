"use client";

import { useActionState } from "react";
import {
  initialPasswordResetEmailRequestActionState,
  type PasswordResetEmailRequestActionState,
} from "@/lib/auth/form-state";

export function PasswordResetEmailRequestForm({
  action,
  title,
  helper,
  submitLabel,
}: {
  action: (state: PasswordResetEmailRequestActionState, formData: FormData) => Promise<PasswordResetEmailRequestActionState>;
  title: string;
  helper: string;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialPasswordResetEmailRequestActionState);

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <div>
        <label htmlFor={`${title}-email`} className="mb-1 block text-sm font-medium text-slate-700">Email</label>
        <input
          id={`${title}-email`}
          name="email"
          type="email"
          className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-[var(--brand)] focus:ring-2 focus:ring-[color:var(--brand-soft)]"
          autoComplete="email"
          required
        />
      </div>
      <p className="text-xs text-slate-500">{helper}</p>
      {state.status === "error" ? <p className="text-sm font-medium text-rose-700">{state.message}</p> : null}
      {state.status === "success" ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          <p className="font-medium">{state.message}</p>
        </div>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-[var(--brand)] px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Sending email..." : submitLabel}
      </button>
    </form>
  );
}
