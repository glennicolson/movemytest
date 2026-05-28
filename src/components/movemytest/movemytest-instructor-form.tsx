"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { initialMoveMyTestActionState } from "@/features/movemytest/action-state";
import { updateMoveMyTestInstructorAction } from "@/features/movemytest/actions";
import { lookupMoveMyTestInstructorByAdiAction } from "@/features/movemytest/instructor-actions";

type InstructorFormProps = {
  listingId: string;
  existingDetails?: {
    adiNumber?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    mobileNumber?: string | null;
    email?: string | null;
    learnerConfirmedPermissionAt?: Date | null;
    learnerConfirmedAvailabilityCheckAt?: Date | null;
  } | null;
};

export function MoveMyTestInstructorForm({ listingId, existingDetails }: InstructorFormProps) {
  const [hasInstructor, setHasInstructor] = useState<string | null>(
    existingDetails ? "yes" : null
  );
  const initialKnowsDetails =
    existingDetails && (existingDetails.firstName || existingDetails.lastName || existingDetails.email || existingDetails.adiNumber)
      ? "yes"
      : existingDetails ? "no" : null;
  const [knowsDetails, setKnowsDetails] = useState<string | null>(initialKnowsDetails);
  const [lookupState, lookupAction, lookupPending] = useActionState(lookupMoveMyTestInstructorByAdiAction, { status: "idle" } as const);
  const [lookupTransitionPending, startLookupTransition] = useTransition();
  const adiInputRef = useRef<HTMLInputElement>(null);
  const lookupIsPending = lookupPending || lookupTransitionPending;
  const [state, action] = useActionState(updateMoveMyTestInstructorAction, initialMoveMyTestActionState);
  const [adiNumber, setAdiNumber] = useState(existingDetails?.adiNumber ?? "");
  const [firstName, setFirstName] = useState(existingDetails?.firstName ?? "");
  const [lastName, setLastName] = useState(existingDetails?.lastName ?? "");
  const [mobileNumber, setMobileNumber] = useState(existingDetails?.mobileNumber ?? "");
  const [email, setEmail] = useState(existingDetails?.email ?? "");

  useEffect(() => {
    if (lookupState.status !== "found") return;
    setFirstName(lookupState.assignedInstructor.firstName);
    setLastName(lookupState.assignedInstructor.lastName);
    setMobileNumber(lookupState.assignedInstructor.mobileNumber ?? "");
    setEmail(lookupState.assignedInstructor.email);
  }, [lookupState]);

  function handleLookupClick() {
    const fd = new FormData();
    fd.set("instructorAdiNumber", adiInputRef.current?.value ?? adiNumber);
    startLookupTransition(() => lookupAction(fd));
  }

  return (
    <form action={action} className="space-y-8 rounded-3xl border border-slate-300 bg-white p-5 shadow-sm sm:p-8">
      {state.status === "error" ? <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{state.message}</div> : null}
      {state.status === "success" ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">{state.message}</div> : null}
      <input type="hidden" name="listingId" value={listingId} />

      <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm leading-6 text-emerald-950">
        <h2 className="text-xl font-semibold text-emerald-950">Instructor</h2>
        <p className="mt-2">
          Linking your instructor lets them see your test swap request and respond. You can create or remove your instructor connection at any time.
        </p>
      </section>

      {/* Step 1: Do you have an instructor? */}
      {hasInstructor === null ? (
        <section className="space-y-4 rounded-2xl border border-slate-300 bg-white p-5">
          <h2 className="text-xl font-semibold text-slate-950">Do you have an instructor?</h2>
          <p className="text-sm leading-6 text-slate-600">
            Linking your instructor lets them see your test swap request and respond. You can still use MoveMyTest without one and add an instructor later.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setHasInstructor("yes")}
              className="rounded-full border border-[var(--brand)] bg-white px-5 py-3 text-sm font-semibold text-[var(--brand-strong)] transition hover:bg-[var(--brand)] hover:text-white"
            >
              Yes, I have an instructor
            </button>
            <button
              type="button"
              onClick={() => setHasInstructor("no")}
              className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              No, I don't have one
            </button>
          </div>
        </section>
      ) : hasInstructor === "no" ? (
        <section className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <h2 className="text-xl font-semibold text-slate-950">Instructor</h2>
          <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
            <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-600">✓</span>
            <p>You don't have an instructor listed. You can still create your listing and add one later from your dashboard if you get one.</p>
          </div>
          <input type="hidden" name="hasInstructor" value="no" />
          <button
            type="button"
            onClick={() => { setHasInstructor(null); setKnowsDetails(null); }}
            className="text-sm font-semibold text-[var(--brand)] underline"
          >
            Change my answer
          </button>
          <button type="submit" className="rounded-full bg-[var(--brand)] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--brand-strong)]">
            Save &amp; continue
          </button>
        </section>
      ) : knowsDetails === null ? (
        /* Step 2: Do you know their details? */
        <section className="space-y-4 rounded-2xl border border-slate-300 bg-white p-5">
          <h2 className="text-xl font-semibold text-slate-950">Instructor</h2>
          <p className="text-sm leading-6 text-slate-600">
            Do you know your instructor's email address or ADI number?
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setKnowsDetails("yes")}
              className="rounded-full border border-[var(--brand)] bg-white px-5 py-3 text-sm font-semibold text-[var(--brand-strong)] transition hover:bg-[var(--brand)] hover:text-white"
            >
              Yes, I know their details
            </button>
            <button
              type="button"
              onClick={() => setKnowsDetails("no")}
              className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              No, I don't know them yet
            </button>
          </div>
          <button
            type="button"
            onClick={() => { setHasInstructor(null); setKnowsDetails(null); }}
            className="text-sm font-semibold text-slate-500 underline"
          >
            Go back
          </button>
        </section>
      ) : knowsDetails === "no" ? (
        /* Has instructor, no details */
        <section className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <h2 className="text-xl font-semibold text-slate-950">Instructor</h2>
          <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
            <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700">!</span>
            <p>You have an instructor but don't have their details yet. You can still create your listing and add their details later from your dashboard.</p>
          </div>
          <input type="hidden" name="hasInstructor" value="yes" />
          <input type="hidden" name="knowsInstructorDetails" value="no" />
          <button
            type="button"
            onClick={() => { setHasInstructor("yes"); setKnowsDetails(null); }}
            className="text-sm font-semibold text-[var(--brand)] underline"
          >
            I found their details
          </button>
          <button type="submit" className="rounded-full bg-[var(--brand)] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--brand-strong)]">
            Save &amp; continue
          </button>
        </section>
      ) : (
        /* knowsDetails === "yes" — full detail form */
        <section className="space-y-4 rounded-2xl border border-slate-300 bg-white p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">Instructor details</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">Enter what you know. If they are registered with MoveMyTest, we'll fill details automatically when you check their ADI number.</p>
            </div>
            <button
              type="button"
              onClick={() => { setHasInstructor("yes"); setKnowsDetails(null); }}
              className="shrink-0 text-xs font-semibold text-slate-500 underline"
            >
              Change
            </button>
          </div>

          <input type="hidden" name="hasInstructor" value="yes" />
          <input type="hidden" name="knowsInstructorDetails" value="yes" />

          <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
            <label className="space-y-2 text-sm font-medium text-slate-800">
              ADI number (if you know it)
              <input ref={adiInputRef} name="instructorAdiNumber" type="text" value={adiNumber} onChange={(event) => setAdiNumber(event.target.value.toUpperCase())} className="w-full rounded-xl border border-slate-300 px-3 py-3 text-sm uppercase" placeholder="e.g. ADI123456" />
            </label>
            <button type="button" onClick={handleLookupClick} disabled={lookupIsPending} className="rounded-full border border-[var(--brand)] bg-white px-5 py-3 text-sm font-semibold text-[var(--brand-strong)] transition hover:bg-[var(--brand)] hover:text-white disabled:opacity-60">
              {lookupIsPending ? "Checking..." : "Check ADI"}
            </button>
          </div>
          {lookupState.status === "found" ? <p className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-950">Registered instructor found. Details have been filled from MoveMyTest instructor record.</p> : null}
          {lookupState.status === "not_found" || lookupState.status === "error" ? <p className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-900">{lookupState.message}</p> : null}

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-slate-800">
              Instructor first name
              <input name="instructorFirstName" type="text" value={firstName} onChange={(event) => setFirstName(event.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-3 text-sm" />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-800">
              Instructor last name
              <input name="instructorLastName" type="text" value={lastName} onChange={(event) => setLastName(event.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-3 text-sm" />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-800">
              Instructor mobile number
              <input name="instructorMobileNumber" type="tel" value={mobileNumber} onChange={(event) => setMobileNumber(event.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-3 text-sm" />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-800">
              Instructor email address
              <input name="instructorEmail" type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-3 text-sm" />
            </label>
          </div>

          <div className="space-y-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
            <label className="flex gap-3"><input name="instructorPermission" type="checkbox" defaultChecked={!!existingDetails?.learnerConfirmedPermissionAt} /> <span>I confirm I have permission from my instructor to use these details for this MoveMyTest listing.</span></label>
            <label className="flex gap-3"><input name="instructorAvailabilityCheck" type="checkbox" defaultChecked={!!existingDetails?.learnerConfirmedAvailabilityCheckAt} /> <span>I confirm I have checked, or will check before accepting a swap, that my instructor is available for the test date, time, and centre.</span></label>
          </div>

          <button type="submit" className="rounded-full bg-[var(--brand)] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--brand-strong)]">
            Save instructor details
          </button>
        </section>
      )}
    </form>
  );
}
