"use client";

import { useActionState } from "react";
import { initialMoveMyTestActionState } from "@/features/movemytest/action-state";
import { revealBookingReferenceAction } from "@/features/movemytest/actions";

type BookingReferenceFormProps = {
  matchId: string;
  savedBookingReference?: string | null;
  alreadyConfirmed?: boolean;
  callerStatus?: "i-am-caller" | "other-is-caller" | "no-caller-yet";
};

export function BookingReferenceForm({ matchId, savedBookingReference, alreadyConfirmed = false, callerStatus = "no-caller-yet" }: BookingReferenceFormProps) {
  const [state, action, pending] = useActionState(revealBookingReferenceAction, initialMoveMyTestActionState);

  if (alreadyConfirmed) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-950">
        <h2 className="text-lg font-semibold">Booking reference consent complete</h2>
        <p className="mt-2">Your booking reference has been securely stored for this match. Return to Call DVSA once both learners have completed consent.</p>
      </div>
    );
  }

  const callerLabel =
    callerStatus === "i-am-caller"
      ? "I will make the call to DVSA for both learners."
      : callerStatus === "other-is-caller"
        ? "The other learner will make the call. DVSA will call me for security checks."
        : "I will make the call to DVSA.";

  return (
    <form action={action} className="space-y-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
      <input type="hidden" name="matchId" value={matchId} />
      {savedBookingReference ? <input type="hidden" name="useSavedBookingReference" value="on" /> : null}
      <div>
        <h2 className="text-lg font-semibold text-slate-950">Booking reference consent</h2>
        {savedBookingReference ? (
          <p className="mt-2 text-sm leading-6 text-slate-700">
            Your booking reference has been saved. Please check it is correct before you consent: <span className="font-mono font-semibold text-slate-950">{savedBookingReference}</span>
          </p>
        ) : (
          <p className="mt-2 text-sm leading-6 text-slate-700">
            You have not saved your booking reference yet. Enter it now so it can be securely stored for the agreed DVSA call.
          </p>
        )}
        <p className="mt-2 text-sm text-slate-700">Only continue if both learners are available to complete the DVSA phone process.</p>
      </div>
      {state.message ? <p className={state.status === "error" ? "text-sm text-red-700" : "text-sm text-green-700"}>{state.message}</p> : null}
      {!savedBookingReference ? (
        <label className="space-y-2 text-sm font-medium text-slate-800">
          Booking reference only
          <input name="bookingReference" required maxLength={40} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm" />
        </label>
      ) : null}
      <div className="space-y-2 text-sm text-slate-700">
        <label className="flex gap-3"><input type="checkbox" name="volunteerDvsaCaller" /> <span>{callerLabel}</span></label>
        <label className="flex gap-3"><input type="checkbox" name="consentReadyNow" required /> <span>Both learners are available for the DVSA phone process now.</span></label>
        <label className="flex gap-3"><input type="checkbox" name="consentSecurity" required /> <span>DVSA will complete security checks with each learner.</span></label>
        <label className="flex gap-3"><input type="checkbox" name="consentNoSensitiveSharing" required /> <span>I will never share driving licence numbers, payment card details, address, theory certificate number or GOV.UK login details.</span></label>
        <div className="mt-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900">
          <label className="flex gap-3 font-semibold"><input type="checkbox" name="instructorConfirmedByLearner" /> <span>I have spoken to my instructor and they have agreed to the swap.</span></label>
          <p className="mt-1.5 ml-7">DTC takes no responsibility for ensuring the instructor is aware. You are responsible for making sure your instructor knows about the swap and is available.</p>
        </div>
      </div>
      <button disabled={pending} className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">
        {pending ? "Securing reference..." : "Consent and store this match"}
      </button>
    </form>
  );
}
