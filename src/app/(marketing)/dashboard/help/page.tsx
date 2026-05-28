import { getLearnerMoveMyTestDashboard } from "@/features/movemytest/queries";
import { requireMoveMyTestSession } from "@/features/movemytest/session";
import { reportMoveMyTestAction } from "@/features/movemytest/actions";

export default async function HelpPage() {
  const session = await requireMoveMyTestSession("/dashboard/help");
  const { listing } = await getLearnerMoveMyTestDashboard(session.accountId);

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-950">Help</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Send DTC a message if something looks wrong, you need help with a match, or you cannot complete the DVSA
          call.
        </p>

        <form action={reportMoveMyTestAction} className="mt-5 space-y-3">
          <input type="hidden" name="listingId" value={listing?.id ?? ""} />
          <input type="hidden" name="reason" value="SUPPORT_REQUEST" />
          <textarea
            name="detail"
            required
            className="min-h-32 w-full rounded-xl border border-slate-300 p-3 text-sm"
            placeholder="Tell MoveMyTest what you need help with"
          />
          <button className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white">
            Send message
          </button>
        </form>
      </section>
    </div>
  );
}
