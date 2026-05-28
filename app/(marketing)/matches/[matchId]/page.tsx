import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookingReferenceForm } from "@/components/movemytest/booking-reference-form";
import { CallWindowCountdown } from "@/components/movemytest/call-window-countdown";
import { MoveMyTestAccountNav } from "@/components/movemytest/movemytest-account-nav";
import { MatchPageAutoRefresh } from "@/components/movemytest/match-page-auto-refresh";
import {
  acceptMoveMyTestMatchAction,
  completeMoveMyTestMatchAction,
  declineMoveMyTestMatchAction,
  reportMoveMyTestAction,
  volunteerDvsaCallerAction,
} from "@/features/movemytest/actions";
import { DVSA_SWAP_PHONE } from "@/features/movemytest/constants";
import { getPrivateMatch } from "@/features/movemytest/queries";
import { formatMatchExpiryRemaining } from "@/features/movemytest/business-days";
import { decryptBookingReference, isBookingReferenceVisible } from "@/features/movemytest/secrets";
import { requireMoveMyTestSession } from "@/features/movemytest/session";
import { ArrowRight, CheckCircle2, Info, Phone, Shield, XCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Private MoveMyTest Match",
  robots: { index: false, follow: false },
};

type PageProps = { params: Promise<{ matchId: string }> };

function ScoreExplanation({ score }: { score: number }) {
  let label: string;
  let description: string;
  if (score >= 80) {
    label = "Excellent match";
    description = "Very similar dates, nearby centres and compatible preferences. This swap has a high chance of success when you call DVSA.";
  } else if (score >= 60) {
    label = "Good match";
    description = "Some differences in date or location but still workable. Review the details carefully before accepting.";
  } else if (score >= 40) {
    label = "Fair match";
    description = "Larger gaps in date or location. Only accept if you are flexible. DVSA may have additional questions.";
  } else {
    label = "Lower match";
    description = "Significant differences. DVSA may reject this swap even if both learners agree. Only accept if you are very flexible.";
  }
  return (
    <div className="mt-3 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-blue-900">
      <div className="flex items-start gap-2">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
        <div>
          <p className="font-semibold">{label} — {score}/100</p>
          <p className="mt-1 text-blue-800">{description}</p>
          <p className="mt-2 text-xs text-blue-700">
            The score is based on how closely your desired swap details match the other learner&apos;s current test.
            Higher scores mean a more compatible swap that DVSA is more likely to approve.
          </p>
        </div>
      </div>
    </div>
  );
}

function CallerVolunteerForm({ matchId, alreadyVolunteered }: { matchId: string; alreadyVolunteered: boolean }) {
  if (alreadyVolunteered) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm leading-6 text-emerald-950">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
          <div>
            <h3 className="font-semibold">You have agreed to make the DVSA call</h3>
            <p className="mt-1 text-emerald-800">
              The other learner has been notified to be ready to answer their phone. You are the designated caller.
            </p>
          </div>
        </div>
      </div>
    );
  }
  return (
    <form action={volunteerDvsaCallerAction} className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900">
      <h3 className="font-semibold">Who will call DVSA?</h3>
      <p className="mt-2">
        Before booking references can be shared, one learner must volunteer to make the DVSA call.
        The other learner will be asked to be available to answer their phone at the same time.
      </p>
      <input type="hidden" name="matchId" value={matchId} />
      <button className="mt-4 inline-flex items-center gap-2 rounded-full bg-[var(--brand)] px-5 py-2.5 text-sm font-semibold !text-white shadow-sm transition hover:bg-[var(--brand-strong)] hover:!text-white">
        <Phone className="h-4 w-4" />
        Yes, I will make the DVSA call
      </button>
    </form>
  );
}

function OtherVolunteeredNotice() {
  return (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm leading-6 text-emerald-950">
      <div className="flex items-start gap-3">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
        <div>
          <h3 className="font-semibold">The other learner has offered to make the call</h3>
          <p className="mt-1 text-emerald-800">
            The other learner has volunteered to call DVSA. You do not need to call — just be ready to answer your phone at the same time.
            DVSA will call you to complete security checks and confirm the swap.
          </p>
        </div>
      </div>
    </div>
  );
}

export default async function MoveMyTestMatchPage({ params }: PageProps) {
  const { matchId } = await params;
  const session = await requireMoveMyTestSession(`/matches/${matchId}`);

  let errorMessage: string | null = null;
  let match: Awaited<ReturnType<typeof getPrivateMatch>> = null;

  try {
    match = await getPrivateMatch(matchId, session.accountId);
  } catch (err) {
    errorMessage = err instanceof Error ? err.message : String(err);
  }

  if (errorMessage) {
    return (
      <main className="bg-white">
        <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-red-200 bg-red-50 p-6">
            <h1 className="text-xl font-semibold text-red-800">Match page error</h1>
            <p className="mt-3 text-sm text-red-700">{errorMessage}</p>
          </div>
        </section>
      </main>
    );
  }

  if (!match) notFound();

  const isA = match.listingA.accountId === session.accountId;
  const mine = isA ? match.listingA : match.listingB;
  const other = isA ? match.listingB : match.listingA;
  const acceptedByMe = isA ? match.learnerAAcceptedAt : match.learnerBAcceptedAt;
  const bookingReferenceConfirmedByMe = isA ? match.learnerABookingReferenceConfirmedAt : match.learnerBBookingReferenceConfirmedAt;
  const completedByMe = isA ? match.learnerACompletedAt : match.learnerBCompletedAt;
  const iAmCaller = isA
    ? match.learnerADvsaCallerAt && 
      (!match.learnerBDvsaCallerAt || 
       new Date(match.learnerADvsaCallerAt) >= new Date(match.learnerBDvsaCallerAt))
    : match.learnerBDvsaCallerAt && 
      (!match.learnerADvsaCallerAt || 
       new Date(match.learnerBDvsaCallerAt) >= new Date(match.learnerADvsaCallerAt));
  const otherIsCaller = isA
    ? match.learnerBDvsaCallerAt && 
      (!match.learnerADvsaCallerAt || 
       new Date(match.learnerBDvsaCallerAt) > new Date(match.learnerADvsaCallerAt))
    : match.learnerADvsaCallerAt && 
      (!match.learnerBDvsaCallerAt || 
       new Date(match.learnerADvsaCallerAt) > new Date(match.learnerBDvsaCallerAt));
  const callerPending = match.status === "CALLER_PENDING";
  const bothAccepted = match.status === "BOTH_ACCEPTED" || match.status === "CALLER_PENDING" || match.status === "BOOKING_REFERENCE_CONSENT_REQUESTED" || match.status === "BOOKING_REFERENCE_SHARED";
  const savedBookingReference = mine.bookingReferenceEncrypted && mine.bookingReferenceIv && mine.bookingReferenceAuthTag
    ? decryptBookingReference({ encryptedValue: mine.bookingReferenceEncrypted, iv: mine.bookingReferenceIv, authTag: mine.bookingReferenceAuthTag })
    : null;
  const myMatchReference = match.secrets.find((secret) => secret.ownerAccountId === session.accountId && !secret.deletedAt);
  const otherMatchReference = match.secrets.find((secret) => isBookingReferenceVisible(secret, session.accountId));
  const myReferenceValue = myMatchReference ? decryptBookingReference(myMatchReference) : savedBookingReference;
  const otherReferenceValue = otherMatchReference ? decryptBookingReference(otherMatchReference) : null;
  const callInstructionsReady = match.status === "BOOKING_REFERENCE_SHARED" && myReferenceValue && otherReferenceValue;

  return (
    <main className="bg-white">
      <section className="mx-auto max-w-5xl px-4 py-6 pb-28 sm:px-6 sm:py-12 lg:px-8 lg:pb-12">
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--brand)] transition hover:text-[var(--brand-strong)]">
          <ArrowRight className="h-4 w-4 rotate-180" /> Back to dashboard
        </Link>
        <MatchPageAutoRefresh active={!match.archivedAt && match.status !== "COMPLETED" && match.status !== "EXPIRED" && match.status !== "DECLINED"} />
        <p className="mt-4 text-sm font-semibold uppercase tracking-[0.25em] text-[var(--brand)]">Private match room</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Potential test swap match</h1>
        <p className="mt-3 text-sm text-slate-600">
          Status: {match.status.toLowerCase().replaceAll("_", " ")} · Match quality {match.score}/100
          {match.status === "PROPOSED" && match.expiresAt ? (
            <span className="ml-2 inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
              Expires in: {formatMatchExpiryRemaining(match.expiresAt)}
            </span>
          ) : null}
        </p>
        <ScoreExplanation score={match.score} />

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6"><h2 className="text-xl font-semibold text-slate-950">Your current slot</h2><p className="mt-3 text-sm leading-6 text-slate-700">{mine.currentCentre.name}<br />{mine.currentDateTime.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" })}</p></div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6"><h2 className="text-xl font-semibold text-slate-950">Their offered slot</h2><p className="mt-3 text-sm leading-6 text-slate-700">{other.currentCentre.name}<br />{other.currentDateTime.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" })}</p></div>
        </div>

        {/* Next step */}
        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">Next step</h2>
          {acceptedByMe && !bothAccepted ? (
            <p className="mt-3 text-sm text-slate-700">You have accepted this match. Waiting for the other learner to accept.</p>
          ) : acceptedByMe && bothAccepted ? (
            <p className="mt-3 text-sm text-slate-700">Both learners have accepted this match. Proceed to confirm your booking reference below.</p>
          ) : match.status === "DECLINED" ? (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
              <p className="font-semibold">This match has been declined</p>
              <p className="mt-1">{match.cancelReason || "The match was declined by one of the learners."}</p>
            </div>
          ) : match.status === "EXPIRED" ? (
            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              <p className="font-semibold">This match has expired</p>
              <p className="mt-1">{match.cancelReason || "The match expired without both learners accepting."}</p>
            </div>
          ) : (
            <div className="mt-4 flex flex-wrap gap-3">
              <form action={acceptMoveMyTestMatchAction}>
                <input type="hidden" name="matchId" value={match.id} />
                <button className="rounded-full bg-[var(--brand)] px-5 py-3 text-sm font-semibold !text-white transition hover:bg-[var(--brand-strong)] hover:!text-white">Accept this proposed match</button>
              </form>
              <form action={declineMoveMyTestMatchAction}>
                <input type="hidden" name="matchId" value={match.id} />
                <button className="inline-flex items-center gap-2 rounded-full border border-red-300 bg-white px-5 py-3 text-sm font-semibold text-red-700 shadow-sm transition hover:bg-red-50">
                  <XCircle className="h-4 w-4" />
                  Decline
                </button>
              </form>
            </div>
          )}
          {bothAccepted ? <div className="mt-6"><BookingReferenceForm matchId={match.id} savedBookingReference={savedBookingReference} alreadyConfirmed={Boolean(bookingReferenceConfirmedByMe)} callerStatus={iAmCaller ? "i-am-caller" : otherIsCaller ? "other-is-caller" : "no-caller-yet"} /></div> : null}
        </div>

        {/* Caller stage — only visible when both accepted but no caller yet, or when someone volunteered */}
        {bothAccepted && (
          <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">DVSA caller</h2>
            {iAmCaller ? (
              <CallerVolunteerForm matchId={match.id} alreadyVolunteered={true} />
            ) : otherIsCaller ? (
              <OtherVolunteeredNotice />
            ) : callerPending ? (
              <CallerVolunteerForm matchId={match.id} alreadyVolunteered={false} />
            ) : (
              <p className="mt-3 text-sm text-slate-700">Caller status will appear here after both learners accept the match.</p>
            )}
          </div>
        )}

        {/* Call DVSA */}
        <div id="call-dvsa" className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">Call DVSA</h2>
          {callInstructionsReady ? (
            <div className="mt-5 space-y-5">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm leading-6 text-emerald-950">
                <h3 className="font-semibold">Swap instructions</h3>

                {/* Step 1: Update your details */}
                <div className="mt-3 rounded-xl bg-white p-3 text-sm">
                  <p className="font-semibold text-emerald-900">Step 1 — Check your DVSA record is up to date</p>
                  <p className="mt-1 text-emerald-800">
                    Before calling DVSA, make sure your driving licence details, contact information, and especially your
                    <span className="font-semibold"> mobile phone number</span> are correct on your DVSA record. DVSA uses this number to call the other learner during the swap.
                  </p>
                  <p className="mt-2 text-emerald-800">
                    Your number on MoveMyTest is: <span className="font-semibold">{mine.account?.mobileNumber || "Not saved"}</span>
                    {mine.account?.mobileNumber ? " — check this matches your DVSA record." : " — please update this in your MoveMyTest profile before proceeding."}
                  </p>
                  <Link href="/dashboard/edit" className="mt-2 inline-block text-xs font-semibold text-emerald-700 underline hover:text-emerald-900">
                    Update my details →
                  </Link>
                </div>

                {/* Caller role */}
                {iAmCaller ? (
                  <div className="mt-3 rounded-xl bg-white p-3 text-sm">
                    <p className="font-semibold text-emerald-900">Step 2 — You are making the DVSA call</p>
                    <p className="mt-1 text-emerald-800">Both learners must be available at the same time. DVSA will call the other learner for their security checks during the call.</p>
                  </div>
                ) : otherIsCaller ? (
                  <div className="mt-3 rounded-xl bg-white p-3 text-sm">
                    <p className="font-semibold text-emerald-900">Step 2 — The other learner is making the call</p>
                    <p className="mt-1 text-emerald-800">
                      You do <span className="font-semibold">not</span> need to call DVSA. The other learner will call DVSA and give them your number.
                      DVSA will call <span className="font-semibold">you</span> on your mobile to complete your security checks. Keep your phone charged and ready.
                    </p>
                  </div>
                ) : (
                  <div className="mt-3 rounded-xl bg-white p-3 text-sm">
                    <p className="font-semibold text-amber-800">Step 2 — One of you needs to volunteer to make the call</p>
                    <p className="mt-1 text-amber-700">Use the form above to volunteer. Both learners still need to be available at the same time — DVSA will call the other learner for checks.</p>
                  </div>
                )}

                <h3 className="mt-4 font-semibold">Step 3 — Call details</h3>
                {iAmCaller ? (
                  <p className="mt-2">Call DVSA on <span className="font-semibold">{DVSA_SWAP_PHONE}</span> once both learners are ready. DVSA customer services are open Monday to Friday, 8am to 5pm.</p>
                ) : otherIsCaller ? (
                  <p className="mt-2">
                    The other learner will call DVSA on <span className="font-semibold">{DVSA_SWAP_PHONE}</span>. DVSA customer services are open Monday to Friday, 8am to 5pm.
                    Make sure your phone is charged and you have signal — DVSA will call you on <span className="font-semibold">{mine.account?.mobileNumber || "your registered mobile number"}</span>.
                  </p>
                ) : (
                  <p className="mt-2">Once one learner volunteers, call details will appear here.</p>
                )}
                <p className="mt-2">You are swapping from <span className="font-semibold">{mine.currentCentre.name}</span> on {mine.currentDateTime.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" })} to <span className="font-semibold">{other.currentCentre.name}</span> on {other.currentDateTime.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" })}.</p>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <div className="rounded-xl bg-white p-3"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">Your booking reference number is</p><p className="mt-1 font-mono text-base font-semibold text-slate-950">{myReferenceValue}</p></div>
                  <div className="rounded-xl bg-white p-3"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">The swapping learner&apos;s booking reference number is</p><p className="mt-1 font-mono text-base font-semibold text-slate-950">{otherReferenceValue}</p></div>
                </div>
              </div>
              {match.callWindowExpiresAt ? <CallWindowCountdown expiresAt={match.callWindowExpiresAt.toISOString()} /> : null}
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
                <p className="font-semibold">Help keep MoveMyTest free</p>
                <p className="mt-1">MoveMyTest is free to use. If it saved you time or helped you get an earlier test, consider a one-off contribution to keep it running.</p>
                <Link href="/support-us" className="mt-3 inline-block rounded-full bg-white px-4 py-2 text-xs font-semibold text-amber-800 shadow-sm hover:bg-amber-100">Support MoveMyTest (optional)</Link>
              </div>
              <form action={completeMoveMyTestMatchAction} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                <input type="hidden" name="matchId" value={match.id} />
                <h3 className="font-semibold text-slate-950">After you have called DVSA</h3>
                <p className="mt-2">Once DVSA has confirmed the swap, mark this match complete. This closes the match for both learners.</p>
                <button disabled={Boolean(completedByMe)} className="mt-4 rounded-full bg-[var(--brand)] px-5 py-3 text-sm font-semibold !text-white disabled:opacity-60">{completedByMe ? "Match completed" : "Complete match"}</button>
              </form>
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm leading-6 text-slate-700">
              <h3 className="font-semibold text-slate-950">No instructions available</h3>
              <p className="mt-2">Instructions appear here once both parties agree to a match, one learner volunteers to call DVSA, and both complete booking-reference consent.</p>
            </div>
          )}
        </div>

        {/* Security warning */}
        <div className="mt-8 rounded-3xl border border-red-200 bg-red-50 p-6 text-sm leading-6 text-red-900">
          <h2 className="font-semibold">Before sharing anything sensitive</h2>
          <p className="mt-2">Only continue if both of you are available to complete the DVSA phone process now. DVSA will complete security checks with each learner. Never share your driving licence number, payment card details, address, theory certificate number or GOV.UK login details.</p>
        </div>

        {/* Report */}
        <form action={reportMoveMyTestAction} className="mt-8 rounded-3xl border border-slate-200 bg-white p-6">
          <input type="hidden" name="matchId" value={match.id} />
          <h2 className="font-semibold text-slate-950">Report this match</h2>
          <textarea name="detail" className="mt-3 min-h-24 w-full rounded-xl border border-slate-300 p-3 text-sm" placeholder="Tell MoveMyTest what looks suspicious" />
          <button className="mt-3 rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white">Report</button>
        </form>
        {/* Sticky mobile action bar */}
        {match.status === "PROPOSED" && !acceptedByMe && (
          <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] backdrop-blur-sm sm:hidden"
          >
            <div className="mx-auto flex max-w-5xl gap-3"
            >
              <form action={acceptMoveMyTestMatchAction} className="flex-1"
              >
                <input type="hidden" name="matchId" value={match.id} />
                <button className="w-full rounded-full bg-[var(--brand)] px-5 py-3 text-sm font-semibold !text-white"
                >Accept</button
                >
              </form>
              <form action={declineMoveMyTestMatchAction}
              >
                <input type="hidden" name="matchId" value={match.id} />
                <button className="inline-flex items-center gap-2 rounded-full border border-red-300 bg-white px-5 py-3 text-sm font-semibold text-red-700 shadow-sm"
                >
                  <XCircle className="h-4 w-4" /
                  > Decline
                </button
                >
              </form>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
