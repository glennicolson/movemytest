import { Phone } from "lucide-react";
import { getLearnerMoveMyTestDashboard } from "@/features/movemytest/queries";
import { requireMoveMyTestSession } from "@/features/movemytest/session";
import { completeMoveMyTestMatchAction, volunteerDvsaCallerAction } from "@/features/movemytest/actions";
import { decryptBookingReference, isBookingReferenceVisible } from "@/features/movemytest/secrets";
import { DVSA_SWAP_PHONE } from "@/features/movemytest/constants";
import { CallWindowCountdown } from "@/components/movemytest/call-window-countdown";

export default async function CallDvsaPage() {
  const session = await requireMoveMyTestSession("/dashboard/call-dvsa");
  const { listing, matches } = await getLearnerMoveMyTestDashboard(session.accountId);
  const formatDateTime = (value: Date) =>
    value.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" });

  const acceptedMatches = matches.filter(({ match }) =>
    ["BOOKING_REFERENCE_SHARED", "COMPLETED"].includes(match.status),
  );
  const agreedMatch = acceptedMatches[0];
  const isA = agreedMatch && listing ? agreedMatch.match.listingAId === listing.id : null;
// The FIRST person to volunteer is the caller. The second person to volunteer is the receiver.
  const iAmCaller = agreedMatch
    ? isA
      ? agreedMatch.match.learnerADvsaCallerAt &&
        (!agreedMatch.match.learnerBDvsaCallerAt ||
         new Date(agreedMatch.match.learnerADvsaCallerAt) <= new Date(agreedMatch.match.learnerBDvsaCallerAt))
      : agreedMatch.match.learnerBDvsaCallerAt &&
        (!agreedMatch.match.learnerADvsaCallerAt ||
         new Date(agreedMatch.match.learnerBDvsaCallerAt) <= new Date(agreedMatch.match.learnerADvsaCallerAt))
    : null;
  const otherIsCaller = agreedMatch
    ? isA
      ? agreedMatch.match.learnerBDvsaCallerAt &&
        (!agreedMatch.match.learnerADvsaCallerAt ||
         new Date(agreedMatch.match.learnerBDvsaCallerAt) < new Date(agreedMatch.match.learnerADvsaCallerAt))
      : agreedMatch.match.learnerADvsaCallerAt &&
        (!agreedMatch.match.learnerBDvsaCallerAt ||
         new Date(agreedMatch.match.learnerADvsaCallerAt) < new Date(agreedMatch.match.learnerBDvsaCallerAt))
    : null;
  const mySecret = agreedMatch?.match.secrets.find(
    (s) => s.ownerAccountId === session.accountId && !s.deletedAt,
  );
  const otherSecret = agreedMatch?.match.secrets.find((s) =>
    isBookingReferenceVisible(s, session.accountId),
  );
  const myReferenceValue = mySecret ? decryptBookingReference(mySecret) : null;
  const otherReferenceValue = otherSecret ? decryptBookingReference(otherSecret) : null;
  const completedByMe = agreedMatch
    ? isA
      ? agreedMatch.match.learnerACompletedAt
      : agreedMatch.match.learnerBCompletedAt
    : null;
  const isCompleted = agreedMatch?.match.status === "COMPLETED";

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-950">Call DVSA</h2>
        {!listing ? (
          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
            No active listing. Create one to begin the swap process.
          </div>
        ) : agreedMatch && isCompleted ? (
          <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm leading-6 text-emerald-950">
            <h3 className="font-semibold">Swap completed</h3>
            <p className="mt-2">
              This match has been marked complete after the DVSA phone process. Your listing has been closed.
            </p>
          </div>
        ) : agreedMatch && myReferenceValue && otherReferenceValue ? (
          <div className="mt-5 space-y-4">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm leading-6 text-emerald-950">
              <h3 className="font-semibold">Swap instructions</h3>

              {/* Step 1: Check your details */}
              {otherIsCaller ? (
                <div className="mt-3 rounded-xl bg-white p-3">
                  <p className="font-semibold text-emerald-900">Step 1 - Check your DVSA record is up to date</p>
                  <p className="mt-1 text-emerald-800">
                    Before receiving the call from DVSA, make sure your driving licence details, contact information, and especially your
                    <span className="font-semibold"> mobile phone number</span> are correct on your DVSA record. As DVSA uses this number to call you during the swap.
                  </p>
                </div>
              ) : (
                <div className="mt-3 rounded-xl bg-white p-3">
                  <p className="font-semibold text-emerald-900">Step 1 - Check your DVSA record is up to date</p>
                  <p className="mt-1 text-emerald-800">
                    Before calling DVSA, make sure your driving licence details, contact information, and especially your
                    <span className="font-semibold"> mobile phone number</span> are correct on your DVSA record. DVSA uses this number to call the other learner during the swap.
                  </p>
                </div>
              )}

              {/* Step 2: Caller role */}
              {otherIsCaller ? (
                <div className="mt-3 rounded-xl bg-white p-3">
                  <p className="font-semibold text-emerald-900">Step 2 - You are receiving the call from DVSA</p>
                  <p className="mt-1 text-emerald-800">
                    Both learners must be available at the same time. You will receive the call from DVSA and the other learner who is making the call to DVSA. Be ready to go through the security checks during the call.
                  </p>
                </div>
              ) : iAmCaller ? (
                <div className="mt-3 rounded-xl bg-white p-3">
                  <p className="font-semibold text-emerald-900">Step 2 - You are making the DVSA call</p>
                  <p className="mt-1 text-emerald-800">Both learners must be available at the same time. DVSA will call the other learner for their security checks during the call.</p>
                </div>
              ) : (
                <div className="mt-3 rounded-xl bg-white p-3">
                  <p className="font-semibold text-amber-800">Step 2 - One of you needs to volunteer to make the call</p>
                  <p className="mt-1 text-amber-700">Neither learner has volunteered yet. Coordinate in the match room or volunteer below.</p>
                  <form action={volunteerDvsaCallerAction}>
                    <input type="hidden" name="matchId" value={agreedMatch.match.id} />
                    <button className="mt-2 rounded-full border border-emerald-300 bg-white px-4 py-2 text-xs font-semibold text-emerald-800">
                      I will make the call to DVSA
                    </button>
                  </form>
                </div>
              )}

              {/* Step 3: Call details */}
              <h3 className="mt-4 font-semibold">Step 3 - Call details</h3>
              {otherIsCaller ? (
                <p className="mt-2">
                  When DVSA call you they will confirm the swap, please remember customer services are open Monday to Friday, 8am to 5pm.
                </p>
              ) : iAmCaller ? (
                <p className="mt-2">
                  Call DVSA on{" "}
                  <a href={`tel:${DVSA_SWAP_PHONE}`} className="inline-flex items-center gap-2 rounded-full bg-[var(--brand)] px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-[var(--brand-strong)] md:hidden">
                    <Phone className="h-4 w-4" />
                    {DVSA_SWAP_PHONE}
                  </a>
                  <span className="hidden font-semibold md:inline">{DVSA_SWAP_PHONE}</span>
                  . DVSA customer services are open Monday to Friday, 8am to 5pm.
                </p>
              ) : (
                <p className="mt-2">Once one learner volunteers, call details will appear here.</p>
              )}

              <p className="mt-2">
                You are swapping from{" "}
                <span className="font-semibold">{listing.currentCentre.name}</span>{" "}
                on {formatDateTime(listing.currentDateTime)} to{" "}
                <span className="font-semibold">{agreedMatch.otherCentre.name}</span>{" "}
                on {formatDateTime(agreedMatch.otherListing.currentDateTime)}.
              </p>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="rounded-xl bg-white p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
                    Your booking reference number is
                  </p>
                  <p className="mt-1 font-mono text-base font-semibold text-slate-950">
                    {myReferenceValue}
                  </p>
                </div>
                <div className="rounded-xl bg-white p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
                    The swapping learner&apos;s booking reference number is
                  </p>
                  <p className="mt-1 font-mono text-base font-semibold text-slate-950">
                    {otherReferenceValue}
                  </p>
                </div>
              </div>
            </div>
            {agreedMatch.match.callWindowExpiresAt ? (
              <CallWindowCountdown expiresAt={agreedMatch.match.callWindowExpiresAt.toISOString()} />
            ) : null}
            <form
              action={completeMoveMyTestMatchAction}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700"
            >
              <input type="hidden" name="matchId" value={agreedMatch.match.id} />
              <h3 className="font-semibold text-slate-950">After the DVSA call</h3>
              <p className="mt-2">
                Once DVSA has confirmed the swap, mark this match complete. This closes the match for both learners.
              </p>
              <button
                disabled={Boolean(completedByMe)}
                className="mt-4 rounded-full bg-[var(--brand)] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
              >
                {completedByMe ? "Match completed" : "Complete match"}
              </button>
            </form>
          </div>
        ) : (
          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm leading-6 text-slate-700">
            <h3 className="font-semibold text-slate-950">No instructions available</h3>
            <p className="mt-2">
              Instructions appear here once both parties agree to a match. Reference numbers are securely stored and
              only revealed to both learners when the DVSA call window is active.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
