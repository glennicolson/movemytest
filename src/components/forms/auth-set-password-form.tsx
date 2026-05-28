"use client";

import { useActionState } from "react";
import { PasswordInput } from "@/components/forms/password-input";
import { initialPasswordSetActionState, type PasswordSetActionState } from "@/lib/auth/form-state";

export function AuthSetPasswordForm({
  action,
  token,
  submitLabel,
  helper,
}: {
  action: (state: PasswordSetActionState, formData: FormData) => Promise<PasswordSetActionState>;
  token: string;
  submitLabel: string;
  helper: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialPasswordSetActionState);

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <input type="hidden" name="token" value={token} />
      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">New password</label>
        <PasswordInput
          id="password"
          name="password"
          autoComplete="new-password"
          className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-[var(--brand)] focus:ring-2 focus:ring-[color:var(--brand-soft)]"
          required
          minLength={10}
        />
      </div>
      <div>
        <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium text-slate-700">Confirm password</label>
        <PasswordInput
          id="confirmPassword"
          name="confirmPassword"
          autoComplete="new-password"
          className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-[var(--brand)] focus:ring-2 focus:ring-[color:var(--brand-soft)]"
          required
          minLength={10}
        />
      </div>
      <p className="text-xs text-slate-500">{helper}</p>
      {state.status === "error" ? <p className="text-sm font-medium text-rose-700">{state.message}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-[var(--brand)] px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Saving password..." : submitLabel}
      </button>
    </form>
  );
}
