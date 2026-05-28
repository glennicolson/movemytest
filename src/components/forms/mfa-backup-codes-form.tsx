"use client";

import { useActionState } from "react";
import { PasswordInput } from "@/components/forms/password-input";
import { initialMfaSetupActionState, type MfaSetupActionState } from "@/lib/auth/mfa-state";

export function MfaBackupCodesForm({
  action,
}: {
  action: (state: MfaSetupActionState, formData: FormData) => Promise<MfaSetupActionState>;
}) {
  const [state, formAction, pending] = useActionState(action, initialMfaSetupActionState);

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">Regenerate backup codes</h3>
        <p className="mt-2 text-sm text-slate-600">
          This invalidates any backup codes you saved previously. You must confirm your password to regenerate.
        </p>
      </div>
      <form action={formAction} className="space-y-4">
        {state.status === "error" ? <p className="text-sm font-medium text-rose-700">{state.message}</p> : null}
        {state.status === "success" ? <p className="text-sm font-medium text-emerald-700">{state.message}</p> : null}
        <div>
          <label htmlFor="regen-backup-password" className="block text-sm font-medium text-slate-700">
            Confirm your current password
          </label>
          <PasswordInput
            id="regen-backup-password"
            name="currentPassword"
            required
            autoComplete="current-password"
            className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:ring-1 focus:ring-slate-500 focus:outline-none"
            placeholder="Enter your password to confirm"
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Regenerating..." : "Regenerate backup codes"}
        </button>
      </form>
      {state.backupCodes?.length ? (
        <div className="grid gap-2 sm:grid-cols-2">
          {state.backupCodes.map((code) => (
            <div key={code} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-sm text-slate-900">
              {code}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
