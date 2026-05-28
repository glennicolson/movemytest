import { requireMoveMyTestInstructorSession } from "@/features/movemytest/instructor-session";

export default async function LearnerJourneyPage() {
  await requireMoveMyTestInstructorSession();

  const steps = [
    {
      step: "1",
      title: "Learner creates a listing",
      desc: "The learner enters their current test centre, date, time, and test type. They also set their preferred swap window and acceptable centres. Optionally, they can enter your ADI number or email to link you as their instructor.",
      instructorAction: "No action needed yet. Your ADI number being entered is what links them to your dashboard.",
    },
    {
      step: "2",
      title: "MoveMyTest finds compatible matches",
      desc: "DTC automatically checks for other learners with compatible preferences — same test type, matching direction, within the DVSA 10-working-day notice window and centre location rules.",
      instructorAction: "No action needed. MoveMyTest handles matching automatically in the background.",
    },
    {
      step: "3",
      title: "Both learners accept a match",
      desc: "When a compatible match is found, both learners are notified. Each learner must review and accept the proposed swap. The match becomes visible to you at this stage.",
      instructorAction: "Check your availability for the new proposed test slot. Confirm whether you can support the swap date, time, and centre.",
    },
    {
      step: "4",
      title: "Booking reference consent",
      desc: "Only after both learners have accepted the match do they move to the DVSA call consent step. At this point, booking references are exchanged securely between the two learners — they are never visible to instructors.",
      instructorAction: "The learner sees a checkbox asking them to confirm they have spoken to you and that you agreed to the swap. If they check this, you'll see '✓ Spoke to instructor' on their card.",
    },
    {
      step: "5",
      title: "Call DVSA to complete the swap",
      desc: "Both learners call DVSA customer services together. DVSA completes security checks with each learner individually and processes the official test slot swap. MoveMyTest is not involved in this call and cannot make changes to GOV.UK bookings.",
      instructorAction: "No action needed during the call. Be available in case the learner needs to confirm your availability with DVSA.",
    },
    {
      step: "6",
      title: "Swap confirmed and listing closed",
      desc: "Once DVSA confirms the swap is complete, the learner marks it as completed in MoveMyTest. The listing is automatically closed and moves to history.",
      instructorAction: "The learner card moves to your history. No further action needed.",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[var(--brand)]">Learner Journey</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
          How your learners use MoveMyTest
        </h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-slate-700">
          Understanding each step your learners go through helps you guide them and know when your input is needed.
        </p>
      </div>

      <div className="space-y-4">
        {steps.map(({ step, title, desc, instructorAction }) => (
          <div key={step} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--brand)] text-sm font-bold text-white">
                {step}
              </span>
              <div className="space-y-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{desc}</p>
                </div>
                <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm leading-6 text-blue-900">
                  <span className="font-semibold">Your role:</span> {instructorAction}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6">
        <h2 className="text-lg font-semibold text-emerald-950">Key things to remember</h2>
        <ul className="mt-3 space-y-2 text-sm leading-6 text-emerald-900">
          <li>• Booking references are <strong>never shown to instructors</strong> — they stay learner-only</li>
          <li>• The <strong>official swap happens by phone with DVSA</strong> — MoveMyTest only facilitates matching</li>
          <li>• Your availability decisions <strong>help learners know if a swap works</strong> before they commit</li>
          <li>• Learners see a <strong>&apos;Spoke to instructor&apos;</strong> checkbox — this appears on your dashboard as a ✓ badge</li>
          <li>• The 10-working-day DVSA notice rule applies to <strong>both learners</strong> — MoveMyTest checks this automatically</li>
        </ul>
      </div>
    </div>
  );
}
