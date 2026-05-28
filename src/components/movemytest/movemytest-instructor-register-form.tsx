"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PasswordInput } from "@/components/forms/password-input";
import {
  lookupMoveMyTestInstructorRegistrationPrefillAction,
  registerMoveMyTestInstructorAction,
} from "@/features/movemytest/instructor-actions";

export function MoveMyTestInstructorRegisterForm() {
  const router = useRouter();
  const [state, action, pending] = useActionState(registerMoveMyTestInstructorAction, { status: "idle" } as const);
  const [lookupState, lookupAction, lookupPending] = useActionState(lookupMoveMyTestInstructorRegistrationPrefillAction, { status: "idle" } as const);
  const [lookupTransitionPending, startLookupTransition] = useTransition();
  const adiInputRef = useRef<HTMLInputElement>(null);
  const lookupIsPending = lookupPending || lookupTransitionPending;

  const [adiNumber, setAdiNumber] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [email, setEmail] = useState("");

// When the server action signals success (status "idle" after submit), navigate to the success page
  const prevPendingRef = useRef(pending);
  useEffect(() => {
    if (prevPendingRef.current && !pending && state.status === "idle") {
      const successEmail = email || adiInputRef.current?.closest("form")?.querySelector<HTMLInputElement>("[name='email']")?.value || "";
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Next.js typed route workaround for dynamic query params
      router.push(`/instructor/register-success?email=${encodeURIComponent(successEmail)}` as any);
    }
    prevPendingRef.current = pending;
  }, [pending, state.status, email, router]);

  useEffect(() => {
    if (lookupState.status !== "found") return;
    setAdiNumber(lookupState.assignedInstructor.adiNumber);
    setFirstName(lookupState.assignedInstructor.firstName);
    setLastName(lookupState.assignedInstructor.lastName);
    setMobileNumber(lookupState.assignedInstructor.mobileNumber ?? "");
    setEmail(lookupState.assignedInstructor.email);
  }, [lookupState]);

  function handleAdiLookup() {
    const formData = new FormData();
    formData.set("adiNumber", adiInputRef.current?.value ?? adiNumber);
    startLookupTransition(() => lookupAction(formData));
  }

  return (
    <form action={action} className="space-y-5 rounded-3xl border border-slate-300 bg-white p-6 shadow-sm">
      {state.status === "error" ? <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{state.message}</div> : null}
      {lookupState.status === "found" ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-950">{lookupState.message}</div> : null}
      {lookupState.status === "already_registered" || lookupState.status === "not_found" || lookupState.status === "error" ? <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-900">{lookupState.message}</div> : null}

      <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
        <label className="space-y-2 text-sm font-medium text-slate-800">
          ADI number
          <input ref={adiInputRef} name="adiNumber" type="text" required value={adiNumber} onChange={(event) => setAdiNumber(event.target.value.toUpperCase())} className="w-full rounded-xl border border-slate-300 px-3 py-3 text-sm uppercase" placeholder="e.g. ADI123456" />
        </label>
        <button type="button" onClick={handleAdiLookup} disabled={lookupIsPending} className="rounded-full border border-[var(--brand)] bg-white px-5 py-3 text-sm font-semibold text-[var(--brand-strong)] transition hover:bg-[var(--brand)] hover:text-white disabled:opacity-60">
          {lookupIsPending ? "Checking..." : "Check ADI"}
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm font-medium text-slate-800">
          Mobile number
          <input name="mobileNumber" type="tel" required value={mobileNumber} onChange={(event) => setMobileNumber(event.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-3 text-sm" />
        </label>
        <label className="space-y-2 text-sm font-medium text-slate-800">
          First name
          <input name="firstName" type="text" required value={firstName} onChange={(event) => setFirstName(event.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-3 text-sm" />
        </label>
        <label className="space-y-2 text-sm font-medium text-slate-800">
          Last name
          <input name="lastName" type="text" required value={lastName} onChange={(event) => setLastName(event.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-3 text-sm" />
        </label>
        <label className="space-y-2 text-sm font-medium text-slate-800">
          Email address
          <input name="email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-3 text-sm" />
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm font-medium text-slate-800">
          Password
          <PasswordInput name="password" autoComplete="new-password" required minLength={8} className="w-full rounded-xl border border-slate-300 px-3 py-3 text-sm" />
        </label>
        <label className="space-y-2 text-sm font-medium text-slate-800">
          Confirm password
          <PasswordInput name="confirmPassword" autoComplete="new-password" required minLength={8} className="w-full rounded-xl border border-slate-300 px-3 py-3 text-sm" />
        </label>
      </div>
      <label className="flex gap-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700"><input name="acceptTerms" type="checkbox" required /> <span>I confirm I am the ADI holder linked to this number and I am authorised to manage MoveMyTest requests.</span></label>
      <button disabled={pending} className="rounded-full bg-[var(--brand)] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--brand-strong)] disabled:opacity-60">
        {pending ? "Creating account..." : "Create instructor account"}
      </button>
      <p className="text-xs text-slate-500">You will receive a verification email. Your account is not active until you verify your email address.</p>
    </form>
  );
}
