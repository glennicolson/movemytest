import { requireMoveMyTestSession } from "@/features/movemytest/session";
import { getLearnerSupportTickets, submitMoveMyTestSupportAction, markNotificationsReadAction } from "@/features/movemytest/support-actions";
import { SupportTicketCard } from "@/components/movemytest/support-ticket-card";
import { SupportTicketForm } from "@/components/movemytest/support-ticket-form";

export default async function SupportPage({ searchParams }: { searchParams?: Promise<{ status?: string } > }) {
  const session = await requireMoveMyTestSession("/dashboard/support");
  const { reports, unreadCount } = await getLearnerSupportTickets();
  const params = await searchParams;

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-950">My Support Tickets</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Send a message to MoveMyTest if you need help with a match, the DVSA phone process, or anything else.
            </p>
          </div>
          {unreadCount > 0 ? (
            <form action={markNotificationsReadAction}>
              <button className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-[var(--brand)]">
                Mark all notifications read ({unreadCount})
              </button>
            </form>
          ) : null}
        </div>

        <SupportTicketForm />
      </section>

      <section className="space-y-4">
        {reports.length ? (
          reports.map((report: any) => <SupportTicketCard key={report.id} report={report} />)
        ) : (
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-600">
            No support tickets yet. Use the form above to send your first message.
          </div>
        )}
      </section>
    </div>
  );
}
