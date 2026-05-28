"use client";

import { useActionState } from "react";
import { PasswordInput } from "@/components/forms/password-input";
import { initialMfaSetupActionState, type MfaSetupActionState } from "@/lib/auth/mfa-state";

export function MfaDisableForm({
  action,
  hasActiveTotp,
  mfaRequiredForRole = false,
}: {
  action: (state: MfaSetupActionState, formData: FormData) => Promise<MfaSetupActionState>;
  hasActiveTotp: boolean;
  mfaRequiredForRole?: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, initialMfaSetupActionState);

  if (!hasActiveTotp && state.status !== "success") return null;

// If MFA is mandatory for this user's role, don't allow disabling.
  if (mfaRequiredForRole) {
    return (
      <div className="space-y-4 rounded-2xl border border-amber-200 bg-amber-50 p-5">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-600">MFA required</p>
          <h3 className="mt-1 text-lg font-semibold text-amber-950">Cannot disable MFA</h3>
          <p className="mt-2 text-sm text-amber-900">
            Your role requires multi-factor authentication. You can rotate your backup codes or switch to a different authenticator app, but you cannot disable MFA entirely.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4 rounded-2xl border border-rose-200 bg-rose-50 p-5">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose-600">Danger zone</p>
        <h3 className="mt-1 text-lg font-semibold text-rose-950">Disable authenticator MFA</h3>
        <p className="mt-2 text-sm text-rose-900">
          This removes your authenticator app factor and clears all backup codes. Your account will revert to password-only sign-in.
        </p>
      </div>
      {state.status === "error" ? <p className="text-sm font-medium text-rose-700">{state.message}</p> : null}
      {state.status === "success" ? <p className="text-sm font-medium text-emerald-700">{state.message}</p> : null}
      <div>
        <label htmlFor="disable-mfa-password" className="block text-sm font-medium text-rose-900">
          Confirm your current password
        </label>
        <PasswordInput
          id="disable-mfa-password"
          name="currentPassword"
          required
          autoComplete="current-password"
          className="mt-1 block w-full max-w-sm rounded-lg border border-rose-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-rose-500 focus:ring-1 focus:ring-rose-500 focus:outline-none"
          placeholder="Enter your password to confirm"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Disabling..." : "Disable MFA"}
      </button>
    </form>
  );
}
