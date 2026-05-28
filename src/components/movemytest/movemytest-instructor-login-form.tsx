"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { PasswordInput } from "@/components/forms/password-input";
import { loginMoveMyTestInstructorAction, resendMoveMyTestInstructorVerificationAction } from "@/features/movemytest/instructor-actions";

export function MoveMyTestInstructorLoginForm() {
  const [state, action, pending] = useActionState(loginMoveMyTestInstructorAction, { status: "idle" } as const);
  const [resendState, resendAction, resendPending] = useActionState(resendMoveMyTestInstructorVerificationAction, { status: "idle", message: "" });
  const [showResend, setShowResend] = useState(false);
  const [resendEmail, setResendEmail] = useState("");
  const [resendTriggered, setResendTriggered] = useState(false);
  const [resendTransitionPending, startResendTransition] = useTransition();

// Detect PENDING account errors and show resend UI
  useEffect(() => {
    if (state.message?.includes("email hasn't been verified")) {
      const emailInput = document.querySelector<HTMLInputElement>("[name='email']");
      if (emailInput?.value) {
        setResendEmail(emailInput.value);
        setShowResend(true);
      }
    }
  }, [state.status, state.message]);

  function handleResend() {
    const formData = new FormData();
    formData.set("email", resendEmail);
    setResendTriggered(true);
    startResendTransition(() => resendAction(formData));
  }

  return (
    <form action={action} className="space-y-5 rounded-3xl border border-slate-300 bg-white p-6 shadow-sm">
      {state.status === "error" ? <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{state.message}</div> : null}
      {showResend && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
          <p className="font-semibold">Your email is not yet verified.</p>
          <p className="mt-1">Check your inbox for the verification email, or request a new one below.</p>
          {resendTriggered && resendState.status === "success" && (
            <p className="mt-2 font-semibold text-emerald-700">{resendState.message}</p>
          )}
          {resendTriggered && resendState.status === "error" && (
            <p className="mt-2 font-semibold text-red-700">{resendState.message}</p>
          )}
          <button
            type="button"
            onClick={handleResend}
            disabled={resendPending || resendTransitionPending}
            className="mt-3 rounded-full border border-amber-600 bg-white px-4 py-2 text-sm font-semibold text-amber-800 transition hover:bg-amber-600 hover:text-white disabled:opacity-60"
          >
            {resendPending || resendTransitionPending ? "Sending..." : "Resend verification email"}
          </button>
        </div>
      )}
      <label className="block space-y-2 text-sm font-medium text-slate-800">
        Email address
        <input name="email" type="email" required className="w-full rounded-xl border border-slate-300 px-3 py-3 text-sm" />
      </label>
      <label className="block space-y-2 text-sm font-medium text-slate-800">
        Password
        <PasswordInput name="password" autoComplete="current-password" required className="w-full rounded-xl border border-slate-300 px-3 py-3 text-sm" />
      </label>
      <button disabled={pending} className="rounded-full bg-[var(--brand)] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--brand-strong)] disabled:opacity-60">
        {pending ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
