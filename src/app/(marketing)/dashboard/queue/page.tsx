import { getLearnerMoveMyTestDashboard } from "@/features/movemytest/queries";
import { requireMoveMyTestSession } from "@/features/movemytest/session";
import { InfoTile } from "@/components/movemytest/dashboard-helpers";

export default async function QueuePage() {
  const session = await requireMoveMyTestSession("/dashboard/queue");
  const { listing, matches } = await getLearnerMoveMyTestDashboard(session.accountId);
  const formatDate = (value: Date) =>
    value.toLocaleDateString("en-GB", { dateStyle: "medium", timeZone: "UTC" });

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-950">Queue Status</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Live overview of your listing and potential matches in the queue.
        </p>

        {!listing ? (
          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
            No active listing. Create one to see your queue status.
          </div>
        ) : (
          <>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <InfoTile label="Listing status" value={listing.status.toLowerCase().replaceAll("_", " ")} />
              <InfoTile label="Potential matches" value={String(matches.length)} />
              <InfoTile label="Expires" value={formatDate(listing.expiresAt)} />
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              We compare your listing against compatible learners. Stronger matches appear in My Match when the centre,
              date, time and DVSA rule checks line up.
            </p>
          </>
        )}
      </section>
    </div>
  );
}
