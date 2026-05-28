"use client";

import Image from "next/image";
import { useActionState, useMemo } from "react";
import { initialMfaSetupActionState, initialMfaVerifyActionState, type MfaSetupActionState, type MfaVerifyActionState } from "@/lib/auth/mfa-state";

export function MfaTotpSetupForm({
  beginAction,
  confirmAction,
  initialHasActiveTotp,
  initialFactorLabel,
}: {
  beginAction: (state: MfaSetupActionState, formData: FormData) => Promise<MfaSetupActionState>;
  confirmAction: (state: MfaVerifyActionState, formData: FormData) => Promise<MfaVerifyActionState>;
  initialHasActiveTotp: boolean;
  initialFactorLabel?: string | null;
}) {
  const [setupState, setupFormAction, setupPending] = useActionState(beginAction, initialMfaSetupActionState);
  const [verifyState, verifyFormAction, verifyPending] = useActionState(confirmAction, initialMfaVerifyActionState);

  const hasActiveTotp = useMemo(
    () => verifyState.hasActiveTotp ?? setupState.hasActiveTotp ?? initialHasActiveTotp,
    [initialHasActiveTotp, setupState.hasActiveTotp, verifyState.hasActiveTotp],
  );

  const activeFactorLabel = verifyState.activeFactorLabel ?? setupState.activeFactorLabel ?? initialFactorLabel ?? null;
  const backupCodes = verifyState.backupCodes ?? [];
  const qrDataUrl = setupState.qrDataUrl;
  const secretBase32 = setupState.secretBase32;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
        <p className="font-medium text-slate-900">Current status: {hasActiveTotp ? "TOTP active" : "TOTP not active"}</p>
        <p className="mt-1 text-slate-600">
          {hasActiveTotp
            ? `Your account already has authenticator-app MFA enabled${activeFactorLabel ? ` (${activeFactorLabel})` : ""}.`
            : "Start setup to scan a QR code in Google Authenticator, 1Password, Authy, or another TOTP app."}
        </p>
      </div>

      <form action={setupFormAction} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
        <div>
          <label htmlFor="mfa-label" className="mb-1 block text-sm font-medium text-slate-700">Device label</label>
          <input
            id="mfa-label"
            name="label"
            type="text"
            defaultValue={activeFactorLabel ?? "Authenticator app"}
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-[var(--brand)] focus:ring-2 focus:ring-[color:var(--brand-soft)]"
            placeholder="Work iPhone authenticator"
          />
        </div>
        {setupState.status === "error" ? <p className="text-sm font-medium text-rose-700">{setupState.message}</p> : null}
        {setupState.status === "success" ? <p className="text-sm font-medium text-emerald-700">{setupState.message}</p> : null}
        <button
          type="submit"
          disabled={setupPending}
          className="rounded-xl bg-[var(--brand)] px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {setupPending ? "Preparing setup..." : hasActiveTotp ? "Recreate TOTP setup" : "Start TOTP setup"}
        </button>
      </form>

      {qrDataUrl && secretBase32 ? (
        <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 lg:grid-cols-[240px_1fr]">
          <div className="mx-auto rounded-2xl border border-slate-200 bg-white p-3">
            <Image src={qrDataUrl} alt="QR code for authenticator app setup" width={240} height={240} unoptimized />
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Step 2, verify your code</h3>
              <p className="mt-2 text-sm text-slate-600">
                Scan the QR code, or enter the setup key manually if your app needs it.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Manual setup key</p>
              <p className="mt-2 break-all font-mono text-sm text-slate-900">{secretBase32}</p>
            </div>
            <form action={verifyFormAction} className="space-y-4">
              <div>
                <label htmlFor="mfa-token" className="mb-1 block text-sm font-medium text-slate-700">6-digit code</label>
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
              </div>
              {verifyState.status === "error" ? <p className="text-sm font-medium text-rose-700">{verifyState.message}</p> : null}
              {verifyState.status === "success" ? <p className="text-sm font-medium text-emerald-700">{verifyState.message}</p> : null}
              <button
                type="submit"
                disabled={verifyPending}
                className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {verifyPending ? "Activating..." : "Activate MFA"}
              </button>
            </form>
          </div>
        </div>
      ) : null}

      {backupCodes.length ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <h3 className="text-lg font-semibold text-amber-950">Backup codes</h3>
          <p className="mt-2 text-sm text-amber-900">
            Save these now. Each code works once. If you regenerate them later, these copies stop working.
          </p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {backupCodes.map((code) => (
              <div key={code} className="rounded-xl border border-amber-200 bg-white px-3 py-2 font-mono text-sm text-slate-900">
                {code}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
