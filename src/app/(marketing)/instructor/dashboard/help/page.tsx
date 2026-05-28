import { requireMoveMyTestInstructorSession } from "@/features/movemytest/instructor-session";
import { getInstructorSupportTickets } from "@/features/movemytest/instructor-support-actions";
import { InstructorSupportTicketForm } from "@/components/movemytest/instructor-support-ticket-form";
import { InstructorTicketList } from "@/components/movemytest/instructor-ticket-list";
import { prisma } from "@/lib/db/prisma";

export default async function InstructorHelpPage() {
  const session = await requireMoveMyTestInstructorSession();
  const instructor = await prisma.instructorAccount.findUniqueOrThrow({
    where: { id: session.instructorId },
    select: { email: true, firstName: true, lastName: true, adiNumber: true },
  });
  const reports = await getInstructorSupportTickets();

  return (
    <div className="space-y-8">
      {/* Support Section */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-950">Help &amp; Support</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Send a message to MoveMyTest if you need help with your instructor account, linked learners, or the MoveMyTest process. MoveMyTest will reply below.
        </p>

        <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
          <span className="font-semibold">Signed in as:</span> {instructor.firstName} {instructor.lastName} · ADI: {instructor.adiNumber} · {instructor.email}
        </div>

        <InstructorSupportTicketForm />
      </section>

      {/* My Tickets */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-950">My Support Tickets</h2>
        <InstructorTicketList reports={reports} />
      </section>

      {/* FAQs */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-950">FAQs</h2>
        <div className="mt-4 divide-y divide-slate-200">
          {[
            {
              q: "How does a learner make sure their details are visible to instructors?",
              a: "When a learner creates a MoveMyTest listing, they are asked whether they have an instructor. If they select 'Yes, I know their details' and enter your ADI number or email, a link is created between their listing and your instructor account. They can also add or edit instructor details later from the Instructor section of their learner dashboard. Share your ADI number and tell your learners to enter it during listing creation.",
            },
            {
              q: "How do I record my availability for a learner's test or swap?",
              a: "On the Linked Learners page, each learner card has an availability form. You can mark yourself as Available, Unavailable, or Needs Discussion for both the learner's current test and any proposed swaps.",
            },
            {
              q: "What happens when a learner accepts a match?",
              a: "You'll see the match status change from Proposed to Accepted on the learner's card. The learner cannot complete the official DVSA swap call until both sides have accepted the match.",
            },
            {
              q: "Can I see a learner's booking reference?",
              a: "No. Booking references stay learner-only and are never shown to instructors. They are encrypted and only shared when both learners are ready for the DVSA phone swap.",
            },
            {
              q: "What if my ADI number is wrong or has changed?",
              a: "Contact MoveMyTest through the support form above. ADI numbers are locked once learners are linked to prevent accidental changes. MoveMyTest can help update your details.",
            },
            {
              q: "Can I use this if I'm already a MoveMyTest instructor?",
              a: "Yes. If you have a MoveMyTest instructor profile, your MoveMyTest instructor account will be linked automatically. You'll see both MoveMyTest and DTC calendar events in one view, but MoveMyTest records stay separately managed from your main DTC learner data.",
            },
            {
              q: "Do I need a separate login for MoveMyTest as an instructor?",
              a: "Yes. The MoveMyTest instructor dashboard uses its own login. This keeps MoveMyTest separate from the main DTC CRM.",
            },
          ].map((faq) => (
            <details key={faq.q} className="group py-4">
              <summary className="cursor-pointer text-sm font-semibold text-slate-950">{faq.q}</summary>
              <p className="mt-2 text-sm leading-6 text-slate-600">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

    </div>
  );
}
