"use client";

import { useActionState, useState } from "react";
import { initialSignInActionState, type SignInActionState } from "@/lib/auth/form-state";

export function MfaChallengeForm({
  action,
}: {
  action: (state: SignInActionState | void, formData: FormData) => Promise<SignInActionState | void>;
}) {
  const [state, formAction, pending] = useActionState(action, initialSignInActionState);
  const [useBackupCode, setUseBackupCode] = useState(false);

  return (
    <form action={formAction} className="mt-6 space-y-4">
      {useBackupCode ? (
        <div>
          <label htmlFor="backup-code" className="mb-1 block text-sm font-medium text-slate-700">Backup code</label>
          <input
            id="backup-code"
            name="backupCode"
            type="text"
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-[var(--brand)] focus:ring-2 focus:ring-[color:var(--brand-soft)]"
            placeholder="ABCDE-12345"
            required
          />
          <p className="mt-1 text-xs text-slate-500">Enter one of your stored one-time backup codes.</p>
        </div>
      ) : (
        <div>
          <label htmlFor="mfa-token" className="mb-1 block text-sm font-medium text-slate-700">Authenticator code</label>
          <input
            id="mfa-token"
            name="token"
            type="text"
            inputMode="numeric"
            pattern="[0-9]{6}"
            maxLength={6}
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-[var(--brand)] focus:ring-2 focus:ring-[color:var(--brand-soft)]"
            placeholder="123456"
            required
          />
          <p className="mt-1 text-xs text-slate-500">Enter the 6-digit code from your authenticator app.</p>
        </div>
      )}

      <button
        type="button"
        onClick={() => setUseBackupCode((prev) => !prev)}
        className="text-sm font-medium text-[var(--brand)] underline underline-offset-2"
      >
        {useBackupCode ? "Use authenticator code instead" : "Use a backup code instead"}
      </button>

      {state?.status === "error" && state.error ? <p className="text-sm font-medium text-rose-700">{state.error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-[var(--brand)] px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Verifying..." : "Verify and continue"}
      </button>
    </form>
  );
}