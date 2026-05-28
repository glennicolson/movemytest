import Link from "next/link";
import { getLearnerMoveMyTestDashboard } from "@/features/movemytest/queries";
import { requireMoveMyTestSession } from "@/features/movemytest/session";
import { AvailabilityNotice } from "@/components/movemytest/dashboard-helpers";

export default async function MatchesPage() {
  const session = await requireMoveMyTestSession("/dashboard/matches");
  const { listing, matches } = await getLearnerMoveMyTestDashboard(session.accountId);
  const formatDateTime = (value: Date) =>
    value.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" });
  const instructorDecisions = listing?.instructorDetails?.availabilityDecisions ?? [];
  const instructorDecisionForMatch = (matchId: string) =>
    instructorDecisions.find((d) => d.slotType === "PROPOSED_SWAP" && d.matchId === matchId);

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="text-xl font-semibold text-slate-950 sm:text-2xl">My Match</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Compatible learners and their proposed test slots. Tap a match to review details, accept, share booking
          references, and get call instructions.
        </p>

        {!listing ? (
          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
            No active listing. Create one to see matches.
          </div>
        ) : matches.length ? (
          <div className="mt-5 space-y-4">
            {matches.map(({ match, otherListing, otherCentre }) => (
              <Link
                key={match.id}
                href={`/matches/${match.id}`}
                className="block rounded-2xl border border-slate-200 p-4 hover:bg-slate-50"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-950">{otherCentre.name}</h3>
                    <p className="mt-1 text-sm text-slate-600">
                      Offered test: {formatDateTime(otherListing.currentDateTime)}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      Match quality: {match.score}/100 ·{" "}
                      {match.status.toLowerCase().replaceAll("_", " ")}
                    </p>
                    <AvailabilityNotice decision={instructorDecisionForMatch(match.id)} compact />
                  </div>
                  <span className="text-sm font-semibold text-[var(--brand)]">Open</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
            No compatible matches yet. We&apos;ll show aggregate-compatible learners here when they appear.
          </div>
        )}
      </section>
    </div>
  );
}
