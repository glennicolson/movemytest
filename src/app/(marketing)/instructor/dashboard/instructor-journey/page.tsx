import { requireMoveMyTestInstructorSession } from "@/features/movemytest/instructor-session";

export default async function InstructorJourneyPage() {
  await requireMoveMyTestInstructorSession();

  const steps = [
    {
      step: "1",
      title: "Register your instructor account",
      desc: "Create your free MoveMyTest instructor account with your ADI number. This is separate from any DTC CRM account — it only shows MoveMyTest learner activity linked to your ADI.",
      action: "Go to /movemytest/instructor/register. Enter your ADI number, name, email, and password. Verify your email, then sign in.",
    },
    {
      step: "2",
      title: "Set up your profile",
      desc: "Make sure your ADI number, name, and contact details are correct. This information is shown to learners when you invite them and appears in your linked learner cards.",
      action: "Go to Profile in your dashboard sidebar. Review your ADI number and email. Updates are locked once learners are linked, so get it right first time.",
    },
    {
      step: "3",
      title: "Enable two-step verification (recommended)",
      desc: "Protect your instructor account with an authenticator app. This adds an extra layer of security to your login and keeps learner links safe.",
      action: "Go to Security in your dashboard sidebar. Follow the setup to scan a QR code with your authenticator app. Save your backup codes somewhere safe.",
    },
    {
      step: "4",
      title: "Invite your learners",
      desc: "Send an invite link to each learner you want to support through MoveMyTest. When they register, your ADI number is pre-filled so their listing is instantly visible to you.",
      action: "Go to Invite Learners in your sidebar. Enter your learner's email address. They'll receive an email with a registration link and your ADI number.",
    },
    {
      step: "5",
      title: "Learner creates a listing",
      desc: "After registering, your learner creates a MoveMyTest listing with their current test centre, date, and time. Your ADI number is automatically populated from your invite.",
      action: "No action needed. The learner fills in their test details. They'll see your name and ADI number already filled in the instructor section.",
    },
    {
      step: "6",
      title: "Check your Linked Learners",
      desc: "Once a learner links you, their listing appears in your Linked Learners section. You'll see their current test, desired swap window, and any pending matches.",
      action: "Go to Linked Learners. Review each learner card. Mark your availability for their current test so MoveMyTest knows you can support a swap.",
    },
    {
      step: "7",
      title: "Review proposed matches",
      desc: "When MoveMyTest finds a compatible learner for your pupil, a match is proposed. Both learners must review and accept it before the swap can proceed.",
      action: "Check the Action Centre for new matches. Review whether the proposed date, time, and centre work for you. Record your availability for the match slot.",
    },
    {
      step: "8",
      title: "Learner accepts the match",
      desc: "Both learners must accept the proposed match. Before they can proceed to the DVSA call, they'll confirm they have spoken to you and you agreed to the swap.",
      action: "Your learner should speak to you before accepting. You'll see '✓ Spoke to instructor' on their card when they've confirmed this in the system.",
    },
    {
      step: "9",
      title: "Booking references exchanged",
      desc: "Only after both learners accept the match do their booking references get exchanged securely. Booking references are never visible to instructors — they stay learner-only.",
      action: "No action needed. The booking reference exchange happens between the two learners via the secure DVSA call consent step.",
    },
    {
      step: "10",
      title: "Learners call DVSA to complete the swap",
      desc: "Both learners call DVSA customer services to complete the official test slot swap. DVSA verifies each learner's identity and processes the change.",
      action: "No action needed during the call, but be available in case the learner needs to confirm your availability directly with DVSA.",
    },
    {
      step: "11",
      title: "Swap complete — listing closed",
      desc: "Once DVSA confirms the swap, the learner marks it as completed in MoveMyTest. The listing moves to history and no further action is needed.",
      action: "No action needed. The learner's card will move to your history. If they need another swap, they'll create a new listing and you'll see them again in Linked Learners.",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[var(--brand)]">Instructor Journey</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
          Your step-by-step guide to MoveMyTest
        </h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-slate-700">
          Follow these steps to get set up as an instructor and guide your learners through the test swap process. Most steps require no action from you — you&apos;ll be notified when your input is needed.
        </p>
      </div>

      <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5">
        <p className="text-sm font-semibold text-emerald-950">
          ⏱ This whole process takes about 5 minutes to set up, then mostly runs itself. You only need to check in when a match is proposed or accepted.
        </p>
      </div>

      <div className="space-y-4">
        {steps.map(({ step, title, desc, action }) => (
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
                  <span className="font-semibold">What to do:</span> {action}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6">
        <h2 className="text-lg font-semibold text-emerald-950">Key things to remember</h2>
        <ul className="mt-3 space-y-2 text-sm leading-6 text-emerald-900">
          <li>• Your <strong>ADI number is how learners link to you</strong> — make sure it&apos;s correct in your profile</li>
          <li>• <strong>Booking references are never shown to instructors</strong> — they stay learner-only throughout</li>
          <li>• The <strong>official swap happens by phone with DVSA</strong> — MoveMyTest only handles the matching</li>
          <li>• <strong>Mark your availability early</strong> — it helps MoveMyTest know which matches are viable before proposing them</li>
          <li>• <strong>Learners must speak to you</strong> before accepting a match — they confirm this with a checkbox you&apos;ll see on their card</li>
          <li>• The <strong>10-working-day DVSA notice rule</strong> applies to both learners — MoveMyTest checks this automatically</li>
        </ul>
      </div>
    </div>
  );
}
